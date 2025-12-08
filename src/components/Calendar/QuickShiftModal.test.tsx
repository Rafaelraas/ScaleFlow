import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickShiftModal } from './QuickShiftModal';
import * as useEmployees from '@/hooks/useEmployees';
import * as useSession from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/hooks/useEmployees');
vi.mock('@/hooks/useSession');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));
vi.mock('@/utils/toast', () => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
}));
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe('QuickShiftModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();
  const startDate = new Date('2024-12-10T09:00:00');

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useSession
    vi.mocked(useSession.useSession).mockReturnValue({
      userProfile: {
        id: 'user-1',
        company_id: 'company-1',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        role: 'manager',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      userRole: 'manager',
      session: null,
      loading: false,
    } as unknown as ReturnType<typeof useSession.useSession>);

    // Mock useEmployees
    vi.mocked(useEmployees.useEmployees).mockReturnValue({
      employees: [
        { id: 'emp-1', first_name: 'John', last_name: 'Doe' },
        { id: 'emp-2', first_name: 'Jane', last_name: 'Smith' },
      ],
      loading: false,
      error: null,
    });
  });

  it('should render modal when open', () => {
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create Quick Shift')).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Time/)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Time/)).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(
      <QuickShiftModal
        open={false}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Create Quick Shift')).not.toBeInTheDocument();
  });

  it('should pre-fill start and end times', () => {
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    const startInput = screen.getByLabelText(/Start Time/) as HTMLInputElement;
    const endInput = screen.getByLabelText(/End Time/) as HTMLInputElement;

    // Should have start time pre-filled
    expect(startInput.value).toBe('2024-12-10T09:00');

    // Should have end time pre-filled (8 hours later)
    expect(endInput.value).toBe('2024-12-10T17:00');
  });

  it('should use custom end date when provided', () => {
    const customEndDate = new Date('2024-12-10T18:00:00');
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        endDate={customEndDate}
        onSuccess={mockOnSuccess}
      />
    );

    const endInput = screen.getByLabelText(/End Time/) as HTMLInputElement;
    expect(endInput.value).toBe('2024-12-10T18:00');
  });

  it('should show employee options', async () => {
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    // Employee select should be present
    const employeeSelect = screen.getByRole('combobox', { name: /Employee/ });
    expect(employeeSelect).toBeInTheDocument();
  });

  it('should show loading state for employees', () => {
    vi.mocked(useEmployees.useEmployees).mockReturnValue({
      employees: [],
      loading: true,
      error: null,
    });

    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create Shift')).toBeDisabled();
  });

  it('should have submit button', () => {
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    // Should have submit button
    const submitButton = screen.getByText('Create Shift');
    expect(submitButton).toBeInTheDocument();
  });

  it('should have end time field', () => {
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    const endInput = screen.getByLabelText(/End Time/) as HTMLInputElement;
    expect(endInput).toBeInTheDocument();
  });

  it('should have cancel button', () => {
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
  });

  it('should have break duration field', () => {
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    const breakInput = screen.getByLabelText(/Break Duration/) as HTMLInputElement;
    expect(breakInput).toBeInTheDocument();
    expect(breakInput.value).toBe('30'); // Default value
  });

  it('should have notes field', () => {
    render(
      <QuickShiftModal
        open={true}
        onOpenChange={mockOnOpenChange}
        startDate={startDate}
        onSuccess={mockOnSuccess}
      />
    );

    const notesInput = screen.getByLabelText(/Notes/) as HTMLTextAreaElement;
    expect(notesInput).toBeInTheDocument();
  });
});
