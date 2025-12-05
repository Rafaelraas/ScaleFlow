# ScaleFlow Database Deployment Guide

This guide provides step-by-step instructions for deploying the ScaleFlow database schema to Supabase.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Methods](#deployment-methods)
3. [Method 1: Supabase Dashboard (Recommended for Quick Start)](#method-1-supabase-dashboard)
4. [Method 2: Supabase CLI](#method-2-supabase-cli)
5. [Method 3: Direct PostgreSQL Connection](#method-3-direct-postgresql-connection)
6. [Verification](#verification)
7. [Post-Deployment](#post-deployment)
8. [Rollback](#rollback)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Access to the Supabase project: `ttgntuaffrondfxybxmi`
- Project credentials (available in Supabase Dashboard > Settings > Database)
- For CLI method: Supabase CLI installed (`npm install -g supabase`)

## Deployment Methods

Choose one of the following methods based on your preference and environment.

---

## Method 1: Supabase Dashboard

**Best for:** Quick deployments, first-time setup, or when you don't have CLI access.

### Steps:

1. **Navigate to SQL Editor**
   - Go to https://supabase.com/dashboard/project/ttgntuaffrondfxybxmi
   - Click on "SQL Editor" in the left sidebar

2. **Run Migration 1: Initial Schema**
   - Open `supabase/migrations/20241205000001_initial_schema.sql`
   - Copy all content
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl/Cmd + Enter)
   - Wait for "Success" message
   - Verify: You should see "Query executed successfully"

3. **Run Migration 2: Indexes**
   - Open `supabase/migrations/20241205000002_indexes.sql`
   - Copy all content
   - Paste into the SQL Editor
   - Click "Run"
   - Wait for "Success" message

4. **Run Migration 3: Functions and Triggers**
   - Open `supabase/migrations/20241205000003_functions_triggers.sql`
   - Copy all content
   - Paste into the SQL Editor
   - Click "Run"
   - Wait for "Success" message

5. **Run Migration 4: RLS Policies**
   - Open `supabase/migrations/20241205000004_rls_policies.sql`
   - Copy all content
   - Paste into the SQL Editor
   - Click "Run"
   - Wait for "Success" message

6. **Verify Deployment**
   - See [Verification](#verification) section below

**Estimated Time:** 5-10 minutes

---

## Method 2: Supabase CLI

**Best for:** Automated deployments, local development, or CI/CD pipelines.

### Setup:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Navigate to project root
cd /path/to/ScaleFlow

# Link to your Supabase project
supabase link --project-ref ttgntuaffrondfxybxmi
```

You'll be prompted for your database password. Find it in:
- Supabase Dashboard > Settings > Database > Connection string

### Deploy:

```bash
# Deploy all migrations
supabase db push

# Or use the provided deployment script
chmod +x supabase/deploy.sh
./supabase/deploy.sh production
```

The script will:
- Check if CLI is installed
- Confirm you want to deploy to production
- Link to the project
- Push all migrations
- Verify the deployment
- Display summary of tables and RLS status

**Estimated Time:** 2-5 minutes

---

## Method 3: Direct PostgreSQL Connection

**Best for:** Direct database access, advanced users, or when other methods fail.

### Get Connection Details:

1. Go to Supabase Dashboard > Settings > Database
2. Find "Connection string" section
3. Use the "Direct connection" or "Connection pooling" string

### Deploy:

```bash
# Using psql command line
psql "postgresql://postgres:[PASSWORD]@db.ttgntuaffrondfxybxmi.supabase.co:5432/postgres" \
  -f supabase/migrations/20241205000001_initial_schema.sql \
  -f supabase/migrations/20241205000002_indexes.sql \
  -f supabase/migrations/20241205000003_functions_triggers.sql \
  -f supabase/migrations/20241205000004_rls_policies.sql
```

Replace `[PASSWORD]` with your actual database password.

**Estimated Time:** 2-5 minutes

---

## Verification

After deployment, verify the database is correctly set up:

### 1. Check Tables

Run this query in SQL Editor:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Expected Result:**
```
companies
preferences
profiles
roles
shift_templates
shifts
swap_requests
```

### 2. Check RLS Status

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Expected Result:** All tables should have `rowsecurity = true`

### 3. Check Indexes

```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname
LIMIT 20;
```

**Expected Result:** Should see multiple indexes starting with `idx_`

### 4. Check Functions

```sql
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**Expected Result:**
```
get_user_company
get_user_role
handle_new_user
is_manager
is_system_admin
same_company
update_updated_at_column
```

### 5. Check Roles

```sql
SELECT name, description FROM public.roles ORDER BY name;
```

**Expected Result:**
```
employee    | Personal access with schedule viewing...
manager     | Company-level access with employee and...
system_admin| Full platform access with company and...
```

### 6. Test RLS Policies

Try to query a table (should work):

```sql
SELECT COUNT(*) FROM public.profiles;
```

If you're not authenticated, this should return 0 or an error (which is correct behavior).

---

## Post-Deployment

### 1. Update Environment Variables

Ensure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://ttgntuaffrondfxybxmi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Test Application

1. Start the application:
   ```bash
   npm run dev
   ```

2. Test key features:
   - User authentication (sign up, sign in)
   - Profile creation
   - Company creation (as manager)
   - Shift creation and viewing
   - Employee management

### 3. Create Test Data (Optional)

For development/testing, you can create sample data:

```sql
-- Create a test company
INSERT INTO public.companies (name, settings) 
VALUES ('Test Company', '{"timezone": "America/New_York"}')
RETURNING id;

-- Note the company ID and use it below
-- Create test profiles (requires authenticated users first)
-- This is best done through the application UI
```

### 4. Monitor Performance

- Check Supabase Dashboard > Database > Query Performance
- Monitor slow queries
- Review connection pool usage

---

## Rollback

If you need to rollback the deployment:

### Complete Rollback (Nuclear Option)

**⚠️ WARNING: This will delete all data!**

```sql
-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS public.swap_requests CASCADE;
DROP TABLE IF EXISTS public.preferences CASCADE;
DROP TABLE IF EXISTS public.shift_templates CASCADE;
DROP TABLE IF EXISTS public.shifts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.get_user_company(UUID);
DROP FUNCTION IF EXISTS public.is_manager(UUID);
DROP FUNCTION IF EXISTS public.is_system_admin(UUID);
DROP FUNCTION IF EXISTS public.same_company(UUID, UUID);
```

### Partial Rollback

To only remove certain components (e.g., just RLS policies):

```sql
-- Disable RLS on all tables
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Or drop specific policies
DROP POLICY IF EXISTS "policy_name" ON public.table_name;
```

---

## Troubleshooting

### Common Issues

#### 1. "Extension uuid-ossp does not exist"

**Solution:** Enable the extension manually:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### 2. "Permission denied for schema public"

**Solution:** You may need to grant permissions:
```sql
GRANT ALL ON SCHEMA public TO postgres;
```

#### 3. "Relation already exists"

**Solution:** The migration uses `IF NOT EXISTS`, so this is usually safe to ignore. If needed, drop the existing object first.

#### 4. "Foreign key constraint violation"

**Solution:** Ensure migrations are run in the correct order (001, 002, 003, 004).

#### 5. RLS Policies Blocking Queries

**Solution:** Check if you're authenticated and have the right role:
```sql
-- Check current user
SELECT auth.uid();

-- Check user role
SELECT get_user_role(auth.uid());
```

### Getting Help

If you encounter issues:

1. Check Supabase logs: Dashboard > Logs
2. Review the [Supabase Documentation](https://supabase.com/docs)
3. Check PostgreSQL version compatibility (should be 15+)
4. Review the DATABASE.md for schema details

---

## Success Checklist

Before considering deployment complete:

- [ ] All 4 migration files ran successfully
- [ ] All 7 tables created
- [ ] RLS enabled on all tables
- [ ] All indexes created
- [ ] All functions created
- [ ] All triggers created
- [ ] Default roles inserted (system_admin, manager, employee)
- [ ] Application can connect to database
- [ ] User authentication works
- [ ] Test user can create a company
- [ ] Test manager can create shifts
- [ ] Test employee can view their shifts

---

## Next Steps

After successful deployment:

1. **Documentation**: Update any project-specific documentation
2. **Backup**: Set up automated backups in Supabase Dashboard
3. **Monitoring**: Set up alerts for database errors
4. **Testing**: Run through all application features
5. **Team Access**: Grant appropriate access to team members
6. **Production**: When ready, deploy application to production

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [ScaleFlow DATABASE.md](../docs/DATABASE.md)
- [ScaleFlow Architecture](../docs/ARCHITECTURE.md)
