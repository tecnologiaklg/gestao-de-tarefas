import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkRoot } from '../middleware/role.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/', checkRoot, UsuarioController.listar);
router.get('/gerar-pin', checkRoot, UsuarioController.gerarPin);
router.post('/', checkRoot, UsuarioController.criar);
router.patch('/:id/status', checkRoot, UsuarioController.alterarStatus);
router.get('/setor/:setorId', UsuarioController.listarPorSetor);
export default router;
