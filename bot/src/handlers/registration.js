import { botDb } from '../services/db.js';
import {
  getMainReplyKeyboard,
  getStoreInlineKeyboard,
  getPhoneRequestKeyboard,
  getLanguageInlineKeyboard
} from '../keyboards/index.js';
import { t } from '../locales/index.js';
import { config } from '../config/index.js';

// Helper: Name validation (letters, apostrophes, hyphens, spaces, 2-50 chars)
function isValidName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  if (/^[0-9]+$/.test(trimmed)) return false;
  if (trimmed.startsWith('/')) return false;
  return true;
}

// Helper: Phone validation (9-15 digits, optional +)
function cleanPhoneNumber(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[\s\-\(\)]/g, '');
  if (/^\+?[0-9]{9,15}$/.test(cleaned)) {
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
  return null;
}

export async function handleRegistrationTextInput(ctx, next) {
  const text = ctx.message?.text?.trim();
  if (!text) return next();

  // Allow standard slash commands to bypass text processor
  if (text.startsWith('/')) {
    return next();
  }

  const telegramId = ctx.from.id;
  const user = await botDb.getUser(telegramId);
  const lang = user?.language_code || 'uz';

  // --- SUB-FLOW A: User is in active profile edit mode ---
  if (user && user.edit_state) {
    if (user.edit_state === 'editing_first_name') {
      if (!isValidName(text)) {
        return ctx.reply(t(lang, 'invalid_first_name'), { parse_mode: 'Markdown' });
      }
      await botDb.updateProfileFields(telegramId, { first_name: text });
      await ctx.reply(t(lang, 'profile_updated'), {
        parse_mode: 'Markdown',
        reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
      });
      return;
    }

    if (user.edit_state === 'editing_last_name') {
      if (!isValidName(text)) {
        return ctx.reply(t(lang, 'invalid_last_name'), { parse_mode: 'Markdown' });
      }
      await botDb.updateProfileFields(telegramId, { last_name: text });
      await ctx.reply(t(lang, 'profile_updated'), {
        parse_mode: 'Markdown',
        reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
      });
      return;
    }

    if (user.edit_state === 'editing_phone') {
      const validPhone = cleanPhoneNumber(text);
      if (!validPhone) {
        return ctx.reply(t(lang, 'invalid_phone'), {
          parse_mode: 'Markdown',
          reply_markup: getPhoneRequestKeyboard(lang)
        });
      }
      await botDb.savePhoneNumber(telegramId, validPhone, false);
      await ctx.reply(t(lang, 'phone_received'), {
        parse_mode: 'Markdown',
        reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
      });
      return;
    }
  }

  // --- SUB-FLOW B: User is in onboarding registration flow ---
  if (user && user.registration_status !== 'completed') {
    // 1. Awaiting First Name
    if (user.registration_status === 'awaiting_first_name') {
      if (!isValidName(text)) {
        return ctx.reply(t(lang, 'invalid_first_name'), { parse_mode: 'Markdown' });
      }

      await botDb.setRegistrationStatus(telegramId, 'awaiting_last_name', { first_name: text });
      return ctx.reply(t(lang, 'enter_last_name', { first_name: text }), {
        parse_mode: 'Markdown'
      });
    }

    // 2. Awaiting Last Name
    if (user.registration_status === 'awaiting_last_name') {
      if (!isValidName(text)) {
        return ctx.reply(t(lang, 'invalid_last_name'), { parse_mode: 'Markdown' });
      }

      await botDb.setRegistrationStatus(telegramId, 'awaiting_phone', { last_name: text });
      return ctx.reply(t(lang, 'enter_phone'), {
        parse_mode: 'Markdown',
        reply_markup: getPhoneRequestKeyboard(lang)
      });
    }

    // 3. Awaiting Phone (Manual typing fallback)
    if (user.registration_status === 'awaiting_phone') {
      const validPhone = cleanPhoneNumber(text);
      if (!validPhone) {
        return ctx.reply(t(lang, 'invalid_phone'), {
          parse_mode: 'Markdown',
          reply_markup: getPhoneRequestKeyboard(lang)
        });
      }

      await botDb.completeRegistration(telegramId, {
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: validPhone,
        phoneVerified: false,
        username: ctx.from.username
      });

      // Send persistent reply keyboard
      await ctx.reply(`📱 ${lang === 'en' ? 'Main Menu:' : lang === 'ru' ? 'Главное меню:' : 'Asosiy menyu:'}`, {
        reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
      });

      return ctx.reply(t(lang, 'registration_completed'), {
        parse_mode: 'Markdown',
        reply_markup: getStoreInlineKeyboard(lang, config.miniAppUrl)
      });
    }

    // 4. If status is unregistered or language not set
    if (!user.language_code || user.registration_status === 'unregistered') {
      return ctx.reply(t('uz', 'welcome'), {
        parse_mode: 'Markdown',
        reply_markup: getLanguageInlineKeyboard()
      });
    }
  }

  // --- SUB-FLOW C: Unregistered User Guard ---
  if (!user || user.registration_status !== 'completed') {
    return ctx.reply(t(lang, 'unregistered_notice'), {
      parse_mode: 'Markdown'
    });
  }

  // User is registered and not in edit mode -> pass to menu handlers
  return next();
}

export async function handleContactShare(ctx) {
  const telegramId = ctx.from.id;
  const contact = ctx.message?.contact;
  const user = await botDb.getUser(telegramId);
  const lang = user?.language_code || 'uz';

  if (!contact || !contact.phone_number) {
    return ctx.reply(t(lang, 'invalid_phone'), { parse_mode: 'Markdown' });
  }

  // Security Check: Verify contact card belongs to the sender
  if (contact.user_id && contact.user_id !== telegramId) {
    return ctx.reply(t(lang, 'invalid_contact_owner'), {
      parse_mode: 'Markdown',
      reply_markup: getPhoneRequestKeyboard(lang)
    });
  }

  const cleanPhone = cleanPhoneNumber(contact.phone_number);
  if (!cleanPhone) {
    return ctx.reply(t(lang, 'invalid_phone'), { parse_mode: 'Markdown' });
  }

  // If user was updating phone from Profile
  if (user?.edit_state === 'editing_phone') {
    await botDb.savePhoneNumber(telegramId, cleanPhone, true);
    await ctx.reply(t(lang, 'phone_received'), {
      parse_mode: 'Markdown',
      reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
    });
    return;
  }

  // Complete onboarding registration
  await botDb.completeRegistration(telegramId, {
    firstName: user?.first_name || ctx.from.first_name,
    lastName: user?.last_name || ctx.from.last_name || '',
    phoneNumber: cleanPhone,
    phoneVerified: true,
    username: ctx.from.username
  });

  // Display persistent reply keyboard
  await ctx.reply(`📱 ${lang === 'en' ? 'Main Menu:' : lang === 'ru' ? 'Главное меню:' : 'Asosiy menyu:'}`, {
    reply_markup: getMainReplyKeyboard(lang, config.miniAppUrl)
  });

  // Localized congratulations and Mini App opening button
  return ctx.reply(t(lang, 'registration_completed'), {
    parse_mode: 'Markdown',
    reply_markup: getStoreInlineKeyboard(lang, config.miniAppUrl)
  });
}
