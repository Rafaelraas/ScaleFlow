# Sprint 3: Dependencies & Stability - Implementation Plan

## 🎯 Sprint Overview

**Sprint Goal:** Update dependencies safely and improve application stability through enhanced error handling

**Duration:** 1 week (10 hours estimated)  
**Priority:** High 🔴  
**Dependencies:** Sprint 2 completed ✅

**Expected Outcomes:**

- All dependencies up to date (or with clear upgrade path documented)
- Zero outdated major versions for critical packages
- Enhanced error boundaries with better UX
- Improved stability and reliability
- Clear dependency health dashboard

---

## 📋 Sprint Tasks

### Task 1: Dependency Audit & Analysis (Priority: HIGH)

**Estimated Time:** 2 hours  
**Impact:** High - Foundation for safe updates

#### Objective

Analyze all dependencies, categorize updates, and create safe update plan.

#### Current State

```bash
npm outdated
# Shows 26 outdated packages
```

#### Implementation Steps

1. **Run comprehensive audit**

   ```bash
   cd /home/runner/work/ScaleFlow/ScaleFlow

   # Check outdated packages
   npm outdated > dependency-audit.txt

   # Check vulnerabilities
   npm audit --production > security-audit.txt
   npm audit --json > security-audit.json

   # Check for breaking changes
   npm outdated --long
   ```

2. **Categorize dependencies**

   Create classification:
   - **Critical**: React, Vite, TypeScript, Supabase
   - **UI**: Radix UI, shadcn/ui components
   - **Utilities**: TanStack Query, React Hook Form, Zod
   - **Dev Tools**: ESLint, Vitest, Testing Library
   - **Build Tools**: Rollup plugins, Vite plugins

3. **Create dependency update matrix**

   **File:** `DEPENDENCY_UPDATE_MATRIX.md`

   ```markdown
   # Dependency Update Matrix

   ## Safe Updates (Patch/Minor)

   | Package | Current | Latest | Type  | Breaking Changes | Action    |
   | ------- | ------- | ------ | ----- | ---------------- | --------- |
   | react   | 18.3.0  | 18.3.1 | Patch | None             | ✅ Update |
   | vite    | 6.3.0   | 6.3.4  | Patch | None             | ✅ Update |

   ## Risky Updates (Major)

   | Package | Current | Latest | Breaking Changes | Migration Effort | Action               |
   | ------- | ------- | ------ | ---------------- | ---------------- | -------------------- |
   | vitest  | 2.x     | 4.x    | Multiple         | High             | ⚠️ Defer to Sprint 5 |

   ## Blocked Updates

   | Package | Current | Latest | Reason   | Resolution |
   | ------- | ------- | ------ | -------- | ---------- |
   | example | 1.0     | 2.0    | Breaks X | Wait for Y |
   ```

4. **Document update strategy**
   - Patch updates: Update immediately
   - Minor updates: Update with testing
   - Major updates: Evaluate breaking changes
   - Blocked updates: Document blockers

#### Files to Create

- `DEPENDENCY_UPDATE_MATRIX.md` - Update tracking
- `dependency-audit.txt` - Audit results
- `security-audit.txt` - Security findings

#### Verification

```bash
# After creating the matrix, validate analysis
cat DEPENDENCY_UPDATE_MATRIX.md
```

---

### Task 2: Update Non-Breaking Dependencies (Priority: HIGH)

**Estimated Time:** 3 hours  
**Impact:** High - Keeps project current without risk

#### Objective

Safely update all patch and minor version dependencies that don't introduce breaking changes.

#### Strategy

**Phase 1: Update Dev Dependencies**

```bash
# Update testing tools
npm update @testing-library/react
npm update @testing-library/jest-dom
npm update @testing-library/user-event

# Update build tools
npm update @vitejs/plugin-react-swc
npm update vite-tsconfig-paths

# Update linting tools
npm update eslint
npm update @typescript-eslint/eslint-plugin
npm update @typescript-eslint/parser
```

