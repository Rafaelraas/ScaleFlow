-- =====================================================
-- Test Data for Recurring Shifts
-- =====================================================
-- Example data demonstrating recurring shift usage
-- Run this AFTER the main migrations

-- Example 1: Weekly Monday-Wednesday-Friday shift
-- Parent shift (the template)
INSERT INTO public.shifts (
  company_id,
  employee_id,
  start_time,
  end_time,
  notes,
  published,
  is_recurring,
  recurrence_rule
) VALUES (
  'example-company-id',
  'example-employee-id',
  '2024-01-01 09:00:00+00',
  '2024-01-01 17:00:00+00',
  'Recurring shift - MWF morning shift',
  true,
  true,
  'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;UNTIL=20240331T235959Z'
) ON CONFLICT DO NOTHING;

-- Example 2: Bi-weekly Tuesday-Thursday shift
INSERT INTO public.shifts (
  company_id,
  employee_id,
  start_time,
  end_time,
  notes,
  published,
  is_recurring,
  recurrence_rule
) VALUES (
  'example-company-id',
  'example-employee-id-2',
  '2024-01-02 14:00:00+00',
  '2024-01-02 22:00:00+00',
  'Bi-weekly evening shift',
  true,
  true,
  'FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,TH;UNTIL=20240630T235959Z'
) ON CONFLICT DO NOTHING;

-- Example 3: Daily shift with exceptions (holidays)
INSERT INTO public.shifts (
  company_id,
  employee_id,
  start_time,
  end_time,
  notes,
  published,
  is_recurring,
  recurrence_rule,
  recurrence_exception_dates
) VALUES (
  'example-company-id',
  'example-employee-id-3',
  '2024-01-01 08:00:00+00',
  '2024-01-01 16:00:00+00',
  'Daily shift - weekdays only, skip holidays',
  true,
  true,
  'FREQ=DAILY;INTERVAL=1;UNTIL=20240331T235959Z',
  '["2024-01-01", "2024-02-14", "2024-03-29"]'::jsonb
) ON CONFLICT DO NOTHING;

-- Example 4: Monthly first Monday shift
INSERT INTO public.shifts (
  company_id,
  employee_id,
  start_time,
  end_time,
  notes,
  published,
  is_recurring,
  recurrence_rule
) VALUES (
  'example-company-id',
  'example-employee-id-4',
  '2024-01-01 10:00:00+00',
  '2024-01-01 18:00:00+00',
  'Monthly meeting shift - first Monday',
  true,
  true,
  'FREQ=MONTHLY;INTERVAL=1;COUNT=12'
) ON CONFLICT DO NOTHING;

-- Note: In production, shift instances will be generated programmatically
-- with recurrence_parent_id pointing to the parent shift
