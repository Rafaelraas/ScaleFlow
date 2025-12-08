-- =====================================================
-- ScaleFlow - Workload and Demand Management Tables
-- =====================================================
-- This migration adds support for workload tracking and demand forecasting
-- Run this after the unified_role_policies migration

-- =====================================================
-- WORKLOAD_METRICS TABLE
-- =====================================================
-- Tracks actual capacity, planned capacity, and utilization metrics
CREATE TABLE IF NOT EXISTS public.workload_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  department TEXT,
  -- Capacity metrics (in hours)
  planned_capacity_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  scheduled_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  actual_hours DECIMAL(10, 2) DEFAULT 0,
  -- Staff counts
  required_staff_count INTEGER NOT NULL DEFAULT 0,
  scheduled_staff_count INTEGER NOT NULL DEFAULT 0,
  actual_staff_count INTEGER DEFAULT 0,
  -- Calculated metrics
  utilization_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN planned_capacity_hours > 0 
      THEN (scheduled_hours / planned_capacity_hours * 100) 
      ELSE 0 
    END
  ) STORED,
  staffing_gap INTEGER GENERATED ALWAYS AS (
    required_staff_count - scheduled_staff_count
  ) STORED,
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraints
  CONSTRAINT check_positive_capacity CHECK (planned_capacity_hours >= 0),
  CONSTRAINT check_positive_scheduled CHECK (scheduled_hours >= 0),
  CONSTRAINT check_positive_actual CHECK (actual_hours >= 0 OR actual_hours IS NULL),
  CONSTRAINT check_positive_staff_counts CHECK (
    required_staff_count >= 0 AND 
    scheduled_staff_count >= 0 AND 
    (actual_staff_count >= 0 OR actual_staff_count IS NULL)
  ),
  -- Ensure one record per company/date/department
  UNIQUE(company_id, date, department)
);

COMMENT ON TABLE public.workload_metrics IS 'Daily workload capacity and utilization tracking per company and department';
COMMENT ON COLUMN public.workload_metrics.planned_capacity_hours IS 'Total planned available hours for the day (e.g., 8 hours × 10 staff = 80 hours)';
COMMENT ON COLUMN public.workload_metrics.scheduled_hours IS 'Total hours scheduled in shifts';
COMMENT ON COLUMN public.workload_metrics.actual_hours IS 'Actual hours worked (from time tracking)';
COMMENT ON COLUMN public.workload_metrics.utilization_rate IS 'Percentage of planned capacity that is scheduled (auto-calculated)';
COMMENT ON COLUMN public.workload_metrics.staffing_gap IS 'Difference between required and scheduled staff (auto-calculated)';

-- =====================================================
-- DEMAND_FORECASTS TABLE
-- =====================================================
-- Stores predicted staffing needs based on historical data and business factors
CREATE TABLE IF NOT EXISTS public.demand_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  department TEXT,
  -- Demand predictions
  predicted_demand_hours DECIMAL(10, 2) NOT NULL,
  predicted_staff_count INTEGER NOT NULL,
  confidence_level DECIMAL(5, 2) DEFAULT 0.5,
  -- Factors influencing demand
  is_holiday BOOLEAN DEFAULT false,
  is_weekend BOOLEAN DEFAULT false,
  special_event TEXT,
  historical_average DECIMAL(10, 2),
  -- Business metrics
  expected_volume DECIMAL(10, 2),
  expected_revenue DECIMAL(12, 2),
  -- Recommendation
  recommended_action TEXT,
  recommendation_priority TEXT CHECK (recommendation_priority IN ('low', 'medium', 'high', 'critical')),
  -- Metadata
  forecast_method TEXT DEFAULT 'manual', -- 'manual', 'historical_avg', 'ml_model', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Constraints
  CONSTRAINT check_positive_demand CHECK (predicted_demand_hours >= 0),
  CONSTRAINT check_positive_staff CHECK (predicted_staff_count >= 0),
  CONSTRAINT check_confidence_range CHECK (confidence_level >= 0 AND confidence_level <= 1),
  -- Ensure one record per company/date/department
  UNIQUE(company_id, forecast_date, department)
);

COMMENT ON TABLE public.demand_forecasts IS 'Predicted staffing requirements and demand forecasts';
COMMENT ON COLUMN public.demand_forecasts.predicted_demand_hours IS 'Predicted total hours needed for the day';
COMMENT ON COLUMN public.demand_forecasts.predicted_staff_count IS 'Predicted number of staff needed';
COMMENT ON COLUMN public.demand_forecasts.confidence_level IS 'Confidence in the forecast (0.0 to 1.0)';
COMMENT ON COLUMN public.demand_forecasts.forecast_method IS 'Method used to generate the forecast';

