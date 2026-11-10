import { botDb } from '../services/db.js';
import { getLanguageInlineKeyboard, getMainReplyKeyboard, getStoreInlineKeyboard } from '../keyboards/index.js';
import { t } from '../locales/index.js';
import { config } from '../config/index.js';

export async function handleLanguageCallback(ctx) {
  const data = ctx.callbackQuery.data; // e.g. 'set_lang:uz'
  const langCode = data.split(':')[1];
  const telegramId = ctx.from.id;

  // Persist language to database
  await botDb.setUserLanguage(telegramId, langCode, {
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    username: ctx.from.username
  });

  // Configure Telegram Menu Button for this user
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

  await ctx.answerCallbackQuery({
    text: langCode === 'uz' ? 'Til saqlandi!' : langCode === 'ru' ? 'Язык сохранен!' : 'Language saved!'
  });

  // Send persistent keyboard for ongoing navigation
  await ctx.reply(`📱 Menyudan foydalanishingiz mumkin:`, {
    reply_markup: getMainReplyKeyboard(langCode, config.miniAppUrl)
  });

  // Send localized confirmation with direct inline Web App button
  await ctx.reply(t(langCode, 'language_selected'), {
    parse_mode: 'Markdown',
    reply_markup: getStoreInlineKeyboard(langCode, config.miniAppUrl)
  });
}

export async function handleChangeLanguageCommand(ctx) {
  const telegramId = ctx.from.id;
  const user = await botDb.getUser(telegramId);
  const lang = user?.language_code || 'uz';

  await ctx.reply(t(lang, 'change_lang_prompt'), {
    parse_mode: 'Markdown',
    reply_markup: getLanguageInlineKeyboard()
  });
}
