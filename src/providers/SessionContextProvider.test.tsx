import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionContextProvider, useSession } from './SessionContextProvider';
import { supabase } from '@/integrations/supabase/client.ts';
import { showError, showSuccess } from '@/utils/toast';
import { MemoryRouter } from 'react-router-dom';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
  isSupabaseConfigured: true,
}));

// Mock toast utilities
vi.mock('@/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

const mockShowError = showError as Mock;
const mockShowSuccess = showSuccess as Mock;

// Test component that uses the useSession hook
const TestComponent = () => {
  const { session, userProfile, userRole, isLoading } = useSession();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div data-testid="session-status">{session ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-profile">{userProfile ? JSON.stringify(userProfile) : 'No Profile'}</div>
      <div data-testid="user-role">{userRole || 'No Role'}</div>
    </div>
  );
};

describe('SessionContextProvider', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' },
    access_token: 'test-token',
    token_type: 'bearer',
  };

  const mockUserProfile = {
    id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: 'http://example.com/avatar.jpg',
    company_id: 'company-abc',
    role_id: 'role-employee',
    roles: { name: 'employee' },
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock for auth subscription
    const mockSubscription = { unsubscribe: vi.fn() };
    (supabase.auth.onAuthStateChange as Mock).mockReturnValue({
      data: { subscription: mockSubscription },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Profile Fetching', () => {
    it('should successfully fetch user profile when authenticated', async () => {
      // Mock successful session
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      // Mock successful profile fetch
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUserProfile,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      render(
        <MemoryRouter>
          <SessionContextProvider>
            <TestComponent />
          </SessionContextProvider>
        </MemoryRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify profile was fetched and displayed
      expect(screen.getByTestId('session-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('employee');
      expect(mockShowError).not.toHaveBeenCalled();
    });

    it('should show "Failed to load user profile" error when profile fetch fails', async () => {
      // Mock successful session
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      // Mock failed profile fetch
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: '500', details: 'Connection failed' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      render(
        <MemoryRouter>
          <SessionContextProvider>
            <TestComponent />
          </SessionContextProvider>
        </MemoryRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify error was shown
      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Failed to load user profile.');
      });

      // Verify profile is null
      expect(screen.getByTestId('user-profile')).toHaveTextContent('No Profile');
      expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
    });

    it('should show "Failed to load user profile" error when profile fetch throws exception', async () => {
      // Mock successful session
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      // Mock profile fetch that throws an error
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Network error', code: 'NETWORK_ERROR' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      render(
        <MemoryRouter>
          <SessionContextProvider>
            <TestComponent />
          </SessionContextProvider>
        </MemoryRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify error was shown
      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Failed to load user profile.');
      });
    });

    it('should handle missing role data gracefully', async () => {
      // Mock successful session
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      // Mock profile without role information
      const profileWithoutRole = {
        ...mockUserProfile,
        roles: null,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: profileWithoutRole,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      render(
        <MemoryRouter>
          <SessionContextProvider>
            <TestComponent />
          </SessionContextProvider>
        </MemoryRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify default role is used
      expect(screen.getByTestId('user-role')).toHaveTextContent('employee');
      expect(mockShowError).not.toHaveBeenCalled();
    });
  });

  describe('User Not Authenticated', () => {
    it('should handle no session gracefully', async () => {
      // Mock no session
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: null },
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <SessionContextProvider>
            <TestComponent />
          </SessionContextProvider>
        </MemoryRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify no authenticated session
      expect(screen.getByTestId('session-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('No Profile');
      expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
    });

    it('should not attempt to fetch profile when there is no session', async () => {
      const mockFrom = supabase.from as Mock;
      
      // Mock no session
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: null },
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <SessionContextProvider>
            <TestComponent />
          </SessionContextProvider>
        </MemoryRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify profile fetch was not attempted
      expect(mockFrom).not.toHaveBeenCalled();
      expect(mockShowError).not.toHaveBeenCalled();
    });
  });

  describe('Error Console Logging', () => {
    it('should log error to console when profile fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock successful session
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });

      // Mock failed profile fetch
      const mockError = { message: 'Database error', code: '500' };
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as Mock).mockReturnValue({ select: mockSelect });

      render(
        <MemoryRouter>
          <SessionContextProvider>
            <TestComponent />
          </SessionContextProvider>
        </MemoryRouter>
      );

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user profile:', mockError);
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
