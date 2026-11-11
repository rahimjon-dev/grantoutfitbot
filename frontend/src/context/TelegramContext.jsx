import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const isInsideTelegram = Boolean(tg && tg.initData);

  // Dev simulation user when opened outside Telegram in development mode
  const [devUser, setDevUser] = useState(() => {
    if (!import.meta.env.DEV) return null;
    const saved = localStorage.getItem('grant_dev_user');
    return saved
      ? JSON.parse(saved)
      : {
          id: 7534175269,
          first_name: 'Rahimjon',
          last_name: 'Dev',
          username: 'rahimjon_dev',
          isAdmin: false
        };
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(null);
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

  const user = isInsideTelegram ? tg?.initDataUnsafe?.user : devUser;

  const refreshProfile = async () => {
    if (!user) return null;
    try {
      const res = await api.getProfile();
      if (res?.data) {
        setProfile(res.data);
        setIsAdmin(Boolean(res.data.is_admin));
        if (res.data.language_code && ['uz', 'ru', 'en'].includes(res.data.language_code)) {
          localStorage.setItem('grant_lang', res.data.language_code);
        }
        return res.data;
      }
    } catch (err) {
      if (!isInsideTelegram && import.meta.env.DEV && devUser?.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    return null;
  };

  // Verify server-side authorization and profile on mount
  useEffect(() => {
    refreshProfile();
  }, [user?.id, isInsideTelegram]);

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
    if (!import.meta.env.DEV) return;
    const next = { ...devUser, ...updates };
    setDevUser(next);
    localStorage.setItem('grant_dev_user', JSON.stringify(next));
    if (updates.isAdmin !== undefined) {
      setIsAdmin(Boolean(updates.isAdmin));
    }
  };

  const value = {
    tg,
    isInsideTelegram,
    user,
    profile,
    refreshProfile,
    isAdmin,
    setIsAdmin,
    isReady,
    haptic,
    updateDevUser,
    colorScheme: tg?.colorScheme || 'light',
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
