import { db } from '../services/supabase.js';

export const userController = {
  async getProfile(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      let user = await db.getUserByTelegramId(telegramId);

      if (!user) {
        const defaultLang = ['uz', 'ru', 'en'].includes(req.telegramUser.language_code)
          ? req.telegramUser.language_code
          : 'uz';

        user = await db.upsertUser({
          telegramId,
          firstName: req.telegramUser.first_name,
          lastName: req.telegramUser.last_name,
          username: req.telegramUser.username,
          languageCode: defaultLang,
          registrationStatus: 'unregistered',
          phoneVerified: false
        });
      }

      res.json({
        success: true,
        data: {
          ...user,
          is_admin: req.isAdmin
        }
      });
    } catch (err) {
      console.error('Error in getProfile:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const telegramId = req.telegramUser.id;
      const { firstName, lastName, phoneNumber, deliveryAddress, deliveryCity, languageCode } = req.body;

      const validLang = ['uz', 'ru', 'en'].includes(languageCode) ? languageCode : undefined;

      const updated = await db.upsertUser({
        telegramId,
        firstName,
        lastName,
        phoneNumber,
        deliveryAddress,
        deliveryCity,
        languageCode: validLang
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      console.error('Error in updateProfile:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async verifySession(req, res) {
    try {
      res.json({
        success: true,
        user: req.telegramUser,
        isAdmin: req.isAdmin
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
