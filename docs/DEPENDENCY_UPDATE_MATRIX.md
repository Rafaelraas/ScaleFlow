# Dependency Update Matrix

**Generated:** December 7, 2024  
**Sprint:** Sprint 3 - Dependencies & Stability  
**Total Outdated Packages:** 26

---

## Summary

- **Safe Updates (Patch/Minor):** 11 packages
- **Risky Updates (Major):** 15 packages
- **Blocked Updates:** 8 packages (documented in DEPENDENCY_BLOCKERS.md)
- **Security:** 0 production vulnerabilities ✅
- **Dev Vulnerabilities:** 7 moderate (vitest/vite related)

---

## Safe Updates (Patch/Minor)

These packages can be updated safely with minimal risk.

| Package      | Current | Latest  | Type       | Breaking Changes | Action    | Notes                              |
| ------------ | ------- | ------- | ---------- | ---------------- | --------- | ---------------------------------- |
| lucide-react | 0.462.0 | 0.556.0 | Minor      | None             | ✅ Update | Icon library - backward compatible |
| next-themes  | 0.3.0   | 0.4.6   | Minor      | None             | ✅ Update | Theme switching library            |
| globals      | 15.15.0 | 16.5.0  | Major-Safe | None expected    | ✅ Update | ESLint globals list                |

---

## Moderate Risk Updates

These packages require testing but are likely safe for minor versions.

| Package                   | Current | Latest  | Type  | Risk   | Action    | Notes                      |
| ------------------------- | ------- | ------- | ----- | ------ | --------- | -------------------------- |
| @types/node               | 22.19.1 | 24.10.1 | Major | Low    | ⚠️ Test   | Type definitions only      |
| @vitejs/plugin-react-swc  | 3.11.0  | 4.2.2   | Major | Low    | ⚠️ Test   | Check Vite compatibility   |
| eslint-plugin-react-hooks | 5.2.0   | 7.0.1   | Major | Medium | ⚠️ Test   | May have new rules         |
| tailwind-merge            | 2.6.0   | 3.4.0   | Major | Low    | ⚠️ Test   | Utility function library   |
| vaul                      | 0.9.9   | 1.1.2   | Minor | Low    | ✅ Update | Drawer component           |
| sonner                    | 1.7.4   | 2.0.7   | Major | Low    | ⚠️ Test   | Toast notification library |
| react-resizable-panels    | 2.1.9   | 3.0.6   | Major | Medium | ⚠️ Test   | Check API changes          |

---

## Risky Updates (Major Versions)

These packages have major version changes that require careful evaluation.

### Critical Production Dependencies

| Package          | Current | Latest | Breaking Changes                           | Migration Effort | Action                           |
| ---------------- | ------- | ------ | ------------------------------------------ | ---------------- | -------------------------------- |
| react            | 18.3.1  | 19.2.1 | Multiple - New features, some deprecations | High             | 🔴 Block - Defer to Sprint 5     |
| react-dom        | 18.3.1  | 19.2.1 | Must update with React                     | High             | 🔴 Block - Defer to Sprint 5     |
| @types/react     | 18.3.27 | 19.2.7 | Type changes for React 19                  | High             | 🔴 Block - Wait for React update |
| @types/react-dom | 18.3.7  | 19.2.3 | Type changes for React 19                  | High             | 🔴 Block - Wait for React update |

### UI & Routing

| Package          | Current | Latest | Breaking Changes                | Migration Effort | Action                          |
| ---------------- | ------- | ------ | ------------------------------- | ---------------- | ------------------------------- |
| react-router-dom | 6.30.2  | 7.10.1 | Major API changes, new features | High             | 🔴 Block - Defer to Sprint 5    |
| react-day-picker | 8.10.1  | 9.12.0 | API changes                     | Medium           | 🟡 Evaluate - Consider Sprint 4 |
| recharts         | 2.15.4  | 3.5.1  | API changes                     | Medium           | 🟡 Evaluate - Consider Sprint 4 |

### Form & Validation

| Package             | Current | Latest | Breaking Changes   | Migration Effort | Action                                              |
| ------------------- | ------- | ------ | ------------------ | ---------------- | --------------------------------------------------- |
| @hookform/resolvers | 3.10.0  | 5.2.2  | Major version jump | High             | 🔴 Block - Check compatibility with react-hook-form |
| zod                 | 3.25.76 | 4.1.13 | Schema API changes | High             | 🔴 Block - Breaking schema changes                  |

### Dev Tools

