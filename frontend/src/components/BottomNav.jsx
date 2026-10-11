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
    { id: 'orders', label: t('nav_orders'), icon: Package },
    { id: 'profile', label: t('nav_profile'), icon: User }
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: t('nav_admin'), icon: Shield, isAdminItem: true });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c10]/95 backdrop-blur-xl border-t border-white/[0.08] safe-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                isActive
                  ? item.isAdminItem
                    ? 'text-amber-400 font-bold'
                    : 'text-gold-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'scale-110 transition-transform' : ''} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[55px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