**Phase 2: Update UI Dependencies**

```bash
# Update Radix UI (carefully - check changelogs)
npm update @radix-ui/react-dialog
npm update @radix-ui/react-dropdown-menu
npm update @radix-ui/react-label
# ... other Radix packages

# Update Lucide icons
npm update lucide-react
```

**Phase 3: Update Utilities**

```bash
# Update TanStack Query
npm update @tanstack/react-query

# Update form libraries
npm update react-hook-form
npm update zod
npm update @hookform/resolvers

# Update date handling
npm update date-fns
```

**Phase 4: Update Production Dependencies**

```bash
# Update Supabase (check changelog first!)
npm update @supabase/supabase-js

# Update React Router
npm update react-router-dom
```

#### Testing After Each Phase

```bash
# After each phase, run:
npm run test
npm run lint
npm run build
npm run dev

# Manual testing checklist:
# 1. Login/Register flow
# 2. Dashboard loads
# 3. Create/edit shift
# 4. Employee management
# 5. Profile settings
# 6. Shift swap request
```

#### Rollback Strategy

If an update breaks something:

```bash
# Check what changed
git diff package.json

# Revert specific package
npm install package-name@old-version

# Test again
npm run test
```

#### Files to Modify

- `package.json` - Updated versions
- `package-lock.json` - Auto-updated

#### Verification

```bash
# Final verification
npm run test          # All tests pass
npm run lint          # No new warnings
npm run build         # Successful build
npm audit --production # No new vulnerabilities

# Document updates
npm outdated > post-update-audit.txt
```

---

### Task 3: Document Major Update Blockers (Priority: MEDIUM)

**Estimated Time:** 1 hour  
**Impact:** Medium - Provides roadmap for future updates

#### Objective

Document why certain major updates can't be done now and plan for future.

#### Research Required

For each blocked major update:

1. **What's the breaking change?**
2. **What's the migration effort?**
3. **What's the benefit of updating?**
4. **When should we update?**
5. **What's the workaround?**

#### Document Format

**File:** `DEPENDENCY_BLOCKERS.md`

```markdown
# Dependency Update Blockers

## Vitest 2.x → 4.x

**Status:** ⚠️ Blocked - Breaking Changes  
**Current:** 2.1.8  
**Latest:** 4.0.15  
**Priority:** Medium

### Breaking Changes

1. Changed API for coverage configuration
2. New test file discovery algorithm
3. Updated ESM handling
4. Changed mock implementation

### Migration Effort

- Estimated: 8-12 hours
- Requires: Updating all test configurations
- Risk: Medium (might break some tests)

### Benefits

- Better ESM support
- Improved performance
- Better type safety
- Latest Vite compatibility

### Recommendation

**Defer to Sprint 5 (Week 5)**

- Low priority (dev dependency)
- High effort
- Current version works fine
- Wait for more stable release

### Workaround

Current version is functional, no workaround needed.

---

## Example Major Update 2

[Similar template for other blocked updates]
```

#### Files to Create

- `DEPENDENCY_BLOCKERS.md` - Major update blockers

---

### Task 4: Improve Error Boundaries (Priority: HIGH)

**Estimated Time:** 3 hours  
**Impact:** High - Better user experience during errors

#### Objective

Enhance error boundary implementation with better UX and error reporting.

#### Current State

- Basic error boundary exists in `src/components/ErrorBoundary.tsx`
- Shows generic error message
- No error reporting to external service
- No recovery mechanism

#### Target Improvements

1. **Better Error UI**
2. **Error categorization** (Network, Auth, Render, Unknown)
3. **Recovery actions** (Reload, Go Home, Report)
4. **Development vs Production behavior**
5. **Error logging integration points**

#### Implementation

