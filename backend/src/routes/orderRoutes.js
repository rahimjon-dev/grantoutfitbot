import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { telegramAuthMiddleware } from '../middleware/telegramAuth.js';

const router = Router();

// Apply Telegram authentication middleware to all order & cart routes
router.use(telegramAuthMiddleware);

// Cart endpoints
router.get('/cart', orderController.getCart);
router.post('/cart', orderController.addToCart);
router.put('/cart/:variantId', orderController.updateCartItem);
router.delete('/cart/:variantId', orderController.removeFromCart);

// Order endpoints
router.post('/checkout', orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

export default router;
