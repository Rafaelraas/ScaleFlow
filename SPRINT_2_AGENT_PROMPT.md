# Sprint 2 Agent Prompt: Performance Optimization

## 🎯 Mission Brief

You are an expert performance optimization agent tasked with implementing Sprint 2 improvements for ScaleFlow. Your mission is to reduce the application's bundle size by 60%+ and optimize loading performance through code splitting and lazy loading.

---

## 📋 Context

### What Has Been Done (Sprint 1) ✅

- Centralized logging utility implemented
- ESLint warnings fixed (useSession hook extracted)
- Pre-commit hooks with Husky + lint-staged + Prettier
- Centralized environment configuration
- All 120+ tests passing

### Current State

- **Bundle Size:** 923 KB (uncompressed main chunk)
- **Loading Strategy:** All pages eager loaded
- **Code Splitting:** None implemented
- **Test Warnings:** Some React `act()` warnings present

### Your Goal

- **Target Bundle Size:** <350 KB (60%+ reduction)
- **Strategy:** Implement route-based and component-level code splitting
- **Quality:** Maintain 100% test pass rate, zero new warnings

---

## 🚀 Your Tasks

### Task 1: Implement Route-Based Code Splitting (3 hours)

**Priority:** CRITICAL ⚠️

Convert all route imports in `src/App.tsx` to lazy-loaded components.

**What to do:**

1. **Import lazy and Suspense from React**

   ```typescript
   import { lazy, Suspense } from 'react';
   ```

2. **Keep these pages EAGERLY loaded** (critical for initial render):
   - Index (landing page)
   - Login
   - Register
   - Verify

3. **Convert these to LAZY loaded** (everything else):
   - Dashboard
   - Schedules
   - ShiftTemplates
   - Employees
   - EmployeePreferences
   - MySchedule
   - Preferences
   - SwapRequests
   - ProfileSettings
   - CompanySettings
   - CreateCompany
   - AdminCompanyManagement
   - AdminUserManagement
   - NotFound

4. **Create LoadingFallback component**
   - Path: `src/components/LoadingFallback.tsx`
   - Use Skeleton components for loading state
   - Should match the general layout of pages

5. **Wrap all Routes in Suspense**
   - Use LoadingFallback as fallback

**Files to modify:**

- `src/App.tsx` - Main routing file
- Create: `src/components/LoadingFallback.tsx`

**Verification:**

```bash
npm run build
ls -lh dist/assets/*.js
# Main chunk should be significantly smaller
# Multiple chunk files should be present
```

---

### Task 2: Implement Component-Level Code Splitting (2 hours)

**Priority:** HIGH 🔴

Lazy load heavy components that aren't needed immediately.

**Target components:**

1. **Chart components** (Recharts is ~100 KB):
   - In Dashboard.tsx, lazy load any chart components
   - Wrap with Suspense and Skeleton fallback

2. **Dialog forms** (only needed when dialog opens):
   - ShiftForm in Schedules.tsx
   - ShiftTemplateForm in ShiftTemplates.tsx
   - InviteEmployeeForm in Employees.tsx
   - EditEmployeeForm in Employees.tsx

**Pattern to follow:**

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// In render:
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <Suspense fallback={<LoadingFallback />}>
      <HeavyComponent {...props} />
    </Suspense>
  </DialogContent>
