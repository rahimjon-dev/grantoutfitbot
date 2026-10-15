import React, { useState } from 'react';
import { ShoppingBag, Heart, Shield, Globe, User, Package, Compass, Home, Bell, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../context/TelegramContext.jsx';

export default function Navbar({ activeTab, setActiveTab }) {
  const { itemCount, setIsOpen } = useCart();
  const { favorites } = useFavorites();
  const { lang, setLang, t } = useLanguage();
  const { isAdmin, user } = useTelegram();
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'uz', label: 'O‘zbekcha', short: 'UZ' },
    { code: 'ru', label: 'Русский', short: 'RU' },
    { code: 'en', label: 'English', short: 'EN' }
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];
  const userName = user?.first_name ? `${user.first_name} ${user?.last_name || ''}`.trim() : 'Rahimjon';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-3">
        {/* User Identity / Brand Logo (Image 2 style) */}
        <div 
          onClick={() => setActiveTab('store')}
          className="cursor-pointer flex items-center gap-2.5 group flex-shrink-0"
        >
          {/* Avatar circle */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-xs">
            {user?.photo_url ? (
              <img src={user.photo_url} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                {userName}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full font-serif tracking-wider uppercase hidden sm:inline-block">
                GRANT
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin size={11} className="text-slate-400" />
              <span>Tashkent, Uzbekistan</span>
            </div>
          </div>
        </div>

        {/* Desktop & Laptop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <button
            onClick={() => setActiveTab('store')}
            className={`transition-colors py-1.5 px-3 rounded-full flex items-center gap-1.5 ${
              activeTab === 'store' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Home size={14} className={activeTab === 'store' ? 'text-blue-600' : 'text-slate-400'} />
            <span>{t('nav_store')}</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`transition-colors py-1.5 px-3 rounded-full flex items-center gap-1.5 ${
              activeTab === 'catalog' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Compass size={14} className={activeTab === 'catalog' ? 'text-blue-600' : 'text-slate-400'} />
            <span>{t('nav_catalog')}</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`transition-colors py-1.5 px-3 rounded-full flex items-center gap-1.5 ${
              activeTab === 'favorites' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Heart size={14} className={activeTab === 'favorites' ? 'text-rose-500 fill-rose-500' : 'text-slate-400'} />
            <span>{t('nav_favorites')}</span>
            {favorites.length > 0 && (
              <span className="bg-rose-50 text-rose-600 text-[10px] px-1.5 rounded-full font-bold">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`transition-colors py-1.5 px-3 rounded-full flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Package size={14} className={activeTab === 'orders' ? 'text-blue-600' : 'text-slate-400'} />
            <span>{t('nav_orders')}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`transition-colors py-1.5 px-3 rounded-full flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <User size={14} className={activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'} />
            <span>{t('nav_profile')}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-colors ${
                activeTab === 'admin'
                  ? 'bg-amber-100 text-amber-700 font-bold'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Action Controls (Image 2 style) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors"
              aria-label="Language selector"
            >
              <Globe size={13} className="text-slate-600" />
              <span className="uppercase tracking-wider text-[11px] font-bold">{currentLangObj.short}</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      lang === l.code ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{l.short}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Wishlist */}
          <button
            onClick={() => setActiveTab('favorites')}
            className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={18} className={activeTab === 'favorites' ? 'fill-rose-500 text-rose-500' : ''} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart Trigger (Image 2 style with badge) */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            aria-label="Shopping Bag"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