-- =====================================================
-- WORKLOAD_TEMPLATES TABLE
-- =====================================================
-- Reusable workload patterns (e.g., typical Monday, Holiday pattern)
CREATE TABLE IF NOT EXISTS public.workload_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  -- Template capacity values
  template_capacity_hours DECIMAL(10, 2) NOT NULL,
  template_staff_count INTEGER NOT NULL,
  -- Application rules
  applies_to_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  applies_to_months INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  is_active BOOLEAN DEFAULT true,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Constraints
  CONSTRAINT check_positive_template_values CHECK (
    template_capacity_hours >= 0 AND template_staff_count >= 0
  ),
  CONSTRAINT unique_company_template_name UNIQUE(company_id, name)
);

COMMENT ON TABLE public.workload_templates IS 'Reusable workload patterns for quick capacity planning';
COMMENT ON COLUMN public.workload_templates.applies_to_days IS 'Days of week this template applies to';
COMMENT ON COLUMN public.workload_templates.applies_to_months IS 'Months (1-12) this template applies to';

-- =====================================================
-- INDEXES
-- =====================================================

-- Workload metrics indexes
CREATE INDEX idx_workload_metrics_company_date ON public.workload_metrics(company_id, date);
CREATE INDEX idx_workload_metrics_date ON public.workload_metrics(date);
CREATE INDEX idx_workload_metrics_department ON public.workload_metrics(company_id, department);
CREATE INDEX idx_workload_metrics_utilization ON public.workload_metrics(utilization_rate);
CREATE INDEX idx_workload_metrics_staffing_gap ON public.workload_metrics(staffing_gap);

-- Demand forecasts indexes
CREATE INDEX idx_demand_forecasts_company_date ON public.demand_forecasts(company_id, forecast_date);
CREATE INDEX idx_demand_forecasts_date ON public.demand_forecasts(forecast_date);
CREATE INDEX idx_demand_forecasts_department ON public.demand_forecasts(company_id, department);
CREATE INDEX idx_demand_forecasts_priority ON public.demand_forecasts(recommendation_priority);

-- Workload templates indexes
CREATE INDEX idx_workload_templates_company ON public.workload_templates(company_id);
CREATE INDEX idx_workload_templates_active ON public.workload_templates(company_id, is_active);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically update workload metrics from shifts
CREATE OR REPLACE FUNCTION public.update_workload_metrics_from_shifts()
RETURNS TRIGGER AS $$
DECLARE
  shift_date DATE;
  shift_duration DECIMAL(10, 2);
  shift_company_id UUID;
BEGIN
  -- Get shift details
  IF TG_OP = 'DELETE' THEN
    shift_date := OLD.start_time::DATE;
    shift_duration := EXTRACT(EPOCH FROM (OLD.end_time - OLD.start_time)) / 3600.0;
    shift_company_id := OLD.company_id;
  ELSE
    shift_date := NEW.start_time::DATE;
    shift_duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600.0;
    shift_company_id := NEW.company_id;
  END IF;

  -- Update or insert workload metrics
  INSERT INTO public.workload_metrics (
    company_id,
    date,
    department,
    scheduled_hours,
    scheduled_staff_count
  )
  SELECT 
    s.company_id,
    s.start_time::DATE,
    'General' as department,
    SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600.0) as total_hours,
    COUNT(DISTINCT s.employee_id) as staff_count
  FROM public.shifts s
  WHERE s.company_id = shift_company_id
    AND s.start_time::DATE = shift_date
  GROUP BY s.company_id, s.start_time::DATE
  ON CONFLICT (company_id, date, department) 
  DO UPDATE SET
    scheduled_hours = EXCLUDED.scheduled_hours,
    scheduled_staff_count = EXCLUDED.scheduled_staff_count,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_workload_metrics_from_shifts IS 'Automatically updates workload metrics when shifts are modified';

-- Trigger to update workload metrics on shift changes
DROP TRIGGER IF EXISTS trigger_update_workload_on_shift_change ON public.shifts;
CREATE TRIGGER trigger_update_workload_on_shift_change
  AFTER INSERT OR UPDATE OR DELETE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workload_metrics_from_shifts();