| Package             | Current | Latest | Breaking Changes             | Migration Effort | Action                                  |
| ------------------- | ------- | ------ | ---------------------------- | ---------------- | --------------------------------------- |
| vitest              | 2.1.9   | 4.0.15 | Config changes, API updates  | High             | 🔴 Block - See DEPENDENCY_BLOCKERS.md   |
| @vitest/coverage-v8 | 2.1.9   | 4.0.15 | Must update with vitest      | High             | 🔴 Block - Tied to vitest               |
| @vitest/ui          | 2.1.9   | 4.0.15 | Must update with vitest      | High             | 🔴 Block - Tied to vitest               |
| vite                | 6.4.1   | 7.2.6  | Major version, new features  | High             | 🔴 Block - Evaluate with vitest upgrade |
| tailwindcss         | 3.4.18  | 4.1.17 | Complete rewrite, new config | Very High        | 🔴 Block - Defer to Sprint 6            |

### Date Handling

| Package  | Current | Latest | Breaking Changes | Migration Effort | Action                        |
| -------- | ------- | ------ | ---------------- | ---------------- | ----------------------------- |
| date-fns | 3.6.0   | 4.1.0  | API changes      | Medium           | 🟡 Evaluate - Check changelog |

---

## Blocked Updates

**Note:** See `DEPENDENCY_BLOCKERS.md` for detailed analysis of blocked major updates.

### Critical Blocks

1. **React 18 → 19** - Ecosystem not fully ready
2. **React Router 6 → 7** - Major API overhaul
3. **vitest 2 → 4** - Breaking config changes
4. **Tailwind CSS 3 → 4** - Complete rewrite
5. **Zod 3 → 4** - Breaking schema changes

---

## Implementation Strategy

### Phase 1: Safe Updates (Immediate) ✅

```bash
npm update lucide-react
npm update next-themes
npm update globals
npm update vaul
```

**Risk:** Very Low  
**Testing Required:** Basic smoke tests

---

### Phase 2: Moderate Risk Updates (With Testing) ⚠️

```bash
npm update @types/node
npm update @vitejs/plugin-react-swc
npm update tailwind-merge
```

**Risk:** Low to Medium  
**Testing Required:**

- Full test suite
- Manual testing of key features
- Build verification

---

### Phase 3: Evaluate & Document (Research) 🔍

For each major update:

1. Read changelog
2. Check breaking changes
3. Assess migration effort
4. Document in DEPENDENCY_BLOCKERS.md
5. Schedule for future sprint or block permanently

---

## Security Considerations

### Production Dependencies ✅

```bash
npm audit --production
# Result: 0 vulnerabilities
```

**Status:** ✅ Production is secure

### Development Dependencies ⚠️

```bash
npm audit
# Result: 7 moderate vulnerabilities (esbuild <=0.24.2)
```

**Issue:** esbuild vulnerability in vitest dependencies  
**Impact:** Development server only (not production)  
**Resolution:** Requires vitest 4.0.15 (breaking change)  
**Action:** Document in blockers, address in Sprint 5

---

## Testing Requirements

### After Each Update Batch

1. **Automated Tests**

   ```bash
   npm run test          # All tests must pass
   npm run lint          # Check for new warnings
   npm run build         # Verify build works
   ```

2. **Manual Testing Checklist**
   - [ ] Login/Register flow
   - [ ] Dashboard loads correctly
   - [ ] Create/edit shift functionality
   - [ ] Employee management
   - [ ] Profile settings
   - [ ] Shift swap requests
   - [ ] Error boundaries work

3. **Build Verification**
   ```bash
   npm run build
   npm run preview
   # Test in production mode
   ```

---

## Rollback Plan

If any update causes issues:

```bash
# 1. Identify problematic package from git diff
git diff package.json

# 2. Revert to previous version
npm install package-name@previous-version

# 3. Lock the package
# Add to package.json overrides if needed

# 4. Document the issue
# Add to DEPENDENCY_BLOCKERS.md

# 5. Continue with other updates
```

---

## Post-Update Actions

After completing all safe updates:

1. **Verify State**

   ```bash
   npm outdated
   npm audit --production
   npm run test
   ```

2. **Document Results**
   - Update this matrix with new versions
   - Create `post-update-audit.txt`
   - Document any issues encountered

3. **Update CHANGELOG.md**
   - List all updated packages
   - Note any behavior changes
   - Document testing results

---

## Next Steps

1. ✅ Complete Phase 1 updates (safe packages)
2. ⚠️ Complete Phase 2 updates (with testing)
3. 📝 Document all blocked major updates
4. 🔄 Enhance error boundaries
5. 📊 Create dependency health dashboard

---

## References

- [npm outdated docs](https://docs.npmjs.com/cli/commands/npm-outdated)
- [npm audit docs](https://docs.npmjs.com/cli/commands/npm-audit)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React Router v7 Migration](https://reactrouter.com/en/main/upgrading/v7)
- [Vitest Migration Guide](https://vitest.dev/guide/migration.html)
- [Tailwind CSS v4 Beta](https://tailwindcss.com/blog/tailwindcss-v4-beta)

---

**Document Version:** 1.0  
**Last Updated:** December 7, 2024  
**Status:** ✅ Ready for Implementation
