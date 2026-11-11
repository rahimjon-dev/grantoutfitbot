import { botDb } from '../services/db.js';
import { getLanguageInlineKeyboard, getMainReplyKeyboard, getStoreInlineKeyboard } from '../keyboards/index.js';
import { t } from '../locales/index.js';
import { config } from '../config/index.js';

export async function handleLanguageCallback(ctx) {
  const data = ctx.callbackQuery?.data || ''; // e.g. 'set_lang:uz'
  const langCode = data.split(':')[1] || 'uz';
  const telegramId = ctx.from.id;

  const existingUser = await botDb.getUser(telegramId);

  // Persist language permanently in DB & Cache
  const user = await botDb.setUserLanguage(telegramId, langCode, {
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

  const alertText = langCode === 'uz' ? 'Til saqlandi!' : langCode === 'ru' ? 'Язык сохранен!' : 'Language saved!';
  try {
    await ctx.answerCallbackQuery({ text: alertText });
  } catch (_) {}

  // If user has already completed registration, update persistent menu and show confirmation
  if (existingUser && existingUser.registration_status === 'completed') {
    await ctx.reply(`📱 ${langCode === 'en' ? 'Main Menu:' : langCode === 'ru' ? 'Главное меню:' : 'Asosiy menyu:'}`, {
      reply_markup: getMainReplyKeyboard(langCode, config.miniAppUrl)
    });

    return ctx.reply(t(langCode, 'language_selected'), {
      parse_mode: 'Markdown',
      reply_markup: getStoreInlineKeyboard(langCode, config.miniAppUrl)
    });
  }

  // Otherwise, user is currently in onboarding flow -> advance to First Name
  await botDb.setRegistrationStatus(telegramId, 'awaiting_first_name');

  await ctx.reply(t(langCode, 'language_selected'), {
    parse_mode: 'Markdown'
  });

  return ctx.reply(t(langCode, 'enter_first_name'), {
    parse_mode: 'Markdown'
  });
}

export async function handleChangeLanguageCommand(ctx) {
  const telegramId = ctx.from.id;
  const lang = await botDb.getUserLanguage(telegramId);

  await ctx.reply(t(lang, 'change_lang_prompt'), {
    parse_mode: 'Markdown',
    reply_markup: getLanguageInlineKeyboard()
  });
}
