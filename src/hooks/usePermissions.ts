/**
 * usePermissions Hook
 *
 * React hook for checking user permissions in components.
 * Provides easy access to permission checks based on current user's role.
 */

import { useSession } from './useSession';
import {
  getRolePermissions,
  canAccessRoute,
  canManageUser,
  canModifyShift,
  canViewShift,
  canApproveSwapRequest,
  canApprovePreference,
  canAssignRole,
  getAssignableRoles,
  getRoleCapabilities,
  PermissionCheck,
} from '@/lib/permissions';
import { UserRole } from '@/types/roles';

/**
 * Hook return type with all permission checks and utilities
 */
export interface UsePermissionsReturn extends PermissionCheck {
  // User context
  userId: string | null;
  userRole: UserRole | null;
  companyId: string | null;

  // Route access
  canAccessRoute: (allowedRoles?: UserRole[], requiresCompany?: boolean) => boolean;

  // User management
  canManageUser: (targetCompanyId: string | null) => boolean;
  canAssignRole: (targetRole: UserRole) => boolean;
  assignableRoles: UserRole[];

  // Shift management
  canModifyShift: (shiftCompanyId: string | null) => boolean;
  canViewShift: (
    shiftEmployeeId: string | null,
    shiftCompanyId: string | null,
    isPublished: boolean
  ) => boolean;

  // Swap requests
  canApproveSwapRequest: (shiftCompanyId: string | null) => boolean;

  // Preferences
  canApprovePreference: (preferenceOwnerCompanyId: string | null) => boolean;

  // Capabilities
  capabilities: string[];
}

/**
 * Hook for accessing user permissions
 */
export function usePermissions(): UsePermissionsReturn {
  const { session, userProfile, userRole } = useSession();

  const userId = session?.user?.id ?? null;
  const companyId = userProfile?.company_id ?? null;

  // Get base permissions for the role
  const basePermissions = getRolePermissions(userRole);

  // Get role capabilities
  const capabilities = userRole ? getRoleCapabilities(userRole) : [];

  // Get assignable roles
  const assignableRoles = getAssignableRoles(userRole);

  return {
    // User context
    userId,
    userRole,
    companyId,

    // Base permissions
    ...basePermissions,

    // Route access
    canAccessRoute: (allowedRoles?: UserRole[], requiresCompany?: boolean) =>
      canAccessRoute(userRole, allowedRoles, requiresCompany, !!companyId),

    // User management
    canManageUser: (targetCompanyId: string | null) =>
      canManageUser(userRole, companyId, targetCompanyId),

    canAssignRole: (targetRole: UserRole) => canAssignRole(userRole, targetRole),

    assignableRoles,

    // Shift management
    canModifyShift: (shiftCompanyId: string | null) =>
      canModifyShift(userRole, companyId, shiftCompanyId),

    canViewShift: (
      shiftEmployeeId: string | null,
      shiftCompanyId: string | null,
      isPublished: boolean
    ) => canViewShift(userRole, userId, companyId, shiftEmployeeId, shiftCompanyId, isPublished),

    // Swap requests
    canApproveSwapRequest: (shiftCompanyId: string | null) =>
      canApproveSwapRequest(userRole, companyId, shiftCompanyId),

    // Preferences
    canApprovePreference: (preferenceOwnerCompanyId: string | null) =>
      canApprovePreference(userRole, companyId, preferenceOwnerCompanyId),

    // Capabilities
    capabilities,
  };
}

/**
 * Hook for simple permission checks
 * Returns just the boolean permission flags for conditional rendering
 */
export function useSimplePermissions() {
  const { userRole } = useSession();
  return getRolePermissions(userRole);
}
