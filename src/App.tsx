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
            <Route
              path="/create-company"
              element={
                <ProtectedRoute
                  requiresCompany={false}
                  allowedRoles={['manager', 'employee', 'operator', 'schedule_manager', 'staff']}
                />
              }
            >
              <Route
                index
                element={
                  <Layout>
                    <CreateCompany />
                  </Layout>
                }
              />
            </Route>

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/profile-settings"
                element={
                  <Layout>
                    <ProfileSettings />
                  </Layout>
                }
              />
              <Route
                path="/swap-requests"
                element={
                  <Layout>
                    <SwapRequests />
                  </Layout>
                }
              />
            </Route>

            {/* Rotas Protegidas para Gerentes e Schedule Managers */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'schedule_manager']} />}>
              <Route
                path="/schedules"
                element={
                  <Layout>
                    <Schedules />
                  </Layout>
                }
              />
              <Route
                path="/shift-templates"
                element={
                  <Layout>
                    <ShiftTemplates />
                  </Layout>
                }
              />
              <Route
                path="/employee-preferences"
                element={
                  <Layout>
                    <EmployeePreferences />
                  </Layout>
                }
              />
            </Route>

            {/* Rotas para Gerentes, Schedule Managers e Operadores */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['manager', 'schedule_manager', 'operator']} />
              }
            >
              <Route
                path="/employees"
                element={
                  <Layout>
                    <Employees />
                  </Layout>
                }
              />
            </Route>

            {/* Rotas Protegidas para Gerentes */}
            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
              <Route
                path="/company-settings"
                element={
                  <Layout>
                    <CompanySettings />
                  </Layout>
                }
              />
            </Route>

            {/* Rotas Protegidas para Funcionários e Staff */}
            <Route element={<ProtectedRoute allowedRoles={['employee', 'staff', 'operator']} />}>
              <Route
                path="/my-schedule"
                element={
                  <Layout>
                    <MySchedule />
                  </Layout>
                }
              />
            </Route>

            {/* Rotas Protegidas para Funcionários e Staff (preferências) */}
            <Route element={<ProtectedRoute allowedRoles={['employee', 'staff']} />}>
              <Route
                path="/preferences"
                element={
                  <Layout>
                    <Preferences />
                  </Layout>
                }
              />
            </Route>

            {/* Rotas Protegidas para Administradores do Sistema */}
            <Route
              element={<ProtectedRoute allowedRoles={['system_admin']} requiresCompany={false} />}
            >
              <Route
                path="/admin/companies"
                element={
                  <Layout>
                    <AdminCompanyManagement />
                  </Layout>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <Layout>
                    <AdminUserManagement />
                  </Layout>
                }
              />
              <Route
                path="/admin/feature-flags"
                element={
                  <Layout>
                    <FeatureFlagAdmin />
                  </Layout>
                }
              />
            </Route>

            {/* Rota catch-all para 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
