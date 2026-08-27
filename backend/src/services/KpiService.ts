// services/KpiService.ts
import { TarefaRepository } from '../repositories/TarefaRepository';
import { KpiData } from '../types';

function mapKpi(raw: Record<string, string>): KpiData {
  return {
    abertas:      parseInt(raw.abertas ?? '0', 10),
    atrasadas:    parseInt(raw.atrasadas ?? '0', 10),
    concluidas7d: parseInt(raw.concluidas_7d ?? '0', 10),
    emAndamento:  parseInt(raw.em_andamento ?? '0', 10),
  };
}

export const KpiService = {
  kpiUsuario: async (userId: number): Promise<KpiData> => mapKpi(await TarefaRepository.kpiByUser(userId)),
  kpiEquipe:  async (setorId: number): Promise<KpiData> => mapKpi(await TarefaRepository.kpiBySetor(setorId)),
};
