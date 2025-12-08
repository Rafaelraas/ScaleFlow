/**
 * Permission Utilities
 *
 * Frontend permission checking for UI elements and actions.
 * These checks mirror the RLS policies in the database but are for UI/UX only.
 * Backend always enforces permissions through RLS.
 */

import { UserRole, ROLE_PERMISSIONS } from '@/types/roles';

/**
 * Permission levels in the system
 */
export enum PermissionLevel {
  PLATFORM_ADMIN = 5, // system_admin
  COMPANY_ADMIN = 4, // manager
  SCHEDULE_ADMIN = 3, // schedule_manager
  OPERATIONS = 2, // operator
  BASIC = 1, // employee, staff
}

/**
 * Get the permission level for a role
 */
export function getRoleLevel(role: UserRole): PermissionLevel {
  switch (role) {
    case 'system_admin':
      return PermissionLevel.PLATFORM_ADMIN;
    case 'manager':
      return PermissionLevel.COMPANY_ADMIN;
    case 'schedule_manager':
      return PermissionLevel.SCHEDULE_ADMIN;
    case 'operator':
      return PermissionLevel.OPERATIONS;
    case 'employee':
    case 'staff':
      return PermissionLevel.BASIC;
  }
}

/**
 * Check if a role has at least the specified permission level
 */
export function hasMinimumLevel(role: UserRole, level: PermissionLevel): boolean {
  return getRoleLevel(role) >= level;
}

/**
 * Check if a role can perform a specific action
 */
