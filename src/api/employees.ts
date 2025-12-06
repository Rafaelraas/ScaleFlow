/**
 * Employees API
 * 
 * Typed API layer for employee management operations.
 * All operations enforce RLS policies defined in the database.
 * 
 * Note: This is essentially a wrapper around profiles API with
 * manager-specific operations.
 */

import { supabase } from '@/integrations/supabase/client.ts';

/**
 * Get all employees in the current company (manager only)
 * RLS Policy: managers can view profiles in their company
 */
export async function getCompanyEmployees() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .order('last_name', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get employee by ID (manager only)
 * RLS Policy: managers can view profiles in their company
 */
export async function getEmployeeById(employeeId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', employeeId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update employee role (manager only)
 * RLS Policy: managers can update profiles in their company
 */
export async function updateEmployeeRole(employeeId: string, roleId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role_id: roleId })
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove employee from company (manager only)
 * RLS Policy: managers can update profiles in their company
 * Note: This sets company_id to null rather than deleting the profile
 */
export async function removeEmployeeFromCompany(employeeId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ company_id: null })
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get employees by role (manager only)
 * RLS Policy: managers can view profiles in their company
 */
export async function getEmployeesByRole(roleName: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles!inner(name)')
    .eq('roles.name', roleName)
    .order('last_name', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get employee statistics (manager only)
 * This is a convenience function that aggregates employee data
 */
export async function getEmployeeStatistics() {
  const { data: employees, error } = await supabase
    .from('profiles')
    .select('*, roles(name)');

  if (error) throw error;

  // Aggregate statistics
  const stats = {
    total: employees?.length || 0,
    byRole: employees?.reduce((acc, emp) => {
      const roleName = (emp.roles as { name: string } | null)?.name || 'unknown';
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };

  return stats;
}
