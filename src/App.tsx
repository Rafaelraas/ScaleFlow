import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
import { PerformanceMonitor } from './components/PerformanceMonitor';

// Eager load critical auth/landing pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';

// Lazy load all other pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Schedules = lazy(() => import('./pages/Schedules'));
const Employees = lazy(() => import('./pages/Employees'));
const MySchedule = lazy(() => import('./pages/MySchedule'));
const Preferences = lazy(() => import('./pages/Preferences'));
const SwapRequests = lazy(() => import('./pages/SwapRequests'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const CompanySettings = lazy(() => import('./pages/CompanySettings'));
const ShiftTemplates = lazy(() => import('./pages/ShiftTemplates'));
const EmployeePreferences = lazy(() => import('./pages/EmployeePreferences'));
const CreateCompany = lazy(() => import('./pages/CreateCompany'));
const AdminCompanyManagement = lazy(() => import('./pages/AdminCompanyManagement'));
const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement'));
const FeatureFlagAdmin = lazy(() => import('./pages/FeatureFlagAdmin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

/**
 * Route Organization:
 * - Public routes: No auth required (/, /login, /register, /verify)
 * - Company creation: Auth required, no company (managers/employees without company)
 * - Generic protected: Auth + company, all roles
 * - Schedule management: Auth + company, managers + schedule_managers
 * - Employee management: Auth + company, managers + schedule_managers + operators
 * - Manager only: Auth + company, managers only
 * - Employee/Staff: Auth + company, employees/staff/operators
 * - System admin: Auth, no company, system_admin only
 */

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          {/* Performance monitoring in development only */}
          {import.meta.env.DEV && <PerformanceMonitor />}
          <Routes>
            {/* Public Routes - No authentication required */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Index />
                </Layout>
              }
            />

            {/* Company Creation - Auth required, no company */}
            <Route
              path="/create-company"
              element={
                <ProtectedRoute
                  requiresCompany={false}
                  allowedRoles={['manager', 'employee', 'operator', 'schedule_manager', 'staff']}
                >
                  <Layout>
                    <CreateCompany />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Generic Protected Routes - All authenticated users with company */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile-settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfileSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/swap-requests"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SwapRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Schedule Management Routes - Managers and Schedule Managers */}
            <Route
              path="/schedules"
              element={
                <ProtectedRoute allowedRoles={['manager', 'schedule_manager']}>
                  <Layout>
                    <Schedules />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shift-templates"
              element={
                <ProtectedRoute allowedRoles={['manager', 'schedule_manager']}>
                  <Layout>
                    <ShiftTemplates />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-preferences"
              element={
                <ProtectedRoute allowedRoles={['manager', 'schedule_manager']}>
                  <Layout>
                    <EmployeePreferences />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Employee Management Routes - Managers, Schedule Managers, and Operators */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['manager', 'schedule_manager', 'operator']}>
                  <Layout>
                    <Employees />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Manager-Only Routes */}
            <Route
              path="/company-settings"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Layout>
                    <CompanySettings />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Employee/Staff Routes - Personal schedules and preferences */}
            <Route
              path="/my-schedule"
              element={
                <ProtectedRoute allowedRoles={['employee', 'staff', 'operator']}>
                  <Layout>
                    <MySchedule />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/preferences"
              element={
                <ProtectedRoute allowedRoles={['employee', 'staff']}>
                  <Layout>
                    <Preferences />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* System Admin Routes - Platform-wide management */}
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={['system_admin']} requiresCompany={false}>
                  <Layout>
                    <AdminCompanyManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['system_admin']} requiresCompany={false}>
                  <Layout>
                    <AdminUserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feature-flags"
              element={
                <ProtectedRoute allowedRoles={['system_admin']} requiresCompany={false}>
                  <Layout>
                    <FeatureFlagAdmin />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 - Catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
