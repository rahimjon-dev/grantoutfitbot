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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 relative transition-all duration-200 ${
                isActive
                  ? item.isAdminItem
                    ? 'text-amber-600 font-bold scale-105'
                    : 'text-blue-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
                <div className="relative">
                  <Icon size={20} className={isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] font-bold rounded-full min-w-3.5 h-3.5 px-1 flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[62px] leading-tight ${isActive ? 'font-bold text-slate-900' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
