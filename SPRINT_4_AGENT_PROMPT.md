# Sprint 4 Agent Prompt: Developer Experience & Monitoring

## 🎯 Mission Brief

You are an expert developer experience engineer tasked with implementing Sprint 4 improvements for ScaleFlow. Your mission is to add developer tools, feature flags, and monitoring capabilities that will improve development workflow and production observability.

---

## 📋 Context

### What Has Been Done ✅

- **Sprint 1:** Logging, linting, pre-commit hooks, environment config
- **Sprint 2:** Code splitting, lazy loading, 60%+ bundle reduction
- **Sprint 3:** Dependencies updated, error boundaries enhanced
- All 120+ tests passing
- Zero security vulnerabilities

### Current State

- **Developer Tools:** Basic setup, no Storybook
- **Feature Flags:** None - all features always on
- **Monitoring:** No performance or analytics tracking
- **Observability:** Limited visibility into production

### Your Goal

- Implement feature flag system for controlled rollouts
- Add performance monitoring with Web Vitals
- Set up Storybook for component development (optional)
- Add analytics tracking (optional)
- Document all new tools
- Maintain 100% test pass rate

---

## 🚀 Your Tasks (Prioritized)

### Task 1: Implement Feature Flags (4 hours) ⚠️ HIGHEST PRIORITY

**Why this is critical:**
Feature flags enable safe rollouts, A/B testing, and quick rollback without deployments.

**What to do:**

1. **Create feature flag system** (2 hours)

   **File:** `src/lib/feature-flags.ts`

   Features to include:
   - Flag definitions with descriptions
   - Environment-based enabling/disabling
   - Role-based access (employee, manager, system_admin)
   - Rollout percentage (for gradual rollouts)
   - User-based rollout (consistent per user)

   See SPRINT_4_PLAN.md for complete implementation.

2. **Create feature flag hook** (30 min)

   **File:** `src/hooks/useFeatureFlag.ts`

   Hook that checks if flag is enabled for current user.

3. **Create FeatureFlag component** (30 min)

   **File:** `src/components/FeatureFlag.tsx`

   Component for conditional rendering based on flags.

4. **Create admin panel** (1 hour)

   **File:** `src/pages/FeatureFlagAdmin.tsx`

   Admin panel to view all feature flags (system admins only).
   Add route in App.tsx:

   ```typescript
   <Route path="/admin/feature-flags" element={
     <ProtectedRoute allowedRoles={['system_admin']}>
       <Layout><FeatureFlagAdmin /></Layout>
     </ProtectedRoute>
   } />
   ```

**Example flags to add:**

```typescript
FEATURE_FLAGS = {
  CALENDAR_VIEW: 'calendar-view', // Future feature
  NEW_DASHBOARD: 'new-dashboard', // A/B test
  SHIFT_BIDDING: 'shift-bidding', // Beta feature
  IN_APP_MESSAGING: 'in-app-messaging', // Coming soon
  ADVANCED_ANALYTICS: 'advanced-analytics', // Manager only
};
```

**Files to create:**

- `src/lib/feature-flags.ts`
- `src/hooks/useFeatureFlag.ts`
- `src/components/FeatureFlag.tsx`
- `src/pages/FeatureFlagAdmin.tsx`

**Files to modify:**

- `src/App.tsx` - Add admin route

**Verification:**

```bash
npm run test
npm run dev

# Navigate to /admin/feature-flags (as system admin)
# Verify all flags display correctly

# Test in component:
<FeatureFlag flag={FEATURE_FLAGS.CALENDAR_VIEW}>
  <div>New feature!</div>
</FeatureFlag>
```

---

### Task 2: Add Performance Monitoring (3 hours) 🔴 HIGH PRIORITY

**Why this matters:**
Track real-world performance and Core Web Vitals in production.

**What to do:**

1. **Install dependencies** (5 min)

   ```bash
   npm install web-vitals
   npm install @vercel/analytics  # If deploying to Vercel
   ```

2. **Create Web Vitals tracker** (1 hour)

   **File:** `src/lib/web-vitals.ts`

   Track:
   - CLS (Cumulative Layout Shift)
   - FID (First Input Delay)
   - FCP (First Contentful Paint)
   - LCP (Largest Contentful Paint)
   - TTFB (Time to First Byte)

   See SPRINT_4_PLAN.md for implementation.

