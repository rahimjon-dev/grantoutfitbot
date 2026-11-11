import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTelegram } from './TelegramContext.jsx';
import { api } from '../services/api.js';
import uz from '../locales/uz.json';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

const translations = { uz, ru, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { profile } = useTelegram();

  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('grant_lang');
    if (saved && ['uz', 'ru', 'en'].includes(saved)) return saved;

    // Default language is ALWAYS Uzbek
    return 'uz';
  });

  // Synchronize with database profile language chosen in Telegram Bot
  useEffect(() => {
    if (profile?.language_code && ['uz', 'ru', 'en'].includes(profile.language_code)) {
      if (profile.language_code !== lang) {
        setLang(profile.language_code);
      }
    }
  }, [profile?.language_code]);

  const handleSetLang = (newLang) => {
    if (['uz', 'ru', 'en'].includes(newLang)) {
      setLang(newLang);
      localStorage.setItem('grant_lang', newLang);
      api.updateProfile({ languageCode: newLang }).catch(() => {});
    }
  };

  useEffect(() => {
    localStorage.setItem('grant_lang', lang);
  }, [lang]);

  const t = (key, params = {}) => {
    const currentDict = translations[lang] || translations['uz'];
    let text = currentDict[key] || translations['uz'][key] || key;

    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  };

  const getLocalizedField = (obj, fieldPrefix) => {
    if (!obj) return '';
    return obj[`${fieldPrefix}_${lang}`] || obj[`${fieldPrefix}_uz`] || obj[`${fieldPrefix}_en`] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, getLocalizedField }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
