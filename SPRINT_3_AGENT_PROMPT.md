# Sprint 3 Agent Prompt: Dependencies & Stability

## 🎯 Mission Brief

You are an expert dependency management and stability agent tasked with implementing Sprint 3 improvements for ScaleFlow. Your mission is to safely update dependencies, document upgrade paths, and enhance application stability through improved error handling.

---

## 📋 Context

### What Has Been Done ✅

- **Sprint 1:** Logging, linting, pre-commit hooks, environment config
- **Sprint 2:** Code splitting, lazy loading, bundle size reduced 60%+
- All 120+ tests passing
- Zero production vulnerabilities

### Current State

- **Outdated packages:** 26 packages need updates
- **Security:** Zero production vulnerabilities (dev dependencies have 7 moderate)
- **Error handling:** Basic error boundary exists
- **Dependency tracking:** No automated health monitoring

### Your Goal

- Update all safe dependencies (patch and minor versions)
- Document major version blockers with upgrade plans
- Enhance error boundaries with better UX and error categorization
- Create dependency health monitoring dashboard
- Maintain 100% test pass rate throughout

---

## 🚀 Your Tasks

### Task 1: Dependency Audit & Analysis (2 hours)

**Priority:** CRITICAL ⚠️ (Do this FIRST)

**What to do:**

1. **Run complete dependency audit:**

   ```bash
   cd /home/runner/work/ScaleFlow/ScaleFlow

   # Check outdated packages
   npm outdated > dependency-audit.txt

   # Security audit
   npm audit --production > security-audit-prod.txt
   npm audit > security-audit-all.txt

   # Detailed package info
   npm outdated --long > dependency-details.txt
   ```

2. **Create DEPENDENCY_UPDATE_MATRIX.md:**

   Categorize ALL outdated packages into:
   - **Safe Updates (Patch/Minor)** - Can update immediately
   - **Risky Updates (Major)** - Breaking changes, need evaluation
   - **Blocked Updates** - Can't update yet, needs documentation

   Format:

   ```markdown
   # Dependency Update Matrix

   Generated: [Date]

   ## Summary

   - Total packages: X
   - Outdated: X
   - Safe to update: X
   - Require evaluation: X
   - Blocked: X

   ## Safe Updates

   | Package | Current | Latest | Type  | Action    |
   | ------- | ------- | ------ | ----- | --------- |
   | react   | X.X.X   | X.X.X  | Patch | ✅ Update |

   ## Risky Updates

   | Package | Current | Latest | Breaking Changes | Defer To |
   | ------- | ------- | ------ | ---------------- | -------- |
   | vitest  | 2.x     | 4.x    | API changes      | Sprint 5 |

   ## Blocked Updates

   | Package | Current | Latest | Blocker | Resolution  |
   | ------- | ------- | ------ | ------- | ----------- |
   | example | 1.x     | 2.x    | Reason  | Action plan |
   ```

3. **Analyze each outdated package:**
   - Check changelog on GitHub/npm
   - Identify breaking changes
   - Note migration requirements
   - Assess risk level

**Files to create:**

- `DEPENDENCY_UPDATE_MATRIX.md`
- `dependency-audit.txt`
- `security-audit-prod.txt`
- `security-audit-all.txt`
- `dependency-details.txt`

---

### Task 2: Update Non-Breaking Dependencies (3 hours)

**Priority:** HIGH 🔴

**Strategy: Update in phases, test after each phase**

**Phase 1: Dev Dependencies (1 hour)**

```bash
# Testing tools
npm update @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Build tools
npm update @vitejs/plugin-react-swc vite-tsconfig-paths

# Linting (be careful with ESLint - check for breaking changes)
npm update prettier husky lint-staged

# After updates:
npm run test
npm run lint
npm run build
```

**Phase 2: UI Dependencies (1 hour)**

```bash
# Radix UI components (update one by one if unsure)
npm update @radix-ui/react-dialog
npm update @radix-ui/react-dropdown-menu
npm update @radix-ui/react-label
npm update @radix-ui/react-select
npm update @radix-ui/react-separator
# ... check dependency-audit.txt for complete list

# Icons
npm update lucide-react

# After updates:
npm run test
npm run dev
# Manual test: Check all UI components work
```

**Phase 3: Utilities & Production (1 hour)**

