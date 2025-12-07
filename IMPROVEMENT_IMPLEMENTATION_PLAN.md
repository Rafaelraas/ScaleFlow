# Improvement Implementation Plan - Sprint 1 (Quick Wins)

## Overview

This document provides detailed, actionable steps to implement the Priority 1 improvements from the Codebase Improvements document. These are high-impact, low-effort improvements that can be completed in approximately 6 hours.

---

## 🎯 Sprint 1 Goals

1. ✅ Remove console statements → Centralized logging utility
2. ✅ Fix ESLint warnings
3. ✅ Add pre-commit hooks with Husky + lint-staged
4. ✅ Centralize environment configuration

**Total Estimated Effort:** 6 hours  
**Expected Impact:** Cleaner codebase, better developer experience

---

## Task 1: Centralized Logging Utility

### Objective
Replace all console.log/error/warn/info statements with a centralized logging utility that:
- Only logs in development mode
- Can be easily integrated with monitoring services (Sentry, LogRocket) in production
- Provides consistent logging patterns

### Steps

#### 1.1 Create Logger Utility
**File:** `src/utils/logger.ts`

```typescript
/**
 * Centralized logging utility for ScaleFlow
 * 
 * In development: logs to console
 * In production: can be configured to send to monitoring service
 */

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isTest = import.meta.env.MODE === 'test';

  /**
   * Log error messages
   * In production, these should be sent to error tracking service
   */
  error(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, context || '');
    } else if (!this.isTest) {
      // Production error tracking integration examples:
      
      // Option 1: Sentry
      // import * as Sentry from '@sentry/react';
      // Sentry.captureException(new Error(message), { 
      //   extra: context,
      //   level: 'error'
      // });
      
      // Option 2: LogRocket
      // import LogRocket from 'logrocket';
      // LogRocket.captureException(new Error(message), {
      //   tags: context
      // });
      
      // Option 3: Datadog
      // import { datadogLogs } from '@datadog/browser-logs';
      // datadogLogs.logger.error(message, context);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    // Warnings typically don't need to be sent to monitoring in production
  }

  /**
   * Log info messages
   * Useful for debugging flows in development
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }
}

export const logger = new Logger();
```

#### 1.2 Update Files with Console Statements

Replace console statements in the following files:

**Files to update:**
1. `src/services/supabase/error-handler.ts`
2. `src/pages/NotFound.tsx`
3. `src/pages/CreateCompany.tsx`
4. `src/pages/SwapRequests.tsx`
5. `src/components/CompanySettingsForm.tsx`
6. `src/components/ProfileForm.tsx`
7. `src/components/ShiftTemplateForm.tsx`
8. `src/components/ErrorBoundary.tsx`
9. `src/components/InviteEmployeeForm.tsx`
10. `src/components/layout/Navbar.tsx`
11. `src/components/EditEmployeeForm.tsx`
12. `src/components/UpdatePasswordForm.tsx`
13. `src/integrations/supabase/client.ts`
14. `src/providers/SessionContextProvider.tsx`

**Example transformation:**
```typescript
// Before
console.error("Error updating profile:", errorMessage);

// After
import { logger } from '@/utils/logger';
logger.error("Error updating profile:", { error: errorMessage });
```

#### 1.3 Add Tests for Logger
**File:** `src/utils/logger.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log errors in development mode', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    logger.error('Test error', { detail: 'test' });
    
    if (import.meta.env.DEV) {
      expect(consoleSpy).toHaveBeenCalled();
    }
  });

  it('should log warnings in development mode', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    logger.warn('Test warning');
    
    if (import.meta.env.DEV) {
      expect(consoleSpy).toHaveBeenCalled();
    }
  });

  it('should log info in development mode', () => {
    const consoleSpy = vi.spyOn(console, 'info');
    logger.info('Test info');
    
    if (import.meta.env.DEV) {
      expect(consoleSpy).toHaveBeenCalled();
    }
  });
});
```

**Verification:**
```bash
npm run test -- logger.test.ts
npm run build  # Ensure no console statements in production build
```

---

## Task 2: Fix ESLint Warnings

### Objective
Eliminate the 7 ESLint warnings related to Fast Refresh by extracting the `useSession` hook export from `SessionContextProvider.tsx`.

### Current Warning
```
SessionContextProvider.tsx: Fast refresh only works when a file only exports components
```

