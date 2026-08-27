// services/AuthService.ts
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { LogRepository } from '../repositories/LogRepository';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { env } from '../config/env';
import { JWTPayload } from '../types';

// ── Store de códigos de confirmação (in-memory, TTL 5 min) ─────────────────
interface PendingCode {
  userId: number;
  expiresAt: number;
}
const pendingCodes = new Map<string, PendingCode>();

function gerarCodigo(): string {
  // 6 caracteres alfanuméricos maiúsculos (ex: A3F7K2)
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function limparExpirados() {
  const agora = Date.now();
  for (const [code, data] of pendingCodes) {
    if (data.expiresAt < agora) pendingCodes.delete(code);
  }
}

// ──────────────────────────────────────────────────────────────────────────────

export const AuthService = {
  login: async ({ pin, adminToken }: { pin: string; adminToken?: string }) => {
    // ── Root (PIN 000000) ──────────────────────────────────────────────────
    if (pin === '000000') {
      if (!adminToken || adminToken !== env.ROOT_ADMIN_TOKEN)
        throw new ForbiddenError('Token administrativo inválido');
      const token = jwt.sign({ role: 'ROOT' }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
      await LogRepository.registrar({ usuario_id: null, tipo_evento: 'LOGIN_ROOT', descricao: 'Acesso root' });
      return { status: 'ok' as const, token, user: { role: 'ROOT' as const, nome: 'Root' } };
    }

    // ── Usuário normal ─────────────────────────────────────────────────────
    const usuario = await UsuarioRepository.findByPin(pin);
    if (!usuario) throw new UnauthorizedError('PIN inválido');
    if (!usuario.ativo) throw new ForbiddenError('Usuário inativo');

    // CASO 1 — Discord não vinculado → bloqueia, pede para vincular
    if (!usuario.discord_vinculado) {
      await LogRepository.registrar({
        usuario_id: usuario.id,
        tipo_evento: 'LOGIN_BLOQUEADO_DISCORD',
        descricao: `${usuario.nome} precisa vincular o Discord`,
      });
      return {
        status: 'discord_required' as const,
        message: 'Você precisa vincular sua conta Discord antes de acessar o sistema.',
      };
    }

    // CASO 2 — Discord vinculado → gera código de confirmação e envia DM
    limparExpirados();
    const code = gerarCodigo();
    pendingCodes.set(code, { userId: usuario.id, expiresAt: Date.now() + 5 * 60 * 1000 });

    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // Envia DM com o código (não bloqueia o response)
    axios.post(`${env.BOT_INTERNAL_URL}/notify`, {
      discord_id: usuario.discord_id,
      mensagem: [
        `🔐 **Confirmação de acesso — ${agora}**`,
        ``,
        `Alguém usou seu PIN para acessar o portal de tarefas.`,
        ``,
        `**Código de confirmação:** \`${code}\``,
        ``,
        `Digite este código no site para concluir o login.`,
        `_O código expira em 5 minutos. Se não foi você, ignore._`,
      ].join('\n'),
    }).catch((err: unknown) => {
      console.warn('[AuthService] Falha ao enviar código Discord:', err instanceof Error ? err.message : err);
    });

    await LogRepository.registrar({
      usuario_id: usuario.id,
      tipo_evento: 'LOGIN_AGUARDANDO_DISCORD',
      descricao: `Código enviado para Discord de ${usuario.nome}`,
    });

    return {
      status: 'discord_confirmation_required' as const,
      message: 'Verifique seu Discord. Um código de confirmação foi enviado.',
    };
  },

  // ── Confirma o código recebido no Discord ──────────────────────────────
  confirmarCodigo: async (code: string) => {
    limparExpirados();
    const pending = pendingCodes.get(code.toUpperCase().trim());

    if (!pending) throw new UnauthorizedError('Código inválido ou expirado');

    pendingCodes.delete(code.toUpperCase().trim()); // uso único

    const usuario = await UsuarioRepository.findById(pending.userId);
    if (!usuario) throw new UnauthorizedError('Usuário não encontrado');
    if (!usuario.ativo) throw new ForbiddenError('Usuário inativo');

    const payload = { id: usuario.id, nome: usuario.nome, cargo: usuario.cargo, setor_id: usuario.setor_id };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

    await LogRepository.registrar({
      usuario_id: usuario.id,
      tipo_evento: 'LOGIN',
      descricao: `Login confirmado via Discord — ${usuario.nome}`,
    });

    return { status: 'ok' as const, token, user: payload };
  },

  verifyToken: (token: string): JWTPayload => {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch {
      throw new UnauthorizedError('Token inválido ou expirado');
    }
  },
};
