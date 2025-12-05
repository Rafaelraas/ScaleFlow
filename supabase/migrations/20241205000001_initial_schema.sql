-- =====================================================
-- ScaleFlow Database Schema - Initial Migration
-- =====================================================
-- This migration creates the core database structure for ScaleFlow
-- Run this first to set up all tables and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ROLES TABLE
-- =====================================================
-- System roles for access control
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('system_admin', 'Full platform access with company and user management'),
  ('manager', 'Company-level access with employee and schedule management'),
  ('employee', 'Personal access with schedule viewing and preference submission')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
-- Organization/company information
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.companies IS 'Organizations using ScaleFlow';
COMMENT ON COLUMN public.companies.settings IS 'Company-specific settings like timezone, work week start, etc.';

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- User profiles with company and role associations
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profile information linked to Supabase auth';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users(id) - automatically linked';

-- =====================================================
-- SHIFTS TABLE
-- =====================================================
-- Scheduled work shifts
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_shift_times CHECK (end_time > start_time)
);

COMMENT ON TABLE public.shifts IS 'Work shifts for employees';
COMMENT ON COLUMN public.shifts.employee_id IS 'Employee assigned to this shift (nullable for unassigned shifts)';
COMMENT ON COLUMN public.shifts.role_id IS 'Role required for this shift (optional)';
COMMENT ON COLUMN public.shifts.published IS 'Whether the shift is visible to employees';

-- =====================================================
-- SHIFT_TEMPLATES TABLE
-- =====================================================
-- Reusable shift templates
CREATE TABLE IF NOT EXISTS public.shift_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  default_start_time TEXT NOT NULL,
  default_role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  default_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_duration_positive CHECK (duration_hours > 0),
  CONSTRAINT check_duration_reasonable CHECK (duration_hours <= 24)
);

COMMENT ON TABLE public.shift_templates IS 'Reusable templates for common shift patterns';
COMMENT ON COLUMN public.shift_templates.default_start_time IS 'Default start time in HH:MM format (e.g., 09:00)';
COMMENT ON COLUMN public.shift_templates.duration_hours IS 'Length of shift in hours';

-- =====================================================
-- PREFERENCES TABLE
-- =====================================================
-- Employee availability and work preferences
CREATE TABLE IF NOT EXISTS public.preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_from DATE,
  available_to DATE,
  preferred_days TEXT[],
  max_hours_week INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_preference_dates CHECK (available_to >= available_from),
  CONSTRAINT check_max_hours CHECK (max_hours_week > 0 AND max_hours_week <= 168),
  CONSTRAINT check_preference_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

COMMENT ON TABLE public.preferences IS 'Employee availability and scheduling preferences';
COMMENT ON COLUMN public.preferences.preferred_days IS 'Array of preferred work days (e.g., [''Monday'', ''Tuesday'', ''Friday''])';
COMMENT ON COLUMN public.preferences.status IS 'Approval status: pending, approved, or rejected';

-- =====================================================
-- SWAP_REQUESTS TABLE
-- =====================================================
-- Shift swap requests between employees
CREATE TABLE IF NOT EXISTS public.swap_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT check_swap_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

COMMENT ON TABLE public.swap_requests IS 'Requests for employees to swap shifts';
COMMENT ON COLUMN public.swap_requests.requester_id IS 'Employee requesting the swap';
COMMENT ON COLUMN public.swap_requests.target_id IS 'Employee to swap with (optional for open swaps)';
COMMENT ON COLUMN public.swap_requests.status IS 'Request status: pending, approved, rejected, or cancelled';
