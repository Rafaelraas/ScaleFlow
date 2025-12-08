# ScaleFlow Permission Matrix

## Role Access Overview

| Feature/Route           | system_admin | manager | schedule_manager | operator | employee | staff |
| ----------------------- | ------------ | ------- | ---------------- | -------- | -------- | ----- |
| **Authentication**      |
| Login/Register          | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| Create Company          | ✗            | ✓       | ✓                | ✓        | ✓        | ✓     |
| **General**             |
| Dashboard               | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| Profile Settings        | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| **Schedule Management** |
| View All Schedules      | ✓            | ✓       | ✓                | ✓        | ✗        | ✗     |
| Create/Edit Shifts      | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| Delete Shifts           | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| Shift Templates         | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| View My Schedule        | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| **Employee Management** |
| View Employees          | ✓            | ✓       | ✓                | ✓        | ✗        | ✗     |
| Add/Edit Employees      | ✓            | ✓       | ✗                | ✗        | ✗        | ✗     |
| Delete Employees        | ✓            | ✓       | ✗                | ✗        | ✗        | ✗     |
| **Preferences**         |
| View Own Preferences    | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| Edit Own Preferences    | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| View All Preferences    | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| Approve Preferences     | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| **Shift Swaps**         |
| View Own Swaps          | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| Create Swap Request     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| View All Swaps          | ✓            | ✓       | ✓                | ✓        | ✗        | ✗     |
| Approve Swaps           | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| **Company Settings**    |
| View Settings           | ✓            | ✓       | ✗                | ✗        | ✗        | ✗     |
| Edit Settings           | ✓            | ✓       | ✗                | ✗        | ✗        | ✗     |
| **Admin Features**      |
| Manage Companies        | ✓            | ✗       | ✗                | ✗        | ✗        | ✗     |
| Manage Users            | ✓            | ✗       | ✗                | ✗        | ✗        | ✗     |
| Feature Flags           | ✓            | ✗       | ✗                | ✗        | ✗        | ✗     |

## Database Table Permissions

### Companies Table

| Operation  | system_admin | manager | schedule_manager | operator | employee | staff |
| ---------- | ------------ | ------- | ---------------- | -------- | -------- | ----- |
| SELECT own | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| SELECT all | ✓            | ✗       | ✗                | ✗        | ✗        | ✗     |
| INSERT     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| UPDATE own | ✓            | ✓       | ✗                | ✗        | ✗        | ✗     |
| UPDATE all | ✓            | ✗       | ✗                | ✗        | ✗        | ✗     |
| DELETE     | ✓            | ✗       | ✗                | ✗        | ✗        | ✗     |

### Profiles Table

| Operation      | system_admin | manager | schedule_manager | operator | employee | staff |
| -------------- | ------------ | ------- | ---------------- | -------- | -------- | ----- |
| SELECT own     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| SELECT company | ✓            | ✓       | ✓                | ✓        | ✗        | ✗     |
| SELECT all     | ✓            | ✗       | ✗                | ✗        | ✗        | ✗     |
| UPDATE own     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| UPDATE company | ✓            | ✓       | ✗                | ✗        | ✗        | ✗     |

### Shifts Table

| Operation            | system_admin | manager | schedule_manager | operator | employee | staff |
| -------------------- | ------------ | ------- | ---------------- | -------- | -------- | ----- |
| SELECT own published | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| SELECT company       | ✓            | ✓       | ✓                | ✓        | ✗        | ✗     |
| SELECT all           | ✓            | ✗       | ✗                | ✗        | ✗        | ✗     |
| INSERT               | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| UPDATE               | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| DELETE               | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |

### Shift Templates Table

| Operation | system_admin | manager | schedule_manager | operator | employee | staff |
| --------- | ------------ | ------- | ---------------- | -------- | -------- | ----- |
| SELECT    | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| INSERT    | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| UPDATE    | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| DELETE    | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |

### Preferences Table

