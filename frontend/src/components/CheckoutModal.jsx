import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, MapPin, Phone, User, CreditCard, Banknote, AlertCircle, Loader2, Home, Building2, Plus, Edit2 } from 'lucide-react';
import { formatUzs } from '../utils/formatters.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTelegram } from '../context/TelegramContext.jsx';
import { api } from '../services/api.js';

export default function CheckoutModal({ onOrderSuccess }) {
  const { isCheckoutOpen, setIsCheckoutOpen, items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { t, getLocalizedField } = useLanguage();
  const { user, isInsideTelegram, tg, haptic } = useTelegram();

  const [selectedAddressType, setSelectedAddressType] = useState('home'); // 'home', 'office', 'new'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Tashkent');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Prefill from user profile or Telegram
  useEffect(() => {
    if (user) {
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
    }

    // Default phone simulation
    if (!phoneNumber) {
      setPhoneNumber('+998 90 123 45 67');
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
      if (!phoneNumber) {
        setPhoneNumber('+998 90 123 45 67');
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const finalAddress = selectedAddressType === 'home' 
      ? (deliveryAddress || 'Amir Temur ko‘chasi, 45-uy')
      : selectedAddressType === 'office'
      ? (deliveryAddress || 'Buyuk Ipak Yo‘li, 12-ofis')
      : deliveryAddress;

    if (!firstName.trim()) {
      setErrorMessage('Iltimos, ismingizni kiriting');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Iltimos, telefon raqamingizni kiriting');
      return;
    }
    if (!finalAddress.trim()) {
      setErrorMessage('Iltimos, yetkazish manzilini kiriting');
      return;
    }

    setLoading(true);
    haptic('medium');

    try {
      const orderPayload = {
        customerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phoneNumber: phoneNumber.trim(),
        deliveryAddress: `${selectedAddressType.toUpperCase()}: ${finalAddress.trim()}`,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto border border-slate-100"
      >
        {/* Header (Image 2 Shipping & Billing style) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Shipping & Billing
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Yetkazib berish va to‘lov</span>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[76vh]">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Address Cards Section (Image 2 Style) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Shipping Address
            </h4>

            {/* Home Card */}
            <div 
              onClick={() => setSelectedAddressType('home')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedAddressType === 'home'
                  ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedAddressType === 'home' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Home size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Home</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Tashkent, Amir Temur ko‘chasi, 45-uy</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{phoneNumber}</div>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-slate-300">
                {selectedAddressType === 'home' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
            </div>

            {/* Office Card */}
            <div 
              onClick={() => setSelectedAddressType('office')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedAddressType === 'office'
                  ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedAddressType === 'office' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Office</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Tashkent, Buyuk Ipak Yo‘li, 12-ofis</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{phoneNumber}</div>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-slate-300">
                {selectedAddressType === 'office' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
            </div>

            {/* + Add New Shipping Address Button (Image 2 Style) */}
            <button
              type="button"
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="w-full p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 text-xs font-bold text-blue-600 hover:bg-blue-50/50 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus size={16} />
              <span>+ Add New Shipping Address</span>
            </button>

            {/* Custom address form drawer */}
            {showAddressForm && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Yangi manzil</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Amir Temur ko‘chasi, 45-uy, 12-xonadon"
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Yetkazish bo‘yicha izoh</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Masalan: 3-podyezd, 4-qavat, domofon 12"
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Personal Info & Contact */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User size={14} />
              Personal Info
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Ism *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ali"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Familiya</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Valiyev"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Telefon raqam *</label>
                <button
                  type="button"
                  onClick={handleRequestTelegramContact}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                >
                  📱 Telegram raqamini olish
                </button>
              </div>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* 3. Payment Method Cards (Image 2 style) */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard size={14} />
              Payment Method
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-blue-600 bg-blue-50/50 text-slate-900 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Banknote size={18} className="text-blue-600" />
                <span className="text-xs font-bold">Naqd / Karta (eshikda)</span>
              </div>

              <div
                onClick={() => setPaymentMethod('manual_transfer')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  paymentMethod === 'manual_transfer'
                    ? 'border-blue-600 bg-blue-50/50 text-slate-900 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard size={18} className="text-blue-600" />
                <span className="text-xs font-bold">Click / Payme (onlayn)</span>
              </div>
            </div>
          </div>

          {/* 4. Order Price Summary Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Mahsulotlar ({items.length} ta):</span>
              <span className="text-slate-900 font-semibold">{formatUzs(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Yetkazib berish:</span>
              <span className="text-slate-900 font-semibold">
                {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">Bepul</span> : formatUzs(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Jami:</span>
              <span className="text-blue-600 text-base font-extrabold">{formatUzs(total)}</span>
            </div>
          </div>

          {/* 5. Big Blue Continue CTA Button (Image 2 Style) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            <span>{loading ? 'Buyurtma rasmiylashtirilmoqda...' : 'Continue'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
