import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateCompany from './CreateCompany';
import { useSession } from '@/providers/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client.ts';
import { showSuccess, showError } from '@/utils/toast';
import { MemoryRouter } from 'react-router-dom';

// Mock useSession
vi.mock('@/providers/SessionContextProvider', () => ({
  useSession: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock toast utilities
vi.mock('@/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseSession = useSession as Mock;
const mockShowSuccess = showSuccess as Mock;
const mockShowError = showError as Mock;
const mockFrom = supabase.from as Mock;

describe('CreateCompany', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' },
  };
  const mockUserProfile = {
    id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: 'http://example.com/avatar.jpg',
    company_id: null,
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
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render company creation form', () => {
    render(
      <MemoryRouter>
        <CreateCompany />
      </MemoryRouter>
    );

    expect(screen.getByText('Create Your Company')).toBeInTheDocument();
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Company' })).toBeInTheDocument();
  });

  it('should successfully create a company', async () => {
    // Mock successful company creation
    const mockSingleCompany = vi.fn().mockResolvedValue({
      data: { id: 'company-123', name: 'Test Company' },
      error: null,
    });
    const mockSelectCompany = vi.fn().mockReturnValue({ single: mockSingleCompany });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelectCompany });

    // Mock successful role fetch
    const mockSingleRole = vi.fn().mockResolvedValue({
      data: { id: 'role-manager' },
      error: null,
    });
    const mockEqRole = vi.fn().mockReturnValue({ single: mockSingleRole });
    const mockSelectRole = vi.fn().mockReturnValue({ eq: mockEqRole });

    // Mock successful profile update
    const mockEqProfile = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqProfile });

    // Setup mock chain
    mockFrom
      .mockReturnValueOnce({ insert: mockInsert }) // First call for companies
      .mockReturnValueOnce({ select: mockSelectRole }) // Second call for roles
      .mockReturnValueOnce({ update: mockUpdate }); // Third call for profiles

    render(
      <MemoryRouter>
        <CreateCompany />
      </MemoryRouter>
    );

    const companyNameInput = screen.getByLabelText('Company Name');
    const createButton = screen.getByRole('button', { name: 'Create Company' });

    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Company "Test Company" created successfully! You are now a manager.'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show "User not authenticated" error when session is null', async () => {
    mockUseSession.mockReturnValue({
      session: null,
      userProfile: mockUserProfile,
      userRole: mockUserProfile.role_name,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <CreateCompany />
      </MemoryRouter>
    );

    const companyNameInput = screen.getByLabelText('Company Name');
    const createButton = screen.getByRole('button', { name: 'Create Company' });

    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('User not authenticated.');
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  it('should show "User not authenticated" error when userProfile is null', async () => {
    mockUseSession.mockReturnValue({
      session: mockSession,
      userProfile: null,
      userRole: null,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <CreateCompany />
      </MemoryRouter>
    );

    const companyNameInput = screen.getByLabelText('Company Name');
    const createButton = screen.getByRole('button', { name: 'Create Company' });

    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
    fireEvent.click(createButton);

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

    render(
      <MemoryRouter>
        <CreateCompany />
      </MemoryRouter>
    );

    const companyNameInput = screen.getByLabelText('Company Name');
    const createButton = screen.getByRole('button', { name: 'Create Company' });

    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('User not authenticated.');
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  it('should show error when company name is empty', async () => {
    render(
      <MemoryRouter>
        <CreateCompany />
      </MemoryRouter>
    );

    const companyNameInput = screen.getByLabelText('Company Name');
    const createButton = screen.getByRole('button', { name: 'Create Company' });

    // Submit with whitespace-only company name
    fireEvent.change(companyNameInput, { target: { value: '   ' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Company name cannot be empty.');
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  it('should handle company creation error', async () => {
    // Mock failed company creation
    const mockSingleCompany = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });
    const mockSelectCompany = vi.fn().mockReturnValue({ single: mockSingleCompany });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelectCompany });

    mockFrom.mockReturnValueOnce({ insert: mockInsert });

    render(
      <MemoryRouter>
        <CreateCompany />
      </MemoryRouter>
    );

    const companyNameInput = screen.getByLabelText('Company Name');
    const createButton = screen.getByRole('button', { name: 'Create Company' });

    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to create company: Database error');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('should disable button during submission', async () => {
    // Mock a pending operation
    let resolveCompanyCreation: ((value: { data: { id: string; name: string }; error: null }) => void) | undefined;
    const mockSingleCompany = vi.fn().mockReturnValue(
      new Promise(resolve => { resolveCompanyCreation = resolve; })
    );
    const mockSelectCompany = vi.fn().mockReturnValue({ single: mockSingleCompany });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelectCompany });

    mockFrom.mockReturnValueOnce({ insert: mockInsert });

    render(
      <MemoryRouter>
        <CreateCompany />
      </MemoryRouter>
    );

    const companyNameInput = screen.getByLabelText('Company Name');
    const createButton = screen.getByRole('button', { name: 'Create Company' });

    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
    fireEvent.click(createButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(createButton).toBeDisabled();
      expect(createButton).toHaveTextContent('Creating Company...');
    });

    // Resolve the promise to end submission
    if (resolveCompanyCreation) {
      resolveCompanyCreation({ data: { id: 'company-123', name: 'Test Company' }, error: null });
    }

    // Note: In a real test, we would also mock role fetch and profile update
    // For simplicity, we're just checking the button state during the initial operation
  });
});
