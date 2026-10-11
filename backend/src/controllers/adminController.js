import { db } from '../services/supabase.js';
import { telegramNotifier } from '../services/telegramBot.js';

export const adminController = {
  // --- REAL-TIME STATS ---
  async getStats(req, res) {
    try {
      const stats = await db.getAdminStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      console.error('Error in admin getStats:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // --- ORDERS MANAGEMENT ---
  async getOrders(req, res) {
    try {
      const { status, search, limit, offset } = req.query;
      const orders = await db.getAllOrdersAdmin({
        status,
        search,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });
      res.json({ success: true, data: orders });
    } catch (err) {
      console.error('Error in admin getOrders:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, trackingNumber, dispatchNotes, notes } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const updated = await db.updateOrderStatus(id, {
        status,
        changedBy: `admin:${req.telegramUser?.id || 'web'}`,
        notes,
        trackingNumber,
        dispatchNotes
      });

      // Find user's preferred language
      const user = await db.getUserByTelegramId(updated.telegram_id);
      const userLang = user?.language_code || 'uz';

      // Send status update notification to customer via Telegram
      telegramNotifier.notifyCustomerStatusChange(updated, userLang).catch(err => {
        console.warn('Customer status notification error:', err.message);
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      console.error('Error in admin updateOrderStatus:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // --- PRODUCTS MANAGEMENT ---
  async saveProduct(req, res) {
    try {
      const productData = req.body;
      const saved = await db.saveProduct(productData);
      res.json({ success: true, data: saved });
    } catch (err) {
      console.error('Error saving product:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await db.deleteProduct(id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // --- USERS MANAGEMENT ---
  async getUsers(req, res) {
    try {
      const { search, limit, offset } = req.query;
      const users = await db.getAllUsersAdmin({
        search,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });
      res.json({ success: true, data: users });
    } catch (err) {
      console.error('Error in admin getUsers:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // --- PROMOTIONS & BROADCASTS ---
  async sendBroadcast(req, res) {
    try {
      const { message, imageUrl, targetLanguage } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message text is required' });
      }

      // Fetch target users
      const allUsers = await db.getAllUsersAdmin({ limit: 5000 });
      let targetUsers = allUsers;
      if (targetLanguage && targetLanguage !== 'all') {
        targetUsers = targetUsers.filter(u => u.language_code === targetLanguage);
      }

      const userIds = targetUsers.map(u => u.telegram_id).filter(Boolean);

      // Execute rate-limited broadcast
      const results = await telegramNotifier.broadcastAnnouncement({
        userIds,
        message: message.trim(),
        imageUrl: imageUrl?.trim() || null
      });

      // Save notification log
      await db.saveBroadcastNotification({
        title: message.slice(0, 60),
        message,
        image_url: imageUrl,
        target_language: targetLanguage || 'all',
        sent_by: req.telegramUser?.id,
        total_targeted: userIds.length,
        total_delivered: results.successCount,
        total_failed: results.failureCount,
        status: 'completed'
      });

      res.json({
        success: true,
        data: {
          totalTargeted: userIds.length,
          delivered: results.successCount,
          failed: results.failureCount
        }
      });
    } catch (err) {
      console.error('Error sending broadcast:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
