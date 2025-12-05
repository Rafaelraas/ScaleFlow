-- =====================================================
-- ScaleFlow Database - Indexes Migration
-- =====================================================
-- Creates indexes for improved query performance

-- =====================================================
-- PROFILES INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_role ON public.profiles(company_id, role_id);

-- =====================================================
-- SHIFTS INDEXES
-- =====================================================
-- Core indexes for shift queries
CREATE INDEX IF NOT EXISTS idx_shifts_company_id ON public.shifts(company_id);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_id ON public.shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_role_id ON public.shifts(role_id);
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON public.shifts(start_time);
CREATE INDEX IF NOT EXISTS idx_shifts_published ON public.shifts(published);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_shifts_company_date ON public.shifts(company_id, start_time);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON public.shifts(employee_id, start_time);
CREATE INDEX IF NOT EXISTS idx_shifts_company_published ON public.shifts(company_id, published);

-- Partial index for published shifts (most commonly queried)
CREATE INDEX IF NOT EXISTS idx_shifts_published_employee 
  ON public.shifts(employee_id, start_time) 
  WHERE published = true;

-- =====================================================
-- SHIFT_TEMPLATES INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_shift_templates_company_id ON public.shift_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_shift_templates_role_id ON public.shift_templates(default_role_id);

-- =====================================================
-- PREFERENCES INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_preferences_profile_id ON public.preferences(profile_id);
CREATE INDEX IF NOT EXISTS idx_preferences_status ON public.preferences(status);

-- Partial index for pending preferences (frequently queried by managers)
CREATE INDEX IF NOT EXISTS idx_preferences_pending 
  ON public.preferences(profile_id, status) 
  WHERE status = 'pending';

-- =====================================================
-- SWAP_REQUESTS INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_swap_requests_shift_id ON public.swap_requests(shift_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_requester_id ON public.swap_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_target_id ON public.swap_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON public.swap_requests(status);

-- Partial index for pending swap requests
CREATE INDEX IF NOT EXISTS idx_swap_requests_pending 
  ON public.swap_requests(shift_id, status) 
  WHERE status = 'pending';

-- Composite index for employee's swap requests
CREATE INDEX IF NOT EXISTS idx_swap_requests_employee 
  ON public.swap_requests(requester_id, status, created_at);
