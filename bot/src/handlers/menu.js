import { botDb } from '../services/db.js';
import { t } from '../locales/index.js';
import { getContactShareKeyboard, getMainReplyKeyboard } from '../keyboards/index.js';
import { config } from '../config/index.js';

function formatUzs(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so‘m';
}

export async function handleMyOrders(ctx) {
  const telegramId = ctx.from.id;
  const user = await botDb.getUser(telegramId);
  const lang = user?.language_code || 'uz';

  const orders = await botDb.getUserOrders(telegramId);

  if (!orders || orders.length === 0) {
    return ctx.reply(t(lang, 'no_orders'), {
      parse_mode: 'Markdown'
    });
  }

  let text = `${t(lang, 'orders_title')}\n\n`;

  for (const order of orders) {
    const statusKey = `status_${order.status}`;
    const statusLabel = t(lang, statusKey);
    const dateStr = new Date(order.created_at).toLocaleDateString();

    text += t(lang, 'order_item', {
      order_number: order.order_number,
      date: dateStr,
      total: formatUzs(order.total_amount_uzs),
      status: statusLabel,
      address: order.delivery_address || 'Tashkent'
    });
    text += `\n`;
  }

  await ctx.reply(text, { parse_mode: 'Markdown' });
}

export async function handleProfile(ctx) {
  const telegramId = ctx.from.id;
  const user = await botDb.getUser(telegramId);
  const lang = user?.language_code || 'uz';

  const name = user?.first_name || ctx.from.first_name || t(lang, 'profile_not_set');
  const phone = user?.phone_number || t(lang, 'profile_not_set');
  const address = user?.delivery_address ? `${user.delivery_address} (${user.delivery_city || 'Tashkent'})` : t(lang, 'profile_not_set');

  const text = `${t(lang, 'profile_title')}
${t(lang, 'profile_name')} *${name}*
${t(lang, 'profile_phone')} \`${phone}\`
${t(lang, 'profile_address')} _${address}_
🌐 Til: *${lang.toUpperCase()}*

Telefon raqamingizni yangilash uchun quyidagi tugmani bosing:`;

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: getContactShareKeyboard(lang)
  });
}

export async function handleSupport(ctx) {
  const telegramId = ctx.from.id;
  const user = await botDb.getUser(telegramId);
  const lang = user?.language_code || 'uz';

  await ctx.reply(t(lang, 'support_text'), { parse_mode: 'Markdown' });
}

export async function handleContactShare(ctx) {
  const telegramId = ctx.from.id;
  const contact = ctx.message.contact;

  if (contact && contact.phone_number) {
    let phone = contact.phone_number;
    if (!phone.startsWith('+')) phone = '+' + phone;

    await botDb.savePhoneNumber(telegramId, phone);
    const user = await botDb.getUser(telegramId);
    const lang = user?.language_code || 'uz';

    await ctx.reply(t(lang, 'phone_received'), {
      parse_mode: 'Markdown',
      reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
    });
  }
}
