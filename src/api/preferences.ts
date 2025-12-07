/**
 * Preferences API
 *
 * Typed API layer for employee preference operations.
 * All operations enforce RLS policies defined in the database.
 */

import { supabase } from '@/integrations/supabase/client.ts';
import { Preference } from '@/types/database';

/**
 * Get the current user's preferences
 * RLS Policy: employees can view their own preferences
 */
export async function getMyPreferences() {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Preference[];
}

/**
 * Get preferences for all employees in the company (manager only)
 * RLS Policy: managers can view preferences of employees in their company
 */
export async function getCompanyPreferences() {
  const { data, error } = await supabase
    .from('preferences')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get a specific preference by ID
 * RLS Policy: employees can view their own, managers can view any in company
 */
export async function getPreferenceById(preferenceId: string) {
  const { data, error } = await supabase
    .from('preferences')
    .select('*, profiles(first_name, last_name)')
    .eq('id', preferenceId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new preference
 * RLS Policy: employees can create their own preferences
 */
export async function createPreference(preference: {
  profile_id: string;
  preference_type: string;
  preference_value: Record<string, unknown>;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('preferences')
    .insert({
      ...preference,
      status: preference.status || 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Preference;
}

/**
 * Update a preference
 * RLS Policy: employees can update their own, managers can update any in company
 */
export async function updatePreference(
  preferenceId: string,
  updates: {
    preference_type?: string;
    preference_value?: Record<string, unknown>;
    status?: string;
  }
) {
  const { data, error } = await supabase
    .from('preferences')
    .update(updates)
    .eq('id', preferenceId)
    .select()
    .single();

  if (error) throw error;
  return data as Preference;
}

/**
 * Approve a preference (manager only)
 * RLS Policy: managers can update preferences in their company
 */
export async function approvePreference(preferenceId: string) {
  return updatePreference(preferenceId, { status: 'approved' });
}

/**
 * Reject a preference (manager only)
 * RLS Policy: managers can update preferences in their company
 */
export async function rejectPreference(preferenceId: string) {
  return updatePreference(preferenceId, { status: 'rejected' });
}

/**
 * Delete a preference
 * RLS Policy: employees can delete their own preferences
 */
export async function deletePreference(preferenceId: string) {
  const { error } = await supabase.from('preferences').delete().eq('id', preferenceId);

  if (error) throw error;
}
