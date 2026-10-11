import { db } from '../services/supabase.js';
import { telegramNotifier } from '../services/telegramBot.js';

export const orderController = {
  // --- CART ---
  async getCart(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      const cart = await db.getUserCart(telegramId);
      res.json({ success: true, data: cart });
    } catch (err) {
      console.error('Error in getCart:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async addToCart(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      const { productId, variantId, quantity } = req.body;

      if (!productId || !variantId) {
        return res.status(400).json({ success: false, error: 'productId and variantId are required' });
      }

      const cart = await db.addToCart(telegramId, {
        productId,
        variantId,
        quantity: parseInt(quantity || '1', 10)
      });
      res.json({ success: true, data: cart });
    } catch (err) {
      console.error('Error in addToCart:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateCartItem(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      const { variantId } = req.params;
      const { quantity } = req.body;

      const cart = await db.updateCartItem(telegramId, variantId, parseInt(quantity, 10));
      res.json({ success: true, data: cart });
    } catch (err) {
      console.error('Error in updateCartItem:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async removeFromCart(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      const { variantId } = req.params;

      const cart = await db.removeFromCart(telegramId, variantId);
      res.json({ success: true, data: cart });
    } catch (err) {
      console.error('Error in removeFromCart:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // --- CHECKOUT & ORDER CREATION ---
  async createOrder(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      const { customerName, phoneNumber, deliveryAddress, deliveryCity, deliveryNotes, paymentMethod, items } = req.body;

      if (!customerName || !phoneNumber || !deliveryAddress) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Ism, telefon raqam va yetkazish manzili kiritilishi shart'
        });
      }

      let orderItems = items;
      if (!orderItems || !orderItems.length) {
        const cartItems = await db.getUserCart(telegramId);
        orderItems = cartItems.map(c => ({
          variantId: c.variant_id,
          productId: c.product_id,
          quantity: c.quantity
        }));
      }

      if (!orderItems || !orderItems.length) {
        return res.status(400).json({
          success: false,
          error: 'CART_EMPTY',
          message: 'Savatchangiz bo‘sh'
        });
      }

      // Execute atomic order placement & stock deduction
      const orderResult = await db.createOrder({
        telegramId,
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryCity: deliveryCity?.trim() || 'Tashkent',
        deliveryNotes: deliveryNotes?.trim() || null,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        items: orderItems
      });

      // Dispatch alert to Administrators asynchronously
      telegramNotifier.notifyAdminsNewOrder(orderResult).catch(err => {
        console.error('Error notifying admins via Telegram:', err);
      });

      res.status(201).json({
        success: true,
        data: orderResult
      });
    } catch (err) {
      console.error('Error creating order:', err);
      const isStockError = err.message?.includes('INSUFFICIENT_STOCK');
      res.status(isStockError ? 409 : 500).json({
        success: false,
        error: isStockError ? 'INSUFFICIENT_STOCK' : 'ORDER_FAILED',
        message: err.message
      });
    }
  },

  // --- MY ORDERS ---
  async getMyOrders(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      const orders = await db.getUserOrders(telegramId);
      res.json({ success: true, data: orders });
    } catch (err) {
      console.error('Error in getMyOrders:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getOrderById(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      const { id } = req.params;
      const order = await db.getOrderById(id);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      // Customer can only view their own order unless they are an admin
      if (order.telegram_id !== telegramId && !req.isAdmin) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      res.json({ success: true, data: order });
    } catch (err) {
      console.error('Error in getOrderById:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
