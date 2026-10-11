import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Globe, Save, CheckCircle2, Shield, Smartphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../context/TelegramContext.jsx';
import { api } from '../services/api.js';

export default function Profile() {
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
      {/* Profile Header */}
      <div className="bg-[#121216] p-6 rounded-3xl border border-white/[0.08] flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center text-white text-2xl font-bold font-serif">
          {firstName ? firstName.charAt(0).toUpperCase() : 'G'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white truncate">
              {firstName} {lastName}
            </h1>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield size={10} />
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            {user?.username ? `@${user.username}` : `Telegram ID: ${user?.id || '—'}`}
          </p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="bg-[#121216] p-6 rounded-3xl border border-white/[0.08] space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/[0.06] pb-3">
          Mening Ma’lumotlarim
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">{t('first_name')}</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">{t('last_name')}</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1.5">{t('phone_number')}</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="text-xs text-zinc-400 block mb-1.5">{t('city')}</label>
            <input
              type="text"
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-zinc-400 block mb-1.5">{t('address')}</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Ko‘cha, uy, xonadon"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Language selector */}
        <div className="pt-2">
          <label className="text-xs text-zinc-400 block mb-2">Ilova tili / Язык приложения</label>
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
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  lang === item.code
                    ? 'border-gold-500 bg-gold-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
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
          className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all"
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