</Dialog>
```

**Files to modify:**

- `src/pages/Dashboard.tsx`
- `src/pages/Schedules.tsx`
- `src/pages/ShiftTemplates.tsx`
- `src/pages/Employees.tsx`

---

### Task 3: Add Bundle Size Monitoring (2 hours)

**Priority:** HIGH 🔴

Set up automated bundle size tracking to prevent regressions.

**What to do:**

1. **Install dependencies:**

   ```bash
   npm install --save-dev rollup-plugin-visualizer vite-plugin-compression
   ```

2. **Update vite.config.ts:**
   - Add visualizer plugin for bundle analysis
   - Add compression plugin for gzip stats
   - Configure to generate stats.html

3. **Create bundle size check script:**
   - Path: `scripts/check-bundle-size.sh`
   - Should fail if main bundle >350 KB
   - Print clear success/failure message

4. **Add npm scripts:**

   ```json
   "build:analyze": "npm run build && open dist/stats.html",
   "bundle:check": "bash scripts/check-bundle-size.sh"
   ```

5. **Create GitHub Action:**
   - Path: `.github/workflows/bundle-size.yml`
   - Run on PRs to main branch
   - Fail if bundle exceeds 350 KB
   - Upload stats.html as artifact

**Files to create:**

- `scripts/check-bundle-size.sh`
- `.github/workflows/bundle-size.yml`

**Files to modify:**

- `vite.config.ts`
- `package.json`

**Verification:**

```bash
npm run build:analyze
npm run bundle:check
```

---

### Task 4: Fix React Test Warnings (2 hours)

**Priority:** MEDIUM 🟡

Clean up React `act()` warnings in test output.

**What to do:**

1. **Find affected tests:**

   ```bash
   npm run test 2>&1 | grep "act()"
   ```

2. **Apply fixes based on warning type:**

   **For async state updates:**
   - Wrap state-changing actions in `act()`
   - Use `waitFor()` for async assertions

   **For useEffect updates:**
   - Use `waitFor()` to wait for effects
   - Add appropriate timeout if needed

   **For timer-based updates:**
   - Use `vi.useFakeTimers()`
   - Advance timers with `act(() => vi.advanceTimersByTime())`
   - Restore with `vi.useRealTimers()`

3. **Test each fix:**
   - Run individual test file
   - Verify warning is gone
   - Ensure test still passes

**Files to modify:**

- Any test files with `act()` warnings
- Likely: component tests with async operations

**Verification:**

```bash
npm run test
# Should show zero "act()" warnings
```

---

### Task 5: Optimize Asset Loading (1 hour)

**Priority:** LOW 🟢

Optional optimizations for marginal improvements.

**What to do:**

1. **Add resource hints to index.html:**
   - Preconnect to Supabase domain
   - DNS prefetch for external resources

2. **Optimize images (if any custom images):**
   - Convert to WebP
   - Add appropriate caching headers

**Files to modify:**

- `index.html`
- `vite.config.ts` (optional image optimization)

---

## ✅ Success Criteria

### Must Have ✅

- [ ] Main bundle size <350 KB (currently 923 KB)
- [ ] All routes lazy loaded (except Index, Login, Register, Verify)
- [ ] LoadingFallback component created and working
- [ ] All 120+ tests passing
- [ ] Zero new ESLint warnings
- [ ] Bundle size monitoring CI/CD active

### Should Have 🎯

- [ ] Heavy components lazy loaded (forms, charts)
- [ ] React act() warnings resolved
- [ ] Bundle analysis script working
- [ ] Visual bundle report generated

### Nice to Have 💡

- [ ] Resource hints added to index.html
- [ ] Image optimization configured
- [ ] Compression enabled

---

## 🧪 Testing & Verification

### After Each Task

```bash
# 1. Run tests
npm run test
# Expected: All 120+ tests passing

# 2. Check lint
npm run lint
# Expected: 6 warnings (same as before)

# 3. Build
npm run build
# Expected: Successful build with smaller chunks

# 4. Manual test
npm run dev
# Navigate between routes
# Verify loading states appear briefly
# Check Chrome DevTools Network tab for lazy chunks
```

### Final Verification

```bash
# Bundle size check
npm run bundle:check
# Expected: ✅ Bundle size check passed!

# Bundle analysis
npm run build:analyze
# Expected: Opens stats.html showing bundle breakdown

