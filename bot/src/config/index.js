import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from bot or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  miniAppUrl: (process.env.TELEGRAM_MINI_APP_URL || 'https://grantoutfitbot.vercel.app/').trim(),
  apiBaseUrl: process.env.API_BASE_URL || 'https://grantoutfitbot.onrender.com',
  adminIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => Number(id)),
  supportPhone: process.env.SUPPORT_PHONE || '+998 (71) 200-00-00',
  supportTelegram: (process.env.SUPPORT_TELEGRAM || 'grant_support').replace(/^@/, ''),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  }
};

export function validateBotConfig() {
  const missing = [];
  if (!config.botToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!config.supabase.url) missing.push('SUPABASE_URL');
  if (!config.supabase.serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    console.warn(`⚠️ [BOT CONFIG WARNING] Missing configuration variables: ${missing.join(', ')}`);
  }
  return { isValid: missing.length === 0, missing };
}