1. **Enhanced ErrorBoundary component**

   **File:** `src/components/ErrorBoundary.tsx` (update existing)

   ```typescript
   import React, { Component, ReactNode } from 'react';
   import { logger } from '@/utils/logger';
   import { Button } from '@/components/ui/button';
   import { AlertTriangle, Home, RefreshCw, Bug } from 'lucide-react';

   interface Props {
     children: ReactNode;
     fallback?: ReactNode;
     onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
   }

   interface State {
     hasError: boolean;
     error: Error | null;
     errorInfo: React.ErrorInfo | null;
     errorCategory: 'network' | 'auth' | 'render' | 'unknown';
   }

   export class ErrorBoundary extends Component<Props, State> {
     constructor(props: Props) {
       super(props);
       this.state = {
         hasError: false,
         error: null,
         errorInfo: null,
         errorCategory: 'unknown',
       };
     }

     static getDerivedStateFromError(error: Error): Partial<State> {
       // Categorize error
       const errorCategory = ErrorBoundary.categorizeError(error);

       return {
         hasError: true,
         error,
         errorCategory,
       };
     }

     static categorizeError(error: Error): State['errorCategory'] {
       const message = error.message.toLowerCase();

       if (message.includes('network') || message.includes('fetch')) {
         return 'network';
       }
       if (message.includes('auth') || message.includes('unauthorized')) {
         return 'auth';
       }
       if (message.includes('render') || error.name === 'RenderError') {
         return 'render';
       }

       return 'unknown';
     }

     componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
       // Log to console in development
       logger.error('Error boundary caught error:', {
         error: error.message,
         stack: error.stack,
         componentStack: errorInfo.componentStack,
         category: this.state.errorCategory,
       });

       // Call custom error handler if provided
       this.props.onError?.(error, errorInfo);

       // In production, send to error tracking service
       // Example: Sentry.captureException(error, { extra: errorInfo });

       this.setState({
         errorInfo,
       });
     }

     handleReload = () => {
       window.location.reload();
     };

     handleGoHome = () => {
       window.location.href = '/';
     };

     handleReset = () => {
       this.setState({
         hasError: false,
         error: null,
         errorInfo: null,
         errorCategory: 'unknown',
       });
     };

     renderErrorMessage(): { title: string; description: string; action: string } {
       const { errorCategory } = this.state;

       switch (errorCategory) {
         case 'network':
           return {
             title: 'Connection Problem',
             description: 'Unable to connect to the server. Please check your internet connection.',
             action: 'Retry',
           };
         case 'auth':
           return {
             title: 'Authentication Error',
             description: 'Your session may have expired. Please try logging in again.',
             action: 'Go to Login',
           };
         case 'render':
           return {
             title: 'Display Error',
             description: 'Something went wrong while displaying this page.',
             action: 'Go Home',
           };
         default:
           return {
             title: 'Unexpected Error',
             description: 'An unexpected error occurred. We have been notified and are working on it.',
             action: 'Reload Page',
           };
       }
     }

     render() {
       if (this.state.hasError) {
         // Use custom fallback if provided
         if (this.props.fallback) {
           return this.props.fallback;
         }

         const { title, description, action } = this.renderErrorMessage();
         const isDev = import.meta.env.DEV;

         return (
           <div className="min-h-screen flex items-center justify-center bg-background p-4">
             <div className="max-w-md w-full space-y-6 text-center">
               <div className="flex justify-center">
                 <AlertTriangle className="h-16 w-16 text-destructive" />
               </div>

               <div className="space-y-2">
                 <h1 className="text-2xl font-bold">{title}</h1>
                 <p className="text-muted-foreground">{description}</p>
               </div>

               {isDev && this.state.error && (
                 <div className="bg-muted p-4 rounded-lg text-left text-sm">
                   <p className="font-mono text-destructive mb-2">
                     {this.state.error.toString()}
                   </p>
                   {this.state.error.stack && (
                     <pre className="text-xs overflow-auto max-h-40">
                       {this.state.error.stack}
                     </pre>
                   )}
                 </div>
               )}

               <div className="flex flex-col sm:flex-row gap-3 justify-center">
                 <Button onClick={this.handleReload} className="gap-2">
                   <RefreshCw className="h-4 w-4" />
                   {action}
                 </Button>
                 <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                   <Home className="h-4 w-4" />
                   Go Home
                 </Button>
                 {isDev && (
                   <Button onClick={this.handleReset} variant="ghost" className="gap-2">
                     <Bug className="h-4 w-4" />
                     Reset Error
                   </Button>
                 )}
               </div>

               <p className="text-xs text-muted-foreground">
                 If this problem persists, please contact support.
               </p>
             </div>
           </div>
         );
       }

       return this.props.children;
     }
   }
   ```

