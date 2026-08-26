import api from './api';
import { Setor } from '../types';

export const setorService = {
  listar: async () => { const { data } = await api.get<Setor[]>('/setores'); return data; },
  criar: async (nome: string) => { const { data } = await api.post<Setor>('/setores', { nome }); return data; },
  atualizar: async (id: number, nome: string) => { const { data } = await api.patch<Setor>(`/setores/${id}`, { nome }); return data; },
};