3. **Create dev performance monitor** (1 hour)

   **File:** `src/components/PerformanceMonitor.tsx`

   Floating panel showing metrics in development mode.

4. **Initialize tracking** (30 min)

   **File:** `src/main.tsx`

   ```typescript
   import { initWebVitals } from '@/lib/web-vitals';
   import { Analytics } from '@vercel/analytics/react';

   initWebVitals();

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <App />
       <Analytics />  {/* If using Vercel */}
     </React.StrictMode>
   );
   ```

5. **Add dev monitor to app** (30 min)

   **File:** `src/App.tsx`

   ```typescript
   import { PerformanceMonitor } from '@/components/PerformanceMonitor';

   function App() {
     return (
       <>
         {/* ... app content */}
         {import.meta.env.DEV && <PerformanceMonitor />}
       </>
     );
   }
   ```

**Files to create:**

- `src/lib/web-vitals.ts`
- `src/components/PerformanceMonitor.tsx`

**Files to modify:**

- `src/main.tsx`
- `src/App.tsx`
- `package.json`

**Verification:**

```bash
npm run dev
# Check bottom-right corner for performance metrics
# Navigate between routes, watch metrics update

npm run build
npm run preview
# Verify metrics are tracked in production build
# Check browser console for metric logs
```

---

### Task 3: Documentation (1 hour) 🔴 HIGH PRIORITY

**What to do:**

1. **Create developer tools guide**

   **File:** `docs/DEVELOPER_TOOLS.md`

   ```markdown
   # Developer Tools & Monitoring

   ## Feature Flags

   ### Using Feature Flags

   [Examples and best practices]

   ### Adding New Flags

   [Step-by-step guide]

   ### Admin Panel

   [How to access and use]

   ## Performance Monitoring

   ### Web Vitals

   [What they mean and how to improve them]

   ### Performance Monitor (Dev)

   [How to use the dev tool]

   ## Analytics

   [If implemented]

   ## Storybook

   [If implemented]
   ```

2. **Create feature flag documentation**

   **File:** `docs/FEATURE_FLAGS.md`

   ```markdown
   # Feature Flags Guide

   ## Available Flags

   [List all flags with descriptions]

   ## Usage Examples

   [Code examples]

   ## Best Practices

   [Guidelines]

   ## Rollout Strategy

   [How to roll out features safely]
   ```

3. **Update main README**
   Add section: "Developer Tools & Monitoring"
   Link to new docs

**Files to create:**

- `docs/DEVELOPER_TOOLS.md`
- `docs/FEATURE_FLAGS.md`

**Files to modify:**

- `README.md`

---

### Task 4: Setup Storybook (5 hours) 🟡 OPTIONAL

**Note:** Only do this if you have time after completing Tasks 1-3.

**What to do:**

1. **Install Storybook** (30 min)

   ```bash
   npx storybook@latest init --type react-vite
   npm install --save-dev @storybook/addon-a11y @storybook/addon-interactions
   ```

2. **Configure Storybook** (1 hour)

   **File:** `.storybook/main.ts` - Add path alias
   **File:** `.storybook/preview.ts` - Add Tailwind, dark mode

3. **Create component stories** (3 hours)

   Priority components:
   - Button (most used UI component)
   - Card
   - Dialog
   - Form components
   - ShiftCard (if exists)

   **File:** `src/components/ui/button.stories.tsx`
   See SPRINT_4_PLAN.md for example.

4. **Add accessibility testing** (30 min)
   Enable a11y addon for all stories

**Files to create:**

- `.storybook/main.ts`
- `.storybook/preview.ts`
- `src/components/ui/*.stories.tsx` (5+ stories)

**Files to modify:**

- `package.json` - Add storybook scripts
- `.gitignore` - Add storybook-static

**Verification:**

```bash
npm run storybook
# Opens at localhost:6006
# Check all stories render
# Test dark mode toggle
# Verify a11y checks
```

---

### Task 5: Add Analytics (2 hours) 🟢 OPTIONAL

**Note:** Only if you have time and analytics are needed.

**What to do:**

1. **Install GA4** (if using Google Analytics)

   ```bash
   npm install react-ga4
   ```

2. **Create analytics utility**

   **File:** `src/lib/analytics.ts`

   Functions:
   - initAnalytics()
   - trackPageView()
   - trackEvent()
   - identifyUser()

