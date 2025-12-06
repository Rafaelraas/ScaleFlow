/**
 * Role Type Definitions
 * 
 * Centralized role definitions to maintain consistency between
 * frontend routing and backend RLS policies.
 */

/**
 * Available user roles in the system
 * These must match exactly with the 'name' column in the roles table
 */
export type UserRole = 'employee' | 'manager' | 'system_admin';

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidRole(role: string | null | undefined): role is UserRole {
  return role === 'employee' || role === 'manager' || role === 'system_admin';
}

/**
 * Role permissions metadata
 * Describes what each role can access
 */
export const ROLE_PERMISSIONS = {
  employee: {
    name: 'Employee',
    description: 'Standard employee with access to their own schedules and preferences',
    requiresCompany: true,
    canAccessAdmin: false,
  },
  manager: {
    name: 'Manager',
    description: 'Company manager with full control over schedules, employees, and settings',
    requiresCompany: true,
    canAccessAdmin: false,
  },
  system_admin: {
    name: 'System Administrator',
    description: 'System-wide administrator with cross-company access',
    requiresCompany: false,
    canAccessAdmin: true,
  },
} as const;

/**
 * Helper function to check if a role requires a company
 */
export function roleRequiresCompany(role: UserRole | null | undefined): boolean {
  if (!role || !isValidRole(role)) return true;
  return ROLE_PERMISSIONS[role].requiresCompany;
}

/**
 * Helper function to check if a role can access admin routes
 */
export function canAccessAdminRoutes(role: UserRole | null | undefined): boolean {
  if (!role || !isValidRole(role)) return false;
  return ROLE_PERMISSIONS[role].canAccessAdmin;
}