# Performance check
# Open Chrome DevTools
# Run Lighthouse audit
# Expected: Performance score >85 (improved from before)
```

---

## 📊 Expected Results

### Before Sprint 2

```
Main bundle: 923 KB
Chunks: 1
Loading: All eager
Test warnings: Several act() warnings
```

### After Sprint 2

```
Main bundle: ~280-300 KB (70% reduction)
Chunks: 15+ separate files
Loading: Lazy on demand
Test warnings: Zero act() warnings
```

### Bundle Analysis Expected

- Main chunk: ~280 KB (App shell, routing, context)
- Vendor chunk: ~150 KB (React, React Router, etc.)
- Page chunks: ~20-50 KB each (loaded on demand)
- Component chunks: ~10-30 KB each (loaded when needed)

---

## 🚨 Important Constraints

### Do NOT Modify

- Database migrations
- Supabase configuration
- Authentication logic (except for lazy loading)
- Existing component logic (only wrap with lazy/Suspense)
- Test assertions (only add act() wrappers)

### Must Maintain

- 100% test pass rate
- Zero TypeScript errors
- Zero ESLint errors
- Same functionality as before (just faster)
- All existing features working

### Quality Standards

- Add JSDoc comments for new components
- Follow existing code style
- Use TypeScript strict mode
- Add loading states for all lazy components
- Test loading states manually

---

## 💡 Pro Tips

### Code Splitting Best Practices

1. **Lazy load at route boundaries** - Easiest and highest impact
2. **Don't lazy load above-the-fold content** - Keep critical UI eager
3. **Use named exports carefully** - Lazy loading works better with default exports
4. **Test with throttled network** - Chrome DevTools > Network > Slow 3G
5. **Monitor chunk sizes** - No chunk should be >200 KB

### Common Pitfalls to Avoid

❌ Lazy loading components used immediately (defeats the purpose)  
❌ Too many tiny chunks (network overhead)  
❌ No loading fallback (poor UX)  
❌ Forgetting to wrap in Suspense (will crash)  
❌ Breaking test mocks by changing imports

### Debugging Tips

1. **Chunk not loading?** Check browser console for errors
2. **Loading state not showing?** Network might be too fast (throttle it)
3. **Tests failing?** Make sure test imports match lazy imports
4. **Bundle still large?** Run `npm run build:analyze` to investigate

---

## 📚 Reference Materials

### Documentation to Read

1. **React Lazy & Suspense**: https://react.dev/reference/react/lazy
2. **Vite Code Splitting**: https://vitejs.dev/guide/features.html#code-splitting
3. **Rollup Visualizer**: https://github.com/btd/rollup-plugin-visualizer

### Existing Code Patterns

- **Loading states**: See existing Skeleton usage in pages
- **Error boundaries**: Already implemented in ErrorBoundary.tsx
- **Lazy loading pattern**: Follow React docs example

### Similar Projects

Look at how other Vite + React projects implement code splitting:

- Check React Router examples
- Review Vite templates
- See shadcn/ui app examples

---

## 🔄 Implementation Flow

### Recommended Order

**Day 1 (5 hours):**

1. Morning: Task 1 - Route-based splitting (3 hours)
   - Set up lazy imports
   - Create LoadingFallback
   - Test thoroughly
2. Afternoon: Task 3 - Bundle monitoring (2 hours)
   - Set up visualization
   - Create size check script
   - Add CI/CD workflow

**Day 2 (5 hours):** 3. Morning: Task 2 - Component-level splitting (2 hours)

- Lazy load heavy components
- Add Suspense boundaries

4. Mid-day: Task 4 - Fix test warnings (2 hours)
   - Identify and fix act() warnings
5. Afternoon: Task 5 - Asset optimization (1 hour)
   - Add resource hints
   - Final polish

---

## 📝 Progress Reporting

### Report After Each Task

Use the **report_progress** tool after completing each task:

```markdown
- [x] Task 1: Route-based code splitting
  - Lazy loaded 10+ routes
  - Created LoadingFallback component
  - Main bundle reduced to 350 KB
- [ ] Task 2: Component-level splitting
- [ ] Task 3: Bundle size monitoring
- [ ] Task 4: Fix test warnings
- [ ] Task 5: Asset optimization
```

### Final Summary

When complete, provide metrics:

- Bundle size before/after
- Number of chunks created
- Test results
- Performance scores (if measured)
- Any issues encountered

---

## 🎓 What You'll Learn

By completing this sprint, you'll gain expertise in:

- React code splitting and lazy loading
- Vite build optimization
- Bundle size analysis and monitoring
- React Suspense and error boundaries
- Performance testing and measurement
- CI/CD for performance budgets

---

## ❓ Need Help?

### If You Get Stuck

1. **Check the detailed plan**: SPRINT_2_PLAN.md has more details
2. **Review React docs**: Official React.lazy() documentation
3. **Test incrementally**: Don't make all changes at once
4. **Ask specific questions**: Include error messages and code snippets

### Common Questions

**Q: How do I know which components to lazy load?**  
A: Start with routes, then target components >50 KB (check bundle analysis)

**Q: What if lazy loading breaks something?**  
A: Revert that specific change, keep the rest, file an issue

**Q: How much performance improvement should I expect?**  
A: 60%+ bundle reduction, 2-3x faster initial load

**Q: What if tests fail after adding lazy loading?**  
A: Ensure test imports match the new lazy imports, check Suspense wrappers

---

## ✅ Final Checklist

Before marking Sprint 2 as complete:

- [ ] All 5 tasks implemented
- [ ] Main bundle <350 KB verified
- [ ] All 120+ tests passing
- [ ] Zero act() warnings in tests
- [ ] Bundle size CI check active
- [ ] Manual testing completed (navigate all routes)
- [ ] Loading states look good (UX check)
- [ ] Bundle analysis shows improvement
- [ ] Documentation updated (README bundle size)
- [ ] Code review passed
- [ ] PR created and merged

---

## 🎯 Success Definition

**Sprint 2 is successfully complete when:**

1. ✅ Bundle size reduced by 60%+ (923 KB → <350 KB)
2. ✅ All routes lazy loaded with proper Suspense
3. ✅ Heavy components split into separate chunks
4. ✅ Bundle size monitoring active in CI/CD
5. ✅ All tests passing with zero warnings
6. ✅ Application functions identically (just faster)
7. ✅ Performance metrics improved (measured with Lighthouse)

---

**Ready to start? Begin with Task 1: Route-based code splitting.**

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Estimated Duration:** 10 hours  
**Difficulty:** Medium  
**Impact:** Very High 🚀
