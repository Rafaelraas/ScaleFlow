# Roles and Permissions

This document describes the user roles available in ScaleFlow and their respective permissions.

## Role Hierarchy

ScaleFlow implements a role-based access control (RBAC) system with 6 distinct user roles:

### 1. System Administrator

**Internal Name**: `system_admin`

**Description**: System-wide administrator with cross-company access

**Permissions**:

- ✅ Full platform access
- ✅ Manage all companies
- ✅ Manage all users across companies
- ✅ Access admin routes (`/admin/*`)
- ✅ Manage feature flags
- ❌ **Does NOT require company association**

**Use Cases**:

- Platform administrators
- Support staff with elevated privileges
- System maintenance and monitoring

**Creation**: System admins cannot be created through normal registration. See [System Admin Setup Guide](./SYSTEM_ADMIN_SETUP.md) for details.

---

### 2. Manager

**Internal Name**: `manager`

**Description**: Company manager with full control over schedules, employees, and settings

**Permissions**:

- ✅ Full company-level access
- ✅ Create and manage schedules
- ✅ Manage employees
- ✅ Create shift templates
- ✅ Approve/reject preferences
- ✅ Approve/reject shift swaps
- ✅ Configure company settings
- ✅ Requires company association

**Use Cases**:

- Business owners
- General managers
- Operations directors

**Dashboard Features**:

- Pending employee preferences
- Pending shift swap requests
- Company-wide statistics

---

### 3. Schedule Manager

**Internal Name**: `schedule_manager`

**Description**: Schedule management specialist with focus on shift planning and coordination

**Permissions**:

- ✅ Create and manage schedules
- ✅ Create shift templates
- ✅ View team members
- ✅ Review employee preferences
- ✅ Approve shift swaps
- ❌ Cannot change company settings
- ❌ Cannot invite new employees (limited HR access)
- ✅ Requires company association

**Use Cases**:

- Schedule coordinators
- Shift planners
- Operations coordinators

**Dashboard Features**:

- Schedule management tools
- Shift template access
- Team availability overview
- Preference approval queue

---

### 4. Operator

**Internal Name**: `operator`

**Description**: Operations team member with access to operational tasks and reporting

**Permissions**:

- ✅ View schedules
- ✅ View team members
- ✅ Access operational reports
- ✅ View own schedule
- ✅ Participate in shift swaps
- ❌ Cannot create schedules
- ❌ Cannot approve preferences
- ✅ Requires company association

**Use Cases**:

- Operations supervisors
- Team leads
- Floor managers

**Dashboard Features**:

- Personal schedule view
- Team overview
- Operations dashboard
- Reports access

---

### 5. Staff

**Internal Name**: `staff`

**Description**: General staff member with basic access to personal schedules and preferences

**Permissions**:

- ✅ View own schedule
- ✅ Submit preferences
- ✅ Request shift swaps
- ✅ Update personal profile
- ❌ Cannot view other employees' schedules
- ❌ Cannot create schedules
- ✅ Requires company association

**Use Cases**:

- General staff members
- Part-time workers
- Temporary employees

**Dashboard Features**:

- Personal schedule view
- Preference management
- Shift swap requests
- Profile settings

---

### 6. Employee

**Internal Name**: `employee`

**Description**: Standard employee with access to their own schedules and preferences

**Permissions**:

- ✅ View own schedule
- ✅ Submit preferences
- ✅ Request shift swaps
- ✅ Update personal profile
- ❌ Cannot view other employees' schedules
- ❌ Cannot create schedules
- ✅ Requires company association

**Use Cases**:

- Regular employees
- Hourly workers
- Standard staff

**Dashboard Features**:

- Next shift information
- Pending preferences count
- Pending swap requests count
- Quick access to schedule

---

## Role Selection During Registration

When users register, they can choose from these roles:

- **Staff** (default)
- **Operator**
- **Schedule Manager**
- **Manager**

**Note**: System Administrator and Employee roles have specific use cases:

- **System Admin** cannot be selected during registration (see setup guide)
- **Employee** is the legacy role (Staff is the newer equivalent)

## Permission Matrix

