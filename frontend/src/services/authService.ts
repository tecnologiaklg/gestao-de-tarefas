import api from './api';

export type LoginStatus = 'ok' | 'discord_required' | 'discord_confirmation_required';

export interface LoginResponse {
  status: LoginStatus;
  token?: string;
  user?: { id?: number; nome: string; cargo?: string; setor_id?: number | null; role?: 'ROOT' };
  message?: string;
}

export const authService = {
  login: async (pin: string, adminToken?: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { pin, adminToken });
    return data;
  },

  confirmar: async (code: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/confirmar', { code });
    return data;
  },
};
