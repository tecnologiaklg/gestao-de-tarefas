import { Router, Request, Response } from 'express';
import { TarefaController } from '../controllers/TarefaController';
import { ComentarioController } from '../controllers/ComentarioController';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkNotRoot, checkCoordenador } from '../middleware/role.middleware';

const router = Router();
router.use(authMiddleware);

// DELETE bloqueado em qualquer rota de tarefa (§27, §54)
router.delete('*', (_req: Request, res: Response) =>
  res.status(405).json({ error: 'Exclusão de tarefas não é permitida' })
);

router.get('/minhas',         checkNotRoot, TarefaController.minhas);
router.get('/criadas',        checkNotRoot, TarefaController.criadas);
router.get('/equipe',         checkNotRoot, checkCoordenador, TarefaController.equipe);
router.get('/:id',            TarefaController.buscar);
router.post('/',              checkNotRoot, TarefaController.criar);
router.patch('/:id',          checkNotRoot, TarefaController.atualizar);
router.patch('/:id/status',   checkNotRoot, TarefaController.alterarStatus);

router.get('/:tarefaId/comentarios',   ComentarioController.listar);
router.post('/:tarefaId/comentarios',  checkNotRoot, ComentarioController.criar);

export default router;

import { HistoricoRepository } from '../repositories/HistoricoRepository';
router.get('/:id/historico', async (req, res, next) => { try { res.json(await HistoricoRepository.findByTarefa(parseInt(req.params.id))); } catch(e) { next(e); } });
