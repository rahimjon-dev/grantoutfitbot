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
  miniAppUrl: process.env.TELEGRAM_MINI_APP_URL || 'https://grantoutfitbot.onrender.com',
  apiBaseUrl: process.env.API_BASE_URL || 'https://grantoutfitbot.onrender.com',
  adminIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => Number(id)),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  }
};
