import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useSession } from '@/hooks/useSession';

// Mock do useSession
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

const mockUseSession = useSession as Mock;

// Componente dummy para simular o conteúdo protegido
const ProtectedContent = () => <div>Protected Content</div>;
const AccessDeniedContent = () => <div>Access Denied</div>;

describe('ProtectedRoute', () => {
  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    mockUseSession.mockReset();
    // Mock console.log para evitar poluição nos logs de teste
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // Restaura os mocks após cada teste
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render nothing when session is loading', () => {
    mockUseSession.mockReturnValue({
      session: null,
      userProfile: null,
      userRole: null,
      isLoading: true,
    });

    render(
      <MemoryRouter
        initialEntries={['/protected']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('should redirect to /login if no session exists', () => {
    mockUseSession.mockReturnValue({
      session: null,
      userProfile: null,
      userRole: null,
      isLoading: false,
    });

    render(
      <MemoryRouter
        initialEntries={['/protected']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to /create-company if requiresCompany is true and user has no company_id', () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-123' } },
      userProfile: { id: 'user-123', company_id: null, role_name: 'employee' },
      userRole: 'employee',
      isLoading: false,
    });

    render(
      <MemoryRouter
        initialEntries={['/protected']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiresCompany={true}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route path="/create-company" element={<div>Create Company Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Create Company Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should grant access if requiresCompany is false and user has no company_id (e.g., system_admin)', () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-123' } },
      userProfile: { id: 'user-123', company_id: null, role_name: 'system_admin' },
      userRole: 'system_admin',
      isLoading: false,
    });

    render(
      <MemoryRouter
        initialEntries={['/admin-route']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/admin-route"
            element={
              <ProtectedRoute requiresCompany={false} allowedRoles={['system_admin']}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('should deny access if user role is not in allowedRoles', () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-123' } },
      userProfile: { id: 'user-123', company_id: 'comp-123', role_name: 'employee' },
      userRole: 'employee',
      isLoading: false,
    });

    render(
      <MemoryRouter
        initialEntries={['/manager-only']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/manager-only"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should grant access if all conditions are met', () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-123' } },
      userProfile: { id: 'user-123', company_id: 'comp-123', role_name: 'manager' },
      userRole: 'manager',
      isLoading: false,
    });

    render(
      <MemoryRouter
        initialEntries={['/manager-dashboard']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/manager-dashboard"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('should grant access if no specific roles are required and conditions are met', () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-123' } },
      userProfile: { id: 'user-123', company_id: 'comp-123', role_name: 'employee' },
      userRole: 'employee',
      isLoading: false,
    });

    render(
      <MemoryRouter
        initialEntries={['/any-authenticated']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/any-authenticated"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });
});
