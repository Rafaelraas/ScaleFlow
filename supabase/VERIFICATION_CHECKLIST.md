# Database Migration Verification Checklist

Use this checklist to verify that the database migrations were deployed successfully and the application is working correctly.

## Pre-Deployment Verification

### 1. Migration Files Review
- [x] Initial schema file exists (20241205000001_initial_schema.sql)
- [x] Indexes file exists (20241205000002_indexes.sql)
- [x] Functions/triggers file exists (20241205000003_functions_triggers.sql)
- [x] RLS policies file exists (20241205000004_rls_policies.sql)
- [x] All migration files have valid SQL syntax
- [x] Migration files are numbered sequentially

### 2. Schema Alignment Check
- [x] Table names match between migration and application code
  - [x] roles
  - [x] companies
  - [x] profiles
  - [x] shifts
  - [x] shift_templates
  - [x] preferences
  - [x] swap_requests
- [x] Column names match for critical tables:
  - [x] shifts: employee_id, role_id, notes, published, start_time, end_time
  - [x] shift_templates: duration_hours, default_start_time, default_role_id, default_notes
  - [x] profiles: first_name, last_name, avatar_url, company_id, role_id
- [x] Application builds successfully

### 3. Documentation Review
- [x] DATABASE.md updated to reflect actual schema
- [x] DEPLOYMENT_GUIDE.md created with deployment instructions
- [x] MIGRATION_SUMMARY.md created with overview
- [x] QUICK_REFERENCE.md created with common queries
- [x] README.md created in supabase directory

---

## Post-Deployment Verification

### 1. Database Structure

Run these queries in Supabase SQL Editor:

#### Check Tables
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```
**Expected count:** 7 tables

**Expected tables:**
- [ ] companies
- [ ] preferences
- [ ] profiles
- [ ] roles
- [ ] shift_templates
- [ ] shifts
- [ ] swap_requests

#### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```
**Expected:** All tables should have `rowsecurity = true`

- [ ] All 7 tables have RLS enabled

#### Check Indexes
```sql
SELECT COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public';
```
**Expected:** At least 20+ indexes

- [ ] Indexes created (count: _______)

#### Check Functions
```sql
SELECT routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```
**Expected functions:**
- [ ] get_user_company
- [ ] get_user_role
- [ ] handle_new_user
- [ ] is_manager
- [ ] is_system_admin
- [ ] same_company
- [ ] update_updated_at_column

#### Check Triggers
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```
**Expected triggers on:**
- [ ] companies (update_companies_updated_at)
- [ ] profiles (update_profiles_updated_at)
- [ ] shifts (update_shifts_updated_at)
- [ ] shift_templates (update_shift_templates_updated_at)
- [ ] preferences (update_preferences_updated_at)
- [ ] swap_requests (update_swap_requests_updated_at)
- [ ] auth.users (on_auth_user_created)

#### Check Default Roles
```sql
SELECT name, description FROM public.roles ORDER BY name;
```
**Expected roles:**
- [ ] employee
- [ ] manager
- [ ] system_admin

### 2. RLS Policies

#### List All Policies
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
**Expected:** 20-30 policies across all tables

- [ ] Policies created (count: _______)

#### Test Policy Effectiveness
```sql
-- This should work (roles table is readable by all)
SELECT COUNT(*) FROM public.roles;
```
- [ ] Roles table accessible

```sql
-- This should return 0 or error (if not authenticated)
SELECT COUNT(*) FROM public.profiles;
```
- [ ] Profiles table protected by RLS

### 3. Data Integrity

#### Check Foreign Keys
```sql
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema='public'
ORDER BY tc.table_name;
```
**Expected:** Foreign keys for all relationships

- [ ] Foreign keys created

#### Check Constraints
```sql
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND contype = 'c'
ORDER BY conrelid::regclass::text;
```
**Expected constraints:**
- [ ] check_shift_times (end_time > start_time)
- [ ] check_preference_dates (available_to >= available_from)
- [ ] check_max_hours (max_hours_week validation)
- [ ] check_duration_positive (duration_hours > 0)
- [ ] check_duration_reasonable (duration_hours <= 24)
- [ ] check_preference_status (status IN (...))
- [ ] check_swap_status (status IN (...))

---

## Application Integration Testing

### 1. Authentication
- [ ] User can sign up (new account creation)
- [ ] Profile automatically created on signup
- [ ] User can sign in
- [ ] User can sign out
- [ ] Password reset works

### 2. Profile Management
- [ ] User can view their own profile
- [ ] User can update their profile (first_name, last_name)
- [ ] Profile changes persist after page reload

### 3. Company Management (as Manager)
- [ ] Manager can create a company
- [ ] Manager can update company settings
- [ ] Company information persists
- [ ] Non-managers cannot create companies

### 4. Employee Management (as Manager)
- [ ] Manager can view all employees in their company
- [ ] Manager can add employees to company
- [ ] Manager can update employee roles
- [ ] Manager can remove employees
- [ ] Manager cannot see employees from other companies

### 5. Shift Management (as Manager)
- [ ] Manager can create new shifts
- [ ] Manager can assign employees to shifts
- [ ] Manager can assign roles to shifts
- [ ] Manager can set shift as published/unpublished
- [ ] Manager can edit existing shifts
- [ ] Manager can delete shifts
- [ ] Shifts can be filtered by employee, role, date, published status

### 6. Shift Templates (as Manager)
- [ ] Manager can create shift templates
- [ ] Manager can edit shift templates
- [ ] Manager can delete shift templates
- [ ] Templates can be applied when creating shifts
- [ ] Template values correctly populate shift form

### 7. Employee Shift Viewing
- [ ] Employee can view their own shifts
- [ ] Employee can only see published shifts
- [ ] Employee cannot see unpublished shifts
- [ ] Employee cannot see other employees' shifts
- [ ] Employee cannot edit shifts
- [ ] Shifts display with correct dates and times

### 8. Preferences Management (as Employee)
- [ ] Employee can create availability preferences
- [ ] Employee can view their preferences
- [ ] Employee can edit their preferences
- [ ] Manager can view employee preferences
- [ ] Manager can approve/reject preferences

### 9. Swap Requests (as Employee)
- [ ] Employee can request to swap shifts
- [ ] Employee can view their swap requests
- [ ] Manager can view all swap requests
- [ ] Manager can approve/reject swap requests
- [ ] Swap request status updates correctly

### 10. Data Isolation
- [ ] Users in Company A cannot see data from Company B
- [ ] Employees cannot see unpublished shifts
- [ ] Employees cannot modify manager-only data
- [ ] Managers can only manage their own company

---

## Performance Testing

### 1. Query Performance
- [ ] Shift queries with date filters are fast (< 500ms)
- [ ] Employee list loads quickly (< 500ms)
- [ ] Dashboard loads quickly (< 1s)
- [ ] Pagination works smoothly

### 2. Index Verification
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE
SELECT * FROM public.shifts 
WHERE company_id = 'some-uuid' 
AND published = true
ORDER BY start_time;
```
- [ ] Query uses idx_shifts_company_published or similar
- [ ] No sequential scans on large tables

