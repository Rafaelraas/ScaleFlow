# ScaleFlow Database Migrations

This directory contains SQL migration files for the ScaleFlow database schema.

## Migration Files

Migrations are numbered sequentially and should be run in order:

1. **20241205000001_initial_schema.sql** - Creates all tables and relationships
2. **20241205000002_indexes.sql** - Creates performance indexes
3. **20241205000003_functions_triggers.sql** - Creates database functions and triggers
4. **20241205000004_rls_policies.sql** - Implements Row Level Security policies

## Database Schema

The ScaleFlow database consists of the following tables:

### Core Tables
- **roles** - System roles (system_admin, manager, employee)
- **companies** - Organization information
- **profiles** - User profiles linked to Supabase Auth

### Scheduling Tables
- **shifts** - Work shifts assigned to employees
- **shift_templates** - Reusable shift templates
- **preferences** - Employee availability preferences
- **swap_requests** - Shift swap requests between employees

## Deployment to Supabase

### Using Supabase Dashboard (Web UI)

1. Go to your project at https://supabase.com/dashboard/project/ttgntuaffrondfxybxmi
2. Navigate to the SQL Editor
3. Run each migration file in order:
   - Copy the contents of `20241205000001_initial_schema.sql`
   - Paste into SQL Editor and click "Run"
   - Repeat for each migration file in sequence

### Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link your project
supabase link --project-ref ttgntuaffrondfxybxmi

# Run all migrations
supabase db push
```

### Manual Deployment

You can also deploy migrations manually using any PostgreSQL client:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.ttgntuaffrondfxybxmi.supabase.co:5432/postgres" \
  -f supabase/migrations/20241205000001_initial_schema.sql \
  -f supabase/migrations/20241205000002_indexes.sql \
  -f supabase/migrations/20241205000003_functions_triggers.sql \
  -f supabase/migrations/20241205000004_rls_policies.sql
```

## Verifying Deployment

After running the migrations, verify the schema:

```sql
-- Check all tables exist
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Verify functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

## Schema Changes

If you need to make changes to the database schema:

1. Create a new migration file with a timestamp: `YYYYMMDDHHMMSS_description.sql`
2. Write the migration SQL (using `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE`, etc.)
3. Test the migration locally if possible
4. Deploy to production following the steps above
5. Update the DATABASE.md documentation

## Rollback Strategy

These migrations use `IF NOT EXISTS` and `DROP ... IF EXISTS` to be idempotent (safe to run multiple times). However, for production:

1. Always backup your database before running migrations
2. Test migrations in a development/staging environment first
3. Keep migration files in version control
4. Document any manual steps required

## Security Notes

- All tables have Row Level Security (RLS) enabled
- RLS policies enforce company-level data isolation
- Users can only access data for their company
- Managers have elevated permissions within their company
- System admins have full access across all companies

## Performance Considerations

The migrations include:
- Composite indexes for common query patterns
- Partial indexes for frequently filtered queries
- Check constraints for data validation
- Automatic timestamp updates via triggers

## Troubleshooting

If migrations fail:

1. Check the error message for the specific SQL causing issues
2. Verify you have the necessary permissions
3. Check if tables/functions already exist (migrations are idempotent)
4. Ensure migrations are run in the correct order
5. Check the Supabase logs for detailed error information

For help, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Project DATABASE.md for schema details
