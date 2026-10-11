import React, { useState } from 'react';
import { ShoppingBag, Heart, Shield, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTelegram } from '../context/TelegramContext.jsx';

export default function Navbar({ activeTab, setActiveTab }) {
  const { itemCount, setIsOpen } = useCart();
  const { favorites } = useFavorites();
  const { lang, setLang } = useLanguage();
  const { isAdmin, isInsideTelegram } = useTelegram();
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'uz', label: 'O‘zbekcha', flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('store')}
          className="cursor-pointer flex items-center gap-2 group"
        >
          <span className="font-serif text-2xl font-black tracking-[0.2em] text-white group-hover:text-gold-400 transition-colors">
            GRANT
          </span>
          <span className="text-[10px] tracking-widest text-zinc-500 font-medium uppercase hidden sm:inline-block border-l border-zinc-700 pl-2">
            Haute Couture
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <button
            onClick={() => setActiveTab('store')}
            className={`transition-colors hover:text-white ${activeTab === 'store' ? 'text-white border-b-2 border-gold-500 pb-1' : ''}`}
          >
            Store
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`transition-colors hover:text-white ${activeTab === 'catalog' ? 'text-white border-b-2 border-gold-500 pb-1' : ''}`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`transition-colors hover:text-white ${activeTab === 'orders' ? 'text-white border-b-2 border-gold-500 pb-1' : ''}`}
          >
            Orders
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 transition-colors hover:text-amber-300 ${activeTab === 'admin' ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-1' : 'text-amber-500/80'}`}
            >
              <Shield size={13} />
              Admin
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors"
            >
              <span>{currentLangObj.flag}</span>
              <span className="uppercase font-semibold tracking-wider text-[11px]">{currentLangObj.code}</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 glass-dropdown rounded-xl shadow-2xl py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/10 transition-colors ${
                      lang === l.code ? 'text-gold-400 font-semibold' : 'text-zinc-300'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Wishlist */}
          <button
            onClick={() => setActiveTab('favorites')}
            className="relative p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={20} className={activeTab === 'favorites' ? 'fill-rose-500 text-rose-500' : ''} />
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            aria-label="Shopping Bag"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
