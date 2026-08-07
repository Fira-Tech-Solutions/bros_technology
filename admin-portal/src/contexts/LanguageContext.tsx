import React, { createContext, useContext, useState } from 'react';

const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    properties: 'Properties',
    settings: 'Settings',
    syndication: 'Syndication',
    loginButton: 'Sign In',
    requiredField: 'Required',
    noResults: 'No results found',
    propertiesTitle: 'Properties',
  },
  am: {
    dashboard: 'ዳሽቦርድ',
    properties: 'נכסים',
    settings: 'הגדרות',
    syndication: 'סינדיקציה',
    loginButton: 'הכנס',
    requiredField: 'חובה',
    noResults: 'לא נמצאו תוצאות',
    propertiesTitle: 'נכסים',
  },
  or: {
    dashboard: 'Daashboordii',
    properties: 'Meeshaalee',
    settings: 'Qindaayina',
    loginButton: 'Keessi',
    requiredField: 'Barbaachisa',
    noResults: 'Filannoo hin argamne',
    propertiesTitle: 'Meeshaalee',
  },
};

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: { code: string; name: string; }[];
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, languages: [
      { code: 'en', name: 'English' },
      { code: 'am', name: 'አማርኛ' },
      { code: 'or', name: 'Afaan Oromoo' },
    ] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
