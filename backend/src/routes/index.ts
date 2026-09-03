import { Router } from 'express';
import authRoutes    from './auth.routes';
import usuarioRoutes from './usuario.routes';
import setorRoutes   from './setor.routes';
import tarefaRoutes  from './tarefa.routes';
import kpiRoutes     from './kpi.routes';
import logRoutes     from './log.routes';
import sqlRoutes     from './sql.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { SseService } from '../services/SseService';

const router = Router();

// Rota SSE para sincronização em tempo real com a tela aberta
router.get('/events', authMiddleware, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const userId = 'id' in req.user ? req.user.id : 0;
  SseService.addClient(userId, res);
});

router.use('/auth',     authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/setores',  setorRoutes);
router.use('/tarefas',  tarefaRoutes);
router.use('/kpis',     kpiRoutes);
router.use('/logs',     logRoutes);
router.use('/sql',      sqlRoutes);

export default router;
