import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Globe, Save, CheckCircle2, Shield, Smartphone, Package, Heart, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../context/TelegramContext.jsx';
import { api } from '../services/api.js';

export default function Profile({ onNavigateToOrders, onNavigateToFavorites, onNavigateToAdmin }) {
  const { lang, setLang, t } = useLanguage();
  const { user, isAdmin, haptic } = useTelegram();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Tashkent');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
    }

    api.getProfile().then((res) => {
      if (res.data) {
        if (res.data.first_name) setFirstName(res.data.first_name);
        if (res.data.last_name) setLastName(res.data.last_name);
        if (res.data.phone_number) setPhoneNumber(res.data.phone_number);
        if (res.data.delivery_address) setDeliveryAddress(res.data.delivery_address);
        if (res.data.delivery_city) setDeliveryCity(res.data.delivery_city);
      }
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    haptic('medium');

    try {
      await api.updateProfile({
        firstName,
        lastName,
        phoneNumber,
        deliveryAddress,
        deliveryCity,
        languageCode: lang
      });

      haptic('success');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Profile Header (Image 2 style) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-slate-100 flex items-center justify-center text-white text-2xl font-bold font-serif shadow-sm">
          {firstName ? firstName.charAt(0).toUpperCase() : 'R'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 truncate">
              {firstName} {lastName}
            </h1>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield size={10} />
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {user?.username ? `@${user.username}` : `Telegram ID: ${user?.id || '—'}`}
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onNavigateToOrders}
          className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{t('orders_title')}</h4>
              <p className="text-[11px] text-slate-400">Buyurtmalarim tarixi</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onNavigateToFavorites}
          className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-400 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{t('favorites_title')}</h4>
              <p className="text-[11px] text-slate-400">Yoqqan liboslar</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="sm:col-span-2 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between hover:border-amber-400 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-amber-900">Admin Control Center</h4>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[9px] font-extrabold uppercase">Admin</span>
                </div>
                <p className="text-[11px] text-amber-700">Buyurtmalar, tovarlar va statistikani boshqarish</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-amber-700" />
          </button>
        )}
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
          Mening Ma’lumotlarim
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('first_name')}</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('last_name')}</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('phone_number')}</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('city')}</label>
            <input
              type="text"
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">{t('address')}</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Ko‘cha, uy, xonadon"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
            />
          </div>
        </div>

        {/* Language selector */}
        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-700 block mb-2">Ilova tili / Язык приложения</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'uz', label: '🇺🇿 O‘zbekcha' },
              { code: 'ru', label: '🇷🇺 Русский' },
              { code: 'en', label: '🇬🇧 English' }
            ].map((item) => (
              <button
                type="button"
                key={item.code}
                onClick={() => setLang(item.code)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  lang === item.code
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span>Saqlandi!</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