| Operation      | system_admin | manager | schedule_manager | operator | employee | staff |
| -------------- | ------------ | ------- | ---------------- | -------- | -------- | ----- |
| SELECT own     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| SELECT company | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| INSERT own     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| UPDATE own     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| UPDATE company | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |
| DELETE own     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |

### Swap Requests Table

| Operation      | system_admin | manager | schedule_manager | operator | employee | staff |
| -------------- | ------------ | ------- | ---------------- | -------- | -------- | ----- |
| SELECT own     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| SELECT company | ✓            | ✓       | ✓                | ✓        | ✗        | ✗     |
| INSERT         | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| UPDATE own     | ✓            | ✓       | ✓                | ✓        | ✓        | ✓     |
| UPDATE company | ✓            | ✓       | ✓                | ✗        | ✗        | ✗     |

## Role Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    system_admin                         │
│  (Platform-wide access, no company requirement)         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │            manager                    │
        │  (Full company control)               │
        └──────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
  ┌────────────────────┐      ┌────────────────────┐
  │  schedule_manager  │      │     operator       │
  │  (Schedule admin)  │      │  (View + Report)   │
  └────────────────────┘      └────────────────────┘
            │                             │
            │                             │
            └──────────────┬──────────────┘
                           ▼
              ┌─────────────────────────┐
              │   employee  /  staff    │
              │   (Basic access)        │
              └─────────────────────────┘
```

## Route Access by Role

### System Admin Routes (`/admin/*`)

- `/admin/companies` - Manage all companies
- `/admin/users` - Manage all users
- `/admin/feature-flags` - Control feature rollout

**Roles**: system_admin only

### Schedule Management Routes

- `/schedules` - View and manage schedules
- `/shift-templates` - Manage reusable templates
- `/employee-preferences` - View employee availability

**Roles**: manager, schedule_manager

### Employee Management Routes

- `/employees` - View and manage employees

**Roles**: manager, schedule_manager, operator

### Company Management Routes

- `/company-settings` - Company configuration

**Roles**: manager only

### Personal Routes

- `/my-schedule` - View personal schedule
- `/preferences` - Manage availability
- `/swap-requests` - Request shift swaps

**Roles**: All authenticated users

### Universal Routes

- `/dashboard` - Role-specific dashboard
- `/profile-settings` - User profile

**Roles**: All authenticated users

## Permission Decision Tree

```
User attempts to access route
    │
    ├─ Is user authenticated?
    │   ├─ NO → Redirect to /login
    │   └─ YES → Continue
    │
    ├─ Does route require company?
    │   ├─ YES
    │   │   ├─ Does user have company_id?
    │   │   │   ├─ NO → Redirect to /create-company
    │   │   │   └─ YES → Continue
    │   │   │
    │   └─ NO (system_admin routes)
    │       └─ Continue
    │
    ├─ Does route have role restrictions?
    │   ├─ NO → Allow access (generic protected)
    │   └─ YES
    │       ├─ Is user's role in allowedRoles?
    │       │   ├─ YES → Allow access
    │       │   └─ NO → Show "Access Denied"
    │
    └─ ALLOW ACCESS
```

## Quick Reference

### Adding a User to a Role

```sql
-- Get role ID
SELECT id FROM roles WHERE name = 'schedule_manager';

-- Update user profile
UPDATE profiles
SET role_id = '<role_id>'
WHERE id = '<user_id>';
```

### Checking User Permissions

```sql
-- Get user's role and company
SELECT
  p.id,
  p.first_name,
  p.last_name,
  r.name as role,
  p.company_id,
  c.name as company_name
FROM profiles p
JOIN roles r ON p.role_id = r.id
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.id = '<user_id>';
```

### Testing RLS Policies

```sql
-- Set current user context
SELECT set_config('request.jwt.claims', '{"sub": "<user_id>"}', true);

-- Test query with RLS
SELECT * FROM shifts WHERE company_id = '<company_id>';
```

---

**Legend**:

- ✓ = Full Access
- ✗ = No Access
- own = User's own data
- company = All data in user's company
- all = All data across all companies

**Last Updated**: 2024-12-08
