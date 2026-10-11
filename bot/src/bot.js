import { Bot } from 'grammy';
import { config } from './config/index.js';
import { handleStart } from './handlers/start.js';
import { handleLanguageCallback, handleChangeLanguageCommand } from './handlers/language.js';
import { handleMyOrders, handleProfile, handleSupport, handleContactShare } from './handlers/menu.js';
import { handleAdminCallback, handleAdminCommand, handleMyChatMember } from './handlers/admin.js';

if (!config.botToken) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set. Bot is in mock/standby mode.');
}

const bot = new Bot(config.botToken || 'dummy_token');

// Commands
bot.command('start', handleStart);
bot.command('admin', handleAdminCommand);
bot.command('language', handleChangeLanguageCommand);

// Callback queries
bot.callbackQuery(/^set_lang:/, handleLanguageCallback);
bot.callbackQuery(/^adm:/, handleAdminCallback);

// Native contact sharing
bot.on(':contact', handleContactShare);

// Member status events (tracking block / unblock)
bot.on('my_chat_member', handleMyChatMember);

// Persistent Keyboard Button Matchers (Multilingual)
bot.hears([/Onlayn Do‘kon/i, /Онлайн Магазин/i, /Online Store/i], async (ctx) => {
  if (config.miniAppUrl && config.miniAppUrl.startsWith('https://')) {
    await ctx.reply('🛍 *GRANT Mini App do‘konini ochish uchun quyidagi tugmani bosing:*', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🛍 Do‘konni Ochish', web_app: { url: config.miniAppUrl } }]]
      }
    });
  } else {
    await ctx.reply(`🛍 *GRANT ONLINE STORE*\n\nDo‘konga kirish havolasi:\n👉 ${config.miniAppUrl}\n\n💡 _Telegram ichida Mini App ochilishi uchun HTTPS havola (masalan, Vercel yoki ngrok) kerak._`, {
      parse_mode: 'Markdown'
    });
  }
});
bot.hears([/Buyurtmalarim/i, /Мои Заказы/i, /My Orders/i], handleMyOrders);
bot.hears([/Profilim/i, /Мой Профиль/i, /My Profile/i], handleProfile);
bot.hears([/Tilni o‘zgartirish/i, /Сменить Язык/i, /Change Language/i], handleChangeLanguageCommand);
bot.hears([/Qo‘llab-quvvatlash/i, /Поддержка/i, /Contact Support/i], handleSupport);

// Global Error Handler
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  console.error(e);
});

// Launch bot if token is present
if (config.botToken && config.botToken !== 'dummy_token') {
  bot.start({
    onStart: (botInfo) => {
      console.log(`===============================================`);
      console.log(`🤖 Telegram Bot @${botInfo.username} started successfully!`);
      console.log(`📱 Mini App URL: ${config.miniAppUrl}`);
      console.log(`👑 Admins: [${config.adminIds.join(', ')}]`);
      console.log(`===============================================`);
    }
  });
} else {
  console.log('🤖 Bot initialized in dev standby mode. Add TELEGRAM_BOT_TOKEN in .env to connect to Telegram live.');
}

export default bot;
