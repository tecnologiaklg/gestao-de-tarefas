import api from './api';
import { Tarefa } from '../types';

export interface CreateTarefaData {
  titulo: string;
  descricao?: string;
  responsavel_id: number;
  setor_id?: number;
  prioridade: string;
  prazo: string;
}

export const tarefaService = {
  todas: async (params?: Record<string, string>) => {
    const { data } = await api.get<Tarefa[]>('/tarefas/todas', { params });
    return data;
  },
  minhas: async (params?: Record<string, string>) => {
    const { data } = await api.get<Tarefa[]>('/tarefas/minhas', { params });
    return data;
  },
  criadas: async (params?: Record<string, string>) => {
    const { data } = await api.get<Tarefa[]>('/tarefas/criadas', { params });
    return data;
  },
  equipe: async (params?: Record<string, string>) => {
    const { data } = await api.get<Tarefa[]>('/tarefas/equipe', { params });
    return data;
  },
  buscar: async (id: number) => {
    const { data } = await api.get<Tarefa>(`/tarefas/${id}`);
    return data;
  },
  criar: async (payload: CreateTarefaData) => {
    const { data } = await api.post<Tarefa>('/tarefas', payload);
    return data;
  },
  atualizar: async (id: number, payload: Partial<CreateTarefaData>) => {
    const { data } = await api.patch<Tarefa>(`/tarefas/${id}`, payload);
    return data;
  },
  alterarStatus: async (id: number, status: string, motivo?: string) => {
    const { data } = await api.patch<Tarefa>(`/tarefas/${id}/status`, { status, motivo });
    return data;
  },
  reclamar: async (tarefaId: number) => {
    const { data } = await api.post(`/tarefas/${tarefaId}/reclamar`);
    return data;
  },
};