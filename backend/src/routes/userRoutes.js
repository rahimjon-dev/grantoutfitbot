import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { telegramAuthMiddleware } from '../middleware/telegramAuth.js';

const router = Router();

router.use(telegramAuthMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/verify', userController.verifySession);

export default router;
