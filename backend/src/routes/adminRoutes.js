import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/stats', adminController.getStats);
router.get('/orders', adminController.getOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.post('/products', adminController.saveProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/users', adminController.getUsers);
router.post('/broadcast', adminController.sendBroadcast);

export default router;
