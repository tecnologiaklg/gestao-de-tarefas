import { Router } from 'express';
import { LogController } from '../controllers/LogController';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkRoot } from '../middleware/role.middleware';

const router = Router();
router.use(authMiddleware, checkRoot);
router.get('/', LogController.listar);
export default router;
