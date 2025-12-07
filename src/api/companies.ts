/**
 * Companies API
 *
 * Typed API layer for company-related operations.
 * All operations enforce RLS policies defined in the database.
 */

import { supabase } from '@/integrations/supabase/client.ts';
import { Company } from '@/types/database';

/**
 * Get the current user's company
 * RLS Policy: users can view their own company
 */
export async function getCurrentUserCompany() {
  const { data, error } = await supabase.from('companies').select('*').single();

  if (error) throw error;
  return data as Company;
}

/**
 * Get a specific company by ID
 * RLS Policy: users can view their own company, system admins can view all
 */
export async function getCompanyById(companyId: string) {
  const { data, error } = await supabase.from('companies').select('*').eq('id', companyId).single();

  if (error) throw error;
  return data as Company;
}

/**
 * Create a new company
 * RLS Policy: authenticated users can create companies (they'll be auto-assigned as owners)
 */
export async function createCompany(name: string, settings?: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('companies')
    .insert({
      name,
      settings: settings || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

/**
 * Update company settings
 * RLS Policy: only managers of the company can update
 */
export async function updateCompany(
  companyId: string,
  updates: {
    name?: string;
    settings?: Record<string, unknown> | null;
  }
) {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

/**
 * List all companies (system admin only)
 * RLS Policy: only accessible by system admins
 */
export async function listAllCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Company[];
}

/**
 * Delete a company (system admin only)
 * RLS Policy: only system admins can delete companies
 */
export async function deleteCompany(companyId: string) {
  const { error } = await supabase.from('companies').delete().eq('id', companyId);

  if (error) throw error;
}
