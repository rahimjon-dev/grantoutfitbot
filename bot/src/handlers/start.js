import { botDb } from '../services/db.js';
import {
  getLanguageInlineKeyboard,
  getMainReplyKeyboard,
  getStoreInlineKeyboard,
  getPhoneRequestKeyboard
} from '../keyboards/index.js';
import { t } from '../locales/index.js';
import { config } from '../config/index.js';

export async function handleStart(ctx) {
  const telegramId = ctx.from.id;
  const user = await botDb.getUser(telegramId);

  // Configure Telegram Menu Button to open Mini App (requires HTTPS)
  if (config.miniAppUrl && config.miniAppUrl.startsWith('https://')) {
    try {
      await ctx.api.setChatMenuButton({
        chat_id: telegramId,
        menu_button: {
          type: 'web_app',
          text: 'Open Store',
          web_app: { url: config.miniAppUrl }
        }
      });
    } catch (_) {}
  }

  // Log user activity
  await botDb.logActivity(telegramId, 'bot_start', {
    username: ctx.from.username,
    first_name: ctx.from.first_name
  });

  // CASE 1: User is already registered and completed onboarding
  if (user && user.registration_status === 'completed') {
    const lang = user.language_code || 'uz';
    const name = user.first_name || ctx.from.first_name || '';

    // Refresh persistent main menu reply keyboard
    await ctx.reply(`📱 ${lang === 'en' ? 'Main Menu:' : lang === 'ru' ? 'Главное меню:' : 'Asosiy menyu:'}`, {
      reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
    });

    // Send localized greeting with direct inline Mini App button
    return ctx.reply(t(lang, 'welcome_back', { name }), {
      parse_mode: 'Markdown',
      reply_markup: getStoreInlineKeyboard(lang, config.miniAppUrl)
    });
  }

  // CASE 2: User started but is in the middle of onboarding
  if (user && user.language_code) {
    const lang = user.language_code;

    if (user.registration_status === 'awaiting_first_name') {
      return ctx.reply(t(lang, 'enter_first_name'), { parse_mode: 'Markdown' });
    }

    if (user.registration_status === 'awaiting_last_name') {
      return ctx.reply(t(lang, 'enter_last_name', { first_name: user.first_name || '' }), {
        parse_mode: 'Markdown'
      });
    }

    if (user.registration_status === 'awaiting_phone') {
      return ctx.reply(t(lang, 'enter_phone'), {
        parse_mode: 'Markdown',
        reply_markup: getPhoneRequestKeyboard(lang)
      });
    }
  }

  // CASE 3: Completely new user or no language chosen
  return ctx.reply(t('uz', 'welcome'), {
    parse_mode: 'Markdown',
    reply_markup: getLanguageInlineKeyboard()
  });
}
