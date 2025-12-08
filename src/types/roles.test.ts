/**
 * Role Type Tests
 */

import { describe, it, expect } from 'vitest';
import {
  type UserRole,
  isValidRole,
  roleRequiresCompany,
  canAccessAdminRoutes,
  ROLE_PERMISSIONS,
} from './roles';

describe('Role Types', () => {
  describe('isValidRole', () => {
    it('should return true for valid roles', () => {
      expect(isValidRole('employee')).toBe(true);
      expect(isValidRole('manager')).toBe(true);
      expect(isValidRole('system_admin')).toBe(true);
      expect(isValidRole('operator')).toBe(true);
      expect(isValidRole('schedule_manager')).toBe(true);
      expect(isValidRole('staff')).toBe(true);
    });

    it('should return false for invalid roles', () => {
      expect(isValidRole('admin')).toBe(false);
      expect(isValidRole('user')).toBe(false);
      expect(isValidRole('superuser')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isValidRole(null)).toBe(false);
      expect(isValidRole(undefined)).toBe(false);
    });
  });

  describe('roleRequiresCompany', () => {
    it('should return true for employee', () => {
      expect(roleRequiresCompany('employee')).toBe(true);
    });

    it('should return true for manager', () => {
      expect(roleRequiresCompany('manager')).toBe(true);
    });

    it('should return true for new roles', () => {
      expect(roleRequiresCompany('staff')).toBe(true);
      expect(roleRequiresCompany('operator')).toBe(true);
      expect(roleRequiresCompany('schedule_manager')).toBe(true);
    });

    it('should return false for system_admin', () => {
      expect(roleRequiresCompany('system_admin')).toBe(false);
    });

    it('should return true for invalid or missing roles', () => {
      expect(roleRequiresCompany(null)).toBe(true);
      expect(roleRequiresCompany(undefined)).toBe(true);
      expect(roleRequiresCompany('invalid' as unknown as UserRole)).toBe(true);
    });
  });

  describe('canAccessAdminRoutes', () => {
    it('should return false for employee', () => {
      expect(canAccessAdminRoutes('employee')).toBe(false);
    });

    it('should return false for manager', () => {
      expect(canAccessAdminRoutes('manager')).toBe(false);
    });

    it('should return false for new roles', () => {
      expect(canAccessAdminRoutes('staff')).toBe(false);
      expect(canAccessAdminRoutes('operator')).toBe(false);
      expect(canAccessAdminRoutes('schedule_manager')).toBe(false);
    });

    it('should return true for system_admin', () => {
      expect(canAccessAdminRoutes('system_admin')).toBe(true);
    });

    it('should return false for invalid or missing roles', () => {
      expect(canAccessAdminRoutes(null)).toBe(false);
      expect(canAccessAdminRoutes(undefined)).toBe(false);
      expect(canAccessAdminRoutes('invalid' as unknown as UserRole)).toBe(false);
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should have permissions for all roles', () => {
      expect(ROLE_PERMISSIONS.employee).toBeDefined();
      expect(ROLE_PERMISSIONS.manager).toBeDefined();
      expect(ROLE_PERMISSIONS.system_admin).toBeDefined();
      expect(ROLE_PERMISSIONS.operator).toBeDefined();
      expect(ROLE_PERMISSIONS.schedule_manager).toBeDefined();
      expect(ROLE_PERMISSIONS.staff).toBeDefined();
    });

    it('should have correct structure for each role', () => {
      Object.values(ROLE_PERMISSIONS).forEach((permission) => {
        expect(permission.name).toBeDefined();
        expect(permission.description).toBeDefined();
        expect(typeof permission.requiresCompany).toBe('boolean');
        expect(typeof permission.canAccessAdmin).toBe('boolean');
      });
    });

    it('should have employee with correct permissions', () => {
      const employee = ROLE_PERMISSIONS.employee;
      expect(employee.requiresCompany).toBe(true);
      expect(employee.canAccessAdmin).toBe(false);
    });

    it('should have manager with correct permissions', () => {
      const manager = ROLE_PERMISSIONS.manager;
      expect(manager.requiresCompany).toBe(true);
      expect(manager.canAccessAdmin).toBe(false);
    });

    it('should have new roles with correct permissions', () => {
      expect(ROLE_PERMISSIONS.staff.requiresCompany).toBe(true);
      expect(ROLE_PERMISSIONS.staff.canAccessAdmin).toBe(false);

      expect(ROLE_PERMISSIONS.operator.requiresCompany).toBe(true);
      expect(ROLE_PERMISSIONS.operator.canAccessAdmin).toBe(false);

      expect(ROLE_PERMISSIONS.schedule_manager.requiresCompany).toBe(true);
      expect(ROLE_PERMISSIONS.schedule_manager.canAccessAdmin).toBe(false);
    });

    it('should have system_admin with correct permissions', () => {
      const admin = ROLE_PERMISSIONS.system_admin;
      expect(admin.requiresCompany).toBe(false);
      expect(admin.canAccessAdmin).toBe(true);
    });
  });
});
