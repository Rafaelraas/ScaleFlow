-- =====================================================
-- ScaleFlow Database - Unified Role-Based Access Control
-- =====================================================
-- This migration updates RLS policies to support all 6 roles:
-- - system_admin: Platform-wide access
-- - manager: Company-level full access
-- - schedule_manager: Schedule and shift management
-- - operator: Operational tasks and employee viewing
-- - staff: Basic employee with schedule access
-- - employee: Standard employee access
--
-- Permission Hierarchy:
-- system_admin > manager > schedule_manager > operator > staff/employee

-- =====================================================
-- HELPER FUNCTIONS FOR ROLE CHECKING
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_id AND r.name = role_name
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.has_role(UUID, TEXT) IS 'Returns true if the user has the specified role';

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(user_id UUID, role_names TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_id AND r.name = ANY(role_names)
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.has_any_role(UUID, TEXT[]) IS 'Returns true if the user has any of the specified roles';

-- Function to check if user can manage schedules (manager or schedule_manager)
CREATE OR REPLACE FUNCTION public.can_manage_schedules(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.has_any_role(user_id, ARRAY['manager', 'schedule_manager']);
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.can_manage_schedules(UUID) IS 'Returns true if user can manage schedules (manager or schedule_manager)';

-- Function to check if user can view employees (manager, schedule_manager, or operator)
CREATE OR REPLACE FUNCTION public.can_view_employees(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.has_any_role(user_id, ARRAY['manager', 'schedule_manager', 'operator']);
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.can_view_employees(UUID) IS 'Returns true if user can view employee information';

-- Function to check if user is a basic employee (employee or staff)
CREATE OR REPLACE FUNCTION public.is_basic_employee(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.has_any_role(user_id, ARRAY['employee', 'staff']);
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.is_basic_employee(UUID) IS 'Returns true if user is a basic employee (employee or staff role)';

-- =====================================================
-- UPDATE PROFILES TABLE POLICIES
-- =====================================================

-- Add policy for schedule managers to view profiles in their company
DROP POLICY IF EXISTS "profiles_select_schedule_managers" ON public.profiles;
CREATE POLICY "profiles_select_schedule_managers" ON public.profiles
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.can_manage_schedules(p.id)
    )
  );

-- Add policy for operators to view profiles in their company
DROP POLICY IF EXISTS "profiles_select_operators" ON public.profiles;
CREATE POLICY "profiles_select_operators" ON public.profiles
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'operator')
    )
  );

-- =====================================================
-- UPDATE SHIFTS TABLE POLICIES
-- =====================================================

-- Schedule managers can view all shifts in their company
DROP POLICY IF EXISTS "shifts_select_schedule_managers" ON public.shifts;
CREATE POLICY "shifts_select_schedule_managers" ON public.shifts
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
    )
  );

-- Schedule managers can insert shifts in their company
DROP POLICY IF EXISTS "shifts_insert_schedule_managers" ON public.shifts;
CREATE POLICY "shifts_insert_schedule_managers" ON public.shifts
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
    )
  );

-- Schedule managers can update shifts in their company
DROP POLICY IF EXISTS "shifts_update_schedule_managers" ON public.shifts;
CREATE POLICY "shifts_update_schedule_managers" ON public.shifts
  FOR UPDATE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
    )
  );

-- Schedule managers can delete shifts in their company
DROP POLICY IF EXISTS "shifts_delete_schedule_managers" ON public.shifts;
CREATE POLICY "shifts_delete_schedule_managers" ON public.shifts
  FOR DELETE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
    )
  );

-- Operators can view all shifts in their company
DROP POLICY IF EXISTS "shifts_select_operators" ON public.shifts;
CREATE POLICY "shifts_select_operators" ON public.shifts
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'operator')
    )
  );

-- Staff members can view their published shifts
DROP POLICY IF EXISTS "shifts_select_staff_published" ON public.shifts;
CREATE POLICY "shifts_select_staff_published" ON public.shifts
  FOR SELECT
  USING (
    employee_id = auth.uid() AND published = true AND public.has_role(auth.uid(), 'staff')
  );

-- =====================================================
-- UPDATE SHIFT_TEMPLATES TABLE POLICIES
-- =====================================================

-- Schedule managers can view templates in their company
DROP POLICY IF EXISTS "shift_templates_select_schedule_managers" ON public.shift_templates;
CREATE POLICY "shift_templates_select_schedule_managers" ON public.shift_templates
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
    )
  );

-- Schedule managers can insert templates in their company
DROP POLICY IF EXISTS "shift_templates_insert_schedule_managers" ON public.shift_templates;
CREATE POLICY "shift_templates_insert_schedule_managers" ON public.shift_templates
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
    )
  );

-- Schedule managers can update templates in their company
DROP POLICY IF EXISTS "shift_templates_update_schedule_managers" ON public.shift_templates;
CREATE POLICY "shift_templates_update_schedule_managers" ON public.shift_templates
  FOR UPDATE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
    )
  );

