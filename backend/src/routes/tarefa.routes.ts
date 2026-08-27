import { Router, Request, Response } from 'express';
import { TarefaController } from '../controllers/TarefaController';
import { ComentarioController } from '../controllers/ComentarioController';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkNotRoot, checkCoordenador } from '../middleware/role.middleware';
import { HistoricoRepository } from '../repositories/HistoricoRepository';

const router = Router();
router.use(authMiddleware);

// DELETE bloqueado em qualquer rota de tarefa (§27, §54)
router.use((req: Request, res: Response, next) => {
  if (req.method === 'DELETE') {
    return res.status(405).json({ error: 'Exclusão de tarefas não é permitida' });
  }
  next();
});

router.get('/minhas',         checkNotRoot, TarefaController.minhas);
router.get('/criadas',        checkNotRoot, TarefaController.criadas);
router.get('/equipe',         checkNotRoot, checkCoordenador, TarefaController.equipe);
router.get('/:id',            TarefaController.buscar);
router.post('/',              checkNotRoot, TarefaController.criar);
router.patch('/:id',          checkNotRoot, TarefaController.atualizar);
router.patch('/:id/status',   checkNotRoot, TarefaController.alterarStatus);

router.get('/:tarefaId/comentarios',   ComentarioController.listar);
router.post('/:tarefaId/comentarios',  checkNotRoot, ComentarioController.criar);
router.get('/:id/historico', async (req, res, next) => {
  try {
    res.json(await HistoricoRepository.findByTarefa(parseInt(req.params.id)));
  } catch(e) {
    next(e);
  }
});

export default router;
