import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { orderController } from '../controllers/orderController.js';
import { telegramAuthMiddleware } from '../middleware/telegramAuth.js';

const router = Router();

// Checkout rate limiter: 15 checkout attempts per 5 minutes per IP
const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Juda ko‘p urinish. Iltimos, bir ozdan so‘ng qayta urinib ko‘ring.'
  }
});

// Apply Telegram authentication middleware to all order & cart routes
router.use(telegramAuthMiddleware);

// Cart endpoints
router.get('/cart', orderController.getCart);
router.post('/cart', orderController.addToCart);
router.put('/cart/:variantId', orderController.updateCartItem);
router.delete('/cart/:variantId', orderController.removeFromCart);

// Order endpoints
router.post('/checkout', checkoutLimiter, orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

export default router;