2. **Add specialized error boundaries**

   **File:** `src/components/RouteErrorBoundary.tsx`

   ```typescript
   import { ErrorBoundary } from './ErrorBoundary';
   import { ReactNode } from 'react';

   interface RouteErrorBoundaryProps {
     children: ReactNode;
     routeName: string;
   }

   export function RouteErrorBoundary({ children, routeName }: RouteErrorBoundaryProps) {
     const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
       // Log route-specific error with context
       console.error(`Error in route: ${routeName}`, {
         error,
         errorInfo,
       });
     };

     return (
       <ErrorBoundary onError={handleError}>
         {children}
       </ErrorBoundary>
     );
   }
   ```

3. **Update App.tsx to use enhanced error boundaries**

   ```typescript
   import { ErrorBoundary } from '@/components/ErrorBoundary';

   function App() {
     return (
       <ErrorBoundary>
         <Router>
           <SessionProvider>
             {/* ... rest of app */}
           </SessionProvider>
         </Router>
       </ErrorBoundary>
     );
   }
   ```

#### Files to Modify

- `src/components/ErrorBoundary.tsx` - Enhance existing
- Create `src/components/RouteErrorBoundary.tsx` - Route-specific errors
- `src/App.tsx` - Wrap with enhanced error boundary

#### Verification

```bash
# Test error boundary by throwing test error
npm run dev

# In browser console:
# throw new Error('Test network error');
# Verify error UI appears correctly

# Test in production build:
npm run build
npm run preview
```

---

### Task 5: Add Dependency Health Dashboard (Priority: LOW)

**Estimated Time:** 1 hour  
**Impact:** Low - Nice to have for maintenance

#### Objective

Create automated dashboard showing dependency health.

#### Implementation

**File:** `scripts/dependency-health.sh`

```bash
#!/bin/bash

echo "======================================"
echo "   ScaleFlow Dependency Health       "
echo "======================================"
echo ""

echo "📦 Outdated Packages:"
npm outdated --long || echo "All packages up to date!"
echo ""

echo "🔒 Security Audit:"
npm audit --production
echo ""

echo "📊 Package Statistics:"
echo "Total dependencies: $(jq '.dependencies | length' package.json)"
echo "Total dev dependencies: $(jq '.devDependencies | length' package.json)"
echo ""

echo "🏷️  Critical Package Versions:"
echo "React: $(npm list react --depth=0 | grep react@)"
echo "TypeScript: $(npm list typescript --depth=0 | grep typescript@)"
echo "Vite: $(npm list vite --depth=0 | grep vite@)"
echo "Supabase: $(npm list @supabase/supabase-js --depth=0 | grep @supabase)"
echo ""

echo "✅ Dependency health check complete!"
```

**Add to package.json:**

```json
{
  "scripts": {
    "deps:check": "bash scripts/dependency-health.sh",
    "deps:update": "npm update && npm audit fix && npm run test"
  }
}
```

#### Files to Create

- `scripts/dependency-health.sh` - Health dashboard script

#### Files to Modify

- `package.json` - Add health check scripts

---

## ✅ Sprint Success Criteria

### Dependency Updates ✅

- [ ] All patch updates applied
- [ ] All safe minor updates applied
- [ ] Major update blockers documented
- [ ] Dependency matrix created
- [ ] Zero new vulnerabilities introduced
- [ ] All dependencies categorized

### Testing & Stability ✅

