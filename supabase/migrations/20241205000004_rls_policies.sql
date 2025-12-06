-- =====================================================
-- ScaleFlow Database - Row Level Security Policies
-- =====================================================
-- Implements RLS policies for data access control

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROLES TABLE POLICIES
-- =====================================================
-- Everyone can read roles (needed for role selection in UI)
DROP POLICY IF EXISTS "roles_select_all" ON public.roles;
CREATE POLICY "roles_select_all" ON public.roles
  FOR SELECT
  USING (true);

-- =====================================================
-- COMPANIES TABLE POLICIES
-- =====================================================

-- Users can view their own company
DROP POLICY IF EXISTS "companies_select_own" ON public.companies;
CREATE POLICY "companies_select_own" ON public.companies
  FOR SELECT
  USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Authenticated users can create companies
DROP POLICY IF EXISTS "companies_insert_authenticated" ON public.companies;
CREATE POLICY "companies_insert_authenticated" ON public.companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Managers can update their company
DROP POLICY IF EXISTS "companies_update_managers" ON public.companies;
CREATE POLICY "companies_update_managers" ON public.companies
  FOR UPDATE
  USING (
    id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- System admins can do everything with companies
DROP POLICY IF EXISTS "companies_all_system_admin" ON public.companies;
CREATE POLICY "companies_all_system_admin" ON public.companies
  FOR ALL
  USING (public.is_system_admin(auth.uid()));

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (limited fields)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Managers can view profiles in their company
DROP POLICY IF EXISTS "profiles_select_company_managers" ON public.profiles;
CREATE POLICY "profiles_select_company_managers" ON public.profiles
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can update profiles in their company
DROP POLICY IF EXISTS "profiles_update_company_managers" ON public.profiles;
CREATE POLICY "profiles_update_company_managers" ON public.profiles
  FOR UPDATE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- System admins can do everything with profiles
DROP POLICY IF EXISTS "profiles_all_system_admin" ON public.profiles;
CREATE POLICY "profiles_all_system_admin" ON public.profiles
  FOR ALL
  USING (public.is_system_admin(auth.uid()));

-- =====================================================
-- SHIFTS TABLE POLICIES
-- =====================================================

-- Employees can view their published shifts
DROP POLICY IF EXISTS "shifts_select_own_published" ON public.shifts;
CREATE POLICY "shifts_select_own_published" ON public.shifts
  FOR SELECT
  USING (
    employee_id = auth.uid() AND published = true
  );

-- Managers can view all shifts in their company
DROP POLICY IF EXISTS "shifts_select_company_managers" ON public.shifts;
CREATE POLICY "shifts_select_company_managers" ON public.shifts
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can insert shifts in their company
DROP POLICY IF EXISTS "shifts_insert_managers" ON public.shifts;
CREATE POLICY "shifts_insert_managers" ON public.shifts
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can update shifts in their company
DROP POLICY IF EXISTS "shifts_update_managers" ON public.shifts;
CREATE POLICY "shifts_update_managers" ON public.shifts
  FOR UPDATE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can delete shifts in their company
DROP POLICY IF EXISTS "shifts_delete_managers" ON public.shifts;
CREATE POLICY "shifts_delete_managers" ON public.shifts
  FOR DELETE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- =====================================================
-- SHIFT_TEMPLATES TABLE POLICIES
-- =====================================================

-- Managers can view templates in their company
DROP POLICY IF EXISTS "shift_templates_select_managers" ON public.shift_templates;
CREATE POLICY "shift_templates_select_managers" ON public.shift_templates
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can insert templates in their company
DROP POLICY IF EXISTS "shift_templates_insert_managers" ON public.shift_templates;
CREATE POLICY "shift_templates_insert_managers" ON public.shift_templates
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can update templates in their company
DROP POLICY IF EXISTS "shift_templates_update_managers" ON public.shift_templates;
CREATE POLICY "shift_templates_update_managers" ON public.shift_templates
  FOR UPDATE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- Managers can delete templates in their company
DROP POLICY IF EXISTS "shift_templates_delete_managers" ON public.shift_templates;
CREATE POLICY "shift_templates_delete_managers" ON public.shift_templates
  FOR DELETE
  USING (
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'manager'
    )
  );

-- =====================================================
-- PREFERENCES TABLE POLICIES
-- =====================================================

-- Employees can view and manage their own preferences
DROP POLICY IF EXISTS "preferences_all_own" ON public.preferences;
CREATE POLICY "preferences_all_own" ON public.preferences
  FOR ALL
  USING (profile_id = auth.uid());

-- Managers can view preferences of employees in their company
DROP POLICY IF EXISTS "preferences_select_company_managers" ON public.preferences;
CREATE POLICY "preferences_select_company_managers" ON public.preferences
  FOR SELECT
  USING (
    profile_id IN (
      SELECT p.id 
      FROM public.profiles p
      WHERE p.company_id IN (
        SELECT p2.company_id 
        FROM public.profiles p2
        JOIN public.roles r ON p2.role_id = r.id
        WHERE p2.id = auth.uid() AND r.name = 'manager'
      )
    )
  );

-- Managers can update preferences (for approval/rejection)
DROP POLICY IF EXISTS "preferences_update_company_managers" ON public.preferences;
CREATE POLICY "preferences_update_company_managers" ON public.preferences
  FOR UPDATE
  USING (
    profile_id IN (
      SELECT p.id 
      FROM public.profiles p
      WHERE p.company_id IN (
        SELECT p2.company_id 
        FROM public.profiles p2
        JOIN public.roles r ON p2.role_id = r.id
        WHERE p2.id = auth.uid() AND r.name = 'manager'
      )
    )
  );

-- =====================================================
-- SWAP_REQUESTS TABLE POLICIES
-- =====================================================

-- Employees can view swap requests they're involved in
DROP POLICY IF EXISTS "swap_requests_select_involved" ON public.swap_requests;
CREATE POLICY "swap_requests_select_involved" ON public.swap_requests
  FOR SELECT
  USING (
    requester_id = auth.uid() OR target_id = auth.uid()
  );

-- Employees can create swap requests for their own shifts
DROP POLICY IF EXISTS "swap_requests_insert_own" ON public.swap_requests;
CREATE POLICY "swap_requests_insert_own" ON public.swap_requests
  FOR INSERT
  WITH CHECK (
    requester_id = auth.uid()
  );

-- Employees can update their own swap requests (e.g., cancel)
DROP POLICY IF EXISTS "swap_requests_update_own" ON public.swap_requests;
CREATE POLICY "swap_requests_update_own" ON public.swap_requests
  FOR UPDATE
  USING (requester_id = auth.uid());

-- Managers can view all swap requests in their company
DROP POLICY IF EXISTS "swap_requests_select_company_managers" ON public.swap_requests;
CREATE POLICY "swap_requests_select_company_managers" ON public.swap_requests
  FOR SELECT
  USING (
    shift_id IN (
      SELECT s.id 
      FROM public.shifts s
      WHERE s.company_id IN (
        SELECT p.company_id 
        FROM public.profiles p
        JOIN public.roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name = 'manager'
      )
    )
  );

-- Managers can update swap requests (for approval/rejection)
DROP POLICY IF EXISTS "swap_requests_update_company_managers" ON public.swap_requests;
CREATE POLICY "swap_requests_update_company_managers" ON public.swap_requests
  FOR UPDATE
  USING (
    shift_id IN (
      SELECT s.id 
      FROM public.shifts s
      WHERE s.company_id IN (
        SELECT p.company_id 
        FROM public.profiles p
        JOIN public.roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name = 'manager'
      )
    )
  );
