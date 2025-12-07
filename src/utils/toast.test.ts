import { describe, it, expect, vi, type Mock } from 'vitest';
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
    const message = 'Operation successful!';
    showSuccess(message);
    expect(toast.success).toHaveBeenCalledWith(message);
  });

  it('showError should call toast.error with the correct message', () => {
    const message = 'Operation failed!';
    showError(message);
    expect(toast.error).toHaveBeenCalledWith(message);
  });

  it('showLoading should call toast.loading with the correct message and return its ID', () => {
    const message = 'Loading data...';
    const mockToastId = 'loading-123';
    (toast.loading as Mock).mockReturnValue(mockToastId); // Alterado de vi.MockedFunction para Mock

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
