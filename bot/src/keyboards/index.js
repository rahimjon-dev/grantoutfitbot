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

export function getMainReplyKeyboard(lang = 'uz', miniAppUrl) {
  const kb = new Keyboard();

  if (miniAppUrl && miniAppUrl.startsWith('https://')) {
    kb.webApp(t(lang, 'btn_store'), miniAppUrl);
  } else {
    kb.text(t(lang, 'btn_store'));
  }

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

export function getContactShareKeyboard(lang = 'uz') {
  return new Keyboard()
    .requestContact(t(lang, 'btn_share_contact'))
    .row()
    .text(t(lang, 'btn_cancel'))
    .resized()
    .oneTime();
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
