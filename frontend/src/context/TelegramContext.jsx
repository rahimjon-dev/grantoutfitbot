import React, { createContext, useContext, useEffect, useState } from 'react';

const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const isInsideTelegram = Boolean(tg && tg.initData);

  // Dev simulation user when opened outside Telegram
  const [devUser, setDevUser] = useState(() => {
    const saved = localStorage.getItem('grant_dev_user');
    return saved
      ? JSON.parse(saved)
      : {
          id: 7534175269,
          first_name: 'Rahimjon',
          last_name: 'Dev',
          username: 'rahimjon_dev',
          isAdmin: true
        };
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        tg.setHeaderColor?.('#ffffff');
        tg.setBackgroundColor?.('#f8fafc');
        tg.enableClosingConfirmation?.();
      } catch (e) {
        console.warn('Telegram WebApp setup warning:', e);
      }
    }
    setIsReady(true);
  }, [tg]);

  const haptic = (type = 'medium') => {
    if (tg?.HapticFeedback) {
      if (type === 'success' || type === 'error' || type === 'warning') {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    }
  };

  const updateDevUser = (updates) => {
    const next = { ...devUser, ...updates };
    setDevUser(next);
    localStorage.setItem('grant_dev_user', JSON.stringify(next));
  };

  const user = isInsideTelegram ? tg?.initDataUnsafe?.user : devUser;
  const isAdmin = isInsideTelegram
    ? Boolean(user?.id && (user.id === 123456789 || user.id === 987654321 || devUser.isAdmin))
    : Boolean(devUser.isAdmin);

  const value = {
    tg,
    isInsideTelegram,
    user,
    isAdmin,
    isReady,
    haptic,
    updateDevUser,
    colorScheme: tg?.colorScheme || 'dark',
    themeParams: tg?.themeParams || {}
  };

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}
