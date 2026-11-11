import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const CACHE_FILE = path.join(DATA_DIR, 'users_cache.json');

// Ensure data directory exists for disk persistence
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[DB Cache] Could not create data directory:', err.message);
}

// In-memory Stores
const usersStore = new Map();
const ordersStore = [];

// Load persistent cache from disk on startup
function loadCacheFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const user of parsed) {
          if (user && user.telegram_id) {
            usersStore.set(Number(user.telegram_id), user);
          }
        }
        console.log(`💾 [DB Cache] Loaded ${usersStore.size} persistent user records from disk cache.`);
      }
    }
  } catch (err) {
    console.warn('[DB Cache] Failed to load cache from disk:', err.message);
  }
}

loadCacheFromDisk();

// Debounced disk flush to avoid excessive I/O
let saveTimeout = null;
function flushCacheToDisk() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const list = Array.from(usersStore.values());
      fs.writeFileSync(CACHE_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DB Cache] Failed to flush cache to disk:', err.message);
    }
  }, 300);
}

// Supabase Client with timeout wrapper
let supabase = null;
if (config.supabase.url && config.supabase.serviceRoleKey) {
  try {
    supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false }
    });
    console.log('✅ Bot: Supabase client initialized.');
  } catch (err) {
    console.warn('Bot: Supabase client init warning:', err.message);
  }
}

// Helper: Run Supabase query with a strict timeout (default 2500ms) to prevent bot hanging
async function withTimeout(promise, ms = 2500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('SUPABASE_QUERY_TIMEOUT')), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

function isUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export const botDb = {
  /**
   * Retrieve user from memory/disk cache first, or query Supabase with fallback.
   */
  async getUser(telegramId) {
    if (!telegramId) return null;
    const tid = Number(telegramId);

    // 1. Check local cache
    const cached = usersStore.get(tid);

    // 2. Query Supabase to ensure fresh record
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase.from('users').select('*').eq('telegram_id', tid).maybeSingle()
        );
        if (!error && data) {
          const merged = { ...cached, ...data };
          usersStore.set(tid, merged);
          flushCacheToDisk();
          return merged;
        }
      } catch (err) {
        // Network/DNS error or timeout: seamlessly fall back to cache
      }
    }

    return cached || null;
  },

  /**
   * Get user language. Always returns 'uz', 'ru', or 'en' (defaults strictly to 'uz', NEVER 'en').
   */
  async getUserLanguage(telegramId) {
    const user = await this.getUser(telegramId);
    if (user && user.language_code && ['uz', 'ru', 'en'].includes(user.language_code)) {
      return user.language_code;
    }
    return 'uz';
  },

  /**
   * Set and permanently persist user language.
   */
  async setUserLanguage(telegramId, languageCode, userInfo = {}) {
    const tid = Number(telegramId);
    const validLang = ['uz', 'ru', 'en'].includes(languageCode) ? languageCode : 'uz';

    const existing = usersStore.get(tid) || {
      telegram_id: tid,
      registration_status: 'language_selected',
      phone_verified: false,
      created_at: new Date().toISOString()
    };

    existing.language_code = validLang;
    if (userInfo.first_name) existing.first_name = userInfo.first_name;
    if (userInfo.last_name !== undefined) existing.last_name = userInfo.last_name;
    if (userInfo.username !== undefined) existing.username = userInfo.username;
    existing.last_active_at = new Date().toISOString();
    existing.updated_at = new Date().toISOString();

    usersStore.set(tid, existing);
    flushCacheToDisk();
    console.log(`🌐 [DB] Language updated for user ${tid} -> ${validLang}`);

    // Asynchronously sync to Supabase
    if (supabase) {
      withTimeout(
        supabase.from('users').upsert(
          {
            telegram_id: tid,
            first_name: existing.first_name,
            last_name: existing.last_name,
            username: existing.username,
            language_code: validLang,
            last_active_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'telegram_id' }
        )
      ).catch((err) => {
        console.warn(`[DB Sync] setUserLanguage warning:`, err.message);
      });

      withTimeout(
        supabase.from('user_activity').insert({
          telegram_id: tid,
          action: 'change_language',
          metadata: { language: validLang }
        })
      ).catch(() => {});
    }

    return existing;
  },

  /**
   * Save registration state (e.g. 'awaiting_first_name', 'awaiting_last_name', 'awaiting_phone')
   */
  async setRegistrationStatus(telegramId, status, extraFields = {}) {
    const tid = Number(telegramId);
    const existing = usersStore.get(tid) || {
      telegram_id: tid,
      language_code: 'uz',
      created_at: new Date().toISOString()
    };

    const updated = {
      ...existing,
      ...extraFields,
      registration_status: status,
      updated_at: new Date().toISOString()
    };

    usersStore.set(tid, updated);
    flushCacheToDisk();

    if (supabase) {
      withTimeout(
        supabase.from('users').upsert(
          {
            telegram_id: tid,
            first_name: updated.first_name,
            last_name: updated.last_name,
            username: updated.username,
            phone_number: updated.phone_number,
            phone_verified: Boolean(updated.phone_verified),
            language_code: updated.language_code || 'uz',
            registration_status: status,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'telegram_id' }
        )
      ).catch((err) => console.warn('[DB Sync] setRegistrationStatus warning:', err.message));
    }

    return updated;
  },

  /**
   * Complete user onboarding and transition to 'completed'
   */
  async completeRegistration(telegramId, { firstName, lastName, phoneNumber, phoneVerified = true, username }) {
    const tid = Number(telegramId);
    const existing = usersStore.get(tid) || { telegram_id: tid, language_code: 'uz' };

    const now = new Date().toISOString();
    const completedUser = {
      ...existing,
      first_name: firstName || existing.first_name,
      last_name: lastName !== undefined ? lastName : existing.last_name,
      username: username !== undefined ? username : existing.username,
      phone_number: phoneNumber || existing.phone_number,
      phone_verified: Boolean(phoneVerified),
      registration_status: 'completed',
      registered_at: existing.registered_at || now,
      edit_state: null,
      last_active_at: now,
      updated_at: now
    };

    usersStore.set(tid, completedUser);
    flushCacheToDisk();
    console.log(`🎉 [DB] Registration completed for user ${tid} (${completedUser.first_name} ${completedUser.last_name})`);

    if (supabase) {
      withTimeout(
        supabase.from('users').upsert(
          {
            telegram_id: tid,
            first_name: completedUser.first_name,
            last_name: completedUser.last_name,
            username: completedUser.username,
            phone_number: completedUser.phone_number,
            phone_verified: completedUser.phone_verified,
            language_code: completedUser.language_code || 'uz',
            registration_status: 'completed',
            registered_at: completedUser.registered_at,
            last_active_at: now,
            updated_at: now
          },
          { onConflict: 'telegram_id' }
        )
      ).catch((err) => console.warn('[DB Sync] completeRegistration warning:', err.message));

      withTimeout(
        supabase.from('user_activity').insert({
          telegram_id: tid,
          action: 'registration_completed',
          metadata: { phone: completedUser.phone_number, verified: completedUser.phone_verified }
        })
      ).catch(() => {});
    }

    return completedUser;
  },

  /**
   * Set temporary inline profile edit mode (e.g. 'editing_first_name', 'editing_last_name', 'editing_phone', or null)
   */
  async setUserEditState(telegramId, editState) {
    const tid = Number(telegramId);
    const existing = usersStore.get(tid);
    if (existing) {
      existing.edit_state = editState;
      usersStore.set(tid, existing);
    }
  },

  /**
   * Save phone number (used for update or registration)
   */
  async savePhoneNumber(telegramId, phoneNumber, verified = true) {
    const tid = Number(telegramId);
    const existing = usersStore.get(tid) || { telegram_id: tid, language_code: 'uz' };
    existing.phone_number = phoneNumber;
    existing.phone_verified = Boolean(verified);
    existing.edit_state = null;
    existing.updated_at = new Date().toISOString();

    usersStore.set(tid, existing);
    flushCacheToDisk();

    if (supabase) {
      withTimeout(
        supabase.from('users').update({
          phone_number: phoneNumber,
          phone_verified: Boolean(verified),
          updated_at: new Date().toISOString()
        }).eq('telegram_id', tid)
      ).catch(() => {});
    }
    return existing;
  },

  /**
   * Save updated profile fields (e.g. first_name, last_name)
   */
  async updateProfileFields(telegramId, fields = {}) {
    const tid = Number(telegramId);
    const existing = usersStore.get(tid) || { telegram_id: tid, language_code: 'uz' };
    const updated = {
      ...existing,
      ...fields,
      edit_state: null,
      updated_at: new Date().toISOString()
    };

    usersStore.set(tid, updated);
    flushCacheToDisk();

    if (supabase) {
      withTimeout(
        supabase.from('users').update({
          ...fields,
          updated_at: new Date().toISOString()
        }).eq('telegram_id', tid)
      ).catch(() => {});
    }
    return updated;
  },

  async logActivity(telegramId, action, metadata = {}) {
    const tid = Number(telegramId);
    if (supabase) {
      withTimeout(
        supabase.from('user_activity').insert({
          telegram_id: tid,
          action,
          metadata
        })
      ).catch(() => {});
    }
  },

  async getUserOrders(telegramId) {
    const tid = Number(telegramId);
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('orders')
            .select(`*, items:order_items(*)`)
            .eq('telegram_id', tid)
            .order('created_at', { ascending: false })
            .limit(5)
        );
        if (!error && data) return data;
      } catch (_) {}
    }
    return ordersStore.filter(o => o.telegram_id === tid).slice(0, 5);
  },

  async getUserOrderCount(telegramId) {
    const tid = Number(telegramId);
    if (supabase) {
      try {
        const { count, error } = await withTimeout(
          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('telegram_id', tid)
        );
        if (!error && typeof count === 'number') return count;
      } catch (_) {}
    }
    return ordersStore.filter(o => o.telegram_id === tid).length;
  },

  async updateOrderStatus(orderId, status, adminId) {
    if (supabase) {
      try {
        let orderRecord = null;
        if (isUUID(orderId)) {
          const { data } = await withTimeout(
            supabase.from('orders').select('*').eq('id', orderId).maybeSingle()
          );
          orderRecord = data;
        } else {
          const { data } = await withTimeout(
            supabase.from('orders').select('*').eq('order_number', orderId).maybeSingle()
          );
          orderRecord = data;
        }

        if (orderRecord) {
          if (status === 'cancelled') {
            await withTimeout(
              supabase.rpc('cancel_order_atomic', {
                p_order_id: orderRecord.id,
                p_changed_by: `admin:${adminId}`,
                p_reason: `Cancelled via Telegram bot by Admin ${adminId}`
              })
            );
          } else {
            await withTimeout(
              supabase
                .from('orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', orderRecord.id)
            );

            await withTimeout(
              supabase.from('order_status_history').insert({
                order_id: orderRecord.id,
                previous_status: orderRecord.status,
                new_status: status,
                changed_by: `admin:${adminId}`,
                notes: `Updated via Telegram inline button by Admin ${adminId}`
              })
            );
          }
          return { ...orderRecord, status };
        }
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
