# Database Schema Documentation

## Overview

ScaleFlow uses PostgreSQL through Supabase as its database. This document describes the database schema, relationships, and Row-Level Security (RLS) policies.

> **📦 Ready-to-Deploy Migrations Available!**
> 
> Complete SQL migration files are available in the `/supabase/migrations/` directory. See:
> - [Migration Summary](../supabase/MIGRATION_SUMMARY.md) - Overview of all migrations
> - [Deployment Guide](../supabase/DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions
> - [Quick Reference](../supabase/QUICK_REFERENCE.md) - Common queries and operations

## Entity Relationship Diagram

```
┌──────────────────┐
│      roles       │
│──────────────────│
│ id (PK)          │
│ name             │
│ description      │
└──────────────────┘
         │
         │ role_id (FK)
         ▼
┌──────────────────┐         ┌──────────────────┐
│    profiles      │◄────────│    companies     │
│──────────────────│         │──────────────────│
│ id (PK)          │         │ id (PK)          │
│ first_name       │         │ name             │
│ last_name        │         │ created_at       │
│ avatar_url       │         │ settings         │
│ company_id (FK)  ├────────►│ updated_at       │
│ role_id (FK)     │         └──────────────────┘
│ created_at       │
│ updated_at       │
└──────────────────┘
         │
         │ employee_id (FK)
         ▼
┌──────────────────┐         ┌──────────────────────┐
│     shifts       │         │  shift_templates     │
│──────────────────│         │──────────────────────│
│ id (PK)          │         │ id (PK)              │
│ company_id (FK)  │         │ company_id (FK)      │
│ employee_id (FK) │         │ name                 │
│ role_id (FK)     │         │ duration_hours       │
│ start_time       │         │ default_start_time   │
│ end_time         │         │ default_role_id (FK) │
│ notes            │         │ default_notes        │
│ published        │         │ created_at           │
│ created_at       │         │ updated_at           │
│ updated_at       │         └──────────────────────┘
└──────────────────┘
         │
         │ shift_id (FK)
         ▼
┌──────────────────┐         ┌──────────────────┐
│  swap_requests   │         │   preferences    │
│──────────────────│         │──────────────────│
│ id (PK)          │         │ id (PK)          │
│ shift_id (FK)    │         │ profile_id (FK)  │
│ requester_id (FK)│         │ available_from   │
│ target_id (FK)   │         │ available_to     │
│ status           │         │ preferred_days   │
│ created_at       │         │ max_hours_week   │
│ updated_at       │         │ notes            │
│ resolved_at      │         │ status           │
│ resolved_by (FK) │         │ created_at       │
└──────────────────┘         │ updated_at       │
         ▲                    └──────────────────┘
         │                             ▲
         │                             │ profile_id (FK)
         └─────────────────────────────┘
```

## Table Definitions

### `roles`

Defines the available user roles in the system.

| Column      | Type    | Constraints | Description |
|-------------|---------|-------------|-------------|
| id          | uuid    | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique role identifier |
| name        | text    | NOT NULL, UNIQUE | Role name (system_admin, manager, employee) |
| description | text    | | Role description |

**Sample Data:**
```sql
INSERT INTO roles (name, description) VALUES
  ('system_admin', 'Full platform access with company and user management'),
  ('manager', 'Company-level access with employee and schedule management'),
  ('employee', 'Personal access with schedule viewing and preference submission');
```

### `companies`

Stores company/organization information.

| Column      | Type      | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | uuid      | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique company identifier |
| name        | text      | NOT NULL | Company name |
| created_at  | timestamp | DEFAULT now() | Creation timestamp |
| settings    | jsonb     | DEFAULT '{}' | Company-specific settings |

**Settings JSON Structure:**
```json
{
  "timezone": "America/New_York",
  "workWeekStart": "Monday",
  "defaultShiftDuration": 8,
  "requireSwapApproval": true
}
```

### `profiles`

User profile information with role and company associations.

| Column      | Type      | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | uuid      | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase Auth |
| first_name  | text      | | User's first name |
| last_name   | text      | | User's last name |
| avatar_url  | text      | | URL to user's avatar image |
| company_id  | uuid      | REFERENCES companies(id) | Associated company |
| role_id     | uuid      | REFERENCES roles(id), NOT NULL | User role |
| created_at  | timestamp | DEFAULT now() | Creation timestamp |
| updated_at  | timestamp | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role_id ON profiles(role_id);
```

**Triggers:**
```sql
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### `shifts`

Scheduled work shifts assigned to employees.

| Column       | Type      | Constraints | Description |
|--------------|-----------|-------------|-------------|
| id           | uuid      | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique shift identifier |
| company_id   | uuid      | REFERENCES companies(id), NOT NULL | Associated company |
| employee_id  | uuid      | REFERENCES profiles(id) | Assigned employee (nullable for unassigned shifts) |
| role_id      | uuid      | REFERENCES roles(id) | Required role for this shift (optional) |
| start_time   | timestamp | NOT NULL | Shift start date/time |
| end_time     | timestamp | NOT NULL | Shift end date/time |
| notes        | text      | | Additional shift notes or instructions |
| published    | boolean   | DEFAULT false | Whether shift is visible to employees |
| created_at   | timestamp | DEFAULT now() | Creation timestamp |
| updated_at   | timestamp | DEFAULT now() | Last update timestamp |

**Published Field:**
- `false` - Shift is in draft mode, only visible to managers
- `true` - Shift is published and visible to assigned employees

**Indexes:**
```sql
CREATE INDEX idx_shifts_company_id ON shifts(company_id);
CREATE INDEX idx_shifts_employee_id ON shifts(employee_id);
CREATE INDEX idx_shifts_role_id ON shifts(role_id);
CREATE INDEX idx_shifts_start_time ON shifts(start_time);
CREATE INDEX idx_shifts_published ON shifts(published);
CREATE INDEX idx_shifts_company_date ON shifts(company_id, start_time);
CREATE INDEX idx_shifts_employee_date ON shifts(employee_id, start_time);
CREATE INDEX idx_shifts_company_published ON shifts(company_id, published);
CREATE INDEX idx_shifts_published_employee ON shifts(employee_id, start_time) WHERE published = true;
```

**Constraints:**
```sql
ALTER TABLE shifts ADD CONSTRAINT check_shift_times
  CHECK (end_time > start_time);
```

### `shift_templates`

Reusable templates for common shift patterns.

| Column             | Type      | Constraints | Description |
|--------------------|-----------|-------------|-------------|
| id                 | uuid      | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique template identifier |
| company_id         | uuid      | REFERENCES companies(id), NOT NULL | Associated company |
| name               | text      | NOT NULL | Template name |
| duration_hours     | integer   | NOT NULL, CHECK (> 0 AND <= 24) | Length of shift in hours |
| default_start_time | text      | NOT NULL | Default start time in HH:MM format (e.g., '09:00') |
| default_role_id    | uuid      | REFERENCES roles(id) | Default role for shifts created from this template |
| default_notes      | text      | | Default notes for shifts created from this template |
| created_at         | timestamp | DEFAULT now() | Creation timestamp |
| updated_at         | timestamp | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_shift_templates_company_id ON shift_templates(company_id);
CREATE INDEX idx_shift_templates_role_id ON shift_templates(default_role_id);
```

**Example Usage:**
```sql
-- Morning shift template: 8 hours starting at 09:00
INSERT INTO shift_templates (company_id, name, duration_hours, default_start_time, default_role_id)
VALUES ('...', 'Morning Shift', 8, '09:00', '...');

-- Evening shift template: 6 hours starting at 17:00
INSERT INTO shift_templates (company_id, name, duration_hours, default_start_time, default_role_id)
VALUES ('...', 'Evening Shift', 6, '17:00', '...');
```

### `preferences`

Employee availability and work preferences.

| Column          | Type      | Constraints | Description |
|-----------------|-----------|-------------|-------------|
| id              | uuid      | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique preference identifier |
| profile_id      | uuid      | REFERENCES profiles(id), NOT NULL | Employee profile |
| available_from  | date      | | Available from date |
| available_to    | date      | | Available until date |
| preferred_days  | text[]    | | Array of preferred work days |
| max_hours_week  | integer   | | Maximum hours per week |
| notes           | text      | | Additional notes/requests |
| status          | text      | DEFAULT 'pending' | Approval status |
| created_at      | timestamp | DEFAULT now() | Creation timestamp |
| updated_at      | timestamp | DEFAULT now() | Last update timestamp |

**Status Values:**
- `pending` - Awaiting manager review
- `approved` - Approved by manager
- `rejected` - Rejected by manager

**Preferred Days Format:**
```sql
-- Example: Array of day names
preferred_days = ARRAY['Monday', 'Tuesday', 'Wednesday', 'Friday']
```

**Indexes:**
```sql
CREATE INDEX idx_preferences_profile_id ON preferences(profile_id);
CREATE INDEX idx_preferences_status ON preferences(status);
```

### `swap_requests`

Shift swap requests between employees.

| Column       | Type      | Constraints | Description |
|--------------|-----------|-------------|-------------|
| id           | uuid      | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique request identifier |
| shift_id     | uuid      | REFERENCES shifts(id), NOT NULL | Shift to be swapped |
| requester_id | uuid      | REFERENCES profiles(id), NOT NULL | Employee requesting swap |
| target_id    | uuid      | REFERENCES profiles(id) | Employee to swap with (optional) |
| status       | text      | DEFAULT 'pending' | Request status |
| created_at   | timestamp | DEFAULT now() | Creation timestamp |
| updated_at   | timestamp | DEFAULT now() | Last update timestamp |
| resolved_at  | timestamp | | Resolution timestamp |
| resolved_by  | uuid      | REFERENCES profiles(id) | Manager who resolved request |

**Status Values:**
- `pending` - Awaiting approval
- `approved` - Approved and executed
- `rejected` - Rejected by manager
- `cancelled` - Cancelled by requester

**Indexes:**
```sql
CREATE INDEX idx_swap_requests_shift_id ON swap_requests(shift_id);
CREATE INDEX idx_swap_requests_requester_id ON swap_requests(requester_id);
CREATE INDEX idx_swap_requests_status ON swap_requests(status);
```

## Row-Level Security (RLS)

All tables have RLS enabled. Below are the key policies:

### `profiles` Policies

```sql
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Managers can view profiles in their company
CREATE POLICY "profiles_select_company_managers" ON profiles
  FOR SELECT USING (
    company_id IN (
      SELECT p.company_id 
      FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can update profiles in their company
CREATE POLICY "profiles_update_company_managers" ON profiles
  FOR UPDATE USING (
    company_id IN (
      SELECT p.company_id 
      FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- System admins can do everything with profiles
CREATE POLICY "profiles_all_system_admin" ON profiles
  FOR ALL USING (is_system_admin(auth.uid()));
```

### `companies` Policies

```sql
-- Users can view their own company
CREATE POLICY "users_view_own_company" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Managers can update their company
CREATE POLICY "managers_update_company" ON companies
  FOR UPDATE USING (
    id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() 
      AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
    )
  );

-- System admins can view all companies
CREATE POLICY "admins_view_all_companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id IN (SELECT id FROM roles WHERE name = 'system_admin')
    )
  );
```

### `shifts` Policies

```sql
-- Employees can view their published shifts
CREATE POLICY "shifts_select_own_published" ON shifts
  FOR SELECT USING (
    employee_id = auth.uid() AND published = true
  );

-- Managers can view all shifts in their company
CREATE POLICY "shifts_select_company_managers" ON shifts
  FOR SELECT USING (
    company_id IN (
      SELECT p.company_id 
      FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can insert shifts in their company
CREATE POLICY "shifts_insert_managers" ON shifts
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT p.company_id 
      FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can update shifts in their company
CREATE POLICY "shifts_update_managers" ON shifts
  FOR UPDATE USING (
    company_id IN (
      SELECT p.company_id 
      FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can delete shifts in their company
CREATE POLICY "shifts_delete_managers" ON shifts
  FOR DELETE USING (
    company_id IN (
      SELECT p.company_id 
      FROM profiles p
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );
```

### `preferences` Policies

```sql
-- Employees can create their own preferences
CREATE POLICY "employees_create_preferences" ON preferences
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Employees can view and update their own preferences
CREATE POLICY "employees_manage_own_preferences" ON preferences
  FOR ALL USING (profile_id = auth.uid());

-- Managers can view preferences of their company's employees
CREATE POLICY "managers_view_company_preferences" ON preferences
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE company_id IN (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid() 
        AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
      )
    )
  );

-- Managers can update preference status (approve/reject)
CREATE POLICY "managers_update_preference_status" ON preferences
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE company_id IN (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid() 
        AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
      )
    )
  );
```

### `swap_requests` Policies

```sql
-- Employees can create swap requests for their shifts
CREATE POLICY "employees_create_swap_requests" ON swap_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Employees can view swap requests they're involved in
CREATE POLICY "employees_view_own_swap_requests" ON swap_requests
  FOR SELECT USING (
    requester_id = auth.uid() OR target_id = auth.uid()
  );

-- Managers can view all swap requests in their company
CREATE POLICY "managers_view_company_swap_requests" ON swap_requests
  FOR SELECT USING (
    shift_id IN (
      SELECT id FROM shifts 
      WHERE company_id IN (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid() 
        AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
      )
    )
  );

-- Managers can update swap request status
CREATE POLICY "managers_update_swap_requests" ON swap_requests
  FOR UPDATE USING (
    shift_id IN (
      SELECT id FROM shifts 
      WHERE company_id IN (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid() 
        AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
      )
    )
  );
```

## Database Functions

### `update_updated_at_column()`

Automatically updates the `updated_at` timestamp on row updates.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied to tables:
- `companies`
- `profiles`
- `shifts`
- `shift_templates`
- `preferences`
- `swap_requests`

### `handle_new_user()`

Automatically creates a profile when a new user signs up via Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Helper Functions

**`get_user_role(user_id UUID)`** - Returns the role name for a user
```sql
SELECT get_user_role(auth.uid());
-- Returns: 'manager', 'employee', 'system_admin', or NULL
```

**`get_user_company(user_id UUID)`** - Returns the company ID for a user
```sql
SELECT get_user_company(auth.uid());
```

**`is_manager(user_id UUID)`** - Checks if user has manager role
```sql
SELECT is_manager(auth.uid());
-- Returns: true or false
```

**`is_system_admin(user_id UUID)`** - Checks if user has system_admin role
```sql
SELECT is_system_admin(auth.uid());
-- Returns: true or false
```

**`same_company(user_id1 UUID, user_id2 UUID)`** - Checks if two users are in the same company
```sql
SELECT same_company(auth.uid(), 'other-user-id');
-- Returns: true or false
```

## Data Validation

### Application-Level Validation

Using Zod schemas in the frontend:

```typescript
// Example: Shift creation validation
const shiftSchema = z.object({
  start_time: z.date({
    required_error: "Start time is required.",
  }),
  end_time: z.date({
    required_error: "End time is required.",
  }),
  employee_id: z.string().uuid().nullable().optional(),
  role_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).optional(),
  published: z.boolean().default(false),
}).refine((data) => data.end_time > data.start_time, {
  message: 'End time must be after start time',
  path: ['end_time'],
});
```

### Database-Level Constraints

```sql
-- Ensure shift times are valid
ALTER TABLE shifts ADD CONSTRAINT check_shift_times
  CHECK (end_time > start_time);

-- Ensure preference dates are valid
ALTER TABLE preferences ADD CONSTRAINT check_preference_dates
  CHECK (available_to >= available_from);

-- Ensure max hours per week is reasonable
ALTER TABLE preferences ADD CONSTRAINT check_max_hours
  CHECK (max_hours_week > 0 AND max_hours_week <= 168);
```

## Performance Optimization

### Recommended Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_shifts_company_date ON shifts(company_id, start_time);
CREATE INDEX idx_shifts_employee_date ON shifts(employee_id, start_time);

-- Partial indexes for active records
CREATE INDEX idx_preferences_pending 
  ON preferences(profile_id, status) 
  WHERE status = 'pending';

CREATE INDEX idx_swap_requests_pending 
  ON swap_requests(shift_id, status) 
  WHERE status = 'pending';

-- Published shifts partial index
CREATE INDEX idx_shifts_published_employee 
  ON shifts(employee_id, start_time) 
  WHERE published = true;
```

### Query Optimization Tips

1. **Use pagination for large datasets:**
   ```typescript
   const { data } = await supabase
     .from('shifts')
     .select('*')
     .range(0, 9); // First 10 records
   ```

2. **Select only needed columns:**
   ```typescript
   const { data } = await supabase
     .from('profiles')
     .select('id, first_name, last_name')
     .eq('company_id', companyId);
   ```

3. **Use count for pagination:**
   ```typescript
   const { count } = await supabase
     .from('shifts')
     .select('*', { count: 'exact', head: true });
   ```

## Migration Strategy

For future schema changes:

1. Create migration files in a `supabase/migrations/` directory
2. Use Supabase CLI to apply migrations
3. Version migrations with timestamps
4. Test migrations in development before production

Example migration file structure:
```
supabase/
├── migrations/
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240102000000_add_shift_notes.sql
│   └── 20240103000000_add_preferences_table.sql
```

## Backup and Recovery

Supabase provides automated backups:
- Point-in-time recovery (PITR) for paid plans
- Daily automated backups
- Manual backup via pg_dump

## Monitoring and Maintenance

Recommended monitoring:
- Query performance (slow queries)
- Connection pool usage
- Table bloat and vacuum status
- Index usage statistics

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Check table sizes
SELECT tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Conclusion

This database schema provides a solid foundation for ScaleFlow's shift scheduling features with proper security, relationships, and performance optimizations. The RLS policies ensure data isolation between companies and role-appropriate access control.
