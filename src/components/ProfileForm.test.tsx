import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileForm from './ProfileForm';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client.ts';
import { showSuccess, showError } from '@/utils/toast';
import { MemoryRouter } from 'react-router-dom'; // Needed for Link/navigation context

// Mock do useSession
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

// Mock do cliente Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock das funções de toast
vi.mock('@/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

const mockUseSession = useSession as Mock;
const mockShowSuccess = showSuccess as Mock;
const mockShowError = showError as Mock;
const mockFrom = supabase.from as Mock;

describe('ProfileForm', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' },
  };
  const mockUserProfile = {
    id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: 'http://example.com/avatar.jpg',
    company_id: 'company-abc',
    role_id: 'role-employee',
    role_name: 'employee',
  };

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      session: mockSession,
      userProfile: mockUserProfile,
      userRole: mockUserProfile.role_name,
      isLoading: false,
    });
    
    // Reset mocks
    mockFrom.mockClear();
    mockShowSuccess.mockClear();
    mockShowError.mockClear();
    
    // Set up default mock chain for successful updates
    const mockEq = vi.fn().mockResolvedValue({ error: null, data: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading state when isLoading is true', () => {
    mockUseSession.mockReturnValue({
      session: null,
      userProfile: null,
      userRole: null,
      isLoading: true,
    });
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ProfileForm /></MemoryRouter>);
    expect(screen.getByText('Loading profile data...')).toBeInTheDocument();
  });

  it('should pre-fill form fields with user profile data', () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ProfileForm /></MemoryRouter>);

    expect(screen.getByLabelText('First Name (Optional)')).toHaveValue('John');
    expect(screen.getByLabelText('Last Name (Optional)')).toHaveValue('Doe');
    expect(screen.getByLabelText('Avatar URL (Optional)')).toHaveValue('http://example.com/avatar.jpg');
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Employee')).toBeInTheDocument();
  });

  it('should allow updating first name and last name', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null, data: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });
    
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ProfileForm /></MemoryRouter>);

    const firstNameInput = screen.getByLabelText('First Name (Optional)');
    const lastNameInput = screen.getByLabelText('Last Name (Optional)');
    const saveButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Smith',
        avatar_url: 'http://example.com/avatar.jpg', // Avatar URL should remain if not changed
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockShowSuccess).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('should handle avatar URL update', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null, data: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });
    
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ProfileForm /></MemoryRouter>);

    const avatarUrlInput = screen.getByLabelText('Avatar URL (Optional)');
    const saveButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(avatarUrlInput, { target: { value: 'http://new.com/avatar.png' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: 'http://new.com/avatar.png',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('should show error toast on Supabase update failure', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Database error' }, data: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ProfileForm /></MemoryRouter>);

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to update profile: Database error');
      expect(mockShowSuccess).not.toHaveBeenCalled();
    });
  });

  it('should disable button during submission', async () => {
    // Simulate a pending Supabase call
    let resolveSupabaseCall: ((value: { data: null; error: null }) => void) | undefined;
    const mockEq = vi.fn().mockReturnValue(new Promise(resolve => { resolveSupabaseCall = resolve; }));
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ProfileForm /></MemoryRouter>);

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveButton);

    // Wait for React to re-render with the updated state
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveTextContent('Saving...');
    });

    // Resolve the promise to end submission
    resolveSupabaseCall!({ error: null, data: null });

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
      expect(saveButton).toHaveTextContent('Save Changes');
    });
  });

  it('should show "User not authenticated" error when session is null', async () => {
    mockUseSession.mockReturnValue({
      session: null,
      userProfile: mockUserProfile,
      userRole: mockUserProfile.role_name,
      isLoading: false,
    });

    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ProfileForm /></MemoryRouter>);

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('User not authenticated.');
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  it('should show "User not authenticated" error when session.user.id is missing', async () => {
    mockUseSession.mockReturnValue({
      session: { user: {} }, // Session without user.id
      userProfile: mockUserProfile,
      userRole: mockUserProfile.role_name,
      isLoading: false,
    });

    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ProfileForm /></MemoryRouter>);

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('User not authenticated.');
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });
});