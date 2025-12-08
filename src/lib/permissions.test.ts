import { describe, it, expect } from 'vitest';
import {
  getRoleLevel,
  hasMinimumLevel,
  getRolePermissions,
  canAccessRoute,
  canManageUser,
  canModifyShift,
  canViewShift,
  canApproveSwapRequest,
  canApprovePreference,
  canAssignRole,
  getAssignableRoles,
  PermissionLevel,
} from './permissions';

describe('permissions', () => {
  describe('getRoleLevel', () => {
    it('should return correct permission levels', () => {
      expect(getRoleLevel('system_admin')).toBe(PermissionLevel.PLATFORM_ADMIN);
      expect(getRoleLevel('manager')).toBe(PermissionLevel.COMPANY_ADMIN);
      expect(getRoleLevel('schedule_manager')).toBe(PermissionLevel.SCHEDULE_ADMIN);
      expect(getRoleLevel('operator')).toBe(PermissionLevel.OPERATIONS);
      expect(getRoleLevel('employee')).toBe(PermissionLevel.BASIC);
      expect(getRoleLevel('staff')).toBe(PermissionLevel.BASIC);
    });
  });

  describe('hasMinimumLevel', () => {
    it('should check if role has minimum permission level', () => {
      expect(hasMinimumLevel('manager', PermissionLevel.BASIC)).toBe(true);
      expect(hasMinimumLevel('employee', PermissionLevel.COMPANY_ADMIN)).toBe(false);
      expect(hasMinimumLevel('schedule_manager', PermissionLevel.SCHEDULE_ADMIN)).toBe(true);
    });
  });

  describe('getRolePermissions', () => {
    it('should return correct permissions for system_admin', () => {
      const permissions = getRolePermissions('system_admin');
      expect(permissions.canManageCompany).toBe(true);
      expect(permissions.canManageSchedules).toBe(true);
      expect(permissions.canAccessAdmin).toBe(true);
      expect(permissions.requiresCompany).toBe(false);
    });

    it('should return correct permissions for manager', () => {
      const permissions = getRolePermissions('manager');
      expect(permissions.canManageCompany).toBe(true);
      expect(permissions.canManageSchedules).toBe(true);
      expect(permissions.canAccessAdmin).toBe(false);
      expect(permissions.requiresCompany).toBe(true);
    });

    it('should return correct permissions for schedule_manager', () => {
      const permissions = getRolePermissions('schedule_manager');
      expect(permissions.canManageCompany).toBe(false);
      expect(permissions.canManageSchedules).toBe(true);
      expect(permissions.canManageEmployees).toBe(false);
      expect(permissions.canViewEmployees).toBe(true);
    });

    it('should return correct permissions for operator', () => {
      const permissions = getRolePermissions('operator');
      expect(permissions.canManageSchedules).toBe(false);
      expect(permissions.canViewEmployees).toBe(true);
      expect(permissions.canApproveSwaps).toBe(false);
    });

    it('should return correct permissions for employee', () => {
      const permissions = getRolePermissions('employee');
      expect(permissions.canManageCompany).toBe(false);
      expect(permissions.canManageSchedules).toBe(false);
      expect(permissions.canViewEmployees).toBe(false);
    });
  });

  describe('canAccessRoute', () => {
    it('should allow access when no role restrictions', () => {
      expect(canAccessRoute('employee', undefined, true, true)).toBe(true);
    });

    it('should deny access when role not in allowed roles', () => {
      expect(canAccessRoute('employee', ['manager'], true, true)).toBe(false);
    });

    it('should allow access when role is in allowed roles', () => {
      expect(canAccessRoute('manager', ['manager', 'schedule_manager'], true, true)).toBe(true);
    });

    it('should deny access when company required but user has none', () => {
      expect(canAccessRoute('manager', ['manager'], true, false)).toBe(false);
    });

    it('should allow system_admin access without company', () => {
      expect(canAccessRoute('system_admin', ['system_admin'], true, false)).toBe(true);
    });
  });

  describe('canManageUser', () => {
    it('should allow system_admin to manage any user', () => {
      expect(canManageUser('system_admin', 'company1', 'company2')).toBe(true);
    });

    it('should allow manager to manage users in same company', () => {
      expect(canManageUser('manager', 'company1', 'company1')).toBe(true);
    });

    it('should deny manager managing users in different company', () => {
      expect(canManageUser('manager', 'company1', 'company2')).toBe(false);
    });

    it('should deny non-managers from managing users', () => {
      expect(canManageUser('employee', 'company1', 'company1')).toBe(false);
    });
  });

  describe('canModifyShift', () => {
    it('should allow manager to modify shifts in their company', () => {
      expect(canModifyShift('manager', 'company1', 'company1')).toBe(true);
    });

    it('should allow schedule_manager to modify shifts in their company', () => {
      expect(canModifyShift('schedule_manager', 'company1', 'company1')).toBe(true);
    });

    it('should deny operator from modifying shifts', () => {
      expect(canModifyShift('operator', 'company1', 'company1')).toBe(false);
    });

    it('should deny employee from modifying shifts', () => {
      expect(canModifyShift('employee', 'company1', 'company1')).toBe(false);
    });
  });

  describe('canViewShift', () => {
    it('should allow employee to view their own published shift', () => {
      expect(canViewShift('employee', 'user1', 'company1', 'user1', 'company1', true)).toBe(true);
    });

    it('should deny employee viewing unpublished shift', () => {
      expect(canViewShift('employee', 'user1', 'company1', 'user1', 'company1', false)).toBe(false);
    });

    it('should allow manager to view all company shifts', () => {
      expect(canViewShift('manager', 'user1', 'company1', 'user2', 'company1', false)).toBe(true);
    });

    it('should allow operator to view all company shifts', () => {
      expect(canViewShift('operator', 'user1', 'company1', 'user2', 'company1', false)).toBe(true);
    });

    it('should deny employee viewing other employee shift', () => {
      expect(canViewShift('employee', 'user1', 'company1', 'user2', 'company1', true)).toBe(false);
    });
  });

  describe('canApproveSwapRequest', () => {
    it('should allow manager to approve swaps', () => {
      expect(canApproveSwapRequest('manager', 'company1', 'company1')).toBe(true);
    });

    it('should allow schedule_manager to approve swaps', () => {
      expect(canApproveSwapRequest('schedule_manager', 'company1', 'company1')).toBe(true);
    });

    it('should deny operator from approving swaps', () => {
      expect(canApproveSwapRequest('operator', 'company1', 'company1')).toBe(false);
    });

    it('should deny employee from approving swaps', () => {
      expect(canApproveSwapRequest('employee', 'company1', 'company1')).toBe(false);
    });
  });

  describe('canApprovePreference', () => {
    it('should allow manager to approve preferences', () => {
      expect(canApprovePreference('manager', 'company1', 'company1')).toBe(true);
    });

    it('should allow schedule_manager to approve preferences', () => {
      expect(canApprovePreference('schedule_manager', 'company1', 'company1')).toBe(true);
    });

    it('should deny operator from approving preferences', () => {
      expect(canApprovePreference('operator', 'company1', 'company1')).toBe(false);
    });
  });

  describe('canAssignRole', () => {
    it('should allow system_admin to assign any role', () => {
      expect(canAssignRole('system_admin', 'system_admin')).toBe(true);
      expect(canAssignRole('system_admin', 'manager')).toBe(true);
    });

    it('should allow manager to assign non-admin roles', () => {
      expect(canAssignRole('manager', 'manager')).toBe(true);
      expect(canAssignRole('manager', 'employee')).toBe(true);
    });

    it('should deny manager from assigning system_admin role', () => {
      expect(canAssignRole('manager', 'system_admin')).toBe(false);
    });

    it('should deny employee from assigning roles', () => {
      expect(canAssignRole('employee', 'employee')).toBe(false);
    });
  });

  describe('getAssignableRoles', () => {
    it('should return all roles for system_admin', () => {
      const roles = getAssignableRoles('system_admin');
      expect(roles).toContain('system_admin');
      expect(roles).toContain('manager');
      expect(roles.length).toBe(6);
    });

    it('should return non-admin roles for manager', () => {
      const roles = getAssignableRoles('manager');
      expect(roles).not.toContain('system_admin');
      expect(roles).toContain('manager');
      expect(roles).toContain('employee');
      expect(roles.length).toBe(5);
    });

    it('should return empty array for employee', () => {
      const roles = getAssignableRoles('employee');
      expect(roles.length).toBe(0);
    });
  });
});
