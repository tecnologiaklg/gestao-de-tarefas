import api from './api';
import { KpiData } from '../types';

export const kpiService = {
  usuario: async () => { const { data } = await api.get<KpiData>('/kpis'); return data; },
  equipe:  async () => { const { data } = await api.get<KpiData>('/kpis/equipe'); return data; },
};
