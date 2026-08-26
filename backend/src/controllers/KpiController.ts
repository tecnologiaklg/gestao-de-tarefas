// controllers/KpiController.ts
import { Request, Response, NextFunction } from 'express';
import { KpiService } from '../services/KpiService';
import { JWTPayloadUser } from '../types';

export const KpiController = {
  usuario: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const u = req.user as JWTPayloadUser;
      res.json(await KpiService.kpiUsuario(u.id));
    } catch (e) { next(e); }
  },
  equipe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const u = req.user as JWTPayloadUser;
      res.json(await KpiService.kpiEquipe(u.setor_id!));
    } catch (e) { next(e); }
  },
};
