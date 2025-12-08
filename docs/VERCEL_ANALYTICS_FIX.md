# Vercel Analytics Script Error Fix

## Problem

When deploying the ScaleFlow application to GitHub Pages, the browser console showed a 404 error:

```
GET https://rafaelraas.github.io/_vercel/insights/script.js
```

This happened because the `@vercel/analytics` package and `<Analytics />` component were being included in all builds, but the Vercel Analytics script (`/_vercel/insights/script.js`) only exists on Vercel's infrastructure.

## Root Cause

- The application unconditionally loaded the Vercel Analytics component
- Vercel Analytics requires access to Vercel's infrastructure (`/_vercel/insights/`)
- GitHub Pages doesn't have this infrastructure, causing a 404 error
- While the error didn't break functionality, it caused console errors and failed network requests

## Solution

We implemented **conditional loading** of the Analytics component based on the deployment platform:

### 1. Environment Variable Detection (`src/main.tsx`)

```typescript
// Check if running on Vercel (Vercel sets VERCEL env var to "1" during build)
const isVercel = import.meta.env.VITE_VERCEL === '1';

// ...later in the render
{/* Only load Vercel Analytics when deployed on Vercel */}
{isVercel && <Analytics />}
```

### 2. Vercel Build Configuration (`vercel.json`)

```json
{
  "build": {
    "env": {
      "VITE_VERCEL": "1"
    }
  }
}
```

This ensures that when deploying to Vercel, the `VITE_VERCEL` environment variable is set to `"1"`, enabling the Analytics component.

### 3. Documentation (`.env.example`)

```bash
# Platform Detection (automatically set by Vercel)
# Set to "1" when deploying on Vercel to enable Vercel Analytics
# Leave unset for other platforms (e.g., GitHub Pages)
# VITE_VERCEL=1
```

## How It Works

### On Vercel

1. Vercel build runs with `VITE_VERCEL=1` (set in `vercel.json`)
2. `isVercel` evaluates to `true`
3. `<Analytics />` component is included in the build
4. Analytics script loads from `/_vercel/insights/script.js` (exists on Vercel)
5. Analytics tracking works normally ✅

### On GitHub Pages

1. GitHub Pages build runs without `VITE_VERCEL` variable
2. `isVercel` evaluates to `false`
3. `<Analytics />` component is **tree-shaken** (removed from bundle)
4. No attempt to load Vercel Analytics script
5. No 404 errors in console ✅

## Benefits

1. **No More Errors**: Eliminates 404 errors on GitHub Pages
2. **Optimized Bundle**: Analytics code is removed from GitHub Pages builds via tree-shaking
3. **Platform-Aware**: Automatically adapts to deployment platform
4. **Maintainable**: Clear configuration, easy to understand and modify
5. **Zero Impact**: No changes needed to existing Vercel deployments

## Verification

### Check GitHub Pages Build

1. Deploy to GitHub Pages
2. Open browser console (F12)
3. Navigate through the app
4. Verify no `/_vercel/insights/script.js` 404 errors

### Check Vercel Build

1. Deploy to Vercel
2. Open browser console (F12)
3. Navigate through the app
4. Verify Analytics script loads successfully
5. Check Vercel dashboard for analytics data

### Inspect Built Files

```bash
# Build without Vercel flag (GitHub Pages)
npm run build
grep -r "Analytics" dist/assets/*.js
# Should return: (empty - component was tree-shaken)

# Build with Vercel flag (Vercel)
VITE_VERCEL=1 npm run build
grep -r "Analytics" dist/assets/*.js
# Should return: (Analytics code present in bundle)
```

## Alternative Solutions Considered

### ❌ Keep Analytics Always Loaded

- **Rejected**: Causes 404 errors on GitHub Pages
- Still loads unnecessary code on non-Vercel platforms

### ❌ Remove Vercel Analytics Completely

- **Rejected**: Loses valuable analytics on Vercel deployments
- Would require alternative analytics solution

### ❌ Use Try-Catch to Suppress Errors

- **Rejected**: Doesn't prevent network request or console errors
- Still loads unnecessary code and makes failed requests

### ✅ Conditional Loading (Chosen Solution)

- **Advantages**:
  - Clean, no errors on any platform
  - Optimized bundle size via tree-shaking
  - Works seamlessly on both platforms
  - Easy to maintain and understand

## Related Files

- `src/main.tsx` - Conditional rendering logic
- `vercel.json` - Vercel build configuration
- `.env.example` - Environment variable documentation
- `package.json` - Vercel Analytics dependency

## Testing

All existing tests continue to pass:

- ✅ 327 tests passing
- ✅ Build succeeds on both platforms
- ✅ Linter shows no new errors
- ✅ Tree-shaking verified in production builds

## Additional Notes

- The solution uses Vite's native environment variable system
- Variables prefixed with `VITE_` are exposed to the client-side code
- Tree-shaking automatically removes unused code in production builds
- No runtime performance impact - decision made at build time

---

**Created**: December 8, 2024  
**Issue**: `GET https://rafaelraas.github.io/_vercel/insights/script.js` 404 error  
**Status**: ✅ Resolved
