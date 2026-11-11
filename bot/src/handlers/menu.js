import { botDb } from '../services/db.js';
import { t } from '../locales/index.js';
import {
  getMainReplyKeyboard,
  getStoreInlineKeyboard,
  getProfileInlineKeyboard,
  getSupportInlineKeyboard,
  getPhoneRequestKeyboard,
  getCancelKeyboard
} from '../keyboards/index.js';
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
      parse_mode: 'Markdown',
      reply_markup: getStoreInlineKeyboard(lang, config.miniAppUrl)
    });
  }

  let text = `${t(lang, 'orders_title')}\n\n`;

  for (const order of orders) {
    const statusKey = `status_${order.status}`;
    const statusLabel = t(lang, statusKey);
    const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString();

    text += t(lang, 'order_item', {
      order_number: order.order_number || order.id?.slice(0, 8),
      date: dateStr,
      total: formatUzs(order.total_amount_uzs || 0),
      status: statusLabel,
      address: order.delivery_address || 'Tashkent'
    });
    text += `\n`;
  }

  return ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: getStoreInlineKeyboard(lang, config.miniAppUrl)
  });
}

export async function handleProfile(ctx) {
  const telegramId = ctx.from.id;
  const user = await botDb.getUser(telegramId);
  const lang = user?.language_code || 'uz';

  const fullName = `${user?.first_name || ctx.from.first_name || ''} ${user?.last_name || ctx.from.last_name || ''}`.trim() || t(lang, 'profile_not_set');
  const username = user?.username ? `@${user.username}` : (ctx.from.username ? `@${ctx.from.username}` : 'Yo‘q');
  const phone = user?.phone_number || t(lang, 'profile_not_set');
  const verifiedBadge = user?.phone_verified ? t(lang, 'profile_verified') : t(lang, 'profile_unverified');
  
  const langNames = {
    uz: '🇺🇿 O‘zbekcha',
    ru: '🇷🇺 Русский',
    en: '🇬🇧 English'
  };
  const langLabel = langNames[lang] || '🇺🇿 O‘zbekcha';

  const regDate = user?.registered_at
    ? new Date(user.registered_at).toLocaleDateString()
    : (user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Yaqinda');

  const ordersCount = await botDb.getUserOrderCount(telegramId);

  const text = `${t(lang, 'profile_title')}
${t(lang, 'profile_name')} *${fullName}*
${t(lang, 'profile_username')} *${username}*
${t(lang, 'profile_phone')} \`${phone}\` (${verifiedBadge})
${t(lang, 'profile_lang')} *${langLabel}*
${t(lang, 'profile_reg_date')} _${regDate}_
${t(lang, 'profile_orders_count')} *${ordersCount} ta*`;

  return ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: getProfileInlineKeyboard(lang)
  });
}

export async function handleProfileCallback(ctx) {
  const data = ctx.callbackQuery?.data || ''; // e.g. 'prof:edit_firstname'
  const telegramId = ctx.from.id;
  const lang = await botDb.getUserLanguage(telegramId);

  try {
    await ctx.answerCallbackQuery();
  } catch (_) {}

  if (data === 'prof:edit_firstname') {
    await botDb.setUserEditState(telegramId, 'editing_first_name');
    return ctx.reply(t(lang, 'prompt_edit_firstname'), {
      parse_mode: 'Markdown',
      reply_markup: getCancelKeyboard(lang)
    });
  }

  if (data === 'prof:edit_lastname') {
    await botDb.setUserEditState(telegramId, 'editing_last_name');
    return ctx.reply(t(lang, 'prompt_edit_lastname'), {
      parse_mode: 'Markdown',
      reply_markup: getCancelKeyboard(lang)
    });
  }

  if (data === 'prof:edit_phone') {
    await botDb.setUserEditState(telegramId, 'editing_phone');
    return ctx.reply(t(lang, 'prompt_edit_phone'), {
      parse_mode: 'Markdown',
      reply_markup: getPhoneRequestKeyboard(lang)
    });
  }
}

export async function handleSupport(ctx) {
  const telegramId = ctx.from.id;
  const lang = await botDb.getUserLanguage(telegramId);

  const phone = config.supportPhone || '+998 (71) 200-00-00';
  const telegram = config.supportTelegram || 'grant_support';

  const text = `${t(lang, 'support_title')}\n\n${t(lang, 'support_text', {
    phone,
    telegram
  })}`;

  return ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: getSupportInlineKeyboard(lang, phone, telegram)
  });
}

export async function handleCancel(ctx) {
  const telegramId = ctx.from.id;
  await botDb.setUserEditState(telegramId, null);
  const lang = await botDb.getUserLanguage(telegramId);

  return ctx.reply(t(lang, 'action_cancelled'), {
    parse_mode: 'Markdown',
    reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
  });
}
