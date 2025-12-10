# Sprint 2: Performance Optimization - Implementation Plan

## 🎯 Sprint Overview

**Sprint Goal:** Optimize application performance through code splitting, lazy loading, and bundle size reduction

**Duration:** 1 week (10 hours estimated)  
**Priority:** High 🔴  
**Dependencies:** Sprint 1 completed ✅

**Expected Outcomes:**

- 60%+ reduction in initial bundle size (from 923 KB to <350 KB)
- Faster initial page load
- Improved Time to Interactive (TTI)
- Better Core Web Vitals scores
- Resolved React test warnings

---

## 📋 Sprint Tasks

### Task 1: Implement Route-Based Code Splitting (Priority: HIGH)

**Estimated Time:** 3 hours  
**Impact:** High - Reduces initial bundle by 50-60%

#### Objective

Convert all route imports to lazy-loaded components using React.lazy() and Suspense.

#### Current State

All pages are imported directly in `src/App.tsx`:

```typescript
import Dashboard from '@/pages/Dashboard';
import Schedules from '@/pages/Schedules';
// ... 15+ direct imports
```

#### Target State

```typescript
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Schedules = lazy(() => import('@/pages/Schedules'));
// ... all pages lazy loaded
```

#### Implementation Steps

1. **Update src/App.tsx with lazy imports**

   ```typescript
   import { lazy, Suspense } from 'react';
   import { HashRouter as Router, Routes, Route } from 'react-router-dom';
   import { SessionProvider } from '@/providers/SessionContextProvider';
   import ProtectedRoute from '@/components/ProtectedRoute';
   import { Layout } from '@/components/layout/Layout';
   import { Toaster } from '@/components/ui/sonner';

   // Eager load critical components
   import Index from '@/pages/Index';
   import Login from '@/pages/Login';
   import Register from '@/pages/Register';
   import Verify from '@/pages/Verify';

   // Lazy load all other pages
   const Dashboard = lazy(() => import('@/pages/Dashboard'));
   const Schedules = lazy(() => import('@/pages/Schedules'));
   const ShiftTemplates = lazy(() => import('@/pages/ShiftTemplates'));
   const Employees = lazy(() => import('@/pages/Employees'));
   const EmployeePreferences = lazy(() => import('@/pages/EmployeePreferences'));
   const MySchedule = lazy(() => import('@/pages/MySchedule'));
   const Preferences = lazy(() => import('@/pages/Preferences'));
   const SwapRequests = lazy(() => import('@/pages/SwapRequests'));
   const ProfileSettings = lazy(() => import('@/pages/ProfileSettings'));
   const CompanySettings = lazy(() => import('@/pages/CompanySettings'));
   const CreateCompany = lazy(() => import('@/pages/CreateCompany'));
   const AdminCompanyManagement = lazy(() => import('@/pages/AdminCompanyManagement'));
   const AdminUserManagement = lazy(() => import('@/pages/AdminUserManagement'));
   const NotFound = lazy(() => import('@/pages/NotFound'));
   ```

2. **Create loading fallback component**

   **File:** `src/components/LoadingFallback.tsx`

   ```typescript
   import { Skeleton } from '@/components/ui/skeleton';

   export function LoadingFallback() {
     return (
       <div className="container mx-auto px-4 py-8">
         <div className="space-y-4">
           <Skeleton className="h-8 w-64" />
           <Skeleton className="h-64 w-full" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-32 w-full" />
           </div>
         </div>
       </div>
     );
   }
   ```

3. **Wrap Routes with Suspense**
   ```typescript
   function App() {
     return (
       <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
         <SessionProvider>
           <Suspense fallback={<LoadingFallback />}>
             <Routes>
               {/* Public routes - eagerly loaded */}
               <Route path="/" element={<Index />} />
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/verify" element={<Verify />} />

               {/* Protected routes - lazy loaded */}
               <Route
                 path="/dashboard"
                 element={
                   <ProtectedRoute allowedRoles={['employee', 'manager', 'system_admin']}>
                     <Layout>
                       <Dashboard />
                     </Layout>
                   </ProtectedRoute>
                 }
               />
               {/* ... rest of routes */}
             </Routes>
           </Suspense>
           <Toaster />
         </SessionProvider>
       </Router>
     );
   }
   ```

#### Files to Modify

- `src/App.tsx` - Convert imports to lazy
- Create `src/components/LoadingFallback.tsx` - Loading skeleton

#### Verification Steps

