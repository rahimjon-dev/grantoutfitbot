import { config } from '../config/index.js';

// Format UZS currency helper
function formatUzs(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so‘m';
}

/**
 * Call Telegram Bot API via fetch
 */
async function callTelegramApi(method, payload) {
  if (!config.botToken) {
    console.log(`[TelegramBot Mock] ${method}:`, JSON.stringify(payload, null, 2));
    return { ok: true, result: { message_id: 1 } };
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/${method}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!data.ok) {
      console.error(`Telegram API error in ${method}:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`Network error calling Telegram API ${method}:`, err.message);
    return { ok: false, error: err.message };
  }
}

export const telegramNotifier = {
  /**
   * Send new order alert to all configured administrators with interactive inline buttons
   */
  async notifyAdminsNewOrder(order) {
    if (!config.adminIds.length) {
      console.log('No ADMIN_TELEGRAM_IDS configured for notifications.');
      return;
    }

    const itemsSummary = (order.items || [])
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.product_name}*\n   ├ O‘lcham: \`${item.selected_size}\` | Rang: \`${item.selected_color}\`\n   └ Soni: ${item.quantity} x ${formatUzs(item.unit_price_uzs)} = *${formatUzs(item.total_price_uzs)}*`
      )
      .join('\n');

    const messageText = `🛍 *YANGI BUYURTMA QABUL QILINDI!*
━━━━━━━━━━━━━━━━━━━━
🆔 *Buyurtma:* \`${order.order_number}\`
👤 *Mijoz:* ${order.customer_name}
📞 *Telefon:* \`${order.phone_number}\`
📍 *Manzil:* ${order.delivery_address} (${order.delivery_city || 'Toshkent'})
${order.delivery_notes ? `📝 *Izoh:* _${order.delivery_notes}_\n` : ''}💳 *To‘lov turi:* ${order.payment_method === 'cash_on_delivery' ? 'Naqd (yetkazilganda)' : 'Karta / O‘tkazma'}

📦 *Mahsulotlar:*
${itemsSummary}

━━━━━━━━━━━━━━━━━━━━
💵 *Yetkazish:* ${order.delivery_fee_uzs ? formatUzs(order.delivery_fee_uzs) : 'Bepul'}
💰 *JAMI SUMMA:* *${formatUzs(order.total_amount_uzs)}*
⏱ *Vaqt:* ${new Date(order.created_at || Date.now()).toLocaleString('uz-UZ')}`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Tasdiqlash', callback_data: `adm:confirm:${order.id || order.order_number}` },
          { text: '⚙️ Tayyorlash', callback_data: `adm:process:${order.id || order.order_number}` }
        ],
        [
          { text: '🚚 Jo‘natildi', callback_data: `adm:ship:${order.id || order.order_number}` },
          { text: '📦 Yetkazildi', callback_data: `adm:deliver:${order.id || order.order_number}` }
        ],
        [
          { text: '❌ Bekor qilish', callback_data: `adm:reject:${order.id || order.order_number}` },
          { text: '📞 Mijoz bilan aloqa', url: `tg://user?id=${order.telegram_id}` }
        ]
      ]
    };

    for (const adminId of config.adminIds) {
      await callTelegramApi('sendMessage', {
        chat_id: adminId,
        text: messageText,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      });
    }
  },

  /**
   * Notify customer when order status is updated by admin
   */
  async notifyCustomerStatusChange(order, language = 'uz') {
    if (!order.telegram_id) return;

    const statusTranslations = {
      uz: {
        confirmed: '✅ Buyurtmangiz tasdiqlandi!',
        processing: '⚙️ Buyurtmangiz omborda yig‘ilmoqda!',
        shipped: '🚚 Buyurtmangiz kuryerga topshirildi va yo‘lda!',
        delivered: '🎉 Buyurtmangiz muvaffaqiyatli yetkazildi! Xaridingiz uchun rahmat!',
        cancelled: '❌ Buyurtmangiz bekor qilindi.'
      },
      ru: {
        confirmed: '✅ Ваш заказ подтвержден!',
        processing: '⚙️ Ваш заказ собирается на складе!',
        shipped: '🚚 Ваш заказ передан курьеру и в пути!',
        delivered: '🎉 Ваш заказ успешно доставлен! Спасибо за покупку!',
        cancelled: '❌ Ваш заказ отменен.'
      },
      en: {
        confirmed: '✅ Your order has been confirmed!',
        processing: '⚙️ Your order is being packed and prepared!',
        shipped: '🚚 Your order is on the way with courier!',
        delivered: '🎉 Your order has been delivered! Thank you for shopping with us!',
        cancelled: '❌ Your order has been cancelled.'
      }
    };

    const statusTitle =
      statusTranslations[language]?.[order.status] ||
      statusTranslations['uz'][order.status] ||
      `Buyurtma holati o‘zgardi: ${order.status}`;

    let details = `\n🆔 Buyurtma: \`${order.order_number}\``;
    if (order.tracking_number) {
      details += `\n🏷 Trek-kod: \`${order.tracking_number}\``;
    }
    if (order.dispatch_notes) {
      details += `\n📝 Kuryer xabari: _${order.dispatch_notes}_`;
    }

    const messageText = `*GRANT FASHION STORE*\n━━━━━━━━━━━━━━━━━━━━\n${statusTitle}${details}\n\nHolatni bot menyusidagi *Buyurtmalarim* bo‘limida kuzatishingiz mumkin.`;

    await callTelegramApi('sendMessage', {
      chat_id: order.telegram_id,
      text: messageText,
      parse_mode: 'Markdown'
    });
  },

  /**
   * Broadcast message to users safely with rate limiting
   */
  async broadcastAnnouncement({ userIds, message, imageUrl }) {
    let successCount = 0;
    let failureCount = 0;

    for (const userId of userIds) {
      try {
        let res;
        if (imageUrl) {
          res = await callTelegramApi('sendPhoto', {
            chat_id: userId,
            photo: imageUrl,
            caption: message,
            parse_mode: 'Markdown'
          });
        } else {
          res = await callTelegramApi('sendMessage', {
            chat_id: userId,
            text: message,
            parse_mode: 'Markdown'
          });
        }

        if (res.ok) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (err) {
        failureCount++;
      }

      // Safe rate-limit delay (25ms = max 40 msgs/sec per Telegram API guidelines)
      await new Promise(r => setTimeout(r, 35));
    }

    return { successCount, failureCount };
  }
};
