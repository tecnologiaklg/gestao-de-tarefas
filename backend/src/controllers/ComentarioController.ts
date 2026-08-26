// controllers/ComentarioController.ts
import { Request, Response, NextFunction } from 'express';
import { ComentarioService } from '../services/ComentarioService';

export const ComentarioController = {
  listar: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await ComentarioService.listar(parseInt(req.params.tarefaId as string, 10))); } catch (e) { next(e); }
  },
  criar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(await ComentarioService.criar(parseInt(req.params.tarefaId as string, 10), req.body.conteudo, req.user));
    } catch (e) { next(e); }
  },
};
