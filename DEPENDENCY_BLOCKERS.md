# Dependency Update Blockers

**Generated:** December 7, 2024  
**Sprint:** Sprint 3 - Dependencies & Stability  
**Purpose:** Document major version updates that are blocked and why

---

## Summary

This document tracks major dependency updates that cannot be performed immediately due to breaking changes, ecosystem compatibility, or high migration effort. Each blocked update includes:

- Current state and target version
- Detailed breaking changes
- Migration effort estimate
- Benefits of updating
- Recommended timeline
- Temporary workarounds

---

## 🔴 Critical Blockers

### React 18.3.1 → 19.2.1

**Status:** 🔴 BLOCKED - Ecosystem Not Ready  
**Current:** 18.3.1  
**Latest:** 19.2.1  
**Priority:** High (but deferred)  
**Estimated Migration:** 16-24 hours

#### Breaking Changes

1. **New JSX Transform Required**
   - React 19 requires updated JSX transform
   - May need TypeScript config updates

2. **Deprecated APIs Removed**
   - `ReactDOM.render()` fully removed (we use `createRoot`)
   - Some legacy context APIs removed
   - PropTypes support dropped

3. **Server Components Support**
   - New server/client component model
   - May affect routing and data fetching

4. **Concurrent Features**
   - Enhanced concurrent rendering
   - May expose existing race conditions

#### Migration Effort

- **Code Changes:** Medium (mostly TypeScript types)
- **Testing:** High (thorough testing needed)
- **Dependencies:** High (must wait for ecosystem)
- **Risk:** High (core framework)

#### Dependencies That Must Update First

- `react-dom` (18.3.1 → 19.2.1)
- `@types/react` (18.3.27 → 19.2.7)
- `@types/react-dom` (18.3.7 → 19.2.3)
- Verify all React-based libraries are compatible

#### Benefits of Updating

- ✅ Better performance with automatic batching
- ✅ Improved server-side rendering
- ✅ New concurrent features
- ✅ Better TypeScript support
- ✅ Forward compatibility

#### Recommendation

**Defer to Sprint 6-7 (Q1 2025)**

**Reasoning:**

- React 19 is still relatively new
- Ecosystem libraries need time to update
- Current React 18.3.1 is stable and secure
- No critical features needed from React 19 yet

#### Migration Checklist (When Ready)

- [ ] Audit all React-based dependencies for React 19 compatibility
- [ ] Update TypeScript configuration
- [ ] Update all `@types/react*` packages simultaneously
- [ ] Test all components thoroughly
- [ ] Check for console warnings/errors
- [ ] Update error boundaries for new error handling
- [ ] Test Suspense and lazy loading
- [ ] Verify routing still works correctly

#### Workaround

None needed - React 18.3.1 is production-ready and fully supported.

---

### React Router 6.30.2 → 7.10.1

**Status:** 🔴 BLOCKED - Major API Changes  
**Current:** 6.30.2  
**Latest:** 7.10.1  
**Priority:** Medium  
**Estimated Migration:** 12-16 hours

#### Breaking Changes

1. **New Route Configuration**
   - Different route definition syntax
   - Data loading API changes
   - New file-based routing options

2. **Loader/Action API Updates**
   - Enhanced data fetching patterns
   - Different error handling
   - New defer/await patterns

3. **Component API Changes**
   - Some hooks deprecated or changed
   - New component APIs

4. **TypeScript Changes**
   - Updated type definitions
   - Better type inference

#### Migration Effort

- **Code Changes:** High (routing is core to app)
- **Testing:** Very High (affects all pages)
- **Dependencies:** Medium
- **Risk:** High (affects entire navigation)

#### Impact Assessment

**Files Affected:** ~30+ files

- `src/App.tsx` - Main routing configuration
- All page components using routing hooks
- `ProtectedRoute` wrapper component
- Navigation components (Sidebar, Navbar)

#### Benefits of Updating

- ✅ Better data loading patterns
- ✅ Improved error handling
- ✅ Better TypeScript support
- ✅ Performance improvements
- ✅ New features (deferred data, etc.)

#### Recommendation

**Defer to Sprint 5-6 (Weeks 5-6)**

**Reasoning:**

- Major refactoring required
- High risk of breaking navigation
- Current v6 is stable and feature-complete
- Need to ensure React 19 compatibility first

#### Migration Plan (When Ready)

1. **Phase 1: Research** (2 hours)
   - Read v7 migration guide
   - Identify all breaking changes affecting our code
   - Create detailed migration checklist