### Steps

#### 2.1 Create Separate Hook File
**File:** `src/hooks/useSession.ts`

```typescript
import { useContext } from 'react';
import { SessionContext } from '@/providers/SessionContextProvider';

/**
 * Hook to access session context
 * 
 * @returns Session context containing user session, profile, role, and methods
 * @throws Error if used outside SessionProvider
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
```

#### 2.2 Update SessionContextProvider.tsx
Remove the `useSession` export and only export the provider and context:

```typescript
// Remove this line:
export const useSession = () => { ... };

// Keep only:
export { SessionProvider, SessionContext };
```

#### 2.3 Update All Import Statements

**Files to update (search for "useSession"):**
```bash
grep -r "useSession" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

**Update imports from:**
```typescript
import { useSession } from '@/providers/SessionContextProvider';
```

**To:**
```typescript
import { useSession } from '@/hooks/useSession';
```

**Files likely to update:**
- All page components (Dashboard, Schedules, Employees, etc.)
- Layout components (Navbar, Sidebar)
- ProtectedRoute component
- Form components that check user role

#### 2.4 Update Index Exports
**File:** `src/hooks/index.ts` (create if doesn't exist)

```typescript
export { useSession } from './useSession';
export { useIsMobile } from './use-mobile';
// ... other hooks
```

#### 2.5 Note on shadcn/ui Warnings
The remaining 6 warnings are from shadcn/ui components and are standard for that library. They should be left as-is since:
- They follow shadcn/ui patterns
- Modifying them breaks the component library structure
- They don't impact functionality

**Verification:**
```bash
npm run lint  # Should show 6 warnings instead of 7
npm run test  # All tests should pass
```

---

## Task 3: Add Pre-commit Hooks

### Objective
Prevent code quality issues from being committed by adding automated checks before each commit.

### Steps

#### 3.1 Install Dependencies
```bash
npm install --save-dev husky lint-staged prettier
```

#### 3.2 Initialize Husky
```bash
npx husky install
npm pkg set scripts.prepare="husky install"
```

#### 3.3 Create Pre-commit Hook
```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

**File:** `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

#### 3.4 Configure lint-staged
**File:** `package.json` (add this section)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

#### 3.5 Create Prettier Configuration
**File:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### 3.6 Create Prettier Ignore
**File:** `.prettierignore`

```
node_modules
dist
dist-ssr
.next
.vercel
build
coverage
*.min.js
*.min.css
package-lock.json
pnpm-lock.yaml
```

#### 3.7 Add Prettier Script to package.json
```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md,css}\""
  }
}
```

**Verification:**
```bash
# Test the hook by making a commit
echo "// test" >> src/test.ts
git add src/test.ts
git commit -m "test: pre-commit hook"
# Should automatically run linting and formatting
```

---

## Task 4: Centralize Environment Configuration

### Objective
Create a type-safe, centralized configuration for environment variables with validation.

### Steps

#### 4.1 Create Configuration File
**File:** `src/config/env.ts`

```typescript
/**
 * Centralized environment configuration for ScaleFlow
 * 
 * This module provides type-safe access to environment variables
 * and validates required variables at startup.
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface AppConfig {
  env: 'development' | 'production' | 'test';
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
}

interface AppConfiguration {
  supabase: SupabaseConfig;
  app: AppConfig;
}

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required variables
const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
    'Please check your .env file and ensure all required variables are set.'
  );
}

/**
 * Application configuration object
 * Provides type-safe access to all environment variables
 */
export const config: AppConfiguration = {
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  },
  app: {
    env: import.meta.env.MODE as AppConfiguration['app']['env'],
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    isTest: import.meta.env.MODE === 'test',
  },
};

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = () => config.app.isDev;

/**
 * Helper function to check if we're in production mode
 */
export const isProduction = () => config.app.isProd;

/**
 * Helper function to check if we're in test mode
 */
export const isTest = () => config.app.isTest;
```

#### 4.2 Update Supabase Client
**File:** `src/integrations/supabase/client.ts`

```typescript
// Before
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set...');
}

// After
import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

#### 4.3 Update Logger to Use Config
**File:** `src/utils/logger.ts`

```typescript
import { config } from '@/config/env';

class Logger {
  private isDevelopment = config.app.isDev;
  private isTest = config.app.isTest;
  // ... rest of implementation
}
```