```bash
# Query/State management
npm update @tanstack/react-query

# Forms
npm update react-hook-form zod @hookform/resolvers

# Date handling
npm update date-fns

# Charts (if used)
npm update recharts

# Supabase (⚠️ READ CHANGELOG FIRST!)
# Check https://github.com/supabase/supabase-js/releases
npm update @supabase/supabase-js

# Router (⚠️ Check for breaking changes)
npm update react-router-dom

# After updates:
npm run test
npm run lint
npm run build
npm run dev
# Manual test: Login, navigate, create shift, etc.
```

**Testing Checklist After Each Phase:**

- [ ] All tests pass
- [ ] No new lint warnings
- [ ] Build succeeds
- [ ] Login/register works
- [ ] Dashboard loads
- [ ] Can create/edit shifts
- [ ] Navigation works
- [ ] Forms submit correctly

**If something breaks:**

1. Note which package caused the issue
2. Revert: `npm install package-name@old-version`
3. Add to blockers list
4. Continue with other updates

**Files modified:**

- `package.json`
- `package-lock.json`

---

### Task 3: Document Major Update Blockers (1 hour)

**Priority:** MEDIUM 🟡

**What to do:**

1. **Identify major version updates that can't be done now**
   - Example: vitest 2.x → 4.x (breaking changes)
   - Example: Any package requiring significant refactoring

2. **Research each blocked update:**
   - Read changelog/migration guide
   - Estimate effort required
   - Assess benefits vs. cost
   - Determine when to update

3. **Create DEPENDENCY_BLOCKERS.md:**

   ```markdown
   # Dependency Update Blockers

   Packages that cannot be updated in Sprint 3 due to breaking changes or high migration effort.

   ---

   ## Package Name: version → version

   **Status:** ⚠️ Blocked - Breaking Changes  
   **Priority:** Low/Medium/High  
   **Defer To:** Sprint X

   ### Breaking Changes

   - List specific breaking changes
   - Link to migration guide

   ### Migration Effort

   - Estimated hours: X-X
   - Files affected: X
   - Risk level: Low/Medium/High

   ### Benefits of Updating

   - What we gain from updating

   ### Current Workaround

   - How we're managing with current version

   ### Recommendation

   - When and why to update

   ---

   [Repeat for each blocked package]
   ```

**Files to create:**

- `DEPENDENCY_BLOCKERS.md`

---

### Task 4: Enhance Error Boundaries (3 hours)

**Priority:** HIGH 🔴

**What to do:**

1. **Upgrade ErrorBoundary component** (2 hours)

   **File:** `src/components/ErrorBoundary.tsx`

   Add these features:
   - Error categorization (network, auth, render, unknown)
   - Category-specific error messages
   - Recovery actions (reload, go home, reset)
   - Development vs production behavior
   - Better UI with icons and actions
   - Error logging to console/service

   Use the implementation from SPRINT_3_PLAN.md as reference.

2. **Create RouteErrorBoundary** (30 min)

   **File:** `src/components/RouteErrorBoundary.tsx`

   Specialized error boundary for routes that logs route name with errors.

3. **Test error scenarios** (30 min)

   ```bash
   npm run dev

   # In browser console, test each error type:
   throw new Error('network failed')  # Network error
   throw new Error('unauthorized')    # Auth error
   throw new Error('render failed')   # Render error
   throw new Error('test')            # Unknown error

   # Verify:
   - Correct error category shown
   - Appropriate error message displayed
   - Recovery buttons work
   - In dev: stack trace shown
   - In production: clean error UI
   ```

4. **Update App.tsx to use enhanced error boundary**
   Wrap the entire app with the enhanced ErrorBoundary.

**Files to modify:**

- `src/components/ErrorBoundary.tsx` - Enhance
- Create `src/components/RouteErrorBoundary.tsx`
- `src/App.tsx` - Use enhanced error boundary

**Verification:**

```bash
npm run test
npm run build
npm run preview

# Test in production build
# Throw errors and verify production UI works
```

---

### Task 5: Add Dependency Health Dashboard (1 hour)

**Priority:** LOW 🟢

**What to do:**

