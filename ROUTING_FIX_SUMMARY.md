# Routing and Loading Fix Summary

## Issue Description

After logging in with credentials (azeraf@gmail.com / fareza123), the application gets stuck on the login page showing an infinite loading spinner. Navigating directly to the dashboard URL also shows a loading page that never completes.

## Root Causes

### 1. SessionContextProvider Infinite Loop

The `useEffect` in `SessionContextProvider.tsx` included location dependencies (`location.pathname`, `location.search`, `location.hash`), causing:

1. User logs in → SessionProvider fetches profile → redirects to `/dashboard`
2. Navigation changes `location.pathname` → triggers `useEffect` again
3. Creates infinite loop where `isLoading` state never settles to `false`

### 2. ProtectedRoute Blocking System Admins

The `ProtectedRoute` component required all users to have a `company_id`, but system admins are platform-level administrators who don't belong to any company. This created a redirect loop:

1. Dashboard route requires company → redirects system_admin to `/create-company`
2. SessionProvider sees auth user on `/create-company` → redirects to `/dashboard`
3. Loop repeats infinitely

## Solution Implemented

### Changes to `src/providers/SessionContextProvider.tsx`

**1. Removed location dependencies from useEffect**

```typescript
// Before: [navigate, location.pathname, location.search, location.hash, ...]
// After: [navigate, fetchUserProfileAndRole, getRedirectPath]
```

**Why this works:**

- Effect now only runs once on mount and when auth callbacks change
- Auth state changes are handled by `onAuthStateChange` listener
- Navigation doesn't retrigger the entire auth flow
- `isLoading` properly settles to `false` after initialization

**2. Improved hash parsing for HashRouter**

```typescript
const hash = window.location.hash.substring(1);
const [currentPath, queryString] = hash.split('?');
const hashParams = new URLSearchParams(queryString || '');
```

**Why this works:**

- Uses `window.location` directly instead of React Router's location object
- Properly parses HashRouter format: `#/path?param=value`
- Compatible with GitHub Pages deployment strategy

### Changes to `src/components/ProtectedRoute.tsx`

**Added system_admin exception**

```typescript
// Before: if (requiresCompany && !userProfile?.company_id)
// After: if (requiresCompany && !userProfile?.company_id && userRole !== 'system_admin')
```

**Why this works:**

- System admins can access routes without a company_id
- Prevents redirect loop between dashboard and create-company
- Maintains security for other user roles

## How It Works Now

### Login Flow

1. User enters credentials and clicks login
2. Supabase authenticates → triggers `onAuthStateChange` event
3. SessionProvider fetches user profile and role
4. Determines redirect path based on user state
5. Navigates to appropriate route (usually `/dashboard`)
6. **Navigation does NOT retrigger useEffect**
7. ProtectedRoute checks auth and role permissions
8. **System admins pass company check**
9. Dashboard loads with `isLoading = false`
10. User sees their dashboard

### Auth State Management

- **Initial load:** `useEffect` runs once, checks session, fetches profile
- **Login/Logout:** `onAuthStateChange` listener handles these events
- **Navigation:** Does NOT trigger auth flow (prevents loops)
- **Loading state:** Properly set to false after initialization completes

## Testing & Validation

### Automated Tests

- ✅ All 327 tests pass
- ✅ 19 SessionContextProvider tests verify routing behavior
- ✅ Build completes successfully
- ✅ CodeQL security scan: 0 alerts

### Test Coverage

- Session initialization with and without profile
- Profile retry logic for race conditions
- Redirect logic for different user states
- System admin special cases
- Auth flow type detection (recovery, signup)

## Technical Details

### HashRouter Usage

The application uses `HashRouter` for GitHub Pages compatibility. Routes are in the format:

- `/#/` - Landing page
- `/#/login` - Login page
- `/#/dashboard` - Dashboard
- `/#/admin/companies` - System admin routes

### Auth State Listener

The `onAuthStateChange` listener is the source of truth for auth events:

```typescript
supabase.auth.onAuthStateChange(async (event, currentSession) => {
  await handleSessionAndProfile(currentSession, event);
});
```

Events handled:

- `SIGNED_IN` - User logged in
- `SIGNED_OUT` - User logged out
- `TOKEN_REFRESHED` - Session refreshed
- `USER_UPDATED` - User data changed

### Redirect Logic

The `getRedirectPath` function determines where to send users:

| User State               | Current Path                   | Redirect To       |
| ------------------------ | ------------------------------ | ----------------- |
| No session               | Protected route                | `/login`          |
| No session               | Public route                   | Stay              |
| Has session, no profile  | Any                            | Stay (show error) |
| System admin, no company | `/create-company` or auth page | `/dashboard`      |
| System admin, no company | Other                          | Stay              |
| User, no company         | Not `/create-company`          | `/create-company` |
| User, has company        | `/create-company` or auth page | `/dashboard`      |
| User, has company        | Other                          | Stay              |

## Files Modified

1. **src/providers/SessionContextProvider.tsx**
   - Removed location dependencies from useEffect
   - Improved hash parsing for HashRouter
   - Added clarifying comments

2. **src/components/ProtectedRoute.tsx**
   - Added system_admin exception for company requirement

## Migration Notes

### For Developers

- Do NOT add location dependencies back to SessionContextProvider useEffect
- Auth state changes are handled by `onAuthStateChange` listener
- Use `window.location` for HashRouter path parsing
- Remember system_admin exception when modifying access control

### For Users

- No migration required
- Login should now work immediately
- Dashboard loads without infinite spinner
- System admin accounts function correctly

## Future Considerations

### If Switching to BrowserRouter

If the application switches from HashRouter to BrowserRouter:

1. Update hash parsing to use `location.pathname` directly
2. Remove `window.location.hash` parsing logic
3. Update server configuration for proper routing
4. Test auth flows thoroughly

### If Adding New User Roles

When adding roles that don't require companies:

1. Update ProtectedRoute to include the new role in the exception
2. Update getRedirectPath logic if needed
3. Add tests for the new role's routing behavior

### If Modifying Auth Flow

When changing authentication logic:

1. Keep useEffect dependencies minimal (no location)
2. Handle auth events via `onAuthStateChange`
3. Test for redirect loops with different user states
4. Verify loading state settles correctly

## Troubleshooting

### If Users Still Get Stuck Loading

1. Check browser console for errors
2. Verify Supabase connection (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
3. Check if profile exists in database
4. Verify role_id and company_id in profiles table
5. Test with different user roles

### If System Admins Can't Access Dashboard

1. Verify userRole is 'system_admin'
2. Check ProtectedRoute exception is still present
3. Verify Dashboard component handles system_admin role
4. Check for other redirect logic that might interfere

### If Regular Users Can't Create Company

1. Verify getRedirectPath logic for users without company
2. Check /create-company route configuration
3. Ensure ProtectedRoute allows access when requiresCompany=false

## Related Documentation

- `src/config/routes.ts` - Route configuration and permissions
- `src/types/roles.ts` - User role definitions
- `docs/ROUTING_AND_DATABASE_ARCHITECTURE.md` - Overall routing architecture
- `docs/PERMISSION_MATRIX.md` - Role-based permissions

## Contact

For questions or issues related to this fix:

1. Check the test files for examples
2. Review SessionContextProvider and ProtectedRoute source code
3. Consult repository memories for routing patterns
4. Review this document's troubleshooting section
