import React, { useState } from 'react';
import { ShoppingBag, Heart, Shield, Globe, User, Package, Compass, Home } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../context/TelegramContext.jsx';

export default function Navbar({ activeTab, setActiveTab }) {
  const { itemCount, setIsOpen } = useCart();
  const { favorites } = useFavorites();
  const { lang, setLang, t } = useLanguage();
  const { isAdmin } = useTelegram();
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'uz', label: 'O‘zbekcha', short: 'UZ' },
    { code: 'ru', label: 'Русский', short: 'RU' },
    { code: 'en', label: 'English', short: 'EN' }
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('store')}
          className="cursor-pointer flex items-center gap-2 group flex-shrink-0"
        >
          <span className="font-serif text-xl sm:text-2xl font-black tracking-[0.25em] text-white group-hover:text-gold-400 transition-colors">
            GRANT
          </span>
          <span className="text-[9px] tracking-widest text-zinc-400 font-medium uppercase hidden sm:inline-block border-l border-zinc-700 pl-2">
            Luxury Fashion
          </span>
        </div>

        {/* Desktop & Laptop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <button
            onClick={() => setActiveTab('store')}
            className={`transition-colors hover:text-white py-1 relative flex items-center gap-1.5 ${
              activeTab === 'store' ? 'text-gold-400 font-bold' : ''
            }`}
          >
            <Home size={14} className={activeTab === 'store' ? 'text-gold-400' : 'text-zinc-500'} />
            <span>{t('nav_store')}</span>
            {activeTab === 'store' && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`transition-colors hover:text-white py-1 relative flex items-center gap-1.5 ${
              activeTab === 'catalog' ? 'text-gold-400 font-bold' : ''
            }`}
          >
            <Compass size={14} className={activeTab === 'catalog' ? 'text-gold-400' : 'text-zinc-500'} />
            <span>{t('nav_catalog')}</span>
            {activeTab === 'catalog' && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`transition-colors hover:text-white py-1 relative flex items-center gap-1.5 ${
              activeTab === 'favorites' ? 'text-gold-400 font-bold' : ''
            }`}
          >
            <Heart size={14} className={activeTab === 'favorites' ? 'text-rose-500 fill-rose-500' : 'text-zinc-500'} />
            <span>{t('nav_favorites')}</span>
            {favorites.length > 0 && (
              <span className="bg-rose-500/20 text-rose-400 text-[10px] px-1.5 rounded-full font-bold">
                {favorites.length}
              </span>
            )}
            {activeTab === 'favorites' && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`transition-colors hover:text-white py-1 relative flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'text-gold-400 font-bold' : ''
            }`}
          >
            <Package size={14} className={activeTab === 'orders' ? 'text-gold-400' : 'text-zinc-500'} />
            <span>{t('nav_orders')}</span>
            {activeTab === 'orders' && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`transition-colors hover:text-white py-1 relative flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'text-gold-400 font-bold' : ''
            }`}
          >
            <User size={14} className={activeTab === 'profile' ? 'text-gold-400' : 'text-zinc-500'} />
            <span>{t('nav_profile')}</span>
            {activeTab === 'profile' && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 py-1 relative transition-colors ${
                activeTab === 'admin'
                  ? 'text-amber-400 font-bold'
                  : 'text-amber-500/80 hover:text-amber-300'
              }`}
            >
              <Shield size={14} />
              <span>Admin</span>
              {activeTab === 'admin' && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors"
              aria-label="Language selector"
            >
              <Globe size={13} className="text-gold-400 flex-shrink-0" />
              <span className="uppercase tracking-wider text-[11px] font-bold">{currentLangObj.short}</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 glass-dropdown rounded-xl shadow-2xl py-1 z-50 animate-fade-in">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                      lang === l.code ? 'text-gold-400 font-bold' : 'text-zinc-300'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{l.short}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Wishlist (visible in header on mobile too for quick tap) */}
          <button
            onClick={() => setActiveTab('favorites')}
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={18} className={activeTab === 'favorites' ? 'fill-rose-500 text-rose-500' : ''} />
            {favorites.length > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            aria-label="Shopping Bag"
          >
            <ShoppingBag size={18} className="text-zinc-200" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gold-500 text-black text-[9px] font-bold flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
