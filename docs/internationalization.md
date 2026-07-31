# Internationalization (i18n)

## Overview

The platform supports three languages:
- **English (EN)** - Latin script
- **Afaan Oromoo (OM)** - Latin script
- **Amharic (AM)** - Ge'ez script

## Public Website

### Locale Provider

**File:** `public-website/src/providers/locale.tsx`

```typescript
// Language context with translations
export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState('en');

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}
```

### Language Picker

**File:** `public-website/src/components/LanguagePicker.tsx`

UI component for switching between EN/OM/AM.

### Translation Keys

Translations are organized by feature:

```typescript
// Example translation structure
{
  "nav": {
    "home": "Home",
    "catalog": "Catalog",
    "about": "About"
  },
  "hero": {
    "title": "Find Your Perfect Property",
    "subtitle": "Premium real estate in Adama, Ethiopia"
  },
  "filters": {
    "price": "Price",
    "beds": "Bedrooms",
    "baths": "Bathrooms"
  }
}
```

### Font Support

**File:** `public-website/src/routes/__root.tsx:101-104`

```typescript
// Google Fonts with Ethiopian script support
{
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=Noto+Sans+Ethiopic:wght@300;400;500;600&family=Noto+Serif+Ethiopic:wght@400;600&display=swap"
}
```

**Fonts:**
- **Inter** - Latin script (EN, OM)
- **Noto Sans Ethopic** - Ge'ez script (AM)
- **Noto Serif Ethopic** - Serif Ge'ez script (AM)

---

## Admin App

### Language Context

**File:** `admin-app/src/context/LanguageContext.js`

```javascript
// Language context with translations
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

### Translations File

**File:** `admin-app/src/i18n/translations.js`

```javascript
export const translations = {
  en: {
    login: 'Login',
    dashboard: 'Dashboard',
    properties: 'Properties',
    settings: 'Settings',
    // ...
  },
  om: {
    login: 'Seensa',
    dashboard: 'Gabaa',
    properties: 'Mee\'aa',
    settings: 'Qindaa\'ina',
    // ...
  },
  am: {
    login: 'ግባ',
    dashboard: 'ዳሽቦርድ',
    properties: 'ንብረቶች',
    settings: 'ማስተካከያ',
    // ...
  },
};
```

### Usage in Components

```javascript
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

function MyComponent() {
  const { t } = useContext(LanguageContext);

  return <Text>{t('login')}</Text>;
}
```

---

## Language Detection

### Browser Language (Website)

```typescript
// Auto-detect from browser
const browserLang = navigator.language.split('-')[0];
if (['en', 'om', 'am'].includes(browserLang)) {
  setLocale(browserLang);
}
```

### Stored Preference

```typescript
// Persist in localStorage
const savedLang = localStorage.getItem('locale');
if (savedLang) {
  setLocale(savedLang);
}
```

---

## RTL/LTR Support

All three languages use LTR (Left-to-Right) script direction, so no RTL handling is required.

| Language | Script | Direction |
|----------|--------|-----------|
| English | Latin | LTR |
| Afaan Oromoo | Latin | LTR |
| Amharic | Ge'ez | LTR |

---

## Adding a New Language

1. Add translations to both website and admin app
2. Add font support if needed (check script)
3. Update language picker components
4. Add locale to supported list in providers

```typescript
// Add to supported locales
const SUPPORTED_LOCALES = ['en', 'om', 'am', 'new_lang'];
```