1. **Create health check script:**

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
   echo "React: $(npm list react --depth=0 2>/dev/null | grep react@)"
   echo "TypeScript: $(npm list typescript --depth=0 2>/dev/null | grep typescript@)"
   echo "Vite: $(npm list vite --depth=0 2>/dev/null | grep vite@)"
   echo "Supabase: $(npm list @supabase/supabase-js --depth=0 2>/dev/null | grep @supabase)"
   echo ""

   echo "✅ Dependency health check complete!"
   ```

2. **Make script executable:**

   ```bash
   chmod +x scripts/dependency-health.sh
   ```

3. **Add npm scripts:**

   **File:** `package.json`

   ```json
   {
     "scripts": {
       "deps:check": "bash scripts/dependency-health.sh",
       "deps:update": "npm update && npm audit fix && npm run test",
       "deps:audit": "npm outdated && npm audit"
     }
   }
   ```

4. **Test the dashboard:**
   ```bash
   npm run deps:check
   ```

**Files to create:**

- `scripts/dependency-health.sh`

**Files to modify:**

- `package.json`

---

## ✅ Success Criteria

### Must Have ✅

- [ ] All safe (patch/minor) dependencies updated
- [ ] DEPENDENCY_UPDATE_MATRIX.md created and complete
- [ ] DEPENDENCY_BLOCKERS.md created for major updates
- [ ] ErrorBoundary enhanced with categorization
- [ ] All 120+ tests passing
- [ ] Zero new vulnerabilities introduced
- [ ] Build successful
- [ ] Manual testing passed

### Should Have 🎯

- [ ] Dependency health dashboard working
- [ ] Error recovery mechanisms functional
- [ ] Documentation clear and complete
- [ ] Update strategy documented

### Nice to Have 💡

- [ ] RouteErrorBoundary implemented
- [ ] Health check in CI/CD
- [ ] Automatic dependency update PR (Dependabot/Renovate)

---

## 🧪 Testing & Verification

### After Each Dependency Update Phase

```bash
# 1. Tests
npm run test
# Expected: All 120+ tests passing

# 2. Lint
npm run lint
# Expected: 6 warnings (same as before)

# 3. Build
npm run build
# Expected: Successful build

# 4. Run locally
npm run dev
# Manual checklist:
# - Login works
# - Dashboard loads
# - Create shift works
# - Forms submit
# - No console errors
```

### Final Sprint Verification

```bash
# Complete test suite
npm run test

# Lint check
npm run lint

# Build check
npm run build

# Security audit
npm audit --production
# Expected: Zero critical/high vulnerabilities

# Dependency health
npm run deps:check
# Expected: Dashboard displays correctly

# Error boundary test
npm run dev
# Throw test errors and verify UI
```

---

## 📊 Expected Results

### Before Sprint 3

```
Outdated packages: 26
Major versions behind: 4-5
Error boundary: Basic
Dependency tracking: Manual
Production vulnerabilities: 0
```

### After Sprint 3

```
Outdated packages: 0-5 (only blocked majors)
Major versions behind: 0 (with upgrade plan)
Error boundary: Enhanced with categories
Dependency tracking: Automated dashboard
Production vulnerabilities: 0
```

---

## 🚨 Critical Warnings

### Do NOT Update Without Testing

- **Supabase** - May change auth behavior
- **React Router** - May break routing
- **TanStack Query** - May change caching
- **Radix UI** - May change accessibility

### Rollback If Needed

Don't be afraid to revert problematic updates:

```bash
npm install package-name@old-version
```

Document the issue and move on.

### Must Maintain

- [ ] 100% test pass rate
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Zero new security vulnerabilities
- [ ] Same functionality (just updated)

---

## 💡 Pro Tips

### Dependency Update Best Practices

1. **Read changelogs before updating** - Know what's changing
2. **Update one category at a time** - Easier to debug
3. **Test after each batch** - Catch issues early
4. **Check GitHub issues** - Known problems with new versions
5. **Have rollback plan** - Don't panic if something breaks

### Common Pitfalls to Avoid

❌ Updating everything at once (hard to debug)  
❌ Not reading changelogs (miss breaking changes)  
❌ Skipping manual testing (tests don't catch everything)  
❌ Updating Supabase without checking auth changes  
❌ Ignoring peer dependency warnings

### Debugging Tips

1. **Package breaks tests?** Check changelog for breaking changes
2. **Build fails?** Check TypeScript errors, may need type updates
3. **UI looks wrong?** Check Radix UI changelog for style changes
4. **Auth not working?** Revert Supabase and investigate
5. **Router issues?** Check React Router migration guide

---

## 📚 Reference Materials

### Documentation to Read

1. **npm outdated**: https://docs.npmjs.com/cli/commands/npm-outdated
2. **npm audit**: https://docs.npmjs.com/cli/commands/npm-audit
3. **Supabase JS Changelog**: https://github.com/supabase/supabase-js/releases
4. **React Router Upgrading**: https://reactrouter.com/en/main/upgrading/v6
5. **Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

### Check These Before Updating

- Supabase: https://github.com/supabase/supabase-js/releases
- React Router: https://github.com/remix-run/react-router/releases
- TanStack Query: https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5
- Radix UI: https://www.radix-ui.com/docs/primitives/overview/releases

---

## 🔄 Implementation Flow

### Recommended Order

**Day 1 (5 hours):**

1. **Morning:** Task 1 - Audit & Analysis (2 hours)
   - Run all audits
   - Create update matrix
   - Categorize all packages

2. **Afternoon:** Task 2 Phase 1 - Dev Dependencies (1 hour)
   - Update dev dependencies
   - Test thoroughly

3. **Late Afternoon:** Task 2 Phase 2 - UI Dependencies (2 hours)
   - Update UI packages
   - Manual UI testing

**Day 2 (5 hours):** 4. **Morning:** Task 2 Phase 3 - Production (1 hour)

- Update critical packages
- Thorough testing

5. **Mid-Morning:** Task 4 - Error Boundaries (3 hours)
   - Enhance ErrorBoundary
   - Test error scenarios
   - Add RouteErrorBoundary

6. **Afternoon:** Task 3 & 5 - Documentation & Dashboard (1 hour each)
   - Document blockers
   - Create health dashboard

---

## 📝 Progress Reporting

### Report After Each Major Milestone

```markdown
## Sprint 3 Progress

