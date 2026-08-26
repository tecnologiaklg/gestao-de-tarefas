import { Router } from 'express';
import { KpiController } from '../controllers/KpiController';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkNotRoot, checkCoordenador } from '../middleware/role.middleware';

const router = Router();
router.use(authMiddleware, checkNotRoot);
router.get('/', KpiController.usuario);
router.get('/equipe', checkCoordenador, KpiController.equipe);
export default router;
