-- =====================================================
-- ScaleFlow Database - Functions and Triggers Migration
-- =====================================================
-- Creates database functions and triggers for automated operations

-- =====================================================
-- UPDATE TIMESTAMP FUNCTION
-- =====================================================
-- Automatically updates the updated_at column on row updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates updated_at timestamp on row modification';

-- =====================================================
-- APPLY TRIGGERS TO TABLES
-- =====================================================

-- Companies table
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Shifts table
DROP TRIGGER IF EXISTS update_shifts_updated_at ON public.shifts;
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Shift templates table
DROP TRIGGER IF EXISTS update_shift_templates_updated_at ON public.shift_templates;
CREATE TRIGGER update_shift_templates_updated_at
  BEFORE UPDATE ON public.shift_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Preferences table
DROP TRIGGER IF EXISTS update_preferences_updated_at ON public.preferences;
CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON public.preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Swap requests table
DROP TRIGGER IF EXISTS update_swap_requests_updated_at ON public.swap_requests;
CREATE TRIGGER update_swap_requests_updated_at
  BEFORE UPDATE ON public.swap_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- AUTO-CREATE PROFILE FUNCTION
-- =====================================================
-- Automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Get the 'employee' role ID
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'employee' LIMIT 1;
  
  -- Insert profile with default employee role
  INSERT INTO public.profiles (id, role_id, created_at, updated_at)
  VALUES (NEW.id, default_role_id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry with default employee role when a new user signs up';

-- Note: In Supabase, you typically create this trigger via the Supabase Dashboard
-- under Database > Database Webhooks, or via SQL if you have sufficient permissions.
-- If the following trigger creation fails, create it manually in the Supabase Dashboard:
-- Database > Database > Triggers > New Trigger
-- Or use Supabase's built-in user management webhooks.

-- Attempt to create trigger for new user signup
-- This may require elevated permissions in some Supabase environments
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create trigger on auth.users. Please create manually via Supabase Dashboard.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create trigger on auth.users: %. Please create manually if needed.', SQLERRM;
END $$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's role name
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT r.name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = user_id;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Returns the role name for a given user ID';

-- Function to get user's company ID
CREATE OR REPLACE FUNCTION public.get_user_company(user_id UUID)
RETURNS UUID AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = user_id;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.get_user_company(UUID) IS 'Returns the company ID for a given user ID';

-- Function to check if user is a manager
CREATE OR REPLACE FUNCTION public.is_manager(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_id AND r.name = 'manager'
  );
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.is_manager(UUID) IS 'Returns true if the user has the manager role';

-- Function to check if user is a system admin
CREATE OR REPLACE FUNCTION public.is_system_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_id AND r.name = 'system_admin'
  );
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.is_system_admin(UUID) IS 'Returns true if the user has the system_admin role';

-- Function to check if users are in the same company
CREATE OR REPLACE FUNCTION public.same_company(user_id1 UUID, user_id2 UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p1, public.profiles p2
    WHERE p1.id = user_id1 
      AND p2.id = user_id2
      AND p1.company_id = p2.company_id
      AND p1.company_id IS NOT NULL
  );
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION public.same_company(UUID, UUID) IS 'Returns true if two users belong to the same company';
