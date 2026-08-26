import { Router } from 'express';
import { SetorController } from '../controllers/SetorController';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkRoot } from '../middleware/role.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/', SetorController.listar);
router.post('/', checkRoot, SetorController.criar);
router.patch('/:id', checkRoot, SetorController.atualizar);
export default router;
