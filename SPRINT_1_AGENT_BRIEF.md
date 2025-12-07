# Sprint 1 Implementation Agent Brief

## Overview

This document provides a complete brief for an implementation agent to execute Sprint 1 improvements for the ScaleFlow codebase. Sprint 1 focuses on "Quick Wins" - high-impact, low-effort improvements that will significantly improve code quality and developer experience.

---

## 🎯 Mission

Implement Sprint 1 improvements from `IMPROVEMENT_IMPLEMENTATION_PLAN.md`:

1. **Centralized Logging** - Replace console statements with a logging utility
2. **Fix ESLint Warnings** - Extract useSession hook to separate file
3. **Pre-commit Hooks** - Add Husky + lint-staged + Prettier
4. **Environment Configuration** - Centralize environment variable access

**Total Estimated Time:** 6-8 hours  
**Expected Impact:** Cleaner codebase, zero ESLint warnings, automated quality checks

---

## 📋 Prerequisites

### Knowledge Required
- TypeScript/React expertise
- Understanding of Vite build system
- Familiarity with ESLint, Prettier, Husky
- Experience with import/export refactoring

### Repository Context
- **Tech Stack:** React 18 + TypeScript 5.5 + Vite 6 + TanStack Query
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint 9.9
- **Current State:** 120 tests passing, 0 ESLint errors, 7 warnings
- **Package Manager:** npm

### Key Files to Understand
1. `src/providers/SessionContextProvider.tsx` - Auth/session management
2. `src/integrations/supabase/client.ts` - Supabase client setup
3. `.github/copilot-instructions.md` - Development guidelines
4. `IMPROVEMENT_IMPLEMENTATION_PLAN.md` - Detailed implementation steps

---

## 🚀 Task Breakdown

### Task 1: Centralized Logging Utility (Priority: HIGH)

#### What to Do
Replace all 27 console.log/error/warn/info statements with a centralized logger that:
- Only logs in development mode
- Can be integrated with monitoring services
- Provides consistent logging patterns

#### Files to Create
1. `src/utils/logger.ts` - Logger implementation
2. `src/utils/logger.test.ts` - Logger tests

#### Files to Modify (27 console statements total)
1. `src/services/supabase/error-handler.ts` - 1 console.error
2. `src/pages/NotFound.tsx` - 1 console.error
3. `src/pages/CreateCompany.tsx` - 1 console.error
4. `src/pages/SwapRequests.tsx` - 2 console.error
5. `src/components/CompanySettingsForm.tsx` - 1 console.error
6. `src/components/ProfileForm.tsx` - 1 console.error
7. `src/components/ShiftTemplateForm.tsx` - 1 console.error
8. `src/components/ErrorBoundary.tsx` - 1 console.error
9. `src/components/InviteEmployeeForm.tsx` - 1 console.error
10. `src/components/layout/Navbar.tsx` - 3 console.error
11. `src/components/EditEmployeeForm.tsx` - 1 console.error
12. `src/components/UpdatePasswordForm.tsx` - 1 console.error
13. `src/integrations/supabase/client.ts` - 1 console.warn
14. `src/providers/SessionContextProvider.tsx` - 6 console statements (info, error)

#### Pattern to Follow
```typescript
// Before
console.error("Error updating profile:", errorMessage);

// After
import { logger } from '@/utils/logger';
logger.error("Error updating profile:", { error: errorMessage });
```

#### Verification Steps
```bash
npm run test -- logger.test.ts
npm run build
# Check dist/assets/index-*.js for console statements
grep -r "console\." dist/
```

---

### Task 2: Fix ESLint Warnings (Priority: HIGH)

#### What to Do
Extract the `useSession` hook from `SessionContextProvider.tsx` to a separate file to eliminate the Fast Refresh warning.

**Current Warning:**
```
SessionContextProvider.tsx: Fast refresh only works when a file only exports components
```

#### Files to Create
1. `src/hooks/useSession.ts` - Extracted hook

#### Files to Modify
1. `src/providers/SessionContextProvider.tsx` - Remove useSession export
2. All files importing useSession (~15-20 files)

#### Pattern to Follow
```typescript
// New file: src/hooks/useSession.ts
import { useContext } from 'react';
import { SessionContext } from '@/providers/SessionContextProvider';

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
```

**Update imports from:**
```typescript
import { useSession } from '@/providers/SessionContextProvider';
```

**To:**
```typescript
import { useSession } from '@/hooks/useSession';
```

#### Files Likely to Update
Find them with:
```bash
grep -r "useSession" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "test"
```

Expected files:
- All page components (Dashboard, Schedules, Employees, MySchedule, etc.)
- Layout components (Navbar, Sidebar)
- ProtectedRoute
- Various form components

#### Verification Steps
```bash
npm run lint  # Should show 6 warnings (down from 7)
npm run test  # All 120 tests should pass
```

---

### Task 3: Pre-commit Hooks (Priority: MEDIUM)

#### What to Do
Add automated code quality checks before each commit using Husky, lint-staged, and Prettier.

#### Files to Create
1. `.husky/pre-commit` - Pre-commit hook script
2. `.prettierrc` - Prettier configuration
3. `.prettierignore` - Prettier ignore patterns

#### Files to Modify
1. `package.json` - Add lint-staged config and scripts