3. **Initialize in app**

   **File:** `src/main.tsx`

   ```typescript
   import { initAnalytics } from '@/lib/analytics';
   initAnalytics();
   ```

4. **Track page views**

   **File:** `src/App.tsx`

   ```typescript
   const location = useLocation();

   useEffect(() => {
     trackPageView(location.pathname);
   }, [location]);
   ```

5. **Add event tracking to key actions**
   - Shift created
   - Employee invited
   - Swap request submitted
   - etc.

6. **Update .env.example**
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

**Files to create:**

- `src/lib/analytics.ts`

**Files to modify:**

- `src/main.tsx`
- `src/App.tsx`
- `.env.example`
- Key components (add tracking)

---

## ✅ Success Criteria

### Must Have (Complete These) ✅

- [ ] Feature flags system implemented
- [ ] Feature flag hook and component working
- [ ] Feature flag admin panel accessible
- [ ] Performance monitoring (Web Vitals) active
- [ ] Performance monitor visible in dev mode
- [ ] Documentation created (DEVELOPER_TOOLS.md)
- [ ] All tests passing (120+)
- [ ] Zero new warnings
- [ ] Manual testing completed

### Should Have (If Time Permits) 🎯

- [ ] Storybook set up
- [ ] 5+ component stories created
- [ ] Analytics tracking basic events
- [ ] Feature flags documentation complete

### Nice to Have 💡

- [ ] Storybook deployed
- [ ] A/B test running
- [ ] Analytics dashboard configured

---

## 🧪 Testing & Verification

### After Each Task

```bash
# Tests
npm run test
# Expected: All 120+ tests passing

# Lint
npm run lint
# Expected: 6 warnings (same as before)

# Build
npm run build
# Expected: Successful build

# Dev server
npm run dev
# Manual checks:
# - Feature flags work
# - Performance monitor appears
# - No console errors
```

### Final Sprint Verification

```bash
# Complete test suite
npm run test

# Build
npm run build

# Dev with all features
npm run dev

# Check:
# 1. Feature flag admin panel loads (/admin/feature-flags)
# 2. Performance monitor shows in bottom-right
# 3. Feature flag component works
# 4. useFeatureFlag hook works
# 5. Web Vitals tracked in console

# If Storybook:
npm run storybook
# Verify stories render correctly
```

---

## 📊 Expected Results

### Feature Flags

```typescript
// Before Sprint 4: N/A

// After Sprint 4:
<FeatureFlag flag={FEATURE_FLAGS.NEW_FEATURE}>
  <NewFeature />
</FeatureFlag>

const isEnabled = useFeatureFlag(FEATURE_FLAGS.NEW_FEATURE);
```

### Performance Monitoring

```
Before: No visibility
After: Real-time metrics in dev, production tracking
```

### Developer Experience

```
Before: No component documentation
After: Storybook with component stories (if implemented)
```

---

## 🚨 Important Notes

### Do NOT Modify

- Database migrations
- Authentication logic
- Existing feature logic
- Test logic (except adding tests for new features)

### Must Maintain

- 100% test pass rate
- Zero TypeScript errors
- Zero new ESLint warnings
- Same functionality (new tools are additive)

### Quality Standards

- Add JSDoc comments for all new utilities
- Follow existing code patterns
- Test new features manually
- Document everything clearly

---

## 💡 Pro Tips

### Feature Flags Best Practices

1. **Start simple** - Don't over-engineer
2. **Use descriptive names** - CALENDAR_VIEW, not FEAT_1
3. **Document each flag** - What it does, when to enable
4. **Clean up old flags** - Remove after full rollout
5. **Test both states** - Flag on AND flag off

### Performance Monitoring Tips

1. **Test on slow devices** - Use Chrome DevTools throttling
2. **Watch LCP carefully** - Largest Contentful Paint matters most
3. **Check CLS** - Layout shift hurts UX
4. **Monitor TTFB** - Server response time
5. **Track trends** - One-time metrics are less useful

### Storybook Tips (if implementing)

1. **Start with UI components** - Button, Card, Dialog
2. **Add all variants** - Show all props/states
3. **Enable a11y addon** - Catch accessibility issues
4. **Use args controls** - Interactive prop editing
5. **Add examples** - Show real usage

---