```bash
# 1. Build and check bundle size
npm run build
ls -lh dist/assets/*.js

# Expected: Main chunk should be <300 KB (down from 923 KB)

# 2. Test routing
npm run dev
# Navigate between routes and verify loading states

# 3. Run tests
npm run test
# All tests should pass

# 4. Check Chrome DevTools Network tab
# Open browser DevTools > Network > Disable cache
# Navigate to different routes
# Verify separate chunk files are loaded on demand
```

---

### Task 2: Implement Component-Level Code Splitting (Priority: MEDIUM)

**Estimated Time:** 2 hours  
**Impact:** Medium - Further reduces bundle size by 10-15%

#### Objective

Lazy load heavy components that aren't needed on initial render.

#### Target Components

1. **Chart components** (Recharts is ~100 KB)
2. **Form dialogs** (only loaded when opened)
3. **Heavy UI components** (calendars, rich text editors if added later)

#### Implementation

1. **Lazy load chart components in Dashboard**

   **File:** `src/pages/Dashboard.tsx`

   ```typescript
   import { lazy, Suspense } from 'react';

   // Lazy load Recharts components
   const StatsChart = lazy(() => import('@/components/StatsChart'));

   // In render:
   <Suspense fallback={<Skeleton className="h-64 w-full" />}>
     <StatsChart data={chartData} />
   </Suspense>
   ```

2. **Lazy load dialog forms**

   Example: `src/pages/Schedules.tsx`

   ```typescript
   const ShiftForm = lazy(() => import('@/components/ShiftForm'));

   // In modal:
   <Dialog open={isOpen} onOpenChange={setIsOpen}>
     <DialogContent>
       <Suspense fallback={<LoadingFallback />}>
         <ShiftForm onSubmit={handleSubmit} />
       </Suspense>
     </DialogContent>
   </Dialog>
   ```

#### Files to Modify

- `src/pages/Dashboard.tsx` - Lazy load charts
- `src/pages/Schedules.tsx` - Lazy load ShiftForm
- `src/pages/ShiftTemplates.tsx` - Lazy load ShiftTemplateForm
- `src/pages/Employees.tsx` - Lazy load InviteEmployeeForm, EditEmployeeForm

#### Verification

```bash
npm run build
# Check that separate chunks are created for heavy components
ls -lh dist/assets/*.js | grep -E "Recharts|Form"
```

---

### Task 3: Add Bundle Size Monitoring (Priority: HIGH)

**Estimated Time:** 2 hours  
**Impact:** High - Prevents future bundle size regressions

#### Objective

Add automated bundle size tracking to catch size regressions early.

#### Implementation

1. **Install bundle analysis tools**

   ```bash
   npm install --save-dev rollup-plugin-visualizer vite-plugin-compression
   ```

2. **Update vite.config.ts**

   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react-swc';
   import path from 'path';
   import { visualizer } from 'rollup-plugin-visualizer';
   import viteCompression from 'vite-plugin-compression';

   export default defineConfig({
     plugins: [
       react(),
       viteCompression({
         algorithm: 'gzip',
         ext: '.gz',
       }),
       visualizer({
         filename: './dist/stats.html',
         open: false,
         gzipSize: true,
         brotliSize: true,
       }),
     ],
     // ... rest of config
   });
   ```

3. **Add bundle size check script**

   **File:** `scripts/check-bundle-size.sh`

   ```bash
   #!/bin/bash

   # Build the project
   npm run build

   # Get main bundle size in KB
   MAIN_SIZE=$(ls -l dist/assets/index-*.js | awk '{print $5/1024}')
   MAX_SIZE=350

   echo "Main bundle size: ${MAIN_SIZE} KB"
   echo "Maximum allowed: ${MAX_SIZE} KB"

   if (( $(echo "$MAIN_SIZE > $MAX_SIZE" | bc -l) )); then
     echo "❌ Bundle size exceeded! Main bundle is ${MAIN_SIZE} KB (max: ${MAX_SIZE} KB)"
     exit 1
   else
     echo "✅ Bundle size check passed!"
   fi
   ```

4. **Add npm scripts to package.json**

   ```json
   {
     "scripts": {
       "build:analyze": "npm run build && open dist/stats.html",
       "bundle:check": "bash scripts/check-bundle-size.sh"
     }
   }
   ```

5. **Add GitHub Action for bundle size tracking**

   **File:** `.github/workflows/bundle-size.yml`

   ```yaml
   name: Bundle Size Check

   on:
     pull_request:
       branches: [main]

   jobs:
     check-size:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Build project
           run: npm run build

         - name: Check bundle size
           run: npm run bundle:check

         - name: Upload bundle stats
           uses: actions/upload-artifact@v4
           with:
             name: bundle-stats
             path: dist/stats.html
   ```

#### Files to Create

- `scripts/check-bundle-size.sh` - Bundle size validation
- `.github/workflows/bundle-size.yml` - CI bundle check

#### Files to Modify

- `vite.config.ts` - Add bundle analysis plugins
- `package.json` - Add bundle analysis scripts

#### Verification

```bash
# Run bundle analysis
npm run build:analyze

