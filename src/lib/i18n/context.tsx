/**
 * @fileOverviewProvides React Context and a custom hook for client-side translations.
 */
'use client';

import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import type { Locale, Translations } from './types';
import { translate, getDictionary } from './dictionaries'; // Assuming getDictionary can be sync or you preload

// Define a default dictionary for initial load or if context is not found (though it shouldn't happen)
const defaultEnglishDictionary: Translations = {
  meta: { title: '', description: ''},
  homePage: { title: '', subtitle: '', footer: '', allRightsReserved: '' },
  imageCaptioningForm: { 
    cardTitle: '', cardDescription: '', uploadLabel: '', uploadMaxSize: '', 
    uploadClick: '', uploadDragAndDrop: '', uploadSelectedFile: '', uploadSupportedFormats: '',
    errorTitle: '', fileTooLargeError: '', fileReadError: '', selectImageError: '',
    generatingButton: '', generateButton: '', previewTitle: '', imageAltPreview: '',
    captionTitle: '', captionPlaceholder: '', imageAndCaptionPlaceholder: '', poweredBy: ''
  }
};


interface TranslationContextType {
  locale: Locale;
  dict: Translations;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  locale: Locale;
  dictionary: Translations;
}

export const TranslationProvider: FC<TranslationProviderProps> = ({
  children,
  locale,
  dictionary,
}) => {
  const t = useMemo(() => (key: string, params?: Record<string, string | number>) => {
    return translate(dictionary, key, params);
  }, [dictionary]);

  const contextValue = useMemo(() => ({
    locale,
    dict: dictionary,
    t,
  }), [locale, dictionary, t]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    // This fallback should ideally not be reached if Provider is correctly setup
    console.warn('useTranslation must be used within a TranslationProvider. Falling back to default English translations.');
    const defaultLocale: Locale = 'en';
    // In a real scenario, you might fetch or have a statically imported default dictionary
    // For simplicity, using a minimal default or throwing error.
    // Here, we'll provide a non-functional t and an empty dict to avoid crashing, but log a warning.
    return {
      locale: defaultLocale,
      dict: defaultEnglishDictionary, // Provide a default empty dictionary
      t: (key: string) => {
        console.error("Translation context not found, t function is a no-op. Key:", key);
        return key; // Return key as fallback
      }
    };
  }
  return context;
};
