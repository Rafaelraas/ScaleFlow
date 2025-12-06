/**
 * Route Configuration
 * 
 * Centralized route definitions that specify:
 * - Path
 * - Required roles
 * - Company requirement
 * - Route metadata
 * 
 * This configuration serves as a contract between frontend routing
 * and backend RLS policies.
 */

import { UserRole } from '@/types/roles';

export interface RouteConfig {
  /** Route path */
  path: string;
  
  /** Human-readable name for documentation */
  name: string;
  
  /** Description of what this route does */
  description: string;
  
  /** Roles allowed to access this route */
  allowedRoles?: UserRole[];
  
  /** Whether the route requires a company_id */
  requiresCompany?: boolean;
  
  /** Whether authentication is required */
  requiresAuth: boolean;
  
  /** Category for grouping routes */
  category: 'public' | 'auth_flow' | 'generic_protected' | 'manager_only' | 'employee_only' | 'system_admin';
  
  /** Supabase tables accessed by this route */
  tablesAccessed?: string[];
}

/**
 * Public routes - no authentication required
 */
export const PUBLIC_ROUTES: RouteConfig[] = [
  {
    path: '/',
    name: 'Landing Page',
    description: 'Public landing page',
    requiresAuth: false,
    category: 'public',
    tablesAccessed: [],
  },
];

/**
 * Auth flow routes - authentication pages
 */
export const AUTH_FLOW_ROUTES: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    description: 'User login page',
    requiresAuth: false,
    category: 'auth_flow',
    tablesAccessed: ['profiles', 'roles'],
  },
  {
    path: '/register',
    name: 'Register',
    description: 'User registration page',
    requiresAuth: false,
    category: 'auth_flow',
    tablesAccessed: ['profiles', 'roles'],
  },
  {
    path: '/verify',
    name: 'Verify Email',
    description: 'Email verification page',
    requiresAuth: false,
    category: 'auth_flow',
    tablesAccessed: [],
  },
];

/**
 * Company creation route - authenticated users without company
 * Note: Both manager and employee roles can create companies when they don't have one.
 * This allows for flexible onboarding where a manager creates their first company,
 * or an employee creates their own company if they're self-employed.
 * The SessionContextProvider handles redirection to prevent users with companies
 * from accessing this route.
 */
export const COMPANY_CREATION_ROUTE: RouteConfig = {
  path: '/create-company',
  name: 'Create Company',
  description: 'Page for creating a new company',
  requiresAuth: true,
  requiresCompany: false,
  allowedRoles: ['manager', 'employee'],
  category: 'generic_protected',
  tablesAccessed: ['companies', 'profiles'],
};

/**
 * Generic protected routes - any authenticated user with company
 */
export const GENERIC_PROTECTED_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    description: 'Main dashboard for all authenticated users',
    requiresAuth: true,
    requiresCompany: true,
    category: 'generic_protected',
    tablesAccessed: ['shifts', 'profiles', 'swap_requests'],
  },
  {
    path: '/profile-settings',
    name: 'Profile Settings',
    description: 'User profile settings page',
    requiresAuth: true,
    requiresCompany: true,
    category: 'generic_protected',
    tablesAccessed: ['profiles'],
  },
  {
    path: '/swap-requests',
    name: 'Swap Requests',
    description: 'View and manage shift swap requests',
    requiresAuth: true,
    requiresCompany: true,
    category: 'generic_protected',
    tablesAccessed: ['swap_requests', 'shifts', 'profiles'],
  },
];

/**
 * Manager-only routes
 */
export const MANAGER_ROUTES: RouteConfig[] = [
  {
    path: '/schedules',
    name: 'Schedules',
    description: 'Manage company schedules and shifts',
    requiresAuth: true,
    requiresCompany: true,
    allowedRoles: ['manager'],
    category: 'manager_only',
    tablesAccessed: ['shifts', 'profiles', 'shift_templates'],
  },
  {
    path: '/employees',
    name: 'Employees',
    description: 'Manage company employees',
    requiresAuth: true,
    requiresCompany: true,
    allowedRoles: ['manager'],
    category: 'manager_only',
    tablesAccessed: ['profiles', 'roles'],
  },
  {
    path: '/company-settings',
    name: 'Company Settings',
    description: 'Manage company settings',
    requiresAuth: true,
    requiresCompany: true,
    allowedRoles: ['manager'],
    category: 'manager_only',
    tablesAccessed: ['companies'],
  },
  {
    path: '/shift-templates',
    name: 'Shift Templates',
    description: 'Manage shift templates',
    requiresAuth: true,
    requiresCompany: true,
    allowedRoles: ['manager'],
    category: 'manager_only',
    tablesAccessed: ['shift_templates'],
  },
  {
    path: '/employee-preferences',
    name: 'Employee Preferences',
    description: 'View and manage employee schedule preferences',
    requiresAuth: true,
    requiresCompany: true,
    allowedRoles: ['manager'],
    category: 'manager_only',
    tablesAccessed: ['preferences', 'profiles'],
  },
];

/**
 * Employee-only routes
 */
export const EMPLOYEE_ROUTES: RouteConfig[] = [
  {
    path: '/my-schedule',
    name: 'My Schedule',
    description: 'View personal schedule',
    requiresAuth: true,
    requiresCompany: true,
    allowedRoles: ['employee'],
    category: 'employee_only',
    tablesAccessed: ['shifts'],
  },
  {
    path: '/preferences',
    name: 'Preferences',
    description: 'Manage personal schedule preferences',
    requiresAuth: true,
    requiresCompany: true,
    allowedRoles: ['employee'],
    category: 'employee_only',
    tablesAccessed: ['preferences'],
  },
];

/**
 * System admin routes
 */
export const SYSTEM_ADMIN_ROUTES: RouteConfig[] = [
  {
    path: '/admin/companies',
    name: 'Admin - Companies',
    description: 'System-wide company management',
    requiresAuth: true,
    requiresCompany: false,
    allowedRoles: ['system_admin'],
    category: 'system_admin',
    tablesAccessed: ['companies', 'profiles'],
  },
  {
    path: '/admin/users',
    name: 'Admin - Users',
    description: 'System-wide user management',
    requiresAuth: true,
    requiresCompany: false,
    allowedRoles: ['system_admin'],
    category: 'system_admin',
    tablesAccessed: ['profiles', 'roles'],
  },
];

/**
 * All routes combined
 */
export const ALL_ROUTES: RouteConfig[] = [
  ...PUBLIC_ROUTES,
  ...AUTH_FLOW_ROUTES,
  COMPANY_CREATION_ROUTE,
  ...GENERIC_PROTECTED_ROUTES,
  ...MANAGER_ROUTES,
  ...EMPLOYEE_ROUTES,
  ...SYSTEM_ADMIN_ROUTES,
];

/**
 * Get route configuration by path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return ALL_ROUTES.find(route => route.path === path);
}

/**
 * Check if a path is a public route
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => route.path === path);
}

/**
 * Check if a path is an auth flow route
 */
export function isAuthFlowRoute(path: string): boolean {
  return AUTH_FLOW_ROUTES.some(route => route.path === path);
}

/**
 * Get all paths that don't require authentication
 */
export function getUnauthenticatedPaths(): string[] {
  return ALL_ROUTES
    .filter(route => !route.requiresAuth)
    .map(route => route.path);
}

/**
 * Get all paths for a specific role
 */
export function getPathsForRole(role: UserRole): string[] {
  return ALL_ROUTES
    .filter(route => 
      !route.allowedRoles || 
      route.allowedRoles.includes(role)
    )
    .map(route => route.path);
}
