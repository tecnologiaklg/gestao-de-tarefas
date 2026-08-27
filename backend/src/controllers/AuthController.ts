// controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export const AuthController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await AuthService.login(req.body)); } catch (e) { next(e); }
  },

  confirmar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body as { code?: string };
      if (!code) { res.status(400).json({ error: 'Código é obrigatório' }); return; }
      res.json(await AuthService.confirmarCodigo(code));
    } catch (e) { next(e); }
  },
};
