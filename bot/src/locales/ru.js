export const ru = {
  welcome: `✨ Добро пожаловать в *GRANT LUXURY OUTFITBOT*!\n\nВ нашем премиальном магазине вы найдете одежду, обувь и аксессуары безупречного качества.\n\n🌐 Iltimos, muloqot tilini tanlang:\nПожалуйста, выберите язык:\nPlease select your language:`,
  welcome_back: `✨ *GRANT LUXURY OUTFITBOT*\n\nДобро пожаловать, *{name}*!\n\nНажмите кнопку ниже, чтобы открыть каталог и перейти к покупкам:`,
  language_selected: `✅ *Язык успешно выбран!* (Русский)`,

  // Registration Flow
  enter_first_name: `📝 *Регистрация (1/3)*\n\nПожалуйста, введите ваше имя:`,
  enter_last_name: `📝 *Регистрация (2/3)*\n\nСпасибо, *{first_name}*!\nТеперь введите вашу фамилию:`,
  enter_phone: `📱 *Регистрация (3/3)*\n\nПожалуйста, отправьте ваш номер телефона.\nВы можете нажать кнопку ниже, чтобы поделиться контактом, или ввести номер вручную:`,
  invalid_first_name: `⚠️ Пожалуйста, введите корректное имя (минимум 2 буквы, без команд).`,
  invalid_last_name: `⚠️ Пожалуйста, введите корректную фамилию (минимум 2 буквы, без команд).`,
  invalid_contact_owner: `⚠️ Пожалуйста, отправьте именно ваш собственный контакт!`,
  invalid_phone: `⚠️ Пожалуйста, введите корректный номер телефона (например: +998901234567).`,
  registration_completed: `🎉 *Поздравляем! Регистрация успешно завершена.*\n\nТеперь вам доступны все функции онлайн-бутика GRANT. Откройте каталог нажатием кнопки ниже:`,
  unregistered_notice: `⚠️ Пожалуйста, сначала пройдите регистрацию.\nДля этого отправьте команду /start.`,

  // Persistent Menu Buttons
  btn_store: '🛍 Онлайн Магазин',
  btn_orders: '📦 Мои Заказы',
  btn_profile: '👤 Мой Профиль',
  btn_language: '🌐 Сменить Язык',
  btn_support: '📞 Поддержка',
  btn_cancel: '⬅️ Отмена',
  btn_share_contact: '📱 Поделиться контактом',

  // Profile
  profile_title: `👤 *ВАШ ПРОФИЛЬ*\n━━━━━━━━━━━━━━━━━━━━`,
  profile_name: `Имя и фамилия:`,
  profile_username: `Имя пользователя:`,
  profile_phone: `Телефон:`,
  profile_verified: `✅ Подтвержден`,
  profile_unverified: `⚠️ Не подтвержден`,
  profile_lang: `Выбранный язык:`,
  profile_reg_date: `Дата регистрации:`,
  profile_orders_count: `Всего заказов:`,
  profile_not_set: `Не указан`,

  // Profile Inline Buttons
  btn_edit_firstname: `✏️ Изменить имя`,
  btn_edit_lastname: `✏️ Изменить фамилию`,
  btn_edit_phone: `📱 Обновить телефон`,

  prompt_edit_firstname: `✏️ Введите ваше новое имя:`,
  prompt_edit_lastname: `✏️ Введите вашу новую фамилию:`,
  prompt_edit_phone: `📱 Отправьте ваш новый номер телефона (нажмите кнопку или введите номер):`,
  profile_updated: `✅ Данные профиля успешно обновлены!`,
  phone_received: `✅ Ваш номер телефона успешно сохранен!`,
  action_cancelled: `⬅️ Отменено. Главное меню:`,

  // Support
  support_title: `📞 *СЛУЖБА ПОДДЕРЖКИ КЛИЕНТОВ*\n━━━━━━━━━━━━━━━━━━━━`,
  support_text: `Если у вас возникли вопросы, наша консьерж-служба всегда рада помочь вам:\n\n☎️ Телефон: {phone}\n💬 Telegram: @{telegram}\n⏰ Часы работы: 09:00 - 22:00 (ежедневно)`,
  btn_call_support: `📞 Позвонить`,
  btn_telegram_support: `💬 Написать в Telegram`,

  // Orders
  no_orders: `📦 У вас пока нет оформленных заказов.\n\nОткройте магазин и выберите новинки из нашей коллекции!`,
  orders_title: `📦 *ВАШИ ЗАКАЗЫ*\n━━━━━━━━━━━━━━━━━━━━`,
  order_item: `🆔 *Заказ:* \`{order_number}\`\n📅 *Дата:* {date}\n💵 *Сумма:* {total}\n📊 *Статус:* {status}\n📍 *Адрес:* {address}\n`,

  // Statuses
  status_pending: '⏳ В обработке',
  status_confirmed: '✅ Подтвержден',
  status_processing: '⚙️ Собирается на складе',
  status_shipped: '🚚 Передан курьеру',
  status_delivered: '🎉 Доставлен',
  status_cancelled: '❌ Отменен',

  // Language Change Prompt
  change_lang_prompt: `🌐 Пожалуйста, выберите язык:`,

  // Admin Texts
  admin_panel_title: `👑 *ПАНЕЛЬ АДМИНИСТРАТОРА*\n━━━━━━━━━━━━━━━━━━━━`,
  admin_stats: `📊 *Статистика магазина:*\n• Пользователей: {users}\n• Всего заказов: {orders}\n• Ожидают: {pending}\n• Выручка: {revenue}`
};
