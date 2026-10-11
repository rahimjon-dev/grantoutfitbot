import React from 'react';
import { Home, Compass, Heart, Package, User, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useTelegram } from '../context/TelegramContext.jsx';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { t } = useLanguage();
  const { favorites } = useFavorites();
  const { isAdmin, haptic } = useTelegram();

  const handleTabChange = (tabId) => {
    haptic('light');
    setActiveTab(tabId);
  };

  const navItems = [
    { id: 'store', label: t('nav_store'), icon: Home },
    { id: 'catalog', label: t('nav_catalog'), icon: Compass },
    { id: 'favorites', label: t('nav_favorites'), icon: Heart, badge: favorites.length },
    { id: 'orders', label: 'Buyurtma', icon: Package },
    { id: 'profile', label: t('nav_profile'), icon: User }
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: t('nav_admin'), icon: Shield, isAdminItem: true });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c10]/95 backdrop-blur-xl border-t border-white/[0.08] safe-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around h-15 px-0.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 relative transition-all duration-200 ${
                isActive
                  ? item.isAdminItem
                    ? 'text-amber-400 font-bold scale-105'
                    : 'text-gold-400 font-bold scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] font-bold rounded-full min-w-3.5 h-3.5 px-1 flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-1 tracking-tight truncate max-w-[58px] leading-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-gold-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