-- Schedule managers can delete templates in their company
DROP POLICY IF EXISTS "shift_templates_delete_schedule_managers" ON public.shift_templates;
CREATE POLICY "shift_templates_delete_schedule_managers" ON public.shift_templates
  FOR DELETE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
    )
  );

-- =====================================================
-- UPDATE PREFERENCES TABLE POLICIES
-- =====================================================

-- Staff members can view and manage their own preferences
DROP POLICY IF EXISTS "preferences_all_staff" ON public.preferences;
CREATE POLICY "preferences_all_staff" ON public.preferences
  FOR ALL
  USING (
    profile_id = auth.uid() AND public.has_role(auth.uid(), 'staff')
  );

-- Schedule managers can view preferences of employees in their company
DROP POLICY IF EXISTS "preferences_select_schedule_managers" ON public.preferences;
CREATE POLICY "preferences_select_schedule_managers" ON public.preferences
  FOR SELECT
  USING (
    profile_id IN (
      SELECT p.id 
      FROM public.profiles p
      WHERE p.company_id IN (
        SELECT p2.company_id 
        FROM public.profiles p2
        WHERE p2.id = auth.uid() AND public.has_role(p2.id, 'schedule_manager')
      )
    )
  );

-- Schedule managers can update preferences (for approval/rejection)
DROP POLICY IF EXISTS "preferences_update_schedule_managers" ON public.preferences;
CREATE POLICY "preferences_update_schedule_managers" ON public.preferences
  FOR UPDATE
  USING (
    profile_id IN (
      SELECT p.id 
      FROM public.profiles p
      WHERE p.company_id IN (
        SELECT p2.company_id 
        FROM public.profiles p2
        WHERE p2.id = auth.uid() AND public.has_role(p2.id, 'schedule_manager')
      )
    )
  );

-- =====================================================
-- UPDATE SWAP_REQUESTS TABLE POLICIES
-- =====================================================

-- Staff members can view swap requests they're involved in
DROP POLICY IF EXISTS "swap_requests_select_staff" ON public.swap_requests;
CREATE POLICY "swap_requests_select_staff" ON public.swap_requests
  FOR SELECT
  USING (
    (requester_id = auth.uid() OR target_id = auth.uid()) 
    AND public.has_role(auth.uid(), 'staff')
  );

-- Staff members can create swap requests for their own shifts
DROP POLICY IF EXISTS "swap_requests_insert_staff" ON public.swap_requests;
CREATE POLICY "swap_requests_insert_staff" ON public.swap_requests
  FOR INSERT
  WITH CHECK (
    requester_id = auth.uid() AND public.has_role(auth.uid(), 'staff')
  );

-- Staff members can update their own swap requests
DROP POLICY IF EXISTS "swap_requests_update_staff" ON public.swap_requests;
CREATE POLICY "swap_requests_update_staff" ON public.swap_requests
  FOR UPDATE
  USING (
    requester_id = auth.uid() AND public.has_role(auth.uid(), 'staff')
  );

-- Schedule managers can view all swap requests in their company
DROP POLICY IF EXISTS "swap_requests_select_schedule_managers" ON public.swap_requests;
CREATE POLICY "swap_requests_select_schedule_managers" ON public.swap_requests
  FOR SELECT
  USING (
    shift_id IN (
      SELECT s.id 
      FROM public.shifts s
      WHERE s.company_id IN (
        SELECT p.company_id 
        FROM public.profiles p
        WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
      )
    )
  );

-- Schedule managers can update swap requests (for approval/rejection)
DROP POLICY IF EXISTS "swap_requests_update_schedule_managers" ON public.swap_requests;
CREATE POLICY "swap_requests_update_schedule_managers" ON public.swap_requests
  FOR UPDATE
  USING (
    shift_id IN (
      SELECT s.id 
      FROM public.shifts s
      WHERE s.company_id IN (
        SELECT p.company_id 
        FROM public.profiles p
        WHERE p.id = auth.uid() AND public.has_role(p.id, 'schedule_manager')
      )
    )
  );

-- Operators can view swap requests in their company
DROP POLICY IF EXISTS "swap_requests_select_operators" ON public.swap_requests;
CREATE POLICY "swap_requests_select_operators" ON public.swap_requests
  FOR SELECT
  USING (
    shift_id IN (
      SELECT s.id 
      FROM public.shifts s
      WHERE s.company_id IN (
        SELECT p.company_id 
        FROM public.profiles p
        WHERE p.id = auth.uid() AND public.has_role(p.id, 'operator')
      )
    )
  );

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.roles IS 'System roles with hierarchical permissions:
Level 1 (Platform): system_admin - Full platform access
Level 2 (Company Admin): manager - Full company management
Level 3 (Schedule Admin): schedule_manager - Schedule and shift management
Level 4 (Operations): operator - View employees, shifts, operational tasks
Level 5 (Basic): employee, staff - Personal schedule access and preferences';