2. **Phase 2: Update Route Config** (4 hours)
   - Update `src/App.tsx` routing
   - Migrate to new route syntax
   - Update ProtectedRoute wrapper

3. **Phase 3: Update Components** (6 hours)
   - Update all components using routing hooks
   - Migrate data loading patterns
   - Update navigation components

4. **Phase 4: Testing** (4 hours)
   - Test all routes
   - Test protected routes
   - Test navigation
   - Update tests

#### Workaround

None needed - React Router v6 is stable and fully functional.

---

### vitest 2.1.9 → 4.0.15

**Status:** 🔴 BLOCKED - Breaking Changes + Security  
**Current:** 2.1.9  
**Latest:** 4.0.15  
**Priority:** Medium (dev dependency)  
**Estimated Migration:** 8-12 hours

#### Breaking Changes

1. **Configuration API Changes**
   - New config file structure
   - Coverage configuration updated
   - Different plugin system

2. **Test Discovery Algorithm**
   - New file matching patterns
   - May need to update test file names
   - Different test organization options

3. **ESM Handling**
   - Improved ESM support
   - May affect module mocking
   - Different import resolution

4. **Mock Implementation**
   - Updated mocking API
   - Different spy/mock utilities
   - May need to update existing mocks

#### Related Updates Required

- `@vitest/coverage-v8` (2.1.9 → 4.0.15)
- `@vitest/ui` (2.1.9 → 4.0.15)
- Possibly `vite` (6.4.1 → 7.2.6)

#### Security Consideration

⚠️ **Current Version Has Moderate Vulnerability**

```
esbuild <=0.24.2
Severity: moderate
esbuild enables any website to send any requests to
the development server and read the response
```

**Impact:** Development server only (not production)  
**Mitigation:** Don't run dev server on public networks

#### Migration Effort

