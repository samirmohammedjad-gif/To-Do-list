
import React, { createContext, useContext, useEffect } from 'react';
import { translations, Language } from '../locales';

interface LanguageContextType {
  language: Language;
  t: (key: keyof typeof translations['ar']) => string;
  dir: 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language: Language = 'ar';
  const dir = 'rtl';

  const t = (key: keyof typeof translations['ar']) => {
    return translations['ar'][key] || key;
  };

  useEffect(() => {
    document.body.dir = dir;
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
