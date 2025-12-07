# Sprint 8: Internationalization & Accessibility

**Sprint Duration:** Week 13-14 (estimated 2-3 weeks)  
**Status:** 📋 Planned  
**Priority:** High 🟠  
**Main Goals:**

1. Multi-language support (i18n)
2. WCAG 2.1 Level AA accessibility compliance
3. RTL language support

---

## 📋 Executive Summary

Sprint 8 makes ScaleFlow accessible to global markets and all users regardless of language or ability. This sprint implements internationalization for 5+ languages and achieves full accessibility compliance.

**Expected Impact:**

- Open markets in 10+ countries
- Support 5+ languages out of the box
- WCAG 2.1 Level AA compliant
- 100% keyboard navigable
- Screen reader compatible

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Internationalization** (P1 - Critical)
   - English, Spanish, Portuguese, French, German support
   - Dynamic language switching
   - Locale-specific date/time/number formatting
   - Translation management system

2. **Accessibility** (P2 - High)
   - WCAG 2.1 Level AA compliance
   - Keyboard navigation
   - Screen reader optimization
   - Color contrast improvements
   - Focus management

3. **RTL Support** (P3 - Medium)
   - Right-to-left layout support
   - Arabic/Hebrew preparation
   - Bidirectional text handling

---

## 📦 Task Breakdown

### Task 1: i18n Setup & Infrastructure (4 hours)

**Priority:** Critical

**Setup:**

```bash
# Install dependencies
npm install react-i18next i18next i18next-browser-languagedetector
npm install --save-dev @types/i18next
```

**Configuration:**

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/common.json';
import es from './locales/es/common.json';
import pt from './locales/pt/common.json';
import fr from './locales/fr/common.json';
import de from './locales/de/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt },
      fr: { translation: fr },
      de: { translation: de },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

**File Structure:**

```
src/i18n/
├── config.ts
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── dashboard.json
    │   ├── shifts.json
    │   ├── auth.json
    │   └── errors.json
    ├── es/
    ├── pt/
    ├── fr/
    └── de/
```

**Files to Create:**
- `src/i18n/config.ts`
- `src/i18n/locales/en/*.json` (5 files)
- `src/hooks/useTranslation.ts`
- `src/components/LanguageSwitcher.tsx`

---

### Task 2: Extract & Translate UI Strings (6 hours)

**Priority:** Critical

**Translation Keys Structure:**

```json
// src/i18n/locales/en/common.json
{
  "nav": {
    "dashboard": "Dashboard",
    "schedules": "Schedules",
    "employees": "Employees",
    "analytics": "Analytics"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "messages": {
    "saveSuccess": "Changes saved successfully",
    "deleteConfirm": "Are you sure you want to delete this item?"
  }
}

// src/i18n/locales/en/shifts.json
{
  "title": "Shifts",
  "create": "Create Shift",
  "edit": "Edit Shift",
  "fields": {
    "employee": "Employee",
    "startTime": "Start Time",
    "endTime": "End Time",
    "break": "Break Duration"
  },
  "status": {
    "draft": "Draft",
    "published": "Published",
    "completed": "Completed"
  }
}
```

**Usage:**

```typescript
// Before:
<button>Save</button>

// After:
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<button>{t('actions.save')}</button>
```

**Extract All Strings From:**
- Navigation menus
- Button labels
- Form fields
- Error messages
- Success messages
- Table headers
- Modal titles
- Tooltips
- Placeholder text

**Files to Update:**
- All components with UI text (~50-60 files)
- All page components
- All form components

---

### Task 3: Date, Time & Number Formatting (3 hours)

**Priority:** High

**Locale-Aware Formatting:**

```typescript
// src/utils/i18n-formatters.ts

import { format as formatDateFns } from 'date-fns';
import { enUS, es, ptBR, fr, de } from 'date-fns/locale';

const locales = { en: enUS, es, pt: ptBR, fr, de };

export const formatDate = (date: Date, formatStr: string, locale: string = 'en'): string => {
  return formatDateFns(date, formatStr, {
    locale: locales[locale] || locales.en,
  });
};

export const formatCurrency = (amount: number, locale: string = 'en', currency: string = 'USD'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number, locale: string = 'en'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatTime = (date: Date, locale: string = 'en'): string => {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
```

**Usage:**

```typescript
// Before:
<span>${cost}</span>

// After:
import { formatCurrency } from '@/utils/i18n-formatters';
const { i18n } = useTranslation();

<span>{formatCurrency(cost, i18n.language, companySettings.currency)}</span>
```

**Files to Create:**
- `src/utils/i18n-formatters.ts`
- `src/utils/i18n-formatters.test.ts`

---

### Task 4: Language Switcher Component (2 hours)

**Priority:** Medium

**Component:**

