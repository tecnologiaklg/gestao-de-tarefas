import api from './api';
import { Usuario } from '../types';

export const usuarioService = {
  listar: async () => { const { data } = await api.get<Usuario[]>('/usuarios'); return data; },
  listarPorSetor: async (setorId: number) => { const { data } = await api.get<Partial<Usuario>[]>(`/usuarios/setor/${setorId}`); return data; },
  criar: async (payload: { nome: string; pin: string; cargo: string; setor_id?: number | null }) => {
    const { data } = await api.post<Usuario>('/usuarios', payload); return data;
  },
  alterarStatus: async (id: number, ativo: boolean) => {
    const { data } = await api.patch<Usuario>(`/usuarios/${id}/status`, { ativo }); return data;
  },
};