## 📚 Reference Materials

### Documentation

- **Feature Flags**: https://martinfowler.com/articles/feature-toggles.html
- **Web Vitals**: https://web.dev/vitals/
- **Storybook**: https://storybook.js.org/docs/react/get-started/introduction
- **React GA4**: https://github.com/codler/react-ga4

### Code Examples

- See SPRINT_4_PLAN.md for complete implementations
- Check existing code patterns in the codebase

---

## 🔄 Implementation Flow

### Day 1 (8 hours)

1. **Morning:** Task 1 - Feature Flags (4 hours)
   - Create flag system
   - Create hook and component
   - Create admin panel
   - Test thoroughly

2. **Afternoon:** Task 2 - Performance Monitoring (3 hours)
   - Install dependencies
   - Create Web Vitals tracker
   - Create dev monitor
   - Test and verify

3. **End of Day:** Task 3 - Documentation (1 hour)
   - Create developer tools guide
   - Document feature flags
   - Update README

### Day 2 (7 hours) - Optional Tasks

4. **Morning:** Task 4 - Storybook (5 hours) - If time permits
   - Install and configure
   - Create component stories
   - Test all stories

5. **Afternoon:** Task 5 - Analytics (2 hours) - If time permits
   - Set up analytics
   - Add tracking
   - Test events

---

## 📝 Progress Reporting

### Report After Each Task

```markdown
## Sprint 4 Progress

- [x] Task 1: Feature flags system
  - ✅ Flag system implemented
  - ✅ Hook and component created
  - ✅ Admin panel accessible
  - ✅ 8 flags defined
- [x] Task 2: Performance monitoring
  - ✅ Web Vitals tracking active
  - ✅ Dev monitor showing metrics
  - ✅ Vercel Analytics integrated
- [x] Task 3: Documentation
  - ✅ DEVELOPER_TOOLS.md created
  - ✅ FEATURE_FLAGS.md created
  - ✅ README updated
- [ ] Task 4: Storybook (optional)
- [ ] Task 5: Analytics (optional)

### Metrics

- Feature flags: 8 defined
- Web Vitals: 5 metrics tracked
- Documentation: 2 new guides
- Tests: 120+ passing
```

---

## ❓ Need Help?

### If You Get Stuck

1. **Check SPRINT_4_PLAN.md** - Detailed implementations
2. **Read library docs** - web-vitals, react-ga4, storybook
3. **Test incrementally** - Don't implement everything at once
4. **Ask specific questions** - Include error messages

### Common Questions

**Q: How do I test feature flags?**  
A: Toggle the `enabled` value in feature-flags.ts, test both states

**Q: Web Vitals showing poor scores?**  
A: Check Sprint 2 optimizations, ensure code splitting is working

**Q: Storybook not finding components?**  
A: Check path alias in .storybook/main.ts

**Q: Analytics not tracking?**  
A: Verify GA measurement ID is set, check browser console

---

## ✅ Final Checklist

Before marking Sprint 4 complete:

- [ ] Feature flags implemented and tested
- [ ] Feature flag admin panel working
- [ ] Performance monitoring active
- [ ] Dev performance monitor visible
- [ ] Documentation complete
- [ ] All 120+ tests passing
- [ ] Zero new warnings
- [ ] Build successful
- [ ] Manual testing done
- [ ] Code review passed
- [ ] PR created and merged

### Optional Items (if completed):

- [ ] Storybook running
- [ ] 5+ component stories
- [ ] Analytics tracking events
- [ ] Storybook deployed

---

## 🎯 Success Definition

**Sprint 4 is successfully complete when:**

1. ✅ Feature flags system fully functional
2. ✅ Can enable/disable features via flags
3. ✅ Admin panel shows all flags
4. ✅ Performance monitoring tracking Web Vitals
5. ✅ Dev monitor shows metrics in real-time
6. ✅ Documentation complete and clear
7. ✅ All tests passing
8. ✅ Application stable with new tools

**Bonus (optional):**

- Storybook running with component stories
- Analytics tracking user interactions
- A/B test running with feature flags

---

**Ready to start? Begin with Task 1: Feature Flags (highest priority).**

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Estimated Duration:** 8-15 hours (8 for must-haves, +7 for optional)  
**Difficulty:** Medium  
**Impact:** High (Developer Experience + Production Observability)
