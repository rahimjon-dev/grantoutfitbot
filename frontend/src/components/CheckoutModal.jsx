import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, MapPin, Phone, User, CreditCard, Banknote, AlertCircle, Loader2 } from 'lucide-react';
import { formatUzs } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTelegram } from '../context/TelegramContext.jsx';
import { api } from '../services/api.js';

export default function CheckoutModal({ onOrderSuccess }) {
  const { isCheckoutOpen, setIsCheckoutOpen, items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { t, getLocalizedField } = useLanguage();
  const { user, isInsideTelegram, tg, haptic } = useTelegram();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Tashkent');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill from user profile or Telegram
  useEffect(() => {
    if (user) {
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
    }

    // Attempt to load existing saved delivery address from API
    api.getProfile()
      .then((res) => {
        if (res.data) {
          if (res.data.first_name) setFirstName(res.data.first_name);
          if (res.data.last_name) setLastName(res.data.last_name);
          if (res.data.phone_number) setPhoneNumber(res.data.phone_number);
          if (res.data.delivery_address) setDeliveryAddress(res.data.delivery_address);
          if (res.data.delivery_city) setDeliveryCity(res.data.delivery_city);
        }
      })
      .catch(() => {});
  }, [user]);

  if (!isCheckoutOpen) return null;

  // Request Telegram Contact natively if available
  const handleRequestTelegramContact = () => {
    haptic('light');
    if (tg?.requestContact) {
      tg.requestContact((granted, contactData) => {
        if (granted && contactData?.responseUnsafe?.contact?.phone_number) {
          let phone = contactData.responseUnsafe.contact.phone_number;
          if (!phone.startsWith('+')) phone = '+' + phone;
          setPhoneNumber(phone);
        }
      });
    } else {
      // In standalone browser or unassisted webview, simulate prefill or prompt
      if (!phoneNumber) {
        setPhoneNumber('+998 90 123 45 67');
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim()) {
      setErrorMessage('Iltimos, ismingizni kiriting');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Iltimos, telefon raqamingizni kiriting');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMessage('Iltimos, yetkazish manzilini to‘liq kiriting');
      return;
    }

    setLoading(true);
    haptic('medium');

    try {
      const orderPayload = {
        customerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phoneNumber: phoneNumber.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryCity: deliveryCity.trim(),
        deliveryNotes: deliveryNotes.trim(),
        paymentMethod,
        items: items.map((i) => ({
          variantId: i.variantId,
          productId: i.productId,
          quantity: i.quantity
        }))
      };

      const result = await api.createOrder(orderPayload);

      if (result.success) {
        haptic('success');
        clearCart();
        setIsCheckoutOpen(false);
        if (onOrderSuccess) {
          onOrderSuccess(result.data);
        }
      } else {
        throw new Error(result.message || 'Buyurtma yaratishda xatolik yuz berdi');
      }
    } catch (err) {
      haptic('error');
      setErrorMessage(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#121216] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-gold-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              {t('checkout_title')}
            </h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <User size={14} />
              {t('step_contact')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">{t('first_name')} *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ali"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">{t('last_name')}</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Valiyev"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-zinc-400">{t('phone_number')} *</label>
                <button
                  type="button"
                  onClick={handleRequestTelegramContact}
                  className="text-[10px] text-gold-400 hover:text-gold-300 font-medium"
                >
                  📱 Telegram orqali ulashish
                </button>
              </div>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-3 pt-3 border-t border-white/[0.06]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <MapPin size={14} />
              {t('step_delivery')}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-[11px] text-zinc-400 block mb-1">{t('city')}</label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-zinc-400 block mb-1">{t('address')} *</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Amir Temur ko‘chasi, 45-uy, 12-xonadon"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">{t('notes')}</label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Masalan: 3-podyezd, 4-qavat, domofon 12"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <CreditCard size={14} />
              {t('step_payment')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-gold-500 bg-gold-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Banknote size={18} className="text-gold-400" />
                <span className="text-xs font-medium">Naqd yoki karta (yetkazilganda)</span>
              </label>

              <label
                onClick={() => setPaymentMethod('manual_transfer')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  paymentMethod === 'manual_transfer'
                    ? 'border-gold-500 bg-gold-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <CreditCard size={18} className="text-gold-400" />
                <span className="text-xs font-medium">Click / Payme (karta raqamiga)</span>
              </label>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-3.5 bg-zinc-950 rounded-2xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>{t('cart_subtotal')} ({items.length} ta mahsulot):</span>
              <span className="text-white font-medium">{formatUzs(subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>{t('cart_delivery')}:</span>
              <span className="text-white font-medium">
                {deliveryFee === 0 ? <span className="text-emerald-400 font-bold">{t('cart_delivery_free')}</span> : formatUzs(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
              <span>{t('cart_total')}:</span>
              <span className="text-gold-400 text-base">{formatUzs(total)}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-gold-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            <span>{loading ? 'Buyurtma rasmiylashtirilmoqda...' : t('confirm_order_btn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