- [x] Task 1: Dependency audit complete
  - 26 outdated packages identified
  - Update matrix created
  - Categorized into safe/risky/blocked
- [x] Task 2: Phase 1 - Dev dependencies updated
  - Updated 8 packages
  - All tests passing
- [ ] Task 2: Phase 2 - UI dependencies
- [ ] Task 2: Phase 3 - Production dependencies
- [ ] Task 3: Major update blockers documented
- [ ] Task 4: Error boundaries enhanced
- [ ] Task 5: Health dashboard created

### Issues Encountered

- [If any packages couldn't be updated, note here]

### Next Steps

- [What's remaining]
```

---

## ❓ Need Help?

### If You Get Stuck

1. **Check the detailed plan**: SPRINT_3_PLAN.md has more context
2. **Read package changelogs**: Most issues are documented
3. **Check GitHub issues**: See if others hit the same problem
4. **Rollback and continue**: Don't let one package block everything

### Common Questions

**Q: A package update broke tests, what do I do?**  
A: Revert to old version, add to blockers list, continue with others

**Q: How do I know if an update is safe?**  
A: Check semantic version (patch/minor usually safe), read changelog

**Q: Should I update major versions?**  
A: Only if you've read migration guide and have time to test thoroughly

**Q: What if Supabase update breaks authentication?**  
A: Immediately revert, document the issue, research the breaking change

---

## ✅ Final Checklist

Before marking Sprint 3 as complete:

- [ ] All safe dependencies updated
- [ ] DEPENDENCY_UPDATE_MATRIX.md complete
- [ ] DEPENDENCY_BLOCKERS.md complete
- [ ] ErrorBoundary enhanced and tested
- [ ] RouteErrorBoundary created
- [ ] Dependency health dashboard working
- [ ] All 120+ tests passing
- [ ] Zero new lint warnings
- [ ] Build successful
- [ ] Manual testing complete (login, create shift, navigate)
- [ ] No new security vulnerabilities
- [ ] Documentation updated
- [ ] Code review passed
- [ ] PR created and merged

---

## 🎯 Success Definition

**Sprint 3 is successfully complete when:**

1. ✅ All safe (patch/minor) dependencies updated
2. ✅ Major version blockers documented with upgrade plans
3. ✅ ErrorBoundary enhanced with error categorization
4. ✅ Error recovery mechanisms working
5. ✅ Dependency health dashboard functional
6. ✅ All tests passing, zero new warnings
7. ✅ Application stable and functioning correctly
8. ✅ Clear documentation for future dependency management

---

**Ready to start? Begin with Task 1: Dependency Audit & Analysis.**

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Estimated Duration:** 10 hours  
**Difficulty:** Medium  
**Risk Level:** Medium (careful testing required)
