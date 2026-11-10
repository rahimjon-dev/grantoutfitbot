import React, { createContext, useContext, useState, useEffect } from 'react';
import uz from '../locales/uz.json';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

const translations = { uz, ru, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('grant_lang');
    if (saved && ['uz', 'ru', 'en'].includes(saved)) return saved;

    // Detect language from Telegram WebApp user context
    const tgLang = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code : null;
    if (tgLang) {
      if (tgLang.startsWith('ru')) return 'ru';
      if (tgLang.startsWith('uz')) return 'uz';
      if (tgLang.startsWith('en')) return 'en';
    }

    // Detect language from browser environment
    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.startsWith('ru')) return 'ru';
      if (navigator.language.startsWith('uz')) return 'uz';
      if (navigator.language.startsWith('en')) return 'en';
    }

    return 'uz';
  });

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
    <LanguageContext.Provider value={{ lang, setLang, t, getLocalizedField }}>
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
