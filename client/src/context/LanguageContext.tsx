import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { hi } from '../translations/hi';
import { bn } from '../translations/bn';

export type LanguageCode = 'en' | 'hi' | 'bn';

export type TranslationKeys = typeof en;

const translationsMap: Record<LanguageCode, TranslationKeys> = {
  en,
  hi: hi as TranslationKeys,
  bn: bn as TranslationKeys
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode | string) => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bharatfarm_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved === 'hi' || saved === 'bn' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      // localStorage read error fallback
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode | string) => {
    const validLang: LanguageCode = lang === 'hi' ? 'hi' : lang === 'bn' ? 'bn' : 'en';
    setLanguageState(validLang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, validLang);
      document.documentElement.lang = validLang;
    } catch (e) {
      // localStorage write error
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    let currentObj: any = translationsMap[language] || translationsMap.en;
    let fallbackObj: any = translationsMap.en;

    for (const key of keys) {
      if (currentObj && typeof currentObj === 'object' && key in currentObj) {
        currentObj = currentObj[key];
      } else {
        currentObj = undefined;
      }

      if (fallbackObj && typeof fallbackObj === 'object' && key in fallbackObj) {
        fallbackObj = fallbackObj[key];
      } else {
        fallbackObj = undefined;
      }
    }

    let result = (typeof currentObj === 'string' ? currentObj : typeof fallbackObj === 'string' ? fallbackObj : keyPath);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`{\\s*${paramKey}\\s*}`, 'g'), String(paramVal));
      });
    }

    return result;
  };

  const getLocale = (): string => {
    if (language === 'hi') return 'hi-IN';
    if (language === 'bn') return 'bn-IN';
    return 'en-IN';
  };

  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      const defaultOptions: Intl.DateTimeFormatOptions = options || {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };
      return new Intl.DateTimeFormat(getLocale(), defaultOptions).format(d);
    } catch (e) {
      return String(date);
    }
  };

  const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(getLocale(), options).format(num);
    } catch (e) {
      return String(num);
    }
  };

  const formatCurrency = (amount: number): string => {
    try {
      const formatted = new Intl.NumberFormat(getLocale()).format(amount);
      return `₹${formatted}`;
    } catch (e) {
      return `₹${amount}`;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate, formatNumber, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