export interface PermissionCheck {
  canManageCompany: boolean;
  canManageSchedules: boolean;
  canManageEmployees: boolean;
  canViewEmployees: boolean;
  canApproveSwaps: boolean;
  canApprovePreferences: boolean;
  canViewReports: boolean;
  canAccessAdmin: boolean;
  requiresCompany: boolean;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole | null): PermissionCheck {
  if (!role) {
    return {
      canManageCompany: false,
      canManageSchedules: false,
      canManageEmployees: false,
      canViewEmployees: false,
      canApproveSwaps: false,
      canApprovePreferences: false,
      canViewReports: false,
      canAccessAdmin: false,
      requiresCompany: true,
    };
  }

  const level = getRoleLevel(role);
  const roleConfig = ROLE_PERMISSIONS[role];

  return {
    // Company management - Manager only
    canManageCompany: level >= PermissionLevel.COMPANY_ADMIN,

    // Schedule management - Manager and Schedule Manager
    canManageSchedules: level >= PermissionLevel.SCHEDULE_ADMIN,

    // Employee management - Manager only (operators can view but not manage)
    canManageEmployees: level >= PermissionLevel.COMPANY_ADMIN,

    // View employees - Manager, Schedule Manager, Operator
    canViewEmployees: level >= PermissionLevel.OPERATIONS,

    // Approve swaps - Manager and Schedule Manager
    canApproveSwaps: level >= PermissionLevel.SCHEDULE_ADMIN,

    // Approve preferences - Manager and Schedule Manager
    canApprovePreferences: level >= PermissionLevel.SCHEDULE_ADMIN,

    // View reports - Manager, Schedule Manager, Operator
    canViewReports: level >= PermissionLevel.OPERATIONS,

    // Access admin routes - System Admin only
    canAccessAdmin: level >= PermissionLevel.PLATFORM_ADMIN,

    // Requires company
    requiresCompany: roleConfig.requiresCompany,
  };
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(
  userRole: UserRole | null,
  allowedRoles?: UserRole[],
  requiresCompany?: boolean,
  userHasCompany?: boolean
): boolean {
  // No role, no access
  if (!userRole) return false;

  // Check company requirement
  if (requiresCompany && !userHasCompany) {
    return userRole === 'system_admin'; // System admin doesn't need company
  }

  // No role restrictions means all authenticated users can access
  if (!allowedRoles || allowedRoles.length === 0) return true;

  // Check if user's role is in allowed roles
  return allowedRoles.includes(userRole);
}

/**
 * Check if user can manage another user
 * Managers can manage users in their company
 * System admins can manage all users
 */
export function canManageUser(
  currentRole: UserRole | null,
  currentCompanyId: string | null,
  targetCompanyId: string | null
): boolean {
  if (!currentRole) return false;

  // System admin can manage anyone
  if (currentRole === 'system_admin') return true;

  // Managers can manage users in their company
  if (currentRole === 'manager') {
    return currentCompanyId === targetCompanyId && currentCompanyId !== null;
  }

  return false;
}

/**
 * Check if user can modify a shift
 */
export function canModifyShift(
  userRole: UserRole | null,
  userCompanyId: string | null,
  shiftCompanyId: string | null
): boolean {
  if (!userRole || !userCompanyId) return false;

  // System admin can modify any shift
  if (userRole === 'system_admin') return true;

  // Managers and schedule managers can modify shifts in their company
  if (userRole === 'manager' || userRole === 'schedule_manager') {
    return userCompanyId === shiftCompanyId;
  }

  return false;
}

/**
 * Check if user can view a shift
 */
export function canViewShift(
  userRole: UserRole | null,
  userId: string | null,
  userCompanyId: string | null,
  shiftEmployeeId: string | null,
  shiftCompanyId: string | null,
  isPublished: boolean
): boolean {
  if (!userRole || !userId) return false;

  // System admin can view any shift
  if (userRole === 'system_admin') return true;

  // Managers, schedule managers, and operators can view all company shifts
  if (userRole === 'manager' || userRole === 'schedule_manager' || userRole === 'operator') {
    return userCompanyId === shiftCompanyId;
  }

  // Employees and staff can view their own published shifts
  if (userRole === 'employee' || userRole === 'staff') {
    return shiftEmployeeId === userId && isPublished;
  }

  return false;
}

/**
 * Check if user can approve a swap request
 */
export function canApproveSwapRequest(
  userRole: UserRole | null,
  userCompanyId: string | null,
  shiftCompanyId: string | null
): boolean {
  if (!userRole || !userCompanyId) return false;

  // System admin can approve any swap
  if (userRole === 'system_admin') return true;

  // Managers and schedule managers can approve swaps in their company
  if (userRole === 'manager' || userRole === 'schedule_manager') {
    return userCompanyId === shiftCompanyId;
  }

  return false;
}

/**
 * Check if user can approve a preference
 */
export function canApprovePreference(
  userRole: UserRole | null,
  userCompanyId: string | null,
  preferenceOwnerCompanyId: string | null
): boolean {
  if (!userRole || !userCompanyId) return false;

  // System admin can approve any preference
  if (userRole === 'system_admin') return true;

  // Managers and schedule managers can approve preferences in their company
  if (userRole === 'manager' || userRole === 'schedule_manager') {
    return userCompanyId === preferenceOwnerCompanyId;
  }

  return false;
}

/**
 * Get a human-readable description of what a role can do
 */
export function getRoleCapabilities(role: UserRole): string[] {
  const permissions = getRolePermissions(role);
  const capabilities: string[] = [];

  if (permissions.canAccessAdmin) {
    capabilities.push('Manage all companies and users');
    capabilities.push('Configure platform settings');
    capabilities.push('Manage feature flags');
  }

  if (permissions.canManageCompany) {
    capabilities.push('Manage company settings');
    capabilities.push('Add and remove employees');
  }

  if (permissions.canManageSchedules) {
    capabilities.push('Create and modify schedules');
    capabilities.push('Manage shift templates');
    capabilities.push('Publish shifts');
  }

  if (permissions.canViewEmployees) {
    capabilities.push('View employee information');
  }

  if (permissions.canApproveSwaps) {
    capabilities.push('Approve shift swap requests');
  }

  if (permissions.canApprovePreferences) {
    capabilities.push('Review and approve employee preferences');
  }

  if (permissions.canViewReports) {
    capabilities.push('View operational reports');
  }

  // Basic capabilities for all roles
  capabilities.push('View personal schedule');
  capabilities.push('Update profile settings');

  if (role === 'employee' || role === 'staff') {
    capabilities.push('Submit availability preferences');
    capabilities.push('Request shift swaps');
  }

  return capabilities;
}

/**
 * Check if role can be assigned by current user
 * System admins can assign any role
 * Managers can assign non-admin roles within their company
 */
export function canAssignRole(currentRole: UserRole | null, targetRole: UserRole): boolean {
  if (!currentRole) return false;

  // System admin can assign any role
  if (currentRole === 'system_admin') return true;

  // Managers can assign non-admin roles
  if (currentRole === 'manager') {
    return targetRole !== 'system_admin';
  }

  return false;
}

/**
 * Get roles that can be assigned by current user
 */
export function getAssignableRoles(currentRole: UserRole | null): UserRole[] {
  if (!currentRole) return [];

  if (currentRole === 'system_admin') {
    return ['system_admin', 'manager', 'schedule_manager', 'operator', 'employee', 'staff'];
  }

  if (currentRole === 'manager') {
    return ['manager', 'schedule_manager', 'operator', 'employee', 'staff'];
  }

  return [];
}
