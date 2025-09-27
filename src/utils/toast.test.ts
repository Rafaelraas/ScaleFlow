import { describe, it, expect, vi } from 'vitest';
import { toast } from 'sonner';
import { showSuccess, showError, showLoading, dismissToast } from './toast';

// Mock the sonner toast library
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('Toast Utilities', () => {
  it('showSuccess should call toast.success with the correct message', () => {
    showSuccess('Operation successful!');
    expect(toast.success).toHaveBeenCalledWith('Operation successful!');
  });

  it('showError should call toast.error with the correct message', () => {
    showError('Operation failed!');
    expect(toast.error).toHaveBeenCalledWith('Operation failed!');
  });

  it('showLoading should call toast.loading with the correct message and return its ID', () => {
    const message = 'Loading data...';
    const mockToastId = 'loading-123';
    (toast.loading as vi.MockedFunction<typeof toast.loading>).mockReturnValue(mockToastId);

    const result = showLoading(message);
    expect(toast.loading).toHaveBeenCalledWith(message);
    expect(result).toBe(mockToastId);
  });

  it('dismissToast should call toast.dismiss with the correct toast ID', () => {
    const toastId = 'some-toast-id';
    dismissToast(toastId);
    expect(toast.dismiss).toHaveBeenCalledWith(toastId);
  });
});