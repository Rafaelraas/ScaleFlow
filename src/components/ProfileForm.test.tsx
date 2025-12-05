import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileForm from './ProfileForm';
import { useSession } from '@/providers/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { MemoryRouter } from 'react-router-dom'; // Needed for Link/navigation context

// Mock do useSession
vi.mock('@/providers/SessionContextProvider', () => ({
  useSession: vi.fn(),
}));

// Mock do cliente Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null, // Default to no error for successful updates
        })),
      })),
    })),
  },
}));

// Mock das funções de toast
vi.mock('@/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

const mockUseSession = useSession as Mock;
const mockSupabaseFrom = supabase.from as Mock;
const mockShowSuccess = showSuccess as Mock;
const mockShowError = showError as Mock;

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
    mockSupabaseFrom.mockClear();
    mockShowSuccess.mockClear();
    mockShowError.mockClear();
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
    render(<MemoryRouter><ProfileForm /></MemoryRouter>);
    expect(screen.getByText('Loading profile data...')).toBeInTheDocument();
  });

  it('should pre-fill form fields with user profile data', () => {
    render(<MemoryRouter><ProfileForm /></MemoryRouter>);

    expect(screen.getByLabelText('First Name (Optional)')).toHaveValue('John');
    expect(screen.getByLabelText('Last Name (Optional)')).toHaveValue('Doe');
    expect(screen.getByLabelText('Avatar URL (Optional)')).toHaveValue('http://example.com/avatar.jpg');
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Role')).toHaveValue('Employee');
  });

  it('should allow updating first name and last name', async () => {
    render(<MemoryRouter><ProfileForm /></MemoryRouter>);

    const firstNameInput = screen.getByLabelText('First Name (Optional)');
    const lastNameInput = screen.getByLabelText('Last Name (Optional)');
    const saveButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles');
      expect(mockSupabaseFrom().update).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Smith',
        avatar_url: 'http://example.com/avatar.jpg', // Avatar URL should remain if not changed
      });
      expect(mockSupabaseFrom().update().eq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockShowSuccess).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('should handle avatar URL update', async () => {
    render(<MemoryRouter><ProfileForm /></MemoryRouter>);

    const avatarUrlInput = screen.getByLabelText('Avatar URL (Optional)');
    const saveButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(avatarUrlInput, { target: { value: 'http://new.com/avatar.png' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSupabaseFrom().update).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: 'http://new.com/avatar.png',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('should show error toast on Supabase update failure', async () => {
    mockSupabaseFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: { message: 'Database error' },
        })),
      })),
    });

    render(<MemoryRouter><ProfileForm /></MemoryRouter>);

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
    mockSupabaseFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => new Promise(resolve => { resolveSupabaseCall = resolve; })),
      })),
    });

    render(<MemoryRouter><ProfileForm /></MemoryRouter>);

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent('Saving...');

    // Resolve the promise to end submission
    resolveSupabaseCall!({ error: null });

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
      expect(saveButton).toHaveTextContent('Save Changes');
    });
  });
});