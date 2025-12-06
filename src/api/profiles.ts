/**
 * Profiles API
 * 
 * Typed API layer for profile-related operations.
 * All operations enforce RLS policies defined in the database.
 */

import { supabase } from '@/integrations/supabase/client.ts';
import { Profile } from '@/types/database';

/**
 * Get the current user's profile
 * RLS Policy: users can view their own profile
 */
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a profile by user ID
 * RLS Policy: users can view their own profile, managers can view profiles in their company
 */
export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update the current user's profile
 * RLS Policy: users can update their own profile
 */
export async function updateCurrentUserProfile(updates: {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

/**
 * Update a user's profile (manager/admin only)
 * RLS Policy: managers can update profiles in their company, admins can update any
 */
export async function updateProfile(userId: string, updates: {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  company_id?: string | null;
  role_id?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

/**
 * List profiles in the current user's company
 * RLS Policy: managers can view all profiles in their company
 */
export async function listCompanyProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .order('last_name', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * List all profiles (system admin only)
 * RLS Policy: only system admins can view all profiles
 */
export async function listAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name), companies(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Assign a user to a company
 * RLS Policy: managers can update profiles in their company
 */
export async function assignUserToCompany(userId: string, companyId: string, roleId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ company_id: companyId, role_id: roleId })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}
