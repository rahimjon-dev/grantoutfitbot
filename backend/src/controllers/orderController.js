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

      // 1. Validate customer name
      if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Ism kamida 2 ta harfdan iborat bo‘lishi shart'
        });
      }

      // 2. Validate phone number
      const cleanPhone = (phoneNumber || '').trim();
      if (!cleanPhone || !/^\+?[0-9\s\-()]{9,20}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'To‘g‘ri telefon raqam kiritilishi shart (masalan: +998 90 123 45 67)'
        });
      }

      // 3. Validate delivery address
      if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Yetkazib berish manzili kiritilishi shart'
        });
      }

      // 4. Validate payment method
      const allowedPaymentMethods = ['cash_on_delivery', 'manual_transfer', 'card_on_delivery'];
      const validatedPaymentMethod = allowedPaymentMethods.includes(paymentMethod) ? paymentMethod : 'cash_on_delivery';

      let rawItems = items;
      if (!rawItems || !rawItems.length) {
        const cartItems = await db.getUserCart(telegramId);
        rawItems = cartItems.map(c => ({
          variantId: c.variant_id,
          productId: c.product_id,
          quantity: c.quantity
        }));
      }

      if (!rawItems || !rawItems.length) {
        return res.status(400).json({
          success: false,
          error: 'CART_EMPTY',
          message: 'Savatchangiz bo‘sh'
        });
      }

      // 5. Consolidate & validate items (recalculate price strictly on backend, eliminate duplicates)
      const consolidatedMap = new Map();
      for (const item of rawItems) {
        const variantId = item.variantId || item.variant_id;
        const productId = item.productId || item.product_id;
        const qty = parseInt(item.quantity || '1', 10);

        if (!variantId || isNaN(qty) || qty <= 0) {
          return res.status(400).json({
            success: false,
            error: 'INVALID_ITEM',
            message: 'Har bir mahsulot varianti va to‘g‘ri miqdor ko‘rsatilishi shart'
          });
        }

        if (qty > 50) {
          return res.status(400).json({
            success: false,
            error: 'QUANTITY_LIMIT_EXCEEDED',
            message: 'Bitta variantdan maksimal 50 dona buyurtma berish mumkin'
          });
        }

        if (consolidatedMap.has(variantId)) {
          consolidatedMap.get(variantId).quantity += qty;
        } else {
          consolidatedMap.set(variantId, {
            variant_id: variantId,
            product_id: productId,
            quantity: qty
          });
        }
      }

      const orderItems = Array.from(consolidatedMap.values());

      // 6. Execute atomic order placement & stock deduction
      const orderResult = await db.createOrder({
        telegramId,
        customerName: customerName.trim(),
        phoneNumber: cleanPhone,
        deliveryAddress: deliveryAddress.trim(),
        deliveryCity: (deliveryCity || 'Tashkent').trim(),
        deliveryNotes: deliveryNotes ? deliveryNotes.trim() : null,
        paymentMethod: validatedPaymentMethod,
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