```typescript
// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    // Save preference to user profile
    await updateUserPreference({ language: langCode });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className="flex items-center gap-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {i18n.language === lang.code && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

**Integration:**
- Add to Navbar
- Add to user settings
- Save preference to database

**Files to Create:**
- `src/components/LanguageSwitcher.tsx`

---

### Task 5: Accessibility Audit & Fixes (6 hours)

**Priority:** High

**Audit Checklist:**

1. **Keyboard Navigation**
   - [ ] All interactive elements keyboard accessible
   - [ ] Logical tab order
   - [ ] Skip links for main content
   - [ ] No keyboard traps
   - [ ] Escape key closes modals

2. **Screen Readers**
   - [ ] All images have alt text
   - [ ] Form inputs have labels
   - [ ] ARIA labels for icon buttons
   - [ ] ARIA live regions for dynamic content
   - [ ] Proper heading hierarchy

3. **Color Contrast**
   - [ ] Text meets WCAG AA (4.5:1)
   - [ ] Large text meets WCAG AA (3:1)
   - [ ] Focus indicators visible
   - [ ] Don't rely on color alone

4. **Forms**
   - [ ] Error messages associated with inputs
   - [ ] Required fields marked
   - [ ] Clear labels
   - [ ] Autocomplete attributes

**Fixes to Implement:**

```typescript
// Add skip link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Fix icon buttons
<button aria-label="Close modal">
  <X className="h-4 w-4" />
</button>

// Add ARIA live region for notifications
<div role="status" aria-live="polite" aria-atomic="true">
  {notification.message}
</div>

// Improve form accessibility
<label htmlFor="email" className="text-sm font-medium">
  Email Address
  <span className="text-red-500" aria-label="required">*</span>
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-sm text-red-500">
    {errors.email}
  </p>
)}
```

**Tools to Use:**
- axe DevTools
- WAVE browser extension
- Lighthouse accessibility audit
- NVDA/JAWS screen readers
- Keyboard-only testing

**Files to Update:**
- Most UI components (~40-50 files)
- All form components
- All modal components
- Navigation components

---

### Task 6: RTL Support (4 hours)

**Priority:** Medium

**RTL Configuration:**

```typescript
// src/lib/rtl.ts
export const isRTL = (locale: string): boolean => {
  return ['ar', 'he', 'fa'].includes(locale);
};

// Apply to HTML element
useEffect(() => {
  const dir = isRTL(i18n.language) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
}, [i18n.language]);
```

**Tailwind RTL Config:**

```javascript
// tailwind.config.ts
module.exports = {
  plugins: [
    require('tailwindcss-rtl'),
  ],
};
```

**RTL-Aware Components:**

```typescript
// Use logical properties
className="ms-4"  // margin-start (margin-left in LTR, margin-right in RTL)
className="me-4"  // margin-end
className="ps-4"  // padding-start
className="pe-4"  // padding-end

// RTL-aware icons
const ChevronNext = () => {
  const { i18n } = useTranslation();
  return isRTL(i18n.language) ? <ChevronLeft /> : <ChevronRight />;
};
```

**Files to Update:**
- Tailwind config
- Layout components
- Navigation components

---

### Task 7: Professional Translation (3 hours)

**Priority:** Medium

**Translation Process:**

1. **Export for Translation**
   ```bash
   # Extract all translation keys
   node scripts/extract-translations.js
   # Generates translations.csv
   ```

2. **Get Professional Translations**
   - Use service like Lokalise, Phrase, or Crowdin
   - Or hire professional translators
   - Priority: Spanish, Portuguese (high market demand)

3. **Import Translations**
   ```bash
   node scripts/import-translations.js
   ```

4. **Review & Quality Check**
   - Native speaker review
   - Context verification
   - Consistency check

**Translation Guidelines:**
- Keep tone consistent
- Preserve placeholders
- Consider cultural context
- Verify technical terms
- Test with actual users

---

### Task 8: Integration & Testing (4 hours)

**Testing Checklist:**

```bash
# i18n Testing
- [ ] All languages load correctly
- [ ] Language switching works
- [ ] Date/time formats correct per locale
- [ ] Currency formats correct
- [ ] RTL layout works
- [ ] No untranslated strings

# Accessibility Testing
- [ ] Keyboard navigation complete
- [ ] Screen reader announces correctly
- [ ] Color contrast meets WCAG AA
- [ ] Forms accessible
- [ ] ARIA labels present
- [ ] Focus management works

# Tools
axe DevTools - 0 critical issues
WAVE - 0 errors
Lighthouse - Accessibility score >95
Manual keyboard testing
NVDA/JAWS testing
```

**Files to Create:**
- `src/i18n/i18n.test.ts`
- `scripts/extract-translations.js`
- `scripts/import-translations.js`

---

### Task 9: Documentation (2 hours)

**Documents to Create:**

1. **I18N_GUIDE.md** - How to add translations
2. **ACCESSIBILITY_GUIDE.md** - Accessibility standards
3. **TRANSLATION_GUIDE.md** - For translators

---

## 📊 Time Estimates

| Task | Hours | Priority |
|------|-------|----------|
| 1. i18n Setup | 4 | Critical |
| 2. Extract Strings | 6 | Critical |
| 3. Formatting | 3 | High |
| 4. Language Switcher | 2 | Medium |
| 5. Accessibility Fixes | 6 | High |
| 6. RTL Support | 4 | Medium |
| 7. Translation | 3 | Medium |
| 8. Testing | 4 | Critical |
| 9. Documentation | 2 | Medium |
| **TOTAL** | **34 hours** | **~2 weeks** |

**Buffer:** +20% = **41 hours total**

---

## 🎯 Success Metrics

- [ ] 5 languages supported
- [ ] 100% UI strings translated
- [ ] WCAG 2.1 Level AA compliant
- [ ] Accessibility score >95 (Lighthouse)
- [ ] 100% keyboard navigable
- [ ] RTL layout functional
- [ ] 211+ tests passing

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 8 - Internationalization & Accessibility
