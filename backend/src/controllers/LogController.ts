// controllers/LogController.ts
import { Request, Response, NextFunction } from 'express';
import { LogService } from '../services/LogService';

export const LogController = {
  listar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { usuario_id, tipo_evento } = req.query;
      res.json(await LogService.listar({
        usuario_id: usuario_id ? parseInt(usuario_id as string) : undefined,
        tipo_evento: tipo_evento as string | undefined,
      }));
    } catch (e) { next(e); }
  },
};