-- Function to calculate historical averages for forecasting
CREATE OR REPLACE FUNCTION public.calculate_historical_average(
  p_company_id UUID,
  p_department TEXT,
  p_days_back INTEGER DEFAULT 30
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  avg_hours DECIMAL(10, 2);
BEGIN
  SELECT AVG(scheduled_hours) INTO avg_hours
  FROM public.workload_metrics
  WHERE company_id = p_company_id
    AND (department = p_department OR (department IS NULL AND p_department IS NULL))
    AND date >= CURRENT_DATE - p_days_back
    AND date < CURRENT_DATE;
  
  RETURN COALESCE(avg_hours, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.calculate_historical_average IS 'Calculates average scheduled hours over a historical period';

-- Function to generate auto-forecasts for upcoming dates
CREATE OR REPLACE FUNCTION public.generate_auto_forecasts(
  p_company_id UUID,
  p_days_ahead INTEGER DEFAULT 14
)
RETURNS INTEGER AS $$
DECLARE
  forecast_count INTEGER := 0;
  current_date_iter DATE;
  hist_avg DECIMAL(10, 2);
  is_weekend_day BOOLEAN;
  predicted_hours DECIMAL(10, 2);
  predicted_staff INTEGER;
BEGIN
  -- Loop through upcoming dates
  FOR i IN 1..p_days_ahead LOOP
    current_date_iter := CURRENT_DATE + i;
    is_weekend_day := EXTRACT(DOW FROM current_date_iter) IN (0, 6);
    
    -- Calculate historical average
    hist_avg := public.calculate_historical_average(p_company_id, 'General', 30);
    
    -- Adjust for weekend (assume 70% of weekday demand)
    predicted_hours := CASE 
      WHEN is_weekend_day THEN hist_avg * 0.7
      ELSE hist_avg
    END;
    
    predicted_staff := GREATEST(CEIL(predicted_hours / 8.0), 1);
    
    -- Insert or update forecast
    INSERT INTO public.demand_forecasts (
      company_id,
      forecast_date,
      department,
      predicted_demand_hours,
      predicted_staff_count,
      confidence_level,
      is_weekend,
      historical_average,
      forecast_method
    )
    VALUES (
      p_company_id,
      current_date_iter,
      'General',
      predicted_hours,
      predicted_staff,
      0.6,
      is_weekend_day,
      hist_avg,
      'historical_avg'
    )
    ON CONFLICT (company_id, forecast_date, department)
    DO UPDATE SET
      predicted_demand_hours = EXCLUDED.predicted_demand_hours,
      predicted_staff_count = EXCLUDED.predicted_staff_count,
      historical_average = EXCLUDED.historical_average,
      updated_at = NOW()
    WHERE demand_forecasts.forecast_method = 'historical_avg'; -- Only update auto-generated forecasts
    
    forecast_count := forecast_count + 1;
  END LOOP;
  
  RETURN forecast_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.generate_auto_forecasts IS 'Generates automatic demand forecasts for upcoming dates based on historical data';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.workload_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workload_templates ENABLE ROW LEVEL SECURITY;

-- Workload Metrics Policies
-- SELECT: Managers, schedule_managers, and operators can view workload for their company
CREATE POLICY "workload_metrics_select_company_staff" ON public.workload_metrics
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND public.has_any_role(p.id, ARRAY['manager', 'schedule_manager', 'operator'])
    )
  );

-- System admins can view all workload metrics
CREATE POLICY "workload_metrics_select_system_admin" ON public.workload_metrics
  FOR SELECT
  USING (public.is_system_admin(auth.uid()));

-- INSERT/UPDATE: Managers and schedule_managers can modify workload for their company
CREATE POLICY "workload_metrics_modify_managers" ON public.workload_metrics
  FOR ALL
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND public.can_manage_schedules(p.id)
    )
  );

-- Demand Forecasts Policies
-- SELECT: Managers, schedule_managers, and operators can view forecasts for their company
CREATE POLICY "demand_forecasts_select_company_staff" ON public.demand_forecasts
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND public.has_any_role(p.id, ARRAY['manager', 'schedule_manager', 'operator'])
    )
  );

-- System admins can view all forecasts
CREATE POLICY "demand_forecasts_select_system_admin" ON public.demand_forecasts
  FOR SELECT
  USING (public.is_system_admin(auth.uid()));

-- INSERT/UPDATE: Managers and schedule_managers can create/modify forecasts
CREATE POLICY "demand_forecasts_modify_managers" ON public.demand_forecasts
  FOR ALL
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND public.can_manage_schedules(p.id)
    )
  );

-- Workload Templates Policies
-- SELECT: Managers and schedule_managers can view templates for their company
CREATE POLICY "workload_templates_select_company_staff" ON public.workload_templates
  FOR SELECT
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND public.can_manage_schedules(p.id)
    )
  );

-- System admins can view all templates
CREATE POLICY "workload_templates_select_system_admin" ON public.workload_templates
  FOR SELECT
  USING (public.is_system_admin(auth.uid()));

-- INSERT/UPDATE/DELETE: Managers and schedule_managers can manage templates
CREATE POLICY "workload_templates_modify_managers" ON public.workload_templates
  FOR ALL
  USING (
    company_id IN (
      SELECT p.company_id FROM public.profiles p
      WHERE p.id = auth.uid()
      AND public.can_manage_schedules(p.id)
    )
  );
