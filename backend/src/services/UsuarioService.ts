// services/UsuarioService.ts
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { LogRepository } from '../repositories/LogRepository';
import { NotFoundError, ConflictError, UnprocessableError } from '../errors/AppError';
import { CARGO, Cargo } from '../models/enums';

export const UsuarioService = {
  listar: () => UsuarioRepository.findAll(),

  gerarPinUnico: async (): Promise<string> => {
    let pin = '';
    let existente = true;
    let tentativas = 0;

    while (existente && tentativas < 100) {
      tentativas++;
      // Gera número aleatório de 6 dígitos (000001 a 999999, exceto 000000 do Root)
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      pin = String(randomNum).padStart(6, '0');

      if (pin === '000000') continue;

      const user = await UsuarioRepository.findByPin(pin);
      if (!user) {
        existente = false;
      }
    }

    if (existente) {
      throw new Error('Não foi possível gerar um PIN único.');
    }

    return pin;
  },

  criar: async (data: { nome: string; pin?: string; cargo: string; setor_id?: number | null }, reqUserId?: number | null) => {
    if (!Object.values(CARGO).includes(data.cargo as Cargo))
      throw new UnprocessableError(`Cargo inválido: ${data.cargo}`);

    let pin = data.pin?.trim();
    if (!pin) {
      pin = await UsuarioService.gerarPinUnico();
    } else {
      if (!/^\d{6}$/.test(pin)) throw new UnprocessableError('PIN deve conter exatamente 6 dígitos numéricos');
      if (pin === '000000') throw new UnprocessableError('PIN 000000 é reservado para o Root');
      const existente = await UsuarioRepository.findByPin(pin);
      if (existente) throw new ConflictError('PIN já em uso');
    }

    const usuario = await UsuarioRepository.create({ ...data, pin });
    await LogRepository.registrar({
      usuario_id: reqUserId ?? null,
      tipo_evento: 'CRIACAO_USUARIO',
      descricao: `Usuário ${data.nome} criado com PIN ${pin}`,
      valor_depois: JSON.stringify({ nome: data.nome, cargo: data.cargo, pin }),
    });
    return usuario;
  },

  alterarStatus: async (id: number, ativo: boolean, reqUserId?: number | null) => {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) throw new NotFoundError('Usuário não encontrado');
    if (!ativo) {
      const temAberta = await UsuarioRepository.hasOpenTasks(id);
      if (temAberta) throw new ConflictError('Não é possível desativar usuário com tarefas abertas');
    }
    const atualizado = await UsuarioRepository.setAtivo(id, ativo);
    await LogRepository.registrar({
      usuario_id: reqUserId ?? null,
      tipo_evento: ativo ? 'ATIVACAO_USUARIO' : 'DESATIVACAO_USUARIO',
      descricao: `Usuário ${usuario.nome} ${ativo ? 'ativado' : 'desativado'}`,
    });
    return atualizado;
  },

  listarPorSetor: (setorId: number, excludeId?: number) =>
    UsuarioRepository.findBySetor(setorId, excludeId),
};