- **Code Changes:** Medium (config + some tests)
- **Testing:** High (all tests need verification)
- **Dependencies:** Low
- **Risk:** Medium (dev-only, doesn't affect production)

#### Benefits of Updating

- ✅ Better ESM support
- ✅ Improved performance
- ✅ Better type safety
- ✅ Latest Vite compatibility
- ✅ Security fix for esbuild vulnerability
- ✅ New testing features

#### Recommendation

**Defer to Sprint 5 (Week 5)**

**Reasoning:**

- Dev dependency (doesn't affect production)
- Current version works fine
- Security issue only affects dev server
- Should coordinate with Vite upgrade
- Time-consuming migration

#### Migration Checklist (When Ready)

- [ ] Read vitest 4.0 migration guide
- [ ] Update vitest configuration
- [ ] Update coverage configuration
- [ ] Test all test files
- [ ] Update any custom test utilities
- [ ] Update CI/CD test workflows
- [ ] Verify coverage reports work
- [ ] Update vitest UI if used

#### Temporary Workaround

**Security:** Don't run `npm run dev` on public networks or untrusted environments.

**Functionality:** Current version is fully functional for all testing needs.

---

### Tailwind CSS 3.4.18 → 4.1.17

**Status:** 🔴 BLOCKED - Complete Rewrite  
**Current:** 3.4.18  
**Latest:** 4.1.17  
**Priority:** Low  
**Estimated Migration:** 24-40 hours

#### Breaking Changes

1. **New Configuration System**
   - Complete config file rewrite
   - New CSS-based configuration
   - Different plugin system

2. **CSS Layer Changes**
   - New layer structure
   - Different cascade rules
   - May affect custom CSS

3. **Color System Overhaul**
   - New color palette system
   - Different color naming
   - May need to update all colors

4. **Build System Changes**
   - New compiler
   - Different build process
   - May affect Vite integration

#### Migration Effort

- **Code Changes:** Very High (every component)
- **Testing:** Very High (visual regression)
- **Dependencies:** Medium (Vite plugins)
- **Risk:** Very High (affects entire UI)

#### Impact Assessment

**Files Affected:** 100+ files (all components with Tailwind classes)

#### Benefits of Updating

- ✅ Better performance
- ✅ Smaller CSS bundle
- ✅ New features
- ✅ Modern CSS features
- ✅ Better DX

#### Recommendation

**Defer to Sprint 6+ (Q1 2025 or later)**

**Reasoning:**

- Massive breaking changes
- Affects every single component
- High risk of visual regressions
- Current v3 is stable and performant
- v4 is still in beta/early release
- Should be a dedicated sprint

#### Migration Plan (When Ready)

Would require dedicated 2-3 day effort:

1. Setup v4 in parallel
2. Migrate components one by one
3. Visual regression testing
4. Performance testing
5. Update all documentation

#### Workaround

None needed - Tailwind CSS v3.4 is stable and fully featured.

---

### Zod 3.25.76 → 4.1.13

**Status:** 🔴 BLOCKED - Breaking Schema Changes  
**Current:** 3.25.76  
**Latest:** 4.1.13  
**Priority:** Medium  
**Estimated Migration:** 8-12 hours

#### Breaking Changes

1. **Schema API Changes**
   - Different schema definition syntax
   - Changed validation methods
   - New error handling

2. **Type Inference Changes**
   - Updated TypeScript inference
   - May affect type definitions
   - Different utility types

3. **Validation Behavior**
   - Some validators have different defaults
   - Changed error messages
   - New validation options

#### Migration Effort

- **Code Changes:** Medium (all form schemas)
- **Testing:** High (all forms need testing)
- **Dependencies:** Low
- **Risk:** Medium (affects forms and validation)

#### Impact Assessment

**Files Affected:** 15-20 files (all forms and validation)

- All form schemas
- API validation
- Type definitions

#### Benefits of Updating

- ✅ Better type inference
- ✅ Improved performance
- ✅ New validation features
- ✅ Better error messages
- ✅ Smaller bundle size

#### Recommendation

**Defer to Sprint 5 (Week 5)**

**Reasoning:**

- Breaking changes in validation
- Need to test all forms
- Current version works perfectly
- Should coordinate with react-hook-form compatibility

#### Migration Checklist (When Ready)

- [ ] Read Zod v4 migration guide
- [ ] Update all form schemas
- [ ] Update validation utilities
- [ ] Test all forms
- [ ] Update error handling
- [ ] Test API validation
- [ ] Update TypeScript types

#### Workaround

None needed - Zod v3 is stable and feature-complete.

---

## 🟡 Moderate Priority Blockers

### date-fns 3.6.0 → 4.1.0

**Status:** 🟡 EVALUATE - API Changes  
**Current:** 3.6.0  
**Latest:** 4.1.0  
**Priority:** Low  
**Estimated Migration:** 4-6 hours

#### Changes

- Some function signature changes
- Updated timezone handling
- New features

#### Recommendation

**Evaluate in Sprint 4**

Read changelog and determine if changes affect our usage patterns.

---

### @hookform/resolvers 3.10.0 → 5.2.2

**Status:** 🟡 EVALUATE - Major Jump  
**Current:** 3.10.0  
**Latest:** 5.2.2  
**Priority:** Low  
**Estimated Migration:** 2-4 hours

#### Changes

- Skipped version 4 - research needed
- May have resolver API changes
- Coordinate with react-hook-form and Zod updates

#### Recommendation

**Evaluate in Sprint 5**

Research breaking changes and coordinate with form library updates.

---

## Update Timeline

### Sprint 3 (Current - Week 3) ✅

- ✅ Safe minor/patch updates only
- ✅ Document all blockers (this document)
- ✅ No major version updates

### Sprint 4 (Week 4)

- 🟡 Evaluate date-fns migration
- 🟡 Evaluate recharts migration
- 🟡 Evaluate react-day-picker migration

### Sprint 5 (Week 5)

- 🔴 Consider vitest 2 → 4 migration
- 🔴 Consider Zod 3 → 4 migration
- 🟡 Consider vite 6 → 7 migration
- 🟡 Evaluate @hookform/resolvers

### Sprint 6-7 (Weeks 6-7)

- 🔴 Consider React 18 → 19 migration
- 🔴 Consider React Router 6 → 7 migration

### Sprint 8+ (Q1 2025+)

- 🔴 Consider Tailwind CSS 3 → 4 migration (dedicated sprint)

---

## Monitoring Strategy

### Monthly Checks

1. Check for security updates
2. Review React ecosystem readiness
3. Monitor community feedback on major versions
4. Update this document with new findings

### Quarterly Reviews

1. Re-evaluate all blockers
2. Update migration timelines
3. Test major updates in separate branch
4. Update effort estimates

---

## References

- [React 19 Changelog](https://react.dev/blog/2024/04/25/react-19)
- [React Router v7 Release](https://reactrouter.com/en/main/upgrading/v7)
- [Vitest v4 Migration](https://vitest.dev/guide/migration.html)
- [Tailwind CSS v4 Beta](https://tailwindcss.com/blog/tailwindcss-v4-beta)
- [Zod v4 Release Notes](https://github.com/colinhacks/zod/releases)

---

**Document Version:** 1.0  
**Last Updated:** December 7, 2024  
**Next Review:** January 7, 2025  
**Status:** ✅ Complete
