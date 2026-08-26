// controllers/UsuarioController.ts
import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/UsuarioService';
import { JWTPayloadUser } from '../types';

export const UsuarioController = {
  listar: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await UsuarioService.listar()); } catch (e) { next(e); }
  },
  criar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as Partial<JWTPayloadUser>;
      res.status(201).json(await UsuarioService.criar(req.body, user?.id));
    } catch (e) { next(e); }
  },
  alterarStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as Partial<JWTPayloadUser>;
      res.json(await UsuarioService.alterarStatus(parseInt(req.params.id as string, 10), req.body.ativo as boolean, user?.id));
    } catch (e) { next(e); }
  },
  listarPorSetor: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as Partial<JWTPayloadUser>;
      res.json(await UsuarioService.listarPorSetor(parseInt(req.params.setorId as string, 10), user?.id));
    } catch (e) { next(e); }
  },
};
