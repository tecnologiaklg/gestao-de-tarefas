// services/UsuarioService.ts
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { LogRepository } from '../repositories/LogRepository';
import { NotFoundError, ConflictError, UnprocessableError } from '../errors/AppError';
import { CARGO, Cargo } from '../models/enums';

export const UsuarioService = {
  listar: () => UsuarioRepository.findAll(),

  criar: async (data: { nome: string; pin: string; cargo: string; setor_id?: number | null }, reqUserId?: number | null) => {
    if (!Object.values(CARGO).includes(data.cargo as Cargo))
      throw new UnprocessableError(`Cargo inválido: ${data.cargo}`);
    const existente = await UsuarioRepository.findByPin(data.pin);
    if (existente) throw new ConflictError('PIN já em uso');
    const usuario = await UsuarioRepository.create(data);
    await LogRepository.registrar({
      usuario_id: reqUserId ?? null,
      tipo_evento: 'CRIACAO_USUARIO',
      descricao: `Usuário ${data.nome} criado`,
      valor_depois: JSON.stringify({ nome: data.nome, cargo: data.cargo }),
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
