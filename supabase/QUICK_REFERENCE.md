# ScaleFlow Database Quick Reference

Quick reference guide for common database operations and queries.

## Table of Contents

- [Schema Overview](#schema-overview)
- [Common Queries](#common-queries)
- [User Management](#user-management)
- [Shift Management](#shift-management)
- [RLS Policies](#rls-policies)
- [Helper Functions](#helper-functions)

## Schema Overview

### Tables
- `roles` - System roles (3 default: system_admin, manager, employee)
- `companies` - Organizations
- `profiles` - User profiles (linked to auth.users)
- `shifts` - Work shifts
- `shift_templates` - Reusable shift patterns
- `preferences` - Employee availability preferences
- `swap_requests` - Shift swap requests

### Key Relationships
```
roles ←→ profiles ←→ companies
profiles ←→ shifts ←→ shift_templates
profiles ←→ preferences
profiles ←→ swap_requests ←→ shifts
```

## Common Queries

### Get All Tables
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### View Table Structure
```sql
-- For any table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'shifts'
ORDER BY ordinal_position;
```

### Count Records in All Tables
```sql
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM public.roles) as roles_count,
  (SELECT COUNT(*) FROM public.companies) as companies_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM public.shifts) as shifts_count,
  (SELECT COUNT(*) FROM public.shift_templates) as templates_count,
  (SELECT COUNT(*) FROM public.preferences) as preferences_count,
  (SELECT COUNT(*) FROM public.swap_requests) as swap_requests_count
FROM pg_tables 
WHERE schemaname = 'public' 
LIMIT 1;
```

## User Management

### View All Roles
```sql
SELECT * FROM public.roles ORDER BY name;
```

### View Profiles with Role Information
```sql
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  r.name as role,
  c.name as company,
  p.created_at
FROM public.profiles p
LEFT JOIN public.roles r ON p.role_id = r.id
LEFT JOIN public.companies c ON p.company_id = c.id
ORDER BY p.created_at DESC;
```

### Get User's Company and Role
```sql
-- Replace 'user-uuid' with actual user ID
SELECT 
  p.first_name,
  p.last_name,
  r.name as role,
  c.name as company
FROM public.profiles p
LEFT JOIN public.roles r ON p.role_id = r.id
LEFT JOIN public.companies c ON p.company_id = c.id
WHERE p.id = 'user-uuid';
```

### Find All Managers in a Company
```sql
-- Replace 'company-uuid' with actual company ID
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.avatar_url
FROM public.profiles p
JOIN public.roles r ON p.role_id = r.id
WHERE p.company_id = 'company-uuid' 
  AND r.name = 'manager';
```

### Find All Employees in a Company
```sql
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  r.name as role
FROM public.profiles p
JOIN public.roles r ON p.role_id = r.id
WHERE p.company_id = 'company-uuid'
ORDER BY p.last_name, p.first_name;
```

## Shift Management

### View All Published Shifts for a User
```sql
SELECT 
  s.id,
  s.start_time,
  s.end_time,
  s.notes,
  r.name as required_role
FROM public.shifts s
LEFT JOIN public.roles r ON s.role_id = r.id
WHERE s.employee_id = 'user-uuid' 
  AND s.published = true
ORDER BY s.start_time;
```

### View Upcoming Shifts for a Company
```sql
SELECT 
  s.id,
  s.start_time,
  s.end_time,
  p.first_name || ' ' || p.last_name as employee,
  r.name as role,
  s.published,
  s.notes
FROM public.shifts s
LEFT JOIN public.profiles p ON s.employee_id = p.id
LEFT JOIN public.roles r ON s.role_id = r.id
WHERE s.company_id = 'company-uuid'
  AND s.start_time >= NOW()
ORDER BY s.start_time;
```

### Find Unassigned Shifts
```sql
SELECT 
  s.id,
  s.start_time,
  s.end_time,
  r.name as required_role,
  s.published
FROM public.shifts s
LEFT JOIN public.roles r ON s.role_id = r.id
WHERE s.company_id = 'company-uuid'
  AND s.employee_id IS NULL
ORDER BY s.start_time;
```

### View Shift Templates for a Company
```sql
SELECT 
  st.id,
  st.name,
  st.duration_hours,
  st.default_start_time,
  r.name as default_role,
  st.default_notes
FROM public.shift_templates st
LEFT JOIN public.roles r ON st.default_role_id = r.id
WHERE st.company_id = 'company-uuid'
ORDER BY st.name;
```

### Calculate Total Hours for an Employee
```sql
-- For a specific date range
SELECT 
  p.first_name || ' ' || p.last_name as employee,
  COUNT(*) as shift_count,
  SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) as total_hours
FROM public.shifts s
JOIN public.profiles p ON s.employee_id = p.id
WHERE s.employee_id = 'user-uuid'
  AND s.start_time >= '2024-12-01'
  AND s.end_time <= '2024-12-31'
  AND s.published = true
GROUP BY p.first_name, p.last_name;
```

## Preferences Management

### View Pending Preferences for a Company
```sql
SELECT 
  pr.id,
  p.first_name || ' ' || p.last_name as employee,
  pr.available_from,
  pr.available_to,
  pr.preferred_days,
  pr.max_hours_week,
  pr.notes,
  pr.created_at
FROM public.preferences pr
JOIN public.profiles p ON pr.profile_id = p.id
WHERE p.company_id = 'company-uuid'
  AND pr.status = 'pending'
ORDER BY pr.created_at;
```

### Approve/Reject Preferences
```sql
-- Approve
UPDATE public.preferences
SET status = 'approved'
WHERE id = 'preference-uuid';

-- Reject
UPDATE public.preferences
SET status = 'rejected'
WHERE id = 'preference-uuid';
```

## Swap Requests Management

### View Pending Swap Requests
```sql
SELECT 
  sr.id,
  s.start_time,
  s.end_time,
  p1.first_name || ' ' || p1.last_name as requester,
  p2.first_name || ' ' || p2.last_name as target,
  sr.created_at
FROM public.swap_requests sr
JOIN public.shifts s ON sr.shift_id = s.id
JOIN public.profiles p1 ON sr.requester_id = p1.id
LEFT JOIN public.profiles p2 ON sr.target_id = p2.id
WHERE sr.status = 'pending'
  AND s.company_id = 'company-uuid'
ORDER BY sr.created_at;
```

## RLS Policies

### List All Policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check If Policies Are Enabled
```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Helper Functions

### Use Helper Functions
```sql
-- Get current user's role
SELECT get_user_role(auth.uid());

-- Get current user's company
SELECT get_user_company(auth.uid());

-- Check if current user is a manager
SELECT is_manager(auth.uid());

-- Check if current user is a system admin
SELECT is_system_admin(auth.uid());

-- Check if two users are in the same company
SELECT same_company('user-uuid-1', 'user-uuid-2');
```

## Performance Queries

### View Table Sizes
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Find Slow Queries (if pg_stat_statements is enabled)
```sql
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Maintenance

### Update Statistics
```sql
ANALYZE;
```

### Vacuum Tables
```sql
VACUUM ANALYZE public.shifts;
VACUUM ANALYZE public.profiles;
-- etc.
```

### Check for Missing Indexes
```sql
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;
```

## Backup and Restore

### Backup Single Table
```bash
# Using pg_dump
pg_dump -h db.ttgntuaffrondfxybxmi.supabase.co \
  -U postgres \
  -d postgres \
  -t public.shifts \
  > shifts_backup.sql
```

### Restore Single Table
```bash
psql -h db.ttgntuaffrondfxybxmi.supabase.co \
  -U postgres \
  -d postgres \
  < shifts_backup.sql
```

## Tips

### Date/Time Queries
```sql
-- Today's shifts
WHERE DATE(start_time) = CURRENT_DATE

-- This week's shifts
WHERE start_time >= date_trunc('week', CURRENT_DATE)
  AND start_time < date_trunc('week', CURRENT_DATE) + interval '1 week'

-- This month's shifts
WHERE start_time >= date_trunc('month', CURRENT_DATE)
  AND start_time < date_trunc('month', CURRENT_DATE) + interval '1 month'

-- Shifts in the next 7 days
WHERE start_time BETWEEN NOW() AND NOW() + interval '7 days'
```

### JSON Queries (for company settings)
```sql
-- Get companies with specific timezone
SELECT id, name, settings->>'timezone' as timezone
FROM public.companies
WHERE settings->>'timezone' = 'America/New_York';

-- Update company settings
UPDATE public.companies
SET settings = jsonb_set(
  settings, 
  '{timezone}', 
  '"America/Los_Angeles"'
)
WHERE id = 'company-uuid';
```

### Array Queries (for preferred_days)
```sql
-- Find preferences that include Monday
SELECT * FROM public.preferences
WHERE 'Monday' = ANY(preferred_days);

-- Find preferences with at least 3 preferred days
SELECT * FROM public.preferences
WHERE array_length(preferred_days, 1) >= 3;
```

## Additional Resources

- [Full Database Documentation](../docs/DATABASE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Supabase Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
