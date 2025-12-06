/**
 * Route Configuration Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getRouteConfig,
  isPublicRoute,
  isAuthFlowRoute,
  getUnauthenticatedPaths,
  getPathsForRole,
  PUBLIC_ROUTES,
  AUTH_FLOW_ROUTES,
  MANAGER_ROUTES,
  EMPLOYEE_ROUTES,
  SYSTEM_ADMIN_ROUTES,
} from './routes';

describe('Route Configuration', () => {
  describe('getRouteConfig', () => {
    it('should return config for existing route', () => {
      const config = getRouteConfig('/dashboard');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Dashboard');
      expect(config?.requiresAuth).toBe(true);
    });

    it('should return undefined for non-existent route', () => {
      const config = getRouteConfig('/non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('isPublicRoute', () => {
    it('should return true for public routes', () => {
      expect(isPublicRoute('/')).toBe(true);
    });

    it('should return false for protected routes', () => {
      expect(isPublicRoute('/dashboard')).toBe(false);
      expect(isPublicRoute('/schedules')).toBe(false);
    });
  });

  describe('isAuthFlowRoute', () => {
    it('should return true for auth flow routes', () => {
      expect(isAuthFlowRoute('/login')).toBe(true);
      expect(isAuthFlowRoute('/register')).toBe(true);
      expect(isAuthFlowRoute('/verify')).toBe(true);
    });

    it('should return false for non-auth routes', () => {
      expect(isAuthFlowRoute('/dashboard')).toBe(false);
      expect(isAuthFlowRoute('/')).toBe(false);
    });
  });

  describe('getUnauthenticatedPaths', () => {
    it('should return all paths that do not require auth', () => {
      const paths = getUnauthenticatedPaths();
      expect(paths).toContain('/');
      expect(paths).toContain('/login');
      expect(paths).toContain('/register');
      expect(paths).toContain('/verify');
      expect(paths).not.toContain('/dashboard');
    });
  });

  describe('getPathsForRole', () => {
    it('should return paths for employee role', () => {
      const paths = getPathsForRole('employee');
      
      // Should include employee-specific routes
      expect(paths).toContain('/my-schedule');
      expect(paths).toContain('/preferences');
      
      // Should include generic protected routes
      expect(paths).toContain('/dashboard');
      expect(paths).toContain('/profile-settings');
      
      // Should NOT include manager-only routes
      expect(paths).not.toContain('/schedules');
      expect(paths).not.toContain('/employees');
      
      // Should NOT include admin routes
      expect(paths).not.toContain('/admin/companies');
    });

    it('should return paths for manager role', () => {
      const paths = getPathsForRole('manager');
      
      // Should include manager-specific routes
      expect(paths).toContain('/schedules');
      expect(paths).toContain('/employees');
      expect(paths).toContain('/company-settings');
      
      // Should include generic protected routes
      expect(paths).toContain('/dashboard');
      
      // Should NOT include employee-only routes
      expect(paths).not.toContain('/my-schedule');
      expect(paths).not.toContain('/preferences');
      
      // Should NOT include admin routes
      expect(paths).not.toContain('/admin/companies');
    });

    it('should return paths for system_admin role', () => {
      const paths = getPathsForRole('system_admin');
      
      // Should include admin routes
      expect(paths).toContain('/admin/companies');
      expect(paths).toContain('/admin/users');
      
      // Should include generic protected routes
      expect(paths).toContain('/dashboard');
      
      // Should NOT include role-specific routes
      expect(paths).not.toContain('/my-schedule');
      expect(paths).not.toContain('/schedules');
    });
  });

  describe('Route Definitions', () => {
    it('should have correct public routes', () => {
      expect(PUBLIC_ROUTES).toHaveLength(1);
      expect(PUBLIC_ROUTES[0].path).toBe('/');
      expect(PUBLIC_ROUTES[0].requiresAuth).toBe(false);
    });

    it('should have correct auth flow routes', () => {
      expect(AUTH_FLOW_ROUTES).toHaveLength(3);
      const paths = AUTH_FLOW_ROUTES.map(r => r.path);
      expect(paths).toContain('/login');
      expect(paths).toContain('/register');
      expect(paths).toContain('/verify');
    });

    it('should have manager routes with correct configuration', () => {
      MANAGER_ROUTES.forEach(route => {
        expect(route.requiresAuth).toBe(true);
        expect(route.requiresCompany).toBe(true);
        expect(route.allowedRoles).toEqual(['manager']);
        expect(route.category).toBe('manager_only');
      });
    });

    it('should have employee routes with correct configuration', () => {
      EMPLOYEE_ROUTES.forEach(route => {
        expect(route.requiresAuth).toBe(true);
        expect(route.requiresCompany).toBe(true);
        expect(route.allowedRoles).toEqual(['employee']);
        expect(route.category).toBe('employee_only');
      });
    });

    it('should have system admin routes with correct configuration', () => {
      SYSTEM_ADMIN_ROUTES.forEach(route => {
        expect(route.requiresAuth).toBe(true);
        expect(route.requiresCompany).toBe(false);
        expect(route.allowedRoles).toEqual(['system_admin']);
        expect(route.category).toBe('system_admin');
      });
    });

    it('should have tables accessed for all routes', () => {
      const allRoutes = [
        ...PUBLIC_ROUTES,
        ...AUTH_FLOW_ROUTES,
        ...MANAGER_ROUTES,
        ...EMPLOYEE_ROUTES,
        ...SYSTEM_ADMIN_ROUTES,
      ];

      allRoutes.forEach(route => {
        expect(route.tablesAccessed).toBeDefined();
        expect(Array.isArray(route.tablesAccessed)).toBe(true);
      });
    });
  });
});
