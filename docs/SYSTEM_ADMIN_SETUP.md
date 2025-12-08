# System Administrator Setup Guide

This guide explains how to create and manage system administrator accounts in ScaleFlow.

## Overview

System administrators have full platform access with cross-company management capabilities. Unlike other roles, system admins:

- Do NOT require a company association
- Can manage all companies and users across the platform
- Have access to admin-specific routes (`/admin/companies`, `/admin/users`, `/admin/feature-flags`)

## Creating a System Admin User

### Method 1: Via Database (Recommended for Initial Setup)

1. **Create the user account** through the normal registration process or Supabase Auth dashboard.

2. **Update the user's role** to system_admin:

```sql
-- Get the system_admin role ID
SELECT id FROM public.roles WHERE name = 'system_admin';

-- Update the user's profile with system_admin role
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'system_admin')
WHERE id = 'USER_ID_HERE';

-- Verify the update
SELECT p.id, p.first_name, p.last_name, r.name as role
FROM public.profiles p
JOIN public.roles r ON p.role_id = r.id
WHERE p.id = 'USER_ID_HERE';
```

### Method 2: Via Supabase Dashboard

1. Navigate to your Supabase project dashboard
2. Go to **Table Editor** → **profiles**
3. Find the user you want to promote
4. Click **Edit** on their row
5. Change the `role_id` to the UUID of the `system_admin` role
6. Save changes

### Method 3: Via SQL Script

Use the provided SQL script for automated setup:

```bash
# From your Supabase project
psql YOUR_DATABASE_URL < scripts/create-system-admin.sql
```

Create `scripts/create-system-admin.sql`:

```sql
-- Create system admin user
-- Replace with actual email and details
DO $$
DECLARE
  admin_role_id UUID;
  admin_email TEXT := 'admin@scaleflow.com';
BEGIN
  -- Get system_admin role ID
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'system_admin';

  -- Update profile for the admin user (assumes user already exists)
  UPDATE public.profiles
  SET
    role_id = admin_role_id,
    first_name = 'System',
    last_name = 'Administrator'
  WHERE id = (
    SELECT id FROM auth.users WHERE email = admin_email
  );

  RAISE NOTICE 'System admin role assigned to %', admin_email;
END $$;
```

## Important Notes

### Security Considerations

1. **Limit System Admin Accounts**: Only create system admin accounts when absolutely necessary
2. **Use Strong Passwords**: System admin accounts should use very strong, unique passwords
3. **Enable 2FA**: When available, enable two-factor authentication for all admin accounts
4. **Audit Access**: Regularly review who has system admin access
5. **Separate Accounts**: Don't use system admin accounts for regular operations

### Registration Restrictions

System admin is **NOT** available during normal user registration. This is intentional for security reasons:

- Users can only select: Staff, Operator, Schedule Manager, or Manager
- System admin accounts must be created through database operations or admin tools

### Testing System Admin

After creating a system admin account:

1. **Login** with the system admin credentials
2. **Verify Dashboard**: Should see system-wide stats (Total Companies, Total Users)
3. **Check Navigation**: Should have access to:
   - `/admin/companies` - Manage all companies
   - `/admin/users` - Manage all users
   - `/admin/feature-flags` - Manage feature flags
4. **Verify Permissions**: Should bypass company requirement checks

## Role Hierarchy

The complete role hierarchy in ScaleFlow:

1. **System Admin** (highest privilege)
   - Platform-wide access
   - No company requirement
   - Can manage all companies and users

2. **Manager**
   - Company-level full access
   - Manages employees, schedules, settings
   - Requires company association

3. **Schedule Manager**
   - Schedule-focused management
   - Creates and manages shifts
   - Reviews preferences and approvals
   - Requires company association

4. **Operator**
   - Operational access
   - Can view team and reports
   - Limited management capabilities
   - Requires company association

5. **Staff / Employee** (lowest privilege)
   - Personal access only
   - View own schedules
   - Submit preferences
   - Request shift swaps
   - Requires company association

## Troubleshooting

### User Can't Access Admin Routes

1. Verify role assignment:

```sql
SELECT p.id, p.first_name, p.last_name, r.name as role
FROM public.profiles p
JOIN public.roles r ON p.role_id = r.id
WHERE p.id = 'USER_ID';
```

2. Check if system_admin role exists:

```sql
SELECT * FROM public.roles WHERE name = 'system_admin';
```

3. Verify company_id is NULL for system admin:

```sql
SELECT id, company_id, role_id
FROM public.profiles
WHERE id = 'USER_ID';
```

### Can't Create System Admin via SQL

- Ensure you have proper database permissions
- Run migrations first to ensure roles table is populated
- Check Supabase logs for error messages

## Support

For additional help with system admin setup:

1. Check the [Authentication Documentation](./AUTH_REFACTORING_SUMMARY.md)
2. Review [Database Schema](../supabase/migrations/20241205000001_initial_schema.sql)
3. Contact your database administrator
