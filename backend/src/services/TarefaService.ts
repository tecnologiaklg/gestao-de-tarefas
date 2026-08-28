// services/TarefaService.ts
import { TarefaRepository, TarefaFilters } from '../repositories/TarefaRepository';
import { HistoricoRepository } from '../repositories/HistoricoRepository';
import { LogRepository } from '../repositories/LogRepository';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { SetorRepository } from '../repositories/SetorRepository';
import { DiscordNotificationService } from './DiscordNotificationService';
import { ForbiddenError, NotFoundError, UnprocessableError } from '../errors/AppError';
import { STATUS, PRIORIDADE, TRANSICOES_PERMITIDAS, Prioridade } from '../models/enums';
import { JWTPayload, JWTPayloadUser, Tarefa } from '../types';

function asUser(user: JWTPayload): JWTPayloadUser {
  if ('role' in user) throw new ForbiddenError('Root não pode executar esta ação');
  return user as JWTPayloadUser;
}

function verificarAcesso(tarefa: Tarefa, user: JWTPayload): void {
  if ('role' in user) return; // ROOT vê tudo
  const u = user as JWTPayloadUser;
  if (tarefa.criador_id === u.id) return;
  if (tarefa.responsavel_id === u.id) return;
  if (u.cargo === 'COORDENADOR' && tarefa.setor_id === u.setor_id && tarefa.responsavel_cargo === 'FUNCIONARIO') return;
  throw new ForbiddenError('Você não tem acesso a esta tarefa');
}

