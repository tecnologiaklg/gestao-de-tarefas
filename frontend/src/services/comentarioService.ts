import api from './api';
import { Comentario, HistoricoEntry, Log } from '../types';

export const comentarioService = {
  listar: async (tarefaId: number) => { const { data } = await api.get<Comentario[]>(`/tarefas/${tarefaId}/comentarios`); return data; },
  criar: async (tarefaId: number, conteudo: string) => { const { data } = await api.post<Comentario>(`/tarefas/${tarefaId}/comentarios`, { conteudo }); return data; },
};

export const historicoService = {
  listar: async (tarefaId: number) => {
    const { data } = await api.get<HistoricoEntry[]>(`/tarefas/${tarefaId}`);
    // histórico vem em endpoint separado no futuro; por ora buscamos da tarefa
    return data as unknown as HistoricoEntry[];
  },
};

export const logService = {
  listar: async (params?: { usuario_id?: number; tipo_evento?: string }) => {
    const { data } = await api.get<Log[]>('/logs', { params }); return data;
  },
};
