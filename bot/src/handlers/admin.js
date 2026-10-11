import { botDb } from '../services/db.js';
import { config } from '../config/index.js';

export async function handleAdminCallback(ctx) {
  const adminId = ctx.from.id;

  // Authorization check
  if (!config.adminIds.includes(adminId)) {
    return ctx.answerCallbackQuery({
      text: '⛔️ Ruxsat berilmagan: Siz administrator emassiz!',
      show_alert: true
    });
  }

  const data = ctx.callbackQuery.data; // e.g. 'adm:confirm:ord-123'
  const [, action, orderId] = data.split(':');

  const statusMap = {
    confirm: 'confirmed',
    process: 'processing',
    ship: 'shipped',
    deliver: 'delivered',
    reject: 'cancelled'
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return ctx.answerCallbackQuery({ text: 'Noma‘lum harakat' });
  }

  await botDb.updateOrderStatus(orderId, newStatus, adminId);

  await ctx.answerCallbackQuery({
    text: `✅ Buyurtma holati o‘zgartirildi: ${newStatus.toUpperCase()}`
  });

  // Edit message with action stamp
  try {
    const originalText = ctx.callbackQuery.message.text || '';
    const statusNotice = `\n\n📌 *YANGILANDI:* \`${newStatus.toUpperCase()}\` (Admin @${ctx.from.username || adminId} tomonidan)`;
    await ctx.editMessageText(originalText + statusNotice, {
      parse_mode: 'Markdown'
    });
  } catch (err) {
    // Editing might fail if unchanged
  }
}

export async function handleAdminCommand(ctx) {
  const adminId = ctx.from.id;

  if (!config.adminIds.includes(adminId)) {
    return ctx.reply('⛔️ Bu buyruq faqat do‘kon administratorlari uchun mo‘ljallangan.');
  }

  const text = `👑 *GRANT OUTFITBOT — ADMIN PANEL*
━━━━━━━━━━━━━━━━━━━━
Siz do‘kon administratori sifatida ro‘yxatdasiz.

🔗 *Boshqaruv vositalari:*
• Web Admin Dashboard: ${config.miniAppUrl}/admin
• Yangi buyurtmalar avtomatik tarzda ushbu chatga keladi.
• Holatni to‘g‘ridan-to‘g‘ri inline tugmalar orqali boshqarishingiz mumkin.

Buyruqlar:
/stats — Do‘konning umumiy ko‘rsatkichlari`;

  await ctx.reply(text, { parse_mode: 'Markdown' });
}

export async function handleMyChatMember(ctx) {
  const newStatus = ctx.myChatMember.new_chat_member.status;
  const telegramId = ctx.from.id;

  if (newStatus === 'kicked') {
    // User blocked the bot
    await botDb.logActivity(telegramId, 'blocked_bot', { timestamp: new Date().toISOString() });
    console.log(`[Bot Event] User ${telegramId} blocked the bot.`);
  } else if (newStatus === 'member') {
    // User unblocked the bot
    await botDb.logActivity(telegramId, 'unblocked_bot', { timestamp: new Date().toISOString() });
    console.log(`[Bot Event] User ${telegramId} unblocked the bot.`);
  }
}
