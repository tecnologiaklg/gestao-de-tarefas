import { Router } from 'express';
import authRoutes    from './auth.routes';
import usuarioRoutes from './usuario.routes';
import setorRoutes   from './setor.routes';
import tarefaRoutes  from './tarefa.routes';
import kpiRoutes     from './kpi.routes';
import logRoutes     from './log.routes';
import sqlRoutes     from './sql.routes';

const router = Router();
router.use('/auth',     authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/setores',  setorRoutes);
router.use('/tarefas',  tarefaRoutes);
router.use('/kpis',     kpiRoutes);
router.use('/logs',     logRoutes);
router.use('/sql',      sqlRoutes);

export default router;
