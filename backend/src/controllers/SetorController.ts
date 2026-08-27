// controllers/SetorController.ts
import { Request, Response, NextFunction } from 'express';
import { SetorService } from '../services/SetorService';
import { JWTPayloadUser } from '../types';

export const SetorController = {
  listar: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await SetorService.listar()); } catch (e) { next(e); }
  },
  criar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const u = req.user as Partial<JWTPayloadUser>;
      res.status(201).json(await SetorService.criar(req.body.nome as string, u?.id));
    } catch (e) { next(e); }
  },
  atualizar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const u = req.user as Partial<JWTPayloadUser>;
      res.json(await SetorService.atualizar(parseInt(req.params.id as string, 10), req.body.nome as string, u?.id));
    } catch (e) { next(e); }
  },
};
