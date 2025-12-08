/**
 * Route Generator
 *
 * Generates React Router routes from route configuration.
 * This ensures consistency between route config and actual routes.
 */

import { lazy, ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { RouteConfig } from '@/config/routes';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';

// Import page components - these should match the paths in routes.ts
const pageComponents: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  '/': lazy(() => import('@/pages/Index')),
  '/dashboard': lazy(() => import('@/pages/Dashboard')),
  '/schedules': lazy(() => import('@/pages/Schedules')),
  '/employees': lazy(() => import('@/pages/Employees')),
  '/my-schedule': lazy(() => import('@/pages/MySchedule')),
  '/preferences': lazy(() => import('@/pages/Preferences')),
  '/swap-requests': lazy(() => import('@/pages/SwapRequests')),
  '/profile-settings': lazy(() => import('@/pages/ProfileSettings')),
  '/company-settings': lazy(() => import('@/pages/CompanySettings')),
  '/shift-templates': lazy(() => import('@/pages/ShiftTemplates')),
  '/employee-preferences': lazy(() => import('@/pages/EmployeePreferences')),
  '/create-company': lazy(() => import('@/pages/CreateCompany')),
  '/admin/companies': lazy(() => import('@/pages/AdminCompanyManagement')),
  '/admin/users': lazy(() => import('@/pages/AdminUserManagement')),
  '/admin/feature-flags': lazy(() => import('@/pages/FeatureFlagAdmin')),
};

/**
 * Generates a React Router Route element from a RouteConfig
 */
export function generateRoute(config: RouteConfig): ReactElement {
  const PageComponent = pageComponents[config.path];

  if (!PageComponent) {
    console.warn(`No page component found for path: ${config.path}`);
    return <Route key={config.path} path={config.path} element={<div>Page not found</div>} />;
  }

  // Public routes (no auth required)
  if (!config.requiresAuth) {
    return (
      <Route
        key={config.path}
        path={config.path}
        element={
          config.path === '/' ? (
            <Layout>
              <PageComponent />
            </Layout>
          ) : (
            <PageComponent />
          )
        }
      />
    );
  }

  // Protected routes (auth required)
  return (
    <Route
      key={config.path}
      path={config.path}
      element={
        <ProtectedRoute requiresCompany={config.requiresCompany} allowedRoles={config.allowedRoles}>
          <Layout>
            <PageComponent />
          </Layout>
        </ProtectedRoute>
      }
    />
  );
}

/**
 * Generates multiple routes from an array of RouteConfig
 */
export function generateRoutes(configs: RouteConfig[]): ReactElement[] {
  return configs.map(generateRoute);
}

/**
 * Groups routes by their allowed roles for nested route generation
 */
export function groupRoutesByRoles(configs: RouteConfig[]): Map<string, RouteConfig[]> {
  const grouped = new Map<string, RouteConfig[]>();

  for (const config of configs) {
    const key = config.allowedRoles?.sort().join(',') || 'public';
    const existing = grouped.get(key) || [];
    grouped.set(key, [...existing, config]);
  }

  return grouped;
}
