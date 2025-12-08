/**
 * Workload Management API
 * 
 * Typed API functions for workload metrics, capacity planning, and utilization tracking.
 */

import { supabase } from '@/integrations/supabase/client';
import { WorkloadMetric, WorkloadTemplate } from '@/types/database';

/**
 * Get workload metrics for a date range
 */
export async function getWorkloadMetrics(
  companyId: string,
  startDate: string,
  endDate: string,
  department?: string
): Promise<WorkloadMetric[]> {
  let query = supabase
    .from('workload_metrics')
    .select('*')
    .eq('company_id', companyId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (department) {
    query = query.eq('department', department);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get workload metrics for a specific date
 */
export async function getWorkloadMetricByDate(
  companyId: string,
  date: string,
  department: string = 'General'
): Promise<WorkloadMetric | null> {
  const { data, error } = await supabase
    .from('workload_metrics')
    .select('*')
    .eq('company_id', companyId)
    .eq('date', date)
    .eq('department', department)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Create or update workload metrics
 */
export async function upsertWorkloadMetric(
  metric: Omit<WorkloadMetric, 'id' | 'created_at' | 'updated_at' | 'utilization_rate' | 'staffing_gap'>
): Promise<WorkloadMetric> {
  const { data, error } = await supabase
    .from('workload_metrics')
    .upsert(metric, {
      onConflict: 'company_id,date,department',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete workload metric
 */
export async function deleteWorkloadMetric(id: string): Promise<void> {
  const { error } = await supabase
    .from('workload_metrics')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get workload summary statistics for a date range
 */
export async function getWorkloadSummary(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<{
  avgUtilization: number;
  totalScheduledHours: number;
  totalPlannedHours: number;
  avgStaffingGap: number;
  daysUnderStaffed: number;
  daysOverStaffed: number;
}> {
  const metrics = await getWorkloadMetrics(companyId, startDate, endDate);

  if (metrics.length === 0) {
    return {
      avgUtilization: 0,
      totalScheduledHours: 0,
      totalPlannedHours: 0,
      avgStaffingGap: 0,
      daysUnderStaffed: 0,
      daysOverStaffed: 0,
    };
  }

  const totalUtilization = metrics.reduce((sum, m) => sum + m.utilization_rate, 0);
  const totalScheduledHours = metrics.reduce((sum, m) => sum + m.scheduled_hours, 0);
  const totalPlannedHours = metrics.reduce((sum, m) => sum + m.planned_capacity_hours, 0);
  const totalStaffingGap = metrics.reduce((sum, m) => sum + m.staffing_gap, 0);
  const daysUnderStaffed = metrics.filter(m => m.staffing_gap < 0).length;
  const daysOverStaffed = metrics.filter(m => m.staffing_gap > 0).length;

  return {
    avgUtilization: totalUtilization / metrics.length,
    totalScheduledHours,
    totalPlannedHours,
    avgStaffingGap: totalStaffingGap / metrics.length,
    daysUnderStaffed,
    daysOverStaffed,
  };
}

/**
 * Get all workload templates for a company
 */
export async function getWorkloadTemplates(companyId: string): Promise<WorkloadTemplate[]> {
  const { data, error } = await supabase
    .from('workload_templates')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get active workload templates
 */
export async function getActiveWorkloadTemplates(companyId: string): Promise<WorkloadTemplate[]> {
  const { data, error } = await supabase
    .from('workload_templates')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get a specific workload template
 */
export async function getWorkloadTemplate(id: string): Promise<WorkloadTemplate | null> {
  const { data, error } = await supabase
    .from('workload_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Create a new workload template
 */
export async function createWorkloadTemplate(
  template: Omit<WorkloadTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<WorkloadTemplate> {
  const { data, error } = await supabase
    .from('workload_templates')
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a workload template
 */
export async function updateWorkloadTemplate(
  id: string,
  updates: Partial<Omit<WorkloadTemplate, 'id' | 'created_at' | 'updated_at' | 'company_id'>>
): Promise<WorkloadTemplate> {
  const { data, error } = await supabase
    .from('workload_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a workload template
 */
export async function deleteWorkloadTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('workload_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Apply a workload template to specific dates
 */
export async function applyWorkloadTemplate(
  templateId: string,
  dates: string[]
): Promise<WorkloadMetric[]> {
  const template = await getWorkloadTemplate(templateId);
  if (!template) throw new Error('Template not found');

  const metrics: Omit<WorkloadMetric, 'id' | 'created_at' | 'updated_at' | 'utilization_rate' | 'staffing_gap'>[] = dates.map(date => ({
    company_id: template.company_id,
    date,
    department: template.department,
    planned_capacity_hours: template.template_capacity_hours,
    scheduled_hours: 0,
    actual_hours: null,
    required_staff_count: template.template_staff_count,
    scheduled_staff_count: 0,
    actual_staff_count: null,
    notes: `Applied from template: ${template.name}`,
  }));

  const { data, error } = await supabase
    .from('workload_metrics')
    .upsert(metrics, {
      onConflict: 'company_id,date,department',
    })
    .select();

  if (error) throw error;
  return data || [];
}