export const TarefaService = {
  buscarPorId: async (id: number, user: JWTPayload): Promise<Tarefa> => {
    const tarefa = await TarefaRepository.findById(id);
    if (!tarefa) throw new NotFoundError('Tarefa não encontrada');
    verificarAcesso(tarefa, user);
    return tarefa;
  },

  minhasTarefas: (userId: number, filters: TarefaFilters) =>
    TarefaRepository.findMinhasTarefas(userId, filters),

  criadasPorMim: (userId: number, filters: TarefaFilters) =>
    TarefaRepository.findCriadasPorMim(userId, filters),

  tarefasEquipe: async (user: JWTPayload, filters: TarefaFilters): Promise<Tarefa[]> => {
    const u = asUser(user);
    if (u.cargo !== 'COORDENADOR') throw new ForbiddenError('Apenas coordenadores podem ver tarefas da equipe');
    return TarefaRepository.findBySetor(u.setor_id!, filters);
  },

  criar: async (dados: {
    titulo: string; descricao: string; responsavel_id: number;
    setor_id: number; prioridade: Prioridade; prazo: string;
  }, user: JWTPayload): Promise<Tarefa> => {
    const u = asUser(user);
    const { titulo, descricao, responsavel_id, setor_id, prioridade, prazo } = dados;

    if (responsavel_id === u.id) throw new ForbiddenError('Você não pode criar uma tarefa para si mesmo');

    const responsavel = await UsuarioRepository.findById(responsavel_id);
    if (!responsavel) throw new NotFoundError('Responsável não encontrado');
    if (!responsavel.ativo) throw new UnprocessableError('Responsável inativo');

    const targetSetorId = (setor_id ? parseInt(setor_id as unknown as string, 10) : null) || responsavel.setor_id;
    if (!targetSetorId) throw new NotFoundError('Setor não encontrado');

    const setor = await SetorRepository.findById(targetSetorId);
    if (!setor) throw new NotFoundError('Setor não encontrado');

    if (!prazo) throw new UnprocessableError('Data e hora de entrega são obrigatórios');
    if (!Object.values(PRIORIDADE).includes(prioridade)) throw new UnprocessableError('Prioridade inválida');

    const { id } = await TarefaRepository.create({ titulo, descricao, criador_id: u.id, responsavel_id, setor_id: targetSetorId, prioridade, prazo });
    const tarefa = (await TarefaRepository.findById(id))!;

    await HistoricoRepository.registrar({ tarefa_id: id, usuario_id: u.id, tipo: 'CRIACAO', descricao: `Criada por ${u.nome}` });
    await LogRepository.registrar({ usuario_id: u.id, tipo_evento: 'CRIACAO_TAREFA', descricao: `Tarefa #${id}: ${titulo}` });
    await DiscordNotificationService.notificarCriacao(tarefa, u);

    return tarefa;
  },

  atualizar: async (id: number, campos: Record<string, unknown>, user: JWTPayload): Promise<Tarefa> => {
    const u = asUser(user);
    const tarefa = await TarefaRepository.findById(id);
    if (!tarefa) throw new NotFoundError('Tarefa não encontrada');
    if (tarefa.criador_id !== u.id) throw new ForbiddenError('Somente o criador pode editar esta tarefa');
    if (tarefa.status === STATUS.CONCLUIDA) throw new ForbiddenError('Tarefa concluída não pode ser editada');

    const responsavel_id = campos.responsavel_id as number | undefined;
    if (responsavel_id) {
      if (responsavel_id === u.id) throw new ForbiddenError('Você não pode ser o responsável de sua própria tarefa');
      const resp = await UsuarioRepository.findById(responsavel_id);
      if (!resp) throw new NotFoundError('Responsável não encontrado');
      if (!resp.ativo) throw new UnprocessableError('Responsável inativo');
    }

    const camposLabel: Record<string, string> = {
      titulo: 'Título', descricao: 'Descrição', responsavel_id: 'Responsável',
      setor_id: 'Setor', prioridade: 'Prioridade', prazo: 'Prazo',
    };
    for (const [campo, label] of Object.entries(camposLabel)) {
      if (campos[campo] !== undefined && String(campos[campo]) !== String((tarefa as unknown as Record<string, unknown>)[campo] ?? '')) {
        await HistoricoRepository.registrar({
          tarefa_id: id, usuario_id: u.id, tipo: `EDICAO_${campo.toUpperCase()}`,
          valor_antes: String((tarefa as unknown as Record<string, unknown>)[campo] ?? ''),
          valor_depois: String(campos[campo]), descricao: `${label} alterado`,
        });
      }
    }

    await TarefaRepository.update(id, campos as Parameters<typeof TarefaRepository.update>[1]);
    await LogRepository.registrar({ usuario_id: u.id, tipo_evento: 'EDICAO_TAREFA', descricao: `Tarefa #${id} editada` });
    const tarefaAtualizada = (await TarefaRepository.findById(id))!;
    await DiscordNotificationService.notificarAlteracao(tarefaAtualizada, u, campos, tarefa as unknown as Record<string, unknown>);
    return tarefaAtualizada;
  },

  alterarStatus: async (id: number, novoStatus: string, motivo: string | undefined, user: JWTPayload): Promise<Tarefa> => {
    const u = asUser(user);
    const tarefa = await TarefaRepository.findById(id);
    if (!tarefa) throw new NotFoundError('Tarefa não encontrada');
    if (tarefa.responsavel_id !== u.id) throw new ForbiddenError('Somente o responsável pode alterar o status');

    const permitidos = TRANSICOES_PERMITIDAS[tarefa.status] ?? [];
    if (!permitidos.includes(novoStatus as typeof STATUS[keyof typeof STATUS]))
      throw new UnprocessableError(`Transição de ${tarefa.status} para ${novoStatus} não é permitida`);

    if (novoStatus === STATUS.AGUARDANDO && !motivo)
      throw new UnprocessableError('Motivo é obrigatório ao mover para AGUARDANDO');

    await TarefaRepository.updateStatus(id, novoStatus);
    await HistoricoRepository.registrar({
      tarefa_id: id, usuario_id: u.id,
      tipo: novoStatus === STATUS.AGUARDANDO ? 'AGUARDANDO' : 'MUDANCA_STATUS',
      valor_antes: tarefa.status, valor_depois: novoStatus, descricao: motivo,
    });
    await LogRepository.registrar({
      usuario_id: u.id, tipo_evento: 'MUDANCA_STATUS',
      descricao: `Tarefa #${id}: ${tarefa.status} → ${novoStatus}`,
    });

    const tarefaAtualizada = (await TarefaRepository.findById(id))!;
    await DiscordNotificationService.notificarMudancaStatus(tarefaAtualizada, u, tarefa.status, motivo);
    return tarefaAtualizada;
  },
};
