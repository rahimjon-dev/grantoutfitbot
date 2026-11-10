import { botDb } from '../services/db.js';
import { getLanguageInlineKeyboard, getMainReplyKeyboard, getStoreInlineKeyboard } from '../keyboards/index.js';
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
    } catch (err) {
      // Menu button may fail if url is invalid without fatal impact
    }
  }

  // Log user activity
  await botDb.logActivity(telegramId, 'bot_start', {
    username: ctx.from.username,
    first_name: ctx.from.first_name
  });

  // If user has not yet chosen a language, prompt selection
  if (!user || !user.language_code) {
    return ctx.reply(t('uz', 'welcome'), {
      parse_mode: 'Markdown',
      reply_markup: getLanguageInlineKeyboard()
    });
  }

  // User already has a language saved
  const lang = user.language_code;
  const greeting = lang === 'en'
    ? `✨ *GRANT LUXURY OUTFITBOT*\n\nWelcome, ${ctx.from.first_name}!\nClick *Open Store* below to explore the latest collection.`
    : lang === 'ru'
      ? `✨ *GRANT LUXURY OUTFITBOT*\n\nДобро пожаловать, ${ctx.from.first_name}!\nНажмите кнопку *Открыть Магазин* ниже, чтобы перейти к покупкам.`
      : `✨ *GRANT LUXURY OUTFITBOT*\n\nXush kelibsiz, ${ctx.from.first_name}!\nKolleksiyani ko‘rish uchun quyidagi *Do‘konni Ochish* tugmasini bosing.`;

  // First ensure persistent keyboard is active
  await ctx.reply(`📱 Menyudan foydalanishingiz mumkin:`, {
    reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
  });

  // Provide direct inline web_app button
  return ctx.reply(greeting, {
    parse_mode: 'Markdown',
    reply_markup: getStoreInlineKeyboard(lang, config.miniAppUrl)
  });
}
