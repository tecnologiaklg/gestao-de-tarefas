// services/DiscordNotificationService.ts
import axios from 'axios';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { Tarefa } from '../types';
import { JWTPayloadUser } from '../types';
import { env } from '../config/env';

async function enviarDM(userId: number, mensagem: string): Promise<void> {
  const usuario = await UsuarioRepository.findById(userId);
  if (!usuario?.discord_vinculado || !usuario.discord_id) return;
  try {
    await axios.post(`${env.BOT_INTERNAL_URL}/notify`, {
      discord_id: usuario.discord_id,
      mensagem,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Discord] Falha ao notificar user ${userId}:`, msg);
  }
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function formatStatus(s: string): string {
  const map: Record<string, string> = {
    PENDENTE:     'Pendente',
    EM_ANDAMENTO: 'Em Andamento',
    AGUARDANDO:   'Aguardando',
    CONCLUIDA:    'Concluída',
  };
  return map[s] ?? s;
}

export const DiscordNotificationService = {
  notificarCriacao: async (tarefa: Tarefa, _criadorUser: JWTPayloadUser): Promise<void> => {
    await enviarDM(tarefa.criador_id,
      `✅ **Tarefa criada!**\n📋 **${tarefa.titulo}**\n👤 Responsável: ${tarefa.responsavel_nome}\n⏰ Prazo: ${formatDate(tarefa.prazo)}`
    );
    if (tarefa.responsavel_id !== tarefa.criador_id) {
      await enviarDM(tarefa.responsavel_id,
        `📋 **Nova tarefa atribuída a você!**\n**${tarefa.titulo}**\n👤 Enviada por: ${tarefa.criador_nome}\n⏰ Prazo: ${formatDate(tarefa.prazo)}\n🔴 Prioridade: ${tarefa.prioridade}`
      );
    }
  },

  notificarAlteracao: async (tarefa: Tarefa, autorUser: JWTPayloadUser, camposNovos: Record<string, unknown>, camposAntigos: Record<string, unknown>): Promise<void> => {
    if (tarefa.responsavel_id === autorUser.id) return;
    const linhas = Object.entries(camposNovos)
      .filter(([k, v]) => v !== undefined && String(v) !== String(camposAntigos[k] ?? ''))
      .map(([k, v]) => `• **${k}**: \`${camposAntigos[k]}\` → \`${v}\``)
      .join('\n');
    if (!linhas) return;
    await enviarDM(tarefa.responsavel_id, `✏️ **Tarefa atualizada:** ${tarefa.titulo}\n${linhas}`);
  },

  notificarMudancaStatus: async (tarefa: Tarefa, autorUser: JWTPayloadUser, statusAntes: string, motivo?: string | null): Promise<void> => {
    // Não notificar quem executou a ação sobre o que ele mesmo fez
    if (tarefa.criador_id === autorUser.id) return;
    const motMsg = motivo ? `\n📝 Motivo: ${motivo}` : '';
    await enviarDM(tarefa.criador_id,
      `🔄 **Status alterado:** ${tarefa.titulo}\n${formatStatus(statusAntes)} → **${formatStatus(tarefa.status)}**${motMsg}`
    );
  },

  notificarComentario: async (tarefa: Tarefa, autorUser: JWTPayloadUser, conteudo: string): Promise<void> => {
    const destinatarios = new Set([tarefa.criador_id, tarefa.responsavel_id]);
    for (const uid of destinatarios) {
      if (uid !== autorUser.id) {
        await enviarDM(uid, `💬 **Novo comentário em:** ${tarefa.titulo}\n_${conteudo}_`);
      }
    }
  },

  notificarPrazo5Min: async (tarefa: Tarefa): Promise<void> => {
    const msg =
      `⏰ **Atenção: Tarefa próxima do horário de entrega (5 minutos restantes)!**\n` +
      `📋 **${tarefa.titulo}**\n` +
      `👤 Enviada por: ${tarefa.criador_nome}\n` +
      `⏰ Horário limite: **${formatDate(tarefa.prazo)}**\n` +
      `🔴 Prioridade: ${tarefa.prioridade}\n` +
      `👉 Acesse o portal para atualizar o andamento ou concluir a tarefa.`;
    await enviarDM(tarefa.responsavel_id, msg);
  },
};
