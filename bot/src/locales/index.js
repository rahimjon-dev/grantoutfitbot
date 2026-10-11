import { uz } from './uz.js';
import { ru } from './ru.js';
import { en } from './en.js';

export const locales = { uz, ru, en };

export function t(lang = 'uz', key, params = {}) {
  const dictionary = locales[lang] || locales['uz'];
  let text = dictionary[key] || locales['uz'][key] || key;

  for (const [paramKey, paramVal] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
  }

  return text;
}
