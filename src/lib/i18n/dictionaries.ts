/**
 * @fileOverviewManages loading and providing access to translation dictionaries.
 */

import type { Locale, Translations } from './types';

// Using dynamic imports for dictionary files to enable code splitting if desired later.
// For now, they are directly imported.
import enMessages from '@/locales/en.json';
import frMessages from '@/locales/fr.json';

const dictionaries: Record<Locale, Translations> = {
  en: enMessages as Translations,
  fr: frMessages as Translations,
};

export const getDictionary = async (locale: Locale): Promise<Translations> => {
  return dictionaries[locale] ?? dictionaries.en; // Fallback to English
};

/**
 * Retrieves a specific translation string using a dot-separated key.
 * @param dict The dictionary object for the current locale.
 * @param key A dot-separated string representing the path to the translation (e.g., "homePage.title").
 * @param params Optional parameters to replace placeholders in the translation string.
 * @returns The translated string, or the key itself if not found.
 */
export const translate = (dict: Translations, key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let result: any = dict;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      // Key not found, return the original key as a fallback
      console.warn(`Translation key "${key}" not found for current locale.`);
      return key;
    }
  }

  if (typeof result === 'string') {
    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      }, result);
    }
    return result;
  }

  // If the result is not a string (e.g., a nested object was targeted but not fully resolved)
  console.warn(`Translation for key "${key}" is not a string.`);
  return key;
};
