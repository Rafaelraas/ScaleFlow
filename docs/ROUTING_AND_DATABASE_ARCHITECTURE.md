# ScaleFlow - Unified Routing and Database Architecture

## Overview

This document describes the unified routing and database architecture for ScaleFlow, including role-based access control, route organization, and database permissions.

## Table of Contents

1. [Role Hierarchy](#role-hierarchy)
2. [Route Organization](#route-organization)
3. [Database Permissions](#database-permissions)
4. [Implementation Details](#implementation-details)
5. [Migration Guide](#migration-guide)

---

## Role Hierarchy

ScaleFlow implements a hierarchical role system with 6 distinct roles:

### Level 1: Platform Administration

- **system_admin**: Full platform access across all companies
  - Can manage all companies and users
  - Does not require a company_id
  - Access to admin routes (`/admin/*`)

### Level 2: Company Administration

- **manager**: Full company-level access
  - Can manage company settings, all employees, schedules, and shifts
  - Requires company_id
  - Full CRUD on company data

### Level 3: Schedule Administration

- **schedule_manager**: Specialized schedule management
  - Can manage schedules, shifts, templates, and employee preferences
  - Cannot modify company settings
  - Requires company_id

### Level 4: Operations

- **operator**: Operational tasks and reporting
  - Can view employees and shifts
  - Can view their own schedule
  - Cannot modify schedules or manage employees
  - Requires company_id

### Level 5: Basic Employees

- **employee**: Standard employee access
  - Can view their own schedule and manage preferences
  - Limited to personal data
  - Requires company_id

- **staff**: Basic staff member (similar to employee)
  - Can view their own schedule and manage preferences
  - Limited to personal data
  - Requires company_id

---

## Route Organization

Routes are organized by access level and functionality:

### Public Routes (No Auth)

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/verify` - Email verification

### Company Creation (Auth, No Company)

- `/create-company` - Company creation for users without a company
  - Allowed roles: manager, employee, operator, schedule_manager, staff

### Generic Protected (Auth + Company, All Roles)

- `/dashboard` - Main dashboard (role-specific content)
- `/profile-settings` - User profile settings
- `/swap-requests` - View and manage shift swaps

### Schedule Management (Auth + Company)

- `/schedules` - Manage schedules and shifts
- `/shift-templates` - Manage shift templates
- `/employee-preferences` - View/manage employee preferences
- **Allowed roles**: manager, schedule_manager

### Employee Management (Auth + Company)

- `/employees` - View and manage employees
- **Allowed roles**: manager, schedule_manager, operator

### Manager-Only (Auth + Company)

- `/company-settings` - Company configuration
- **Allowed roles**: manager

### Employee/Staff (Auth + Company)

- `/my-schedule` - View personal schedule
  - **Allowed roles**: employee, staff, operator
- `/preferences` - Manage personal preferences
  - **Allowed roles**: employee, staff

### System Admin (Auth, No Company)

- `/admin/companies` - Platform-wide company management
- `/admin/users` - Platform-wide user management
- `/admin/feature-flags` - Feature flag management
- **Allowed roles**: system_admin

---

## Database Permissions

### Row Level Security (RLS) Policies

All tables have RLS enabled with role-based policies:

#### Roles Table

- **SELECT**: Public (needed for UI dropdowns)

#### Companies Table

- **SELECT**: Users can view their own company, system_admin can view all
- **INSERT**: Authenticated users can create companies
- **UPDATE**: Managers can update their company, system_admin can update all
- **DELETE**: System_admin only

#### Profiles Table

- **SELECT**:
  - Users can view their own profile
  - Managers/schedule_managers/operators can view profiles in their company
  - System_admin can view all
- **UPDATE**:
  - Users can update their own profile
  - Managers can update profiles in their company
  - System_admin can update all

#### Shifts Table

- **SELECT**:
  - Employees/staff see their own published shifts
  - Managers/schedule_managers see all shifts in company
  - Operators see all shifts in company (read-only)
  - System_admin sees all
- **INSERT/UPDATE/DELETE**:
  - Managers and schedule_managers in the shift's company
  - System_admin

#### Shift Templates Table

- **SELECT**: Managers and schedule_managers in company
- **INSERT/UPDATE/DELETE**: Managers and schedule_managers in company

#### Preferences Table

- **SELECT**:
  - Employees/staff see their own preferences
  - Managers/schedule_managers see preferences in their company
- **INSERT/UPDATE/DELETE**:
  - Employees/staff manage their own
  - Managers/schedule_managers can update (approval/rejection)

#### Swap Requests Table

- **SELECT**:
  - Employees/staff see requests they're involved in
  - Managers/schedule_managers/operators see all requests in company
- **INSERT**: Employees/staff can create for their own shifts
- **UPDATE**:
  - Employees/staff can update their own requests
  - Managers/schedule_managers can approve/reject

---

## Implementation Details

### Route Configuration (`src/config/routes.ts`)

All routes are defined in a centralized configuration with metadata:

```typescript
interface RouteConfig {
  path: string;
  name: string;
  description: string;
  allowedRoles?: UserRole[];
  requiresCompany?: boolean;
  requiresAuth: boolean;
  category: string;
  tablesAccessed?: string[];
}
```

Routes are grouped by access level:

- `PUBLIC_ROUTES`
- `AUTH_FLOW_ROUTES`
- `COMPANY_CREATION_ROUTE`
- `GENERIC_PROTECTED_ROUTES`
- `SCHEDULE_MANAGEMENT_ROUTES`
- `EMPLOYEE_MANAGEMENT_ROUTES`
- `MANAGER_ROUTES`
- `EMPLOYEE_ROUTES`
- `SYSTEM_ADMIN_ROUTES`

### Protected Route Component (`src/components/ProtectedRoute.tsx`)

Handles authentication and authorization:

```typescript
<ProtectedRoute
  requiresCompany={true}
  allowedRoles={['manager', 'schedule_manager']}
>
  <YourPage />
</ProtectedRoute>
```

Features:

- Session validation
- Role-based access control
- Company requirement checking
- Loading states
- Automatic redirects

### Route Pattern in App.tsx

Consistent pattern for all protected routes:

```typescript
<Route
  path="/schedules"
  element={
    <ProtectedRoute allowedRoles={['manager', 'schedule_manager']}>
      <Layout>
        <Schedules />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### Database Helper Functions

Helper functions for RLS policies (in migrations):

- `has_role(user_id, role_name)` - Check if user has specific role
- `has_any_role(user_id, role_names[])` - Check if user has any of the roles
- `can_manage_schedules(user_id)` - Manager or schedule_manager
- `can_view_employees(user_id)` - Manager, schedule_manager, or operator
- `is_basic_employee(user_id)` - Employee or staff
- `is_manager(user_id)` - Manager role
- `is_system_admin(user_id)` - System admin role

---

## Migration Guide

### Database Migrations

Run migrations in order:

1. `20241205000001_initial_schema.sql` - Core tables
2. `20241205000002_indexes.sql` - Performance indexes
3. `20241205000003_functions_triggers.sql` - Helper functions
4. `20241205000004_rls_policies.sql` - Initial RLS policies
5. `20241208000001_add_new_roles.sql` - Add operator, schedule_manager, staff
6. `20241208170000_unified_role_policies.sql` - **NEW** Complete role-based policies

### Supabase Migration Command

```bash
# From project root
npx supabase db push

# Or manually apply via Supabase Dashboard
# SQL Editor > New query > Paste migration > Run
```

### Frontend Changes

No breaking changes for existing code. Routes now have:

- Clearer organization and comments
- Consistent patterns
- Better role handling

### Testing Checklist

After migration, test each role:

#### System Admin

- [ ] Can access `/admin/companies`
- [ ] Can access `/admin/users`
- [ ] Can access `/admin/feature-flags`
- [ ] Cannot access company-specific routes without company

#### Manager

- [ ] Can access all company routes
- [ ] Can manage schedules, employees, settings
- [ ] Can view and approve preferences and swaps

#### Schedule Manager

- [ ] Can access schedule management routes
- [ ] Can manage shifts and templates
- [ ] Cannot access company settings
- [ ] Can view employees

#### Operator

- [ ] Can view employees
- [ ] Can view their own schedule
- [ ] Cannot modify schedules
- [ ] Can view swap requests

#### Employee/Staff

- [ ] Can view their own schedule
- [ ] Can manage their own preferences
- [ ] Can create swap requests
- [ ] Cannot view other employees

---

## Best Practices

### Adding New Routes

1. **Define in `routes.ts`**:

   ```typescript
   {
     path: '/new-route',
     name: 'New Feature',
     description: 'Description',
     requiresAuth: true,
     requiresCompany: true,
     allowedRoles: ['manager'],
     category: 'manager_only',
     tablesAccessed: ['table1', 'table2'],
   }
   ```

2. **Add to `App.tsx`**:

   ```typescript
   <Route
     path="/new-route"
     element={
       <ProtectedRoute allowedRoles={['manager']}>
         <Layout>
           <NewPage />
         </Layout>
       </ProtectedRoute>
     }
   />
   ```

3. **Update database policies** if new tables are accessed

### Adding New Roles

1. **Add to `roles` table**:

   ```sql
   INSERT INTO public.roles (name, description) VALUES
     ('new_role', 'Description of the role');
   ```

2. **Update TypeScript types** in `src/types/roles.ts`
3. **Add RLS policies** for the new role
4. **Update `ROLE_PERMISSIONS`** in roles.ts
5. **Update route configurations** to include the new role

### Security Considerations

- Always use RLS policies - never rely solely on frontend checks
- Test policies with different user roles
- Use helper functions to keep policies DRY
- Document permission rationale in code comments
- Regular security audits of policies

---

## Troubleshooting

### "Access Denied" on Valid Route

- Check user's role in database: `SELECT * FROM profiles JOIN roles ON profiles.role_id = roles.id WHERE profiles.id = 'user_id'`
- Verify route's `allowedRoles` matches user's role
- Check `requiresCompany` setting if user has/doesn't have company_id

### RLS Policy Blocking Access

- Check policies: `SELECT * FROM pg_policies WHERE tablename = 'table_name'`
- Test with `auth.uid()`: `SELECT auth.uid()`
- Use helper functions to debug: `SELECT has_role(auth.uid(), 'role_name')`

### Route Not Loading

- Check if page component is imported in route-generator
- Verify path matches exactly in routes.ts and App.tsx
- Check browser console for errors

---

## Future Enhancements

Potential improvements for the routing and permission system:

1. **Dynamic Route Generation**: Generate routes from config automatically
2. **Permission Matrix UI**: Admin interface to visualize and edit permissions
3. **Audit Logging**: Track access to sensitive routes and data
4. **Role Templates**: Pre-configured role sets for common use cases
5. **Granular Permissions**: Field-level permissions for sensitive data
6. **Multi-tenant Improvements**: Better isolation between companies

---

## Related Documentation

- [Roles and Permissions](./ROLES_AND_PERMISSIONS.md)
- [Supabase RLS Policies](../supabase/migrations/README.md)
- [Route Configuration](../src/config/routes.ts)
- [GitHub Copilot Instructions](../.github/copilot-instructions.md)

---

**Last Updated**: 2024-12-08
**Version**: 1.0.0
**Author**: ScaleFlow Development Team
