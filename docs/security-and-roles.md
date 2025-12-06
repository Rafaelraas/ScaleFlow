# Security and Roles Documentation

This document defines the security model and role-based access control (RBAC) for ScaleFlow, serving as a contract between the frontend routing and backend RLS policies.

## Table of Contents

1. [Roles](#roles)
2. [Route Access Matrix](#route-access-matrix)
3. [RLS Policies](#rls-policies)
4. [Security Best Practices](#security-best-practices)

## Roles

ScaleFlow has three user roles, defined in the `roles` table:

### Employee (`employee`)
- **Description**: Standard employee with access to their own schedules and preferences
- **Requires Company**: Yes
- **Can Access Admin Routes**: No
- **Capabilities**:
  - View their own published shifts
  - Manage personal schedule preferences
  - Create and manage shift swap requests
  - Update their own profile

### Manager (`manager`)
- **Description**: Company manager with full control over schedules, employees, and settings
- **Requires Company**: Yes
- **Can Access Admin Routes**: No
- **Capabilities**:
  - All employee capabilities
  - View and manage all company shifts (published and unpublished)
  - Manage employees in the company
  - Create and manage shift templates
  - View and approve/reject employee preferences
  - Manage company settings
  - Approve/reject shift swap requests

### System Administrator (`system_admin`)
- **Description**: System-wide administrator with cross-company access
- **Requires Company**: No
- **Can Access Admin Routes**: Yes
- **Capabilities**:
  - Cross-company operations
  - Manage all companies
  - Manage all users across companies
  - Full database access (subject to explicit RLS policies)

## Route Access Matrix

| Route | Anonymous | Authenticated (No Company) | Employee (With Company) | Manager (With Company) | System Admin |
|-------|-----------|---------------------------|------------------------|----------------------|--------------|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/login` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/register` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/verify` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/create-company` | ❌ | ✅ | ❌ (redirected) | ❌ (redirected) | ❌ (redirected) |
| `/dashboard` | ❌ | ❌ (redirect) | ✅ | ✅ | ✅ |
| `/profile-settings` | ❌ | ❌ (redirect) | ✅ | ✅ | ✅ |
| `/swap-requests` | ❌ | ❌ (redirect) | ✅ | ✅ | ✅ |
| `/my-schedule` | ❌ | ❌ (redirect) | ✅ | ❌ | ❌ |
| `/preferences` | ❌ | ❌ (redirect) | ✅ | ❌ | ❌ |
| `/schedules` | ❌ | ❌ (redirect) | ❌ | ✅ | ❌ |
| `/employees` | ❌ | ❌ (redirect) | ❌ | ✅ | ❌ |
| `/company-settings` | ❌ | ❌ (redirect) | ❌ | ✅ | ❌ |
| `/shift-templates` | ❌ | ❌ (redirect) | ❌ | ✅ | ❌ |
| `/employee-preferences` | ❌ | ❌ (redirect) | ❌ | ✅ | ❌ |
| `/admin/companies` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/admin/users` | ❌ | ❌ | ❌ | ❌ | ✅ |

### Access Levels

- ✅ **Allowed**: User can access this route
- ❌ **Denied**: User cannot access this route
- ❌ (redirect): User is redirected to appropriate page (e.g., `/create-company` or `/login`)

## RLS Policies

### Anonymous Access (auth.uid() is NULL)

**Allowed**:
- Supabase Auth endpoints (sign in, sign up, magic link, reset password)
- Reading from `roles` table (needed for role selection in UI)

**RLS Configuration**:
```sql
-- Roles table: Everyone can read roles
CREATE POLICY "roles_select_all" ON public.roles
  FOR SELECT
  USING (true);
```

### Authenticated Users (Regardless of Company)

**Allowed for Profile Management**:
- Users can read/write only their own row in `profiles`, even when `company_id IS NULL`
- Users can create a company (if business rules allow)

**RLS Configuration**:
```sql
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());
```

### Authenticated Users with Company (Generic Protected)

**Access Rules**:
- RLS always checks `company_id = current_user_company_id()`
- For user-specific data (schedules, preferences), also check `user_id = auth.uid()`

**Tables Accessed**:
- `profiles`: Own profile read/write
- `shifts`: Read own published shifts
- `swap_requests`: Create and view own requests
- `preferences`: Create and manage own preferences

### Manager Role

**Access Rules**:
- Can access all data within their company
- Cannot access data from other companies
- RLS policies check both `company_id` and role

**Tables Accessed**:
- `companies`: Read and update own company
- `profiles`: Read and update employees in company
- `shifts`: Full CRUD in company
- `shift_templates`: Full CRUD in company
- `preferences`: Read and approve/reject
- `swap_requests`: Read and approve/reject

**RLS Configuration Examples**:
```sql
-- Managers can view profiles in their company
CREATE POLICY "profiles_select_company_managers" ON public.profiles
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can insert shifts in their company
CREATE POLICY "shifts_insert_managers" ON public.shifts
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );
```

### System Admin Role

**Access Rules**:
- Cross-company operations allowed
- Uses `is_system_admin(auth.uid())` function
- Explicit policies required; default company-based policies don't automatically apply

**Tables Accessed**:
- All tables with full access
- Special admin routes for company and user management

**RLS Configuration**:
```sql
-- System admins can do everything with companies
CREATE POLICY "companies_all_system_admin" ON public.companies
  FOR ALL
  USING (public.is_system_admin(auth.uid()));

-- System admins can do everything with profiles
CREATE POLICY "profiles_all_system_admin" ON public.profiles
  FOR ALL
  USING (public.is_system_admin(auth.uid()));
```

## Table-Specific RLS Policies

### `roles` Table
- **SELECT**: Public (everyone can read)
- **INSERT/UPDATE/DELETE**: No policies (controlled at database level)

### `companies` Table
- **SELECT**: Users can view their own company; system admins can view all
- **UPDATE**: Managers can update their company; system admins can update any
- **INSERT**: Authenticated users can create companies
- **DELETE**: System admins only

### `profiles` Table
- **SELECT**: Users see own profile; managers see company profiles; admins see all
- **UPDATE**: Users update own profile; managers update company profiles; admins update any
- **INSERT**: Auto-created on user signup via trigger
- **DELETE**: No explicit policy (use soft delete by removing company_id)

### `shifts` Table
- **SELECT**: Employees see own published shifts; managers see all company shifts
- **INSERT**: Managers only
- **UPDATE**: Managers only
- **DELETE**: Managers only

### `shift_templates` Table
- **SELECT/INSERT/UPDATE/DELETE**: Managers only

### `preferences` Table
- **SELECT**: Employees see own; managers see all company preferences
- **INSERT**: Employees create own preferences
- **UPDATE**: Employees update own; managers approve/reject
- **DELETE**: Employees delete own (via preferences_all_own policy)

### `swap_requests` Table
- **SELECT**: Employees see requests they're involved in; managers see all company requests
- **INSERT**: Employees create own requests
- **UPDATE**: Requesters update own; managers approve/reject
- **DELETE**: No explicit policy

## Security Best Practices

### Frontend

1. **Never bypass ProtectedRoute**: All protected pages must use `ProtectedRoute` component
2. **Use typed roles**: Import `UserRole` type from `@/types/roles` for type safety
3. **Use route configuration**: Import routes from `@/config/routes` for consistency
4. **Use API layer**: Always use functions from `@/api` instead of direct Supabase calls
5. **Handle auth errors**: Always check `session` and `userProfile` before accessing protected data

### Backend (Supabase)

1. **RLS enabled on all tables**: Every table must have `ENABLE ROW LEVEL SECURITY`
2. **Deny by default**: Start with no access, then add targeted policies
3. **Explicit role checks**: Use `is_manager()` and `is_system_admin()` helper functions
4. **Company isolation**: Always check `company_id` matches for non-admin operations
5. **Principle of least privilege**: Give minimum necessary permissions

### API Layer

1. **Type safety**: All API functions use TypeScript types from `@/types/database`
2. **Error handling**: API functions throw errors; components handle them
3. **RLS enforcement**: Never bypass RLS; trust that policies enforce access
4. **Audit trail**: Include audit fields (created_at, updated_at, created_by) where needed

### Testing

1. **Test role boundaries**: Verify employees can't access manager routes
2. **Test company isolation**: Verify users can't access other companies' data
3. **Test RLS policies**: Use SQL tests to verify policies work correctly
4. **Test auth flows**: Verify redirects work for all user states

## Route → Table Mapping

This mapping helps ensure RLS policies align with frontend routes:

| Route | Tables Accessed | Required Policies |
|-------|----------------|-------------------|
| `/dashboard` | shifts, profiles, swap_requests | Own shifts (employee), all shifts (manager) |
| `/profile-settings` | profiles | Own profile update |
| `/swap-requests` | swap_requests, shifts, profiles | View involved requests, create requests |
| `/my-schedule` | shifts | Own published shifts |
| `/preferences` | preferences | Own preferences CRUD |
| `/schedules` | shifts, profiles, shift_templates | Company shifts CRUD (manager) |
| `/employees` | profiles, roles | Company profiles view/update (manager) |
| `/company-settings` | companies | Company update (manager) |
| `/shift-templates` | shift_templates | Templates CRUD (manager) |
| `/employee-preferences` | preferences, profiles | Company preferences view/approve (manager) |
| `/admin/companies` | companies, profiles | All companies (admin) |
| `/admin/users` | profiles, roles | All profiles (admin) |

## Helper Functions

The database includes helper functions to check user roles:

### `is_manager(user_id UUID)`
Returns true if the user has the manager role.

### `is_system_admin(user_id UUID)`
Returns true if the user has the system_admin role.

### `same_company(user_id1 UUID, user_id2 UUID)`
Returns true if both users belong to the same company.

## Auditing and Monitoring

### What to Log
- Failed authentication attempts
- Unauthorized access attempts
- Role changes
- Company creation/deletion
- Sensitive data access (for managers/admins)

### Where to Log
- Supabase Auth logs (automatic)
- Application logs (implement in services)
- Database audit tables (future enhancement)

## Incident Response

If a security incident occurs:

1. **Identify the breach**: Check logs and RLS policies
2. **Contain the issue**: Disable affected accounts if needed
3. **Patch the vulnerability**: Update RLS policies or code
4. **Notify affected users**: If data was accessed inappropriately
5. **Document the incident**: Update this document with lessons learned

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainers**: ScaleFlow Development Team
