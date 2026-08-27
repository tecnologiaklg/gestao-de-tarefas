// services/LogService.ts
import { LogRepository } from '../repositories/LogRepository';

export const LogService = {
  listar: (filters: { usuario_id?: number; tipo_evento?: string }) =>
    LogRepository.findAll(filters),
};
