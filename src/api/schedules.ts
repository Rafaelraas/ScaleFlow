/**
 * Schedules API
 *
 * Typed API layer for shift and schedule-related operations.
 * All operations enforce RLS policies defined in the database.
 */

import { supabase } from '@/integrations/supabase/client.ts';
import { Shift } from '@/types/database';

/**
 * Get shifts for the current user (employee view)
 * RLS Policy: employees can view their own published shifts
 */
export async function getMyShifts(startDate?: string, endDate?: string) {
  let query = supabase
    .from('shifts')
    .select('*, profiles(first_name, last_name)')
    .eq('published', true)
    .order('start_time', { ascending: true });

  if (startDate) {
    query = query.gte('start_time', startDate);
  }
  if (endDate) {
    query = query.lte('start_time', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Get all shifts in the company (manager view)
 * RLS Policy: managers can view all shifts in their company
 */
export async function getCompanyShifts(startDate?: string, endDate?: string, published?: boolean) {
  let query = supabase
    .from('shifts')
    .select('*, profiles(first_name, last_name, id)')
    .order('start_time', { ascending: true });

  if (startDate) {
    query = query.gte('start_time', startDate);
  }
  if (endDate) {
    query = query.lte('start_time', endDate);
  }
  if (published !== undefined) {
    query = query.eq('published', published);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Get a specific shift by ID
 * RLS Policy: employees can view their published shifts, managers can view all company shifts
 */
export async function getShiftById(shiftId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, profiles(first_name, last_name)')
    .eq('id', shiftId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new shift (manager only)
 * RLS Policy: managers can insert shifts in their company
 */
export async function createShift(shift: {
  company_id: string;
  employee_id: string | null;
  role_id: string | null;
  start_time: string;
  end_time: string;
  notes?: string | null;
  published?: boolean;
}) {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      ...shift,
      published: shift.published ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Shift;
}

/**
 * Update a shift (manager only)
 * RLS Policy: managers can update shifts in their company
 */
export async function updateShift(
  shiftId: string,
  updates: {
    employee_id?: string | null;
    role_id?: string | null;
    start_time?: string;
    end_time?: string;
    notes?: string | null;
    published?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('shifts')
    .update(updates)
    .eq('id', shiftId)
    .select()
    .single();

  if (error) throw error;
  return data as Shift;
}

/**
 * Delete a shift (manager only)
 * RLS Policy: managers can delete shifts in their company
 */
export async function deleteShift(shiftId: string) {
  const { error } = await supabase.from('shifts').delete().eq('id', shiftId);

  if (error) throw error;
}

/**
 * Bulk create shifts (manager only)
 * RLS Policy: managers can insert shifts in their company
 */
export async function bulkCreateShifts(
  shifts: Array<{
    company_id: string;
    employee_id: string | null;
    role_id: string | null;
    start_time: string;
    end_time: string;
    notes?: string | null;
    published?: boolean;
  }>
) {
  const { data, error } = await supabase
    .from('shifts')
    .insert(
      shifts.map((shift) => ({
        ...shift,
        published: shift.published ?? false,
      }))
    )
    .select();

  if (error) throw error;
  return data as Shift[];
}

/**
 * Publish multiple shifts (manager only)
 * RLS Policy: managers can update shifts in their company
 */
export async function publishShifts(shiftIds: string[]) {
  const { data, error } = await supabase
    .from('shifts')
    .update({ published: true })
    .in('id', shiftIds)
    .select();

  if (error) throw error;
  return data as Shift[];
}
