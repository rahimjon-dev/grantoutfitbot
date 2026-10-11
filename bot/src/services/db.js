import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

let supabase = null;

if (config.supabase.url && config.supabase.serviceRoleKey) {
  try {
    supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  } catch (err) {
    console.warn('Bot: Supabase client init warning:', err.message);
  }
}

// In-memory fallback for bot
const usersStore = new Map();
const ordersStore = [];

export const botDb = {
  async getUser(telegramId) {
    const tid = Number(telegramId);
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', tid)
        .single();
      if (!error && data) return data;
    }
    return usersStore.get(tid) || null;
  },

  async setUserLanguage(telegramId, languageCode, userInfo = {}) {
    const tid = Number(telegramId);
    if (supabase) {
      try {
        await supabase
          .from('users')
          .upsert(
            {
              telegram_id: tid,
              first_name: userInfo.first_name,
              last_name: userInfo.last_name,
              username: userInfo.username,
              language_code: languageCode,
              last_active_at: new Date().toISOString()
            },
            { onConflict: 'telegram_id' }
          );

        await supabase.from('user_activity').insert({
          telegram_id: tid,
          action: 'change_language',
          metadata: { language: languageCode }
        });
      } catch (err) {
        console.warn('Supabase setUserLanguage error:', err.message);
      }
    }

    const existing = usersStore.get(tid) || {
      telegram_id: tid,
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
      username: userInfo.username
    };
    existing.language_code = languageCode;
    usersStore.set(tid, existing);
    return existing;
  },

  async savePhoneNumber(telegramId, phoneNumber) {
    const tid = Number(telegramId);
    if (supabase) {
      try {
        await supabase
          .from('users')
          .update({ phone_number: phoneNumber, updated_at: new Date().toISOString() })
          .eq('telegram_id', tid);
      } catch (_) {}
    }

    const user = usersStore.get(tid);
    if (user) {
      user.phone_number = phoneNumber;
      usersStore.set(tid, user);
    }
  },

  async logActivity(telegramId, action, metadata = {}) {
    const tid = Number(telegramId);
    if (supabase) {
      try {
        await supabase.from('user_activity').insert({
          telegram_id: tid,
          action,
          metadata
        });
      } catch (_) {}
    }
  },

  async getUserOrders(telegramId) {
    const tid = Number(telegramId);
    if (supabase) {
      const { data } = await supabase
        .from('orders')
        .select(`*, items:order_items(*)`)
        .eq('telegram_id', tid)
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) return data;
    }
    return ordersStore.filter(o => o.telegram_id === tid).slice(0, 5);
  },

  async updateOrderStatus(orderId, status, adminId) {
    if (supabase) {
      try {
        const { data: updated } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .select()
          .single();

        await supabase.from('order_status_history').insert({
          order_id: orderId,
          new_status: status,
          changed_by: `admin:${adminId}`,
          notes: `Updated via Telegram inline button by Admin ${adminId}`
        });

        return updated;
      } catch (err) {
        console.warn('Supabase updateOrderStatus error:', err.message);
      }
    }

    const order = ordersStore.find(o => o.id === orderId || o.order_number === orderId);
    if (order) {
      order.status = status;
      return order;
    }
    return { id: orderId, status };
  }
};
