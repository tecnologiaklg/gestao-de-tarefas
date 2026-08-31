// controllers/TarefaController.ts
import { Request, Response, NextFunction } from 'express';
import { TarefaService } from '../services/TarefaService';

const paramId = (req: Request, key = 'id') => parseInt(req.params[key] as string, 10);

export const TarefaController = {
  buscar: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await TarefaService.buscarPorId(paramId(req), req.user)); } catch (e) { next(e); }
  },
  todas: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const u = req.user as { id: number };
      res.json(await TarefaService.todasTarefas(u.id, req.query as Record<string, string>));
    } catch (e) { next(e); }
  },
  minhas: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const u = req.user as { id: number };
      res.json(await TarefaService.minhasTarefas(u.id, req.query as Record<string, string>));
    } catch (e) { next(e); }
  },
  criadas: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const u = req.user as { id: number };
      res.json(await TarefaService.criadasPorMim(u.id, req.query as Record<string, string>));
    } catch (e) { next(e); }
  },
  equipe: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await TarefaService.tarefasEquipe(req.user, req.query as Record<string, string>)); } catch (e) { next(e); }
  },
  criar: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await TarefaService.criar(req.body, req.user)); } catch (e) { next(e); }
  },
  atualizar: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await TarefaService.atualizar(paramId(req), req.body, req.user)); } catch (e) { next(e); }
  },
  alterarStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, motivo } = req.body;
      res.json(await TarefaService.alterarStatus(paramId(req), status, motivo, req.user));
    } catch (e) { next(e); }
  },
};
