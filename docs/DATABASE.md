# Database Schema Documentation

## Overview

ScaleFlow uses PostgreSQL through Supabase as its database. This document describes the database schema, relationships, and Row-Level Security (RLS) policies.

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
│ company_id (FK)  ├────────►│                  │
│ role_id (FK)     │         └──────────────────┘
│ created_at       │
│ updated_at       │
└──────────────────┘
         │
         │ assigned_to (FK)
         │ created_by (FK)
         ▼
┌──────────────────┐         ┌──────────────────┐
│     shifts       │◄────────│ shift_templates  │
│──────────────────│         │──────────────────│
│ id (PK)          │         │ id (PK)          │
│ company_id (FK)  │         │ company_id (FK)  │
│ assigned_to (FK) │         │ name             │
│ start_time       │         │ description      │
│ end_time         │         │ default_start    │
│ title            │         │ default_end      │
│ description      │         │ created_at       │
│ location         │         │ updated_at       │
│ status           │         └──────────────────┘
│ created_by (FK)  │
│ created_at       │
│ updated_at       │
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
| assigned_to  | uuid      | REFERENCES profiles(id) | Assigned employee |
| start_time   | timestamp | NOT NULL | Shift start date/time |
| end_time     | timestamp | NOT NULL | Shift end date/time |
| title        | text      | NOT NULL | Shift title/name |
| description  | text      | | Shift description |
| location     | text      | | Work location |
| status       | text      | DEFAULT 'scheduled' | Shift status |
| created_by   | uuid      | REFERENCES profiles(id), NOT NULL | Manager who created shift |
| created_at   | timestamp | DEFAULT now() | Creation timestamp |
| updated_at   | timestamp | DEFAULT now() | Last update timestamp |

**Status Values:**
- `scheduled` - Shift is scheduled
- `in_progress` - Shift is currently active
- `completed` - Shift has been completed
- `cancelled` - Shift was cancelled

**Indexes:**
```sql
CREATE INDEX idx_shifts_company_id ON shifts(company_id);
CREATE INDEX idx_shifts_assigned_to ON shifts(assigned_to);
CREATE INDEX idx_shifts_start_time ON shifts(start_time);
CREATE INDEX idx_shifts_status ON shifts(status);
```

**Constraints:**
```sql
ALTER TABLE shifts ADD CONSTRAINT check_shift_times
  CHECK (end_time > start_time);
```

### `shift_templates`

Reusable templates for common shift patterns.

| Column        | Type      | Constraints | Description |
|---------------|-----------|-------------|-------------|
| id            | uuid      | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique template identifier |
| company_id    | uuid      | REFERENCES companies(id), NOT NULL | Associated company |
| name          | text      | NOT NULL | Template name |
| description   | text      | | Template description |
| default_start | time      | | Default start time (time only, no date) |
| default_end   | time      | | Default end time (time only, no date) |
| created_at    | timestamp | DEFAULT now() | Creation timestamp |
| updated_at    | timestamp | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_shift_templates_company_id ON shift_templates(company_id);
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
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Managers can view all profiles in their company
CREATE POLICY "managers_view_company_profiles" ON profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() 
      AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
    )
  );

-- System admins can view all profiles
CREATE POLICY "admins_view_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id IN (SELECT id FROM roles WHERE name = 'system_admin')
    )
  );
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
-- Employees can view shifts assigned to them
CREATE POLICY "employees_view_own_shifts" ON shifts
  FOR SELECT USING (assigned_to = auth.uid());

-- Managers can view all shifts in their company
CREATE POLICY "managers_view_company_shifts" ON shifts
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() 
      AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
    )
  );

-- Managers can create shifts in their company
CREATE POLICY "managers_create_shifts" ON shifts
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() 
      AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
    )
  );

-- Managers can update shifts in their company
CREATE POLICY "managers_update_shifts" ON shifts
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() 
      AND role_id IN (SELECT id FROM roles WHERE name = 'manager')
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
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied to tables:
- `profiles`
- `shifts`
- `shift_templates`
- `preferences`
- `swap_requests`

## Data Validation

### Application-Level Validation

Using Zod schemas in the frontend:

```typescript
// Example: Shift creation validation
const shiftSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  start_time: z.date(),
  end_time: z.date(),
  assigned_to: z.string().uuid().optional(),
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
CREATE INDEX idx_shifts_assigned_date ON shifts(assigned_to, start_time);

-- Partial indexes for active records
CREATE INDEX idx_active_preferences 
  ON preferences(profile_id, status) 
  WHERE status = 'pending';

CREATE INDEX idx_pending_swaps 
  ON swap_requests(shift_id) 
  WHERE status = 'pending';
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