# Check bundle size
npm run bundle:check

# Expected output:
# Main bundle size: ~280 KB
# Maximum allowed: 350 KB
# ✅ Bundle size check passed!
```

---

### Task 4: Fix React Test Warnings (Priority: MEDIUM)

**Estimated Time:** 2 hours  
**Impact:** Medium - Cleaner test output, better debugging

#### Objective

Fix React `act()` warnings in test output.

#### Current Warnings

```
Warning: An update to ComponentName inside a test was not wrapped in act(...)
```

#### Root Cause

State updates in tests (especially from async operations) need to be wrapped in `act()`.

#### Implementation

1. **Identify affected tests**

   ```bash
   npm run test 2>&1 | grep "act()"
   ```

2. **Common patterns to fix**

   **Pattern 1: Async state updates**

   ```typescript
   // Before
   it('should update state', async () => {
     render(<Component />);
     fireEvent.click(screen.getByRole('button'));
     await waitFor(() => expect(screen.getByText('Updated')).toBeInTheDocument());
   });

   // After
   it('should update state', async () => {
     render(<Component />);
     await act(async () => {
       fireEvent.click(screen.getByRole('button'));
     });
     await waitFor(() => expect(screen.getByText('Updated')).toBeInTheDocument());
   });
   ```

   **Pattern 2: useEffect updates**

   ```typescript
   // Add waitFor to wait for effects to complete
   it('should load data', async () => {
     render(<Component />);
     await waitFor(() => {
       expect(screen.getByText('Data loaded')).toBeInTheDocument();
     });
   });
   ```

   **Pattern 3: Timer-based updates**

   ```typescript
   // Use fake timers
   it('should update after delay', async () => {
     vi.useFakeTimers();
     render(<Component />);

     act(() => {
       vi.advanceTimersByTime(1000);
     });

     expect(screen.getByText('Updated')).toBeInTheDocument();
     vi.useRealTimers();
   });
   ```

3. **Update test files**

   **Files likely affected:**
   - `src/pages/Dashboard.test.tsx` (if exists)
   - `src/pages/Schedules.test.tsx` (if exists)
   - `src/components/*.test.tsx` - Any tests with state updates

#### Verification

```bash
npm run test

# Expected: No more "act()" warnings in test output
```

---

### Task 5: Optimize Asset Loading (Priority: LOW)

**Estimated Time:** 1 hour  
**Impact:** Low - Marginal improvement in load time

#### Objective

Optimize images and fonts for faster loading.

#### Implementation

1. **Add image optimization to Vite config**

   ```typescript
   import { defineConfig } from 'vite';
   import { imagetools } from 'vite-imagetools';

   export default defineConfig({
     plugins: [
       imagetools({
         defaultDirectives: (url) => {
           if (url.searchParams.has('optimize')) {
             return new URLSearchParams({
               format: 'webp',
               quality: '80',
             });
           }
           return new URLSearchParams();
         },
       }),
     ],
   });
   ```

2. **Preload critical fonts (if using custom fonts)**

   **File:** `index.html`

   ```html
   <head>
     <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
   </head>
   ```

3. **Add resource hints**
   ```html
   <head>
     <!-- Preconnect to Supabase -->
     <link rel="preconnect" href="https://ttgntuaffrondfxybxmi.supabase.co" />
     <link rel="dns-prefetch" href="https://ttgntuaffrondfxybxmi.supabase.co" />
   </head>
   ```

#### Files to Modify

- `vite.config.ts` - Add image optimization
- `index.html` - Add resource hints

---

## ✅ Sprint Success Criteria

### Performance Metrics

- [ ] Initial bundle size reduced to <350 KB (target: 280-300 KB)
- [ ] Lazy loading implemented for all routes
- [ ] Separate chunks created for heavy components
- [ ] Bundle size monitoring active in CI/CD

### Code Quality

- [ ] All tests passing (120+ tests)
- [ ] Zero React `act()` warnings
- [ ] Zero new ESLint warnings
- [ ] Build completes without errors

### Developer Experience

- [ ] Bundle analysis available via npm script
- [ ] Bundle size check runs on PRs
- [ ] Loading states added for lazy components
- [ ] Documentation updated

### Verification Commands

```bash
# All must pass
npm run test          # All tests passing
npm run lint          # 6 warnings (same as before)
npm run build         # Successful build
npm run bundle:check  # Bundle size < 350 KB
npm run build:analyze # Visual bundle analysis
```

---

## 🚨 Important Notes

### Do Not Modify

- Database migrations
- Supabase configuration
- Authentication logic
- RLS policies
- Existing test logic (only add `act()` wrappers)

### Coding Standards

- Follow existing React patterns
- Use TypeScript strict mode
- Maintain 100% test pass rate
- Add JSDoc comments for new utilities
- Use existing Loading components/patterns

### Performance Budget

| Metric                 | Before  | Target  | Actual |
| ---------------------- | ------- | ------- | ------ |
| Main bundle            | 923 KB  | <350 KB | TBD    |
| Total assets           | ~2 MB   | <1.5 MB | TBD    |
| Time to Interactive    | Unknown | <3s     | TBD    |
| Lighthouse Performance | Unknown | >90     | TBD    |

---

## 📊 Testing Strategy

### Unit Tests

- Verify lazy loaded components render correctly
- Test Suspense fallback displays
- Ensure loading states work properly

### Integration Tests

- Test navigation between routes
- Verify chunks load on demand
- Check that data persists across route changes

### Performance Tests

```bash
# Use Lighthouse CLI
npm install -g lighthouse
lighthouse http://localhost:5173 --view

# Or use Chrome DevTools
# 1. Open DevTools > Lighthouse
# 2. Generate report
# 3. Check Performance score
```

---

## 🔄 Implementation Flow

### Recommended Order

1. **Task 1: Route-based code splitting** (3 hours)
   - Highest impact
   - Foundation for other optimizations
   - Test thoroughly after completion

2. **Task 3: Bundle size monitoring** (2 hours)
   - Set up tracking before making more changes
   - Ensures we can measure improvements

3. **Task 2: Component-level splitting** (2 hours)
   - Build on Task 1
   - Further optimize bundle

4. **Task 4: Fix test warnings** (2 hours)
   - Clean up test output
   - Important for maintenance

5. **Task 5: Asset optimization** (1 hour)
   - Nice to have
   - Marginal gains

### Time Allocation

- Task 1: 3 hours (30%)
- Task 2: 2 hours (20%)
- Task 3: 2 hours (20%)
- Task 4: 2 hours (20%)
- Task 5: 1 hour (10%)
- **Total: 10 hours**

---

## 📚 Reference Documents

- **Vite Code Splitting:** https://vitejs.dev/guide/features.html#code-splitting
- **React.lazy():** https://react.dev/reference/react/lazy
- **React Suspense:** https://react.dev/reference/react/Suspense
- **Rollup Visualizer:** https://github.com/btd/rollup-plugin-visualizer
- **Web Vitals:** https://web.dev/vitals/

---

## 🎯 Definition of Done

Sprint 2 is complete when:

- [ ] All 5 tasks implemented
- [ ] Bundle size reduced to <350 KB
- [ ] All tests passing (120+)
- [ ] Zero React warnings in tests
- [ ] Bundle size CI check passing
- [ ] Code review passed
- [ ] Documentation updated
- [ ] PR merged to main

---

## 💡 Tips for Success

1. **Test incrementally** - Don't make all changes at once
2. **Measure before and after** - Use bundle analysis
3. **Check Network tab** - Verify chunks load correctly
4. **Use Chrome DevTools** - Performance tab is your friend
5. **Read Vite docs** - Code splitting behavior is well documented

---

## 🔗 Next Steps After Sprint 2

Once Sprint 2 is complete:

1. Measure and document performance improvements
2. Update README with new bundle size
3. Begin Sprint 3 (Dependencies & Stability)

Sprint 3 will focus on:

- Updating dependencies safely
- Improving error boundaries
- Enhanced stability testing

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Status:** ✅ Ready for Implementation  
**Estimated Duration:** 10 hours  
**Expected Bundle Size Reduction:** 60%+ (923 KB → <350 KB)