| Feature                | System Admin | Manager | Schedule Manager | Operator | Staff | Employee |
| ---------------------- | ------------ | ------- | ---------------- | -------- | ----- | -------- |
| View Own Schedule      | ✅           | ✅      | ✅               | ✅       | ✅    | ✅       |
| View Team Schedules    | ✅           | ✅      | ✅               | ✅       | ❌    | ❌       |
| Create Schedules       | ✅           | ✅      | ✅               | ❌       | ❌    | ❌       |
| Manage Shift Templates | ✅           | ✅      | ✅               | ❌       | ❌    | ❌       |
| View Team Members      | ✅           | ✅      | ✅               | ✅       | ❌    | ❌       |
| Invite Employees       | ✅           | ✅      | ❌               | ❌       | ❌    | ❌       |
| Approve Preferences    | ✅           | ✅      | ✅               | ❌       | ❌    | ❌       |
| Approve Shift Swaps    | ✅           | ✅      | ✅               | ❌       | ❌    | ❌       |
| Submit Preferences     | ✅           | ✅      | ✅               | ✅       | ✅    | ✅       |
| Request Shift Swaps    | ✅           | ✅      | ✅               | ✅       | ✅    | ✅       |
| Company Settings       | ✅           | ✅      | ❌               | ❌       | ❌    | ❌       |
| View Reports           | ✅           | ✅      | ✅               | ✅       | ❌    | ❌       |
| Admin Routes           | ✅           | ❌      | ❌               | ❌       | ❌    | ❌       |
| Requires Company       | ❌           | ✅      | ✅               | ✅       | ✅    | ✅       |

## Navigation Access

### System Admin Navigation

- Dashboard
- Schedules
- Shift Templates
- Employees
- Employee Preferences
- Swap Requests
- Profile Settings
- Company Settings
- **Admin Companies**
- **Admin Users**

### Manager Navigation

- Dashboard
- Schedules
- Shift Templates
- Employees
- Employee Preferences
- Swap Requests
- Profile Settings
- Company Settings

### Schedule Manager Navigation

- Dashboard
- Schedules
- Shift Templates
- Employees
- Employee Preferences
- Swap Requests
- Profile Settings

### Operator Navigation

- Dashboard
- Schedules
- Employees
- My Schedule
- Swap Requests
- Profile Settings

### Staff/Employee Navigation

- Dashboard
- My Schedule
- Preferences
- Swap Requests
- Profile Settings

## Technical Implementation

### Type Definition

```typescript
export type UserRole =
  | 'employee'
  | 'manager'
  | 'system_admin'
  | 'operator'
  | 'schedule_manager'
  | 'staff';
```

### Role Permissions Object

```typescript
export const ROLE_PERMISSIONS = {
  employee: { requiresCompany: true, canAccessAdmin: false },
  staff: { requiresCompany: true, canAccessAdmin: false },
  operator: { requiresCompany: true, canAccessAdmin: false },
  schedule_manager: { requiresCompany: true, canAccessAdmin: false },
  manager: { requiresCompany: true, canAccessAdmin: false },
  system_admin: { requiresCompany: false, canAccessAdmin: true },
} as const;
```

### Checking User Role

```typescript
import { useSession } from '@/hooks/useSession';

const { userRole } = useSession();

if (userRole === 'manager') {
  // Manager-specific logic
}
```

### Protected Routes

```typescript
<ProtectedRoute allowedRoles={['manager', 'schedule_manager']}>
  <SchedulesPage />
</ProtectedRoute>
```

## Migration Guide

### From Employee to Staff

If you have existing users with the `employee` role who should be upgraded:

```sql
-- Get staff role ID
SELECT id FROM public.roles WHERE name = 'staff';

-- Update specific users
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'staff')
WHERE id = 'USER_ID_HERE';
```

### Bulk Role Updates

```sql
-- Update all employees in a specific company to staff
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'staff')
WHERE company_id = 'COMPANY_ID_HERE'
  AND role_id = (SELECT id FROM public.roles WHERE name = 'employee');
```

## Best Practices

1. **Principle of Least Privilege**: Assign the minimum role necessary for users to perform their job
2. **Regular Audits**: Periodically review user roles and permissions
3. **Role Transitions**: When promoting users, update their role rather than creating new accounts
4. **System Admin Limitation**: Only create system admin accounts when absolutely necessary
5. **Documentation**: Keep role assignments documented for audit purposes

## Support

For questions about roles and permissions:

- See [System Admin Setup](./SYSTEM_ADMIN_SETUP.md) for admin account creation
- Check [Authentication Documentation](../AUTH_REFACTORING_SUMMARY.md) for auth flow
- Review database schema in `supabase/migrations/`
