/**
 * Profile service for Supabase
 * Handles user profile operations
 */

import { supabase } from '@/integrations/supabase/client.ts';
import type { Profile, ProfileWithRole } from '@/types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export interface ProfileResult {
  data: ProfileWithRole | null;
  error: PostgrestError | null;
}

/**
 * Get a user profile by ID with role information
 */
export async function getProfileById(userId: string): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error };
  }

  // Transform the data to match ProfileWithRole type
  const profile: ProfileWithRole = {
    ...data,
    roles: data.roles ? { name: (data.roles as { name: string }).name } : null,
  };

  return { data: profile, error: null };
}

/**
 * Update a user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<{ data: Profile | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Get all employees for a company
 */
export async function getEmployeesByCompany(
  companyId: string,
  page = 1,
  perPage = 10
): Promise<{
  data: ProfileWithRole[] | null;
  error: PostgrestError | null;
  count: number | null;
}> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Get count
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (countError) {
    return { data: null, error: countError, count: null };
  }

  // Get data
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('company_id', companyId)
    .order('last_name', { ascending: true })
    .range(from, to);

  if (error) {
    return { data: null, error, count };
  }

  const profiles: ProfileWithRole[] = (data || []).map((p) => ({
    ...p,
    roles: p.roles as { name: string } | null,
  }));

  return { data: profiles, error: null, count };
}

/**
 * Delete an employee from a company
 */
export async function removeEmployeeFromCompany(
  employeeId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ company_id: null })
    .eq('id', employeeId);

  return { error };
}
