/**
 * Demand Forecasting API
 * 
 * Typed API functions for demand forecasts and staffing predictions.
 */

import { supabase } from '@/integrations/supabase/client';
import { DemandForecast } from '@/types/database';

/**
 * Get demand forecasts for a date range
 */
export async function getDemandForecasts(
  companyId: string,
  startDate: string,
  endDate: string,
  department?: string
): Promise<DemandForecast[]> {
  let query = supabase
    .from('demand_forecasts')
    .select('*')
    .eq('company_id', companyId)
    .gte('forecast_date', startDate)
    .lte('forecast_date', endDate)
    .order('forecast_date', { ascending: true });

  if (department) {
    query = query.eq('department', department);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get demand forecast for a specific date
 */
export async function getDemandForecastByDate(
  companyId: string,
  date: string,
  department: string = 'General'
): Promise<DemandForecast | null> {
  const { data, error } = await supabase
    .from('demand_forecasts')
    .select('*')
    .eq('company_id', companyId)
    .eq('forecast_date', date)
    .eq('department', department)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Create or update demand forecast
 */
export async function upsertDemandForecast(
  forecast: Omit<DemandForecast, 'id' | 'created_at' | 'updated_at'>
): Promise<DemandForecast> {
  const { data, error } = await supabase
    .from('demand_forecasts')
    .upsert(forecast, {
      onConflict: 'company_id,forecast_date,department',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete demand forecast
 */
export async function deleteDemandForecast(id: string): Promise<void> {
  const { error } = await supabase
    .from('demand_forecasts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get forecasts with high priority recommendations
 */
export async function getHighPriorityForecasts(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<DemandForecast[]> {
  const { data, error } = await supabase
    .from('demand_forecasts')
    .select('*')
    .eq('company_id', companyId)
    .gte('forecast_date', startDate)
    .lte('forecast_date', endDate)
    .in('recommendation_priority', ['high', 'critical'])
    .order('forecast_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Generate automatic forecasts using historical data
 */
export async function generateAutoForecasts(
  companyId: string,
  daysAhead: number = 14
): Promise<number> {
  const { data, error } = await supabase.rpc('generate_auto_forecasts', {
    p_company_id: companyId,
    p_days_ahead: daysAhead,
  });

  if (error) throw error;
  return data || 0;
}

/**
 * Calculate historical average for forecasting
 */
export async function calculateHistoricalAverage(
  companyId: string,
  department: string = 'General',
  daysBack: number = 30
): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_historical_average', {
    p_company_id: companyId,
    p_department: department,
    p_days_back: daysBack,
  });

  if (error) throw error;
  return data || 0;
}

/**
 * Get demand forecast summary statistics
 */
export async function getDemandForecastSummary(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<{
  avgPredictedHours: number;
  avgPredictedStaff: number;
  avgConfidence: number;
  criticalDays: number;
  highPriorityDays: number;
  weekendDays: number;
  holidayDays: number;
}> {
  const forecasts = await getDemandForecasts(companyId, startDate, endDate);

  if (forecasts.length === 0) {
    return {
      avgPredictedHours: 0,
      avgPredictedStaff: 0,
      avgConfidence: 0,
      criticalDays: 0,
      highPriorityDays: 0,
      weekendDays: 0,
      holidayDays: 0,
    };
  }

  const totalHours = forecasts.reduce((sum, f) => sum + f.predicted_demand_hours, 0);
  const totalStaff = forecasts.reduce((sum, f) => sum + f.predicted_staff_count, 0);
  const totalConfidence = forecasts.reduce((sum, f) => sum + f.confidence_level, 0);

  return {
    avgPredictedHours: totalHours / forecasts.length,
    avgPredictedStaff: totalStaff / forecasts.length,
    avgConfidence: totalConfidence / forecasts.length,
    criticalDays: forecasts.filter(f => f.recommendation_priority === 'critical').length,
    highPriorityDays: forecasts.filter(f => f.recommendation_priority === 'high').length,
    weekendDays: forecasts.filter(f => f.is_weekend).length,
    holidayDays: forecasts.filter(f => f.is_holiday).length,
  };
}

/**
 * Compare forecast with actual workload
 */
export async function compareForecastWithActual(
  companyId: string,
  date: string,
  department: string = 'General'
): Promise<{
  forecast: DemandForecast | null;
  actual: {
    scheduled_hours: number;
    scheduled_staff: number;
  } | null;
  variance: {
    hours_variance: number;
    staff_variance: number;
    accuracy_percentage: number;
  } | null;
}> {
  const forecast = await getDemandForecastByDate(companyId, date, department);
  
  const { data: workloadData, error } = await supabase
    .from('workload_metrics')
    .select('scheduled_hours, scheduled_staff_count')
    .eq('company_id', companyId)
    .eq('date', date)
    .eq('department', department)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  let variance = null;
  if (forecast && workloadData) {
    const hoursVariance = workloadData.scheduled_hours - forecast.predicted_demand_hours;
    const staffVariance = workloadData.scheduled_staff_count - forecast.predicted_staff_count;
    const accuracy = forecast.predicted_demand_hours > 0
      ? (1 - Math.abs(hoursVariance) / forecast.predicted_demand_hours) * 100
      : 0;

    variance = {
      hours_variance: hoursVariance,
      staff_variance: staffVariance,
      accuracy_percentage: Math.max(0, accuracy),
    };
  }

  return {
    forecast,
    actual: workloadData || null,
    variance,
  };
}

/**
 * Bulk update forecast priorities
 */
export async function updateForecastPriorities(
  companyId: string,
  updates: Array<{ forecast_date: string; department: string; priority: 'low' | 'medium' | 'high' | 'critical' }>
): Promise<void> {
  const promises = updates.map(({ forecast_date, department, priority }) =>
    supabase
      .from('demand_forecasts')
      .update({ recommendation_priority: priority })
      .eq('company_id', companyId)
      .eq('forecast_date', forecast_date)
      .eq('department', department)
  );

  const results = await Promise.all(promises);
  const error = results.find(r => r.error);
  if (error) throw error.error;
}
