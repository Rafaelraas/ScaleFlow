# Sprint 8 Agent Prompt: Internationalization & Accessibility

## 🎯 Mission Brief

Implement **Internationalization (i18n)** and **Accessibility (a11y)** for ScaleFlow. Make the platform available in 5+ languages and fully accessible to all users.

**Sprint Goals:**

1. ✅ Multi-language support (EN, ES, PT, FR, DE)
2. ✅ WCAG 2.1 Level AA compliance
3. ✅ RTL language support
4. ✅ Keyboard navigation
5. ✅ Screen reader optimization

**Expected Timeline:** 34-41 hours (~2 weeks)

---

## 🎯 Success Criteria

### i18n ✅
- [ ] 5 languages fully translated
- [ ] Dynamic language switching
- [ ] Locale-aware date/time/currency
- [ ] RTL layout support

### Accessibility ✅
- [ ] WCAG 2.1 Level AA compliant
- [ ] 100% keyboard navigable
- [ ] Screen reader compatible
- [ ] Lighthouse accessibility score >95

### Quality ✅
- [ ] 211+ tests passing
- [ ] No untranslated strings
- [ ] 0 critical accessibility issues

---

## 📦 Task List

### Phase 1: i18n Foundation (Day 1-4)

#### Task 1: Setup i18n (4h)

**Action:**
1. Install react-i18next
2. Create i18n config
3. Set up locale file structure
4. Initialize with English

**Files to create:**
- `src/i18n/config.ts`
- `src/i18n/locales/en/common.json`
- `src/i18n/locales/en/shifts.json`
- `src/hooks/useTranslation.ts`

---

#### Task 2: Extract UI Strings (6h)

**Action:**
Replace all hardcoded strings with translation keys.

**Before:**
```typescript
<button>Save</button>
```

**After:**
```typescript
const { t } = useTranslation();
<button>{t('actions.save')}</button>
```

**Update ~50-60 files:**
- Navigation
- Forms
- Buttons
- Messages
- Errors

---

#### Task 3: Formatting (3h)

**Action:**
1. Create i18n formatters
2. Update date displays
3. Update currency displays
4. Update number displays

**Files to create:**
- `src/utils/i18n-formatters.ts`

---

#### Task 4: Language Switcher (2h)

**Action:**
1. Create LanguageSwitcher component
2. Add to Navbar
3. Save preference to database

**Files to create:**
- `src/components/LanguageSwitcher.tsx`

---

### Phase 2: Accessibility (Day 5-7)

#### Task 5: Accessibility Fixes (6h)

**Action:**
1. Run axe DevTools audit
2. Fix keyboard navigation
3. Add ARIA labels
4. Improve color contrast
5. Fix form accessibility
6. Test with screen reader

**Key Fixes:**
- Add skip links
- Fix icon button labels
- Add ARIA live regions
- Improve focus management
- Ensure proper heading hierarchy

---

#### Task 6: RTL Support (4h)

**Action:**
1. Add RTL detection
2. Update Tailwind config
3. Use logical properties (ms/me/ps/pe)
4. Test Arabic layout (simulation)

---

### Phase 3: Translation & Polish (Day 8-10)

#### Task 7: Professional Translation (3h)

**Action:**
1. Export translation keys
2. Get translations (Spanish, Portuguese priority)
3. Import and verify
4. Native speaker review

---

#### Task 8: Testing (4h)

**Testing:**
```bash
# i18n
- All languages switch correctly
- No untranslated strings
- Formats correct per locale

# Accessibility
axe DevTools: 0 critical issues
WAVE: 0 errors
Lighthouse: >95 score
Keyboard: Complete navigation
Screen reader: NVDA/JAWS test
```

---

#### Task 9: Documentation (2h)

**Documents:**
- `docs/I18N_GUIDE.md`
- `docs/ACCESSIBILITY_GUIDE.md`
- `docs/TRANSLATION_GUIDE.md`

---

## 🔧 Technical Guidelines

### i18n Best Practices
- Always use translation keys
- Never concatenate translations
- Use interpolation for variables
- Respect pluralization rules
- Test with pseudo-locale

### Accessibility Best Practices
- Semantic HTML first
- ARIA as enhancement, not replacement
- Test with keyboard only
- Test with screen reader
- Maintain focus management

---

## 🚨 Common Pitfalls

### ❌ Don't
- Hardcode strings
- Forget ARIA labels
- Skip keyboard testing
- Rely on color alone
- Use generic link text ("click here")

### ✅ Do
- Use translation keys everywhere
- Add descriptive ARIA labels
- Test keyboard navigation
- Provide text alternatives
- Use descriptive link text

---

## 🎯 Final Checklist

### i18n ✅
- [ ] 5 languages working
- [ ] All strings translated
- [ ] Locale formatting correct
- [ ] RTL layout functional

### Accessibility ✅
- [ ] axe DevTools: 0 critical
- [ ] Keyboard navigable
- [ ] Screen reader tested
- [ ] Lighthouse >95

### Quality ✅
- [ ] 211+ tests passing
- [ ] Mobile responsive
- [ ] Documentation complete

---

## 🚀 Let's Begin!

**First Task:** Task 1 - i18n Setup

1. Install react-i18next
2. Create config
3. Set up file structure
4. Test with sample translation

**Remember:** Accessibility is not optional!

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 8 - i18n & Accessibility