---

## Security Testing

### 1. RLS Policy Testing
Test with different user roles:

**As Employee:**
- [ ] Cannot query other company's data
- [ ] Cannot see unpublished shifts
- [ ] Cannot modify manager-level data
- [ ] Can view own profile and shifts

**As Manager:**
- [ ] Can query all company data
- [ ] Can modify company data
- [ ] Cannot query other company's data
- [ ] Cannot access system admin functions

**As System Admin:**
- [ ] Can query all companies
- [ ] Can manage all profiles
- [ ] Has elevated privileges

### 2. SQL Injection Prevention
- [ ] Application uses parameterized queries
- [ ] Supabase client library handles escaping
- [ ] No raw SQL string concatenation in application code

---

## Rollback Readiness

### 1. Backup Created
- [ ] Database backup taken before deployment
- [ ] Backup verified and downloadable
- [ ] Backup retention policy configured

### 2. Rollback Plan
- [ ] Rollback SQL script prepared (if needed)
- [ ] Team knows rollback procedure
- [ ] Rollback can be executed quickly

---

## Documentation

### 1. Documentation Complete
- [ ] DATABASE.md reflects actual schema
- [ ] All table descriptions accurate
- [ ] All column descriptions accurate
- [ ] RLS policies documented
- [ ] Helper functions documented

### 2. Team Training
- [ ] Team knows how to query database
- [ ] Team knows RLS policy structure
- [ ] Team knows how to deploy changes
- [ ] Team has access to documentation

---

## Production Readiness

### 1. Monitoring Setup
- [ ] Supabase alerts configured
- [ ] Database performance monitoring enabled
- [ ] Error logging configured
- [ ] Slow query alerts set up

### 2. Maintenance Plan
- [ ] Backup schedule configured
- [ ] Maintenance windows defined
- [ ] Update procedure documented
- [ ] Support contacts identified

### 3. Final Checks
- [ ] All checklist items completed
- [ ] No critical errors in logs
- [ ] Application performs well under load
- [ ] Security scan passed
- [ ] Team sign-off obtained

---

## Sign-Off

**Deployed by:** ___________________  
**Date:** ___________________  
**Environment:** Production / Staging / Development  
**Database Version:** ___________________  
**Application Version:** ___________________  

**Issues Found:** (List any issues and their resolution)
- None / List issues here

**Notes:**




**Approved by:**
- [ ] Technical Lead: ___________________
- [ ] Product Manager: ___________________
- [ ] DevOps: ___________________

---

## Next Steps After Verification

1. **Monitor Performance**
   - Watch Supabase Dashboard for the first 24 hours
   - Check for slow queries
   - Monitor connection pool usage

2. **Gather Feedback**
   - Get user feedback on performance
   - Check for any data access issues
   - Verify all features work as expected

3. **Document Issues**
   - Log any issues found
   - Create tickets for improvements
   - Update documentation with learnings

4. **Plan Optimizations**
   - Review query performance
   - Identify optimization opportunities
   - Schedule maintenance windows

---

**Last Updated:** December 5, 2024
