-- =====================================================
-- ScaleFlow Database - Add New Roles Migration
-- =====================================================
-- Adds new roles: operator, schedule_manager, and staff

-- Insert new roles
INSERT INTO public.roles (name, description) VALUES
  ('operator', 'Operations team member with access to operational tasks and reporting'),
  ('schedule_manager', 'Schedule management specialist with focus on shift planning and coordination'),
  ('staff', 'General staff member with basic access to personal schedules and preferences')
ON CONFLICT (name) DO NOTHING;

-- Add comment to explain role hierarchy
COMMENT ON TABLE public.roles IS 'System roles for access control:
- system_admin: Full platform access with company and user management
- manager: Company-level access with employee and schedule management
- schedule_manager: Schedule management specialist with focus on shift planning
- operator: Operations team member with operational access
- staff: General staff member with basic access
- employee: Personal access with schedule viewing and preference submission';
