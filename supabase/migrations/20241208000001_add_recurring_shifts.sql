-- =====================================================
-- Add Recurring Shifts Support to ScaleFlow
-- =====================================================
-- Migration to add recurrence fields to shifts table
-- Supports iCalendar RFC 5545 recurrence rules

-- Add recurrence fields to shifts table
ALTER TABLE public.shifts 
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS recurrence_exception_dates JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.shifts.is_recurring IS 'Flag indicating if this shift is part of a recurring series';
COMMENT ON COLUMN public.shifts.recurrence_rule IS 'iCalendar RFC 5545 recurrence rule (e.g., FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR)';
COMMENT ON COLUMN public.shifts.recurrence_parent_id IS 'Reference to the parent shift in a recurring series (NULL for parent shift)';
COMMENT ON COLUMN public.shifts.recurrence_exception_dates IS 'Array of ISO 8601 date strings for dates to skip (e.g., holidays)';

-- Create index for performance when querying recurring shifts
CREATE INDEX IF NOT EXISTS idx_shifts_recurrence_parent 
  ON public.shifts(recurrence_parent_id) 
  WHERE recurrence_parent_id IS NOT NULL;

-- Create index for recurring shift queries
CREATE INDEX IF NOT EXISTS idx_shifts_is_recurring 
  ON public.shifts(is_recurring) 
  WHERE is_recurring = true;

-- Add constraint to ensure recurrence_rule is set when is_recurring is true
ALTER TABLE public.shifts 
  ADD CONSTRAINT check_recurring_has_rule 
  CHECK (
    (is_recurring = false OR recurrence_rule IS NOT NULL)
  );

-- Add constraint to ensure parent shifts cannot reference themselves
ALTER TABLE public.shifts 
  ADD CONSTRAINT check_no_self_reference 
  CHECK (
    recurrence_parent_id IS NULL OR recurrence_parent_id != id
  );

-- Add constraint to ensure exception_dates is a valid JSON array
ALTER TABLE public.shifts 
  ADD CONSTRAINT check_exception_dates_is_array 
  CHECK (
    jsonb_typeof(recurrence_exception_dates) = 'array'
  );

-- Note: RLS policies remain unchanged - they already filter by company_id
-- Recurring shift instances inherit the same company-scoped access control
