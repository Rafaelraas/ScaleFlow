import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../pages/Dashboard';
import { useSession } from '@/hooks/useSession';

// Mock useSession
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

// Mock Supabase client with proper chain
vi.mock('@/integrations/supabase/client', () => {
  const createMockQuery = (returnValue: unknown = { data: [], error: null, count: 0 }) => {
    const mockQuery: Record<string, unknown> = {
      eq: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery),
      limit: vi.fn(() => Promise.resolve(returnValue)),
      or: vi.fn(() => mockQuery),
      in: vi.fn(() => Promise.resolve(returnValue)),
      then: vi.fn((resolve) => resolve(returnValue)),
    };
    return mockQuery;
  };

  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => createMockQuery()),
      })),
    },
  };
});

// Mock toast
vi.mock('@/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

const mockUseSession = useSession as Mock;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderDashboard = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading state with skeleton loaders when session is loading', () => {
    mockUseSession.mockReturnValue({
      session: null,
      userProfile: null,
      userRole: null,
      isLoading: true,
    });

    renderDashboard();

    // Should show skeleton loaders (multiple skeleton elements exist)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show loading skeleton when dashboard is loading', async () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-123', email: 'test@test.com' } },
      userProfile: {
        id: 'user-123',
        first_name: 'Test',
        last_name: 'User',
        company_id: 'company-123',
        role_name: 'manager',
      },
      userRole: 'manager',
      isLoading: false, // Session not loading
    });

    renderDashboard();

    // Initially should show skeletons while data is being fetched
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should eventually render welcome message for manager', async () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-123', email: 'manager@test.com' } },
      userProfile: {
        id: 'user-123',
        first_name: 'Manager',
        last_name: 'Test',
        company_id: 'company-123',
        role_name: 'manager',
      },
      userRole: 'manager',
      isLoading: false,
    });

    renderDashboard();

    // The component will eventually show welcome message after data loads
    await waitFor(
      () => {
        expect(screen.getByText('Welcome, Manager!')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should eventually render welcome message for employee', async () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-456', email: 'employee@test.com' } },
      userProfile: {
        id: 'user-456',
        first_name: 'Employee',
        last_name: 'Test',
        company_id: 'company-123',
        role_name: 'employee',
      },
      userRole: 'employee',
      isLoading: false,
    });

    renderDashboard();

    await waitFor(
      () => {
        expect(screen.getByText('Welcome, Employee!')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should eventually render welcome message for system admin', async () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-admin', email: 'admin@test.com' } },
      userProfile: {
        id: 'user-admin',
        first_name: 'Admin',
        last_name: 'Test',
        company_id: null,
        role_name: 'system_admin',
      },
      userRole: 'system_admin',
      isLoading: false,
    });

    renderDashboard();

    await waitFor(
      () => {
        expect(screen.getByText('Welcome, Admin!')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should display email if first name is not available', async () => {
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-123', email: 'john@test.com' } },
      userProfile: {
        id: 'user-123',
        first_name: null,
        last_name: null,
        company_id: 'company-123',
        role_name: 'employee',
      },
      userRole: 'employee',
      isLoading: false,
    });

    renderDashboard();

    await waitFor(
      () => {
        expect(screen.getByText('Welcome, john@test.com!')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