- [ ] All 120+ tests passing after updates
- [ ] Manual testing completed for key flows
- [ ] Error boundaries enhanced
- [ ] Error categorization working
- [ ] Recovery mechanisms functional

### Documentation ✅

- [ ] DEPENDENCY_UPDATE_MATRIX.md created
- [ ] DEPENDENCY_BLOCKERS.md created
- [ ] Update strategy documented
- [ ] Breaking changes noted
- [ ] Future roadmap clear

### Quality Checks ✅

```bash
npm run test          # All tests pass
npm run lint          # 6 warnings (same)
npm run build         # Successful
npm audit --production # Zero critical/high
npm run deps:check    # Health dashboard works
```

---

## 🚨 Important Notes

### Rollback Plan

If any update causes issues:

1. Identify the problematic package
2. Revert to previous version: `npm install package@old-version`
3. Document the issue
4. Add to blockers list
5. Continue with other updates

### Testing Requirements

After each batch of updates:

- Run full test suite
- Manual testing of critical paths
- Check for console errors/warnings
- Verify build works
- Test in production mode

### Dependencies to Handle Carefully

- **@supabase/supabase-js** - Check for breaking auth changes
- **react-router-dom** - Verify routing still works
- **@tanstack/react-query** - Check caching behavior
- **@radix-ui/** packages - May have accessibility changes

---

## 🔄 Implementation Flow

### Recommended Order

1. **Task 1: Audit (2 hours)**
   - Morning: Complete dependency analysis
   - Create update matrix
   - Categorize all packages

2. **Task 2: Update (3 hours)**
   - Phase 1: Dev dependencies (1 hour)
   - Phase 2: UI dependencies (1 hour)
   - Phase 3: Production dependencies (1 hour)
   - Test thoroughly after each phase

3. **Task 4: Error Boundaries (3 hours)**
   - Enhance ErrorBoundary component
   - Add error categorization
   - Test error scenarios
   - Add recovery mechanisms

4. **Task 3: Document Blockers (1 hour)**
   - Research major updates
   - Document blockers
   - Create roadmap

5. **Task 5: Health Dashboard (1 hour)**
   - Create health check script
   - Add to CI/CD if desired
   - Document usage

### Time Allocation

- Task 1: 2 hours (20%)
- Task 2: 3 hours (30%)
- Task 3: 1 hour (10%)
- Task 4: 3 hours (30%)
- Task 5: 1 hour (10%)
- **Total: 10 hours**

---

## 📚 Reference Documents

- **npm outdated**: https://docs.npmjs.com/cli/commands/npm-outdated
- **npm audit**: https://docs.npmjs.com/cli/commands/npm-audit
- **Supabase Changelog**: https://supabase.com/changelog
- **React Router Migration**: https://reactrouter.com/en/main/upgrading/v6
- **Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

---

## 🎯 Definition of Done

Sprint 3 is complete when:

- [ ] All safe dependencies updated
- [ ] Dependency matrix documented
- [ ] Major blockers documented
- [ ] Error boundaries enhanced
- [ ] All tests passing (120+)
- [ ] Zero new vulnerabilities
- [ ] Health dashboard working
- [ ] Code review passed
- [ ] Documentation updated
- [ ] PR merged to main

---

## 💡 Tips for Success

1. **Update incrementally** - Don't update everything at once
2. **Test after each batch** - Catch issues early
3. **Document everything** - Future you will thank you
4. **Read changelogs** - Know what's changing before updating
5. **Have rollback plan** - Be ready to revert if needed

---

## 🔗 Next Steps After Sprint 3

Once Sprint 3 is complete:

1. Document final dependency state
2. Update README with latest versions
3. Begin Sprint 4 (Developer Experience & Monitoring)

Sprint 4 will focus on:

- Adding Storybook (optional)
- Implementing feature flags
- Adding performance monitoring

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Status:** ✅ Ready for Implementation  
**Estimated Duration:** 10 hours  
**Risk Level:** Medium (careful testing required)
