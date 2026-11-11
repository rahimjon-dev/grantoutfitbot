import { InlineKeyboard, Keyboard } from 'grammy';
import { t } from '../locales/index.js';

export function getLanguageInlineKeyboard() {
  return new InlineKeyboard()
    .text('🇺🇿 O‘zbekcha', 'set_lang:uz')
    .row()
    .text('🇷🇺 Русский', 'set_lang:ru')
    .row()
    .text('🇬🇧 English', 'set_lang:en');
}

export function getStoreInlineKeyboard(lang = 'uz', miniAppUrl) {
  const url = (miniAppUrl || 'https://grantoutfitbot.vercel.app/').trim();
  const buttonText = lang === 'en'
    ? '🛍 Open Mini App'
    : lang === 'ru'
      ? '🛍 Открыть Mini App'
      : '🛍 Do‘konni Ochish (Mini App)';

  return new InlineKeyboard().webApp(buttonText, url);
}

export function getMainReplyKeyboard(lang = 'uz', miniAppUrl) {
  const url = (miniAppUrl || 'https://grantoutfitbot.vercel.app/').trim();
  const kb = new Keyboard();

  kb.webApp(t(lang, 'btn_store'), url);

  return kb
    .row()
    .text(t(lang, 'btn_orders'))
    .text(t(lang, 'btn_profile'))
    .row()
    .text(t(lang, 'btn_language'))
    .text(t(lang, 'btn_support'))
    .resized()
    .persistent();
}

export function getPhoneRequestKeyboard(lang = 'uz') {
  return new Keyboard()
    .requestContact(t(lang, 'btn_share_contact'))
    .row()
    .text(t(lang, 'btn_cancel'))
    .resized();
}

export function getCancelKeyboard(lang = 'uz') {
  return new Keyboard()
    .text(t(lang, 'btn_cancel'))
    .resized();
}

export function getProfileInlineKeyboard(lang = 'uz') {
  return new InlineKeyboard()
    .text(t(lang, 'btn_edit_firstname'), 'prof:edit_firstname')
    .row()
    .text(t(lang, 'btn_edit_lastname'), 'prof:edit_lastname')
    .row()
    .text(t(lang, 'btn_edit_phone'), 'prof:edit_phone');
}

export function getSupportInlineKeyboard(lang = 'uz', phone = '+998712000000', telegramUsername = 'grant_support') {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const cleanTg = telegramUsername.replace(/^@/, '');

  return new InlineKeyboard()
    .url(t(lang, 'btn_call_support'), `tel:${cleanPhone}`)
    .row()
    .url(t(lang, 'btn_telegram_support'), `https://t.me/${cleanTg}`);
}

export function getAdminOrderInlineKeyboard(orderId, customerTelegramId) {
  return new InlineKeyboard()
    .text('✅ Tasdiqlash', `adm:confirm:${orderId}`)
    .text('⚙️ Tayyorlash', `adm:process:${orderId}`)
    .row()
    .text('🚚 Jo‘natildi', `adm:ship:${orderId}`)
    .text('📦 Yetkazildi', `adm:deliver:${orderId}`)
    .row()
    .text('❌ Bekor qilish', `adm:reject:${orderId}`)
    .url('📞 Mijozga yozish', `tg://user?id=${customerTelegramId}`);
}