#### 4.4 Add Tests for Config
**File:** `src/config/env.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { config, isDevelopment, isProduction, isTest } from './env';

describe('Environment Configuration', () => {
  it('should load configuration without errors', () => {
    expect(config).toBeDefined();
    expect(config.supabase).toBeDefined();
    expect(config.app).toBeDefined();
  });

  it('should have valid supabase configuration', () => {
    expect(config.supabase.url).toBeTruthy();
    expect(config.supabase.anonKey).toBeTruthy();
  });

  it('should have valid app configuration', () => {
    expect(['development', 'production', 'test']).toContain(config.app.env);
    expect(typeof config.app.isDev).toBe('boolean');
    expect(typeof config.app.isProd).toBe('boolean');
    expect(typeof config.app.isTest).toBe('boolean');
  });

  it('should provide helper functions', () => {
    expect(typeof isDevelopment()).toBe('boolean');
    expect(typeof isProduction()).toBe('boolean');
    expect(typeof isTest()).toBe('boolean');
  });
});
```

**Verification:**
```bash
npm run test -- env.test.ts
npm run build  # Should validate env vars at build time
```

---

## Checklist for Sprint 1 Completion

### Task 1: Centralized Logging ✅
- [ ] Create `src/utils/logger.ts`
- [ ] Add tests in `src/utils/logger.test.ts`
- [ ] Update all 14 files with console statements
- [ ] Run tests to verify
- [ ] Build and verify no console statements in production

### Task 2: Fix ESLint Warnings ✅
- [ ] Create `src/hooks/useSession.ts`
- [ ] Update `SessionContextProvider.tsx` to remove hook export
- [ ] Update all import statements across codebase
- [ ] Run lint and verify 6 warnings (down from 7)
- [ ] Run all tests to verify functionality

### Task 3: Pre-commit Hooks ✅
- [ ] Install husky, lint-staged, prettier
- [ ] Initialize husky
- [ ] Create pre-commit hook
- [ ] Add lint-staged configuration
- [ ] Create prettier configuration
- [ ] Test with a dummy commit
- [ ] Document in README

### Task 4: Centralize Environment ✅
- [ ] Create `src/config/env.ts`
- [ ] Add tests in `src/config/env.test.ts`
- [ ] Update `src/integrations/supabase/client.ts`
- [ ] Update `src/utils/logger.ts`
- [ ] Run tests to verify
- [ ] Build and test production

---

## Verification Commands

After completing all tasks, run these commands to verify:

```bash
# 1. Linting
npm run lint
# Expected: 6 warnings (shadcn/ui only), 0 errors

# 2. Tests
npm run test
# Expected: All tests pass

# 3. Build
npm run build
# Expected: Successful build, no console warnings

# 4. Format check
npm run format:check
# Expected: All files formatted correctly

# 5. Pre-commit hook test
echo "// test" >> src/test.ts
git add src/test.ts
git commit -m "test: verify pre-commit hooks"
# Expected: Linting and formatting run automatically
git reset HEAD~1  # Undo test commit
rm src/test.ts
```

---

## Expected Results

### Before Sprint 1
- ❌ 27 console statements in code
- ⚠️ 7 ESLint warnings
- ❌ No pre-commit hooks
- ⚠️ Environment vars accessed directly

### After Sprint 1
- ✅ 0 console statements (replaced with logger)
- ✅ 6 ESLint warnings (only shadcn/ui)
- ✅ Pre-commit hooks active
- ✅ Type-safe environment config

---

## Timeline

| Task | Duration | Priority |
|------|----------|----------|
| Task 1: Logging | 2-3 hours | High |
| Task 2: ESLint | 1-2 hours | High |
| Task 3: Pre-commit | 1 hour | Medium |
| Task 4: Environment | 2 hours | Medium |
| **Total** | **6-8 hours** | - |

---

## Next Steps After Sprint 1

Once Sprint 1 is complete, proceed to Sprint 2:
- Implement code splitting & lazy loading
- Add bundle size monitoring
- Fix React test warnings

See `CODEBASE_IMPROVEMENTS_2024_12_07.md` for detailed Sprint 2 plan.

---

**Document Version:** 1.0  
**Date:** December 7, 2024  
**Status:** ✅ Ready for Implementation
