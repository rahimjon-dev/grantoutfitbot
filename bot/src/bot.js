import { Bot } from 'grammy';
import { config } from './config/index.js';
import { botDb } from './services/db.js';
import { handleStart } from './handlers/start.js';
import { handleLanguageCallback, handleChangeLanguageCommand } from './handlers/language.js';
import { handleMyOrders, handleProfile, handleSupport, handleContactShare, handleCancel, handleManualPhone } from './handlers/menu.js';
import { handleAdminCallback, handleAdminCommand, handleMyChatMember } from './handlers/admin.js';
import { getStoreInlineKeyboard } from './keyboards/index.js';

if (!config.botToken) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set. Bot is in mock/standby mode.');
}

const bot = new Bot(config.botToken || 'dummy_token');

// Commands
bot.command('start', handleStart);
bot.command('admin', handleAdminCommand);
bot.command('language', handleChangeLanguageCommand);
bot.command('cancel', handleCancel);

// Quick commands to open store
bot.command(['store', 'shop', 'app', 'open'], async (ctx) => {
  const user = await botDb.getUser(ctx.from.id);
  const lang = user?.language_code || 'uz';
  const label = lang === 'en'
    ? '🛍 *Click below to open GRANT Online Store:*'
    : lang === 'ru'
      ? '🛍 *Нажмите кнопку ниже, чтобы открыть магазин GRANT:*'
      : '🛍 *GRANT do‘konini ochish uchun quyidagi tugmani bosing:*';

  await ctx.reply(label, {
    parse_mode: 'Markdown',
    reply_markup: getStoreInlineKeyboard(lang, config.miniAppUrl)
  });
});

// Callback queries
bot.callbackQuery(/^set_lang:/, handleLanguageCallback);
bot.callbackQuery(/^adm:/, handleAdminCallback);

// Native contact sharing
bot.on(':contact', handleContactShare);

// Member status events (tracking block / unblock)
bot.on('my_chat_member', handleMyChatMember);

// Cancel & Back handlers (matches "⬅️ Bekor qilish / Отмена", "⬅️ Bekor qilish", "⬅️ Отмена", "Cancel", etc.)
bot.hears([/Bekor qilish/i, /Отмена/i, /Cancel/i], handleCancel);

// Manual phone number typing
bot.hears(/^\+?[0-9\s\-()]{9,20}$/, handleManualPhone);

// Persistent Keyboard Button Matchers (Multilingual & Open Store variants)
bot.hears([/Onlayn Do‘kon/i, /Онлайн Магазин/i, /Online Store/i, /Open Store/i, /Open Mini App/i, /Do‘konni ochish/i, /Do‘kon/i, /Store/i, /Shop/i], async (ctx) => {
  const user = await botDb.getUser(ctx.from.id);
  const lang = user?.language_code || 'uz';
  const promptText = lang === 'en'
    ? '🛍 *GRANT Luxury Fashion Mini App*\nClick below to browse our collection directly in Telegram:'
    : lang === 'ru'
      ? '🛍 *GRANT Luxury Fashion Mini App*\nНажмите кнопку ниже, чтобы открыть каталог внутри Telegram:'
      : '🛍 *GRANT Luxury Fashion Mini App*\nKolleksiyani Telegram ichida ko‘rish uchun quyidagi tugmani bosing:';

  await ctx.reply(promptText, {
    parse_mode: 'Markdown',
    reply_markup: getStoreInlineKeyboard(lang, config.miniAppUrl)
  });
});
bot.hears([/Buyurtmalarim/i, /Мои Заказы/i, /My Orders/i], handleMyOrders);
bot.hears([/Profilim/i, /Мой Профиль/i, /My Profile/i], handleProfile);
bot.hears([/Tilni o‘zgartirish/i, /Сменить Язык/i, /Change Language/i], handleChangeLanguageCommand);
bot.hears([/Qo‘llab-quvvatlash/i, /Поддержка/i, /Contact Support/i], handleSupport);

// Global Error Handler
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`[Bot Error] update_id: ${ctx?.update?.update_id || 'unknown'}:`, err.message || err);
  const e = err.error;
  if (e?.error_code === 409) {
    console.warn('⚠️ Another bot instance is currently active (Telegram 409 Conflict). Polling paused.');
  }
});

// Launch bot if token is present
if (config.botToken && config.botToken !== 'dummy_token') {
  bot.start({
    onStart: async (botInfo) => {
      console.log(`===============================================`);
      console.log(`🤖 Telegram Bot @${botInfo.username} started successfully!`);
      console.log(`📱 Mini App URL: ${config.miniAppUrl}`);
      console.log(`👑 Admins: [${config.adminIds.join(', ')}]`);
      console.log(`===============================================`);

      // Set global default chat menu button for all users
      if (config.miniAppUrl && config.miniAppUrl.startsWith('https://')) {
        try {
          await bot.api.setChatMenuButton({
            menu_button: {
              type: 'web_app',
              text: 'Open Store',
              web_app: { url: config.miniAppUrl }
            }
          });
          console.log(`✅ Default Chat Menu Button configured: "Open Store" -> ${config.miniAppUrl}`);
        } catch (err) {
          console.warn('⚠️ Could not set global chat menu button on startup:', err.message);
        }
      }
    }
  });

  // Graceful shutdown handling
  const stopBot = () => {
    console.log('Stopping Telegram bot gracefully...');
    bot.stop();
  };
  process.once('SIGINT', stopBot);
  process.once('SIGTERM', stopBot);
} else {
  console.log('🤖 Bot initialized in dev standby mode. Add TELEGRAM_BOT_TOKEN in .env to connect to Telegram live.');
}

export default bot;
