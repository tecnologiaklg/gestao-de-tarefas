// services/ComentarioService.ts
import { ComentarioRepository } from '../repositories/ComentarioRepository';
import { TarefaRepository } from '../repositories/TarefaRepository';
import { HistoricoRepository } from '../repositories/HistoricoRepository';
import { LogRepository } from '../repositories/LogRepository';
import { DiscordNotificationService } from './DiscordNotificationService';
import { ForbiddenError, NotFoundError } from '../errors/AppError';
import { CARGO } from '../models/enums';
import { JWTPayload, JWTPayloadUser, Tarefa } from '../types';

function verificarPermissaoComentario(tarefa: Tarefa, user: JWTPayloadUser): void {
  if (tarefa.criador_id === user.id || tarefa.responsavel_id === user.id) return;
  if (tarefa.responsavel_cargo === CARGO.FUNCIONARIO && user.cargo === CARGO.COORDENADOR && user.setor_id === tarefa.setor_id) return;
  throw new ForbiddenError('Você não tem permissão para comentar nesta tarefa');
}

export const ComentarioService = {
  listar: async (tarefaId: number) => {
    const tarefa = await TarefaRepository.findById(tarefaId);
    if (!tarefa) throw new NotFoundError('Tarefa não encontrada');
    return ComentarioRepository.findByTarefa(tarefaId);
  },

  criar: async (tarefaId: number, conteudo: string, user: JWTPayload) => {
    if ('role' in user) throw new ForbiddenError('Root não pode comentar');
    const u = user as JWTPayloadUser;
    const tarefa = await TarefaRepository.findById(tarefaId);
    if (!tarefa) throw new NotFoundError('Tarefa não encontrada');
    if (tarefa.status === 'CONCLUIDA') throw new ForbiddenError('Comentários bloqueados em tarefa concluída');
    verificarPermissaoComentario(tarefa, u);

    const comentario = await ComentarioRepository.create({ tarefa_id: tarefaId, autor_id: u.id, conteudo });
    await HistoricoRepository.registrar({ tarefa_id: tarefaId, usuario_id: u.id, tipo: 'COMENTARIO', descricao: conteudo });
    await LogRepository.registrar({ usuario_id: u.id, tipo_evento: 'COMENTARIO_ADICIONADO', descricao: `Comentário na tarefa #${tarefaId}` });
    await DiscordNotificationService.notificarComentario(tarefa, u, conteudo);
    return comentario;
  },
};