#### Installation Steps
```bash
npm install --save-dev husky lint-staged prettier
npx husky install
npm pkg set scripts.prepare="husky install"
npx husky add .husky/pre-commit "npx lint-staged"
```

#### Configuration to Add

**package.json:**
```json
{
  "scripts": {
    "prepare": "husky install",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md,css}\""
  },
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

**.prettierrc:**
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

**.prettierignore:**
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

#### Verification Steps
```bash
# Test the hook
echo "// test" >> src/test.ts
git add src/test.ts
git commit -m "test: pre-commit hook"
# Should auto-lint and format
git reset HEAD~1
rm src/test.ts
```

---

### Task 4: Centralize Environment Configuration (Priority: MEDIUM)

#### What to Do
Create a type-safe, centralized configuration module for environment variables with validation.

#### Files to Create
1. `src/config/env.ts` - Environment configuration
2. `src/config/env.test.ts` - Configuration tests

#### Files to Modify
1. `src/integrations/supabase/client.ts` - Use config instead of direct env access
2. `src/utils/logger.ts` - Use config for environment checks

#### Implementation

**src/config/env.ts:**
```typescript
interface AppConfiguration {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    env: 'development' | 'production' | 'test';
    isDev: boolean;
    isProd: boolean;
    isTest: boolean;
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required variables
const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

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
```

#### Verification Steps
```bash
npm run test -- env.test.ts
npm run build
```

---

## ✅ Success Criteria

### After Sprint 1 Completion

1. **Logging**
   - [ ] Zero console statements in src/ (excluding tests)
   - [ ] Logger utility created with tests
   - [ ] All 27 locations updated
   - [ ] Tests pass

2. **ESLint**
   - [ ] ESLint warnings reduced from 7 to 6
   - [ ] useSession hook in separate file
   - [ ] All imports updated
   - [ ] Tests pass

3. **Pre-commit Hooks**
   - [ ] Husky installed and configured
   - [ ] Pre-commit hook runs successfully
   - [ ] Prettier configuration in place
   - [ ] Test commit works

4. **Environment Config**
   - [ ] Config module created
   - [ ] Supabase client updated
   - [ ] Logger updated
   - [ ] Tests pass

### Quality Checks

Run these commands to verify:
```bash
# All should pass
npm run lint         # 6 warnings, 0 errors
npm run test         # 120+ tests passing
npm run build        # Successful build
npm run format:check # All files formatted
```

---

## 🚨 Important Constraints

### Do Not Modify
1. **shadcn/ui components** in `src/components/ui/` - These have acceptable Fast Refresh warnings
2. **Test files** - Only modify if imports need updating
3. **Database migrations** - Not part of Sprint 1
4. **GitHub workflows** - Not part of Sprint 1

### Coding Standards
- Follow existing TypeScript patterns
- Use path aliases (@/components, @/utils, etc.)
- Add JSDoc comments for public functions
- Follow existing test patterns
- Maintain 100% test pass rate

### Git Practices
- Make focused commits per task
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Test after each major change
- Report progress frequently

---

## 📚 Reference Documents

1. **IMPROVEMENT_IMPLEMENTATION_PLAN.md** - Detailed implementation steps
2. **CODEBASE_IMPROVEMENTS_2024_12_07.md** - Full improvement recommendations
3. **.github/copilot-instructions.md** - Repository coding guidelines
4. **README.md** - Project overview and tech stack

---

## 🔄 Implementation Flow

### Recommended Order

1. **Start with Task 4** (Environment Config)
   - Sets foundation for other tasks
   - Low risk, easy to test

2. **Then Task 1** (Centralized Logging)
   - Uses config from Task 4
   - Touches many files, but straightforward

3. **Then Task 2** (Fix ESLint)
   - Requires careful import updates
   - Test frequently

4. **Finally Task 3** (Pre-commit Hooks)
   - Last so it doesn't interfere with development
   - Will format all existing code

### Time Allocation
- Task 4: 1.5 hours
- Task 1: 2.5 hours
- Task 2: 1.5 hours
- Task 3: 1 hour
- Testing/Documentation: 1 hour
- **Total: 7.5 hours**

---

## 🎯 Definition of Done

Sprint 1 is complete when:
- [ ] All 4 tasks implemented
- [ ] All tests passing (120+)
- [ ] ESLint shows 6 warnings (down from 7)
- [ ] Build succeeds without warnings
- [ ] Pre-commit hook working
- [ ] Code review passes
- [ ] Documentation updated
- [ ] PR created and ready for review

---

## 💡 Tips for Success

1. **Test Early and Often** - Run tests after each file change
2. **Use Find/Replace Carefully** - Especially for import updates
3. **Check Git Diff** - Review changes before committing
4. **Run Full Build** - Verify production build after major changes
5. **Ask for Help** - If stuck, refer to detailed implementation plan
6. **Document Decisions** - Note any deviations from plan

---

## 🔗 Next Steps After Sprint 1

Once Sprint 1 is complete:
1. Create PR with detailed description
2. Run code review
3. Get approval
4. Merge to main
5. Begin Sprint 2 (Performance optimizations)

Sprint 2 will focus on:
- Code splitting & lazy loading
- Bundle size monitoring
- Fixing React test warnings

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Status:** ✅ Ready for Agent  
**Estimated Duration:** 7.5 hours
