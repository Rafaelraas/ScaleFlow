import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProfile } from './useProfile';
import * as profileService from '@/services/supabase/profile.service';

// Mock the profile service
vi.mock('@/services/supabase/profile.service', () => ({
  getProfileById: vi.fn(),
  updateProfile: vi.fn(),
}));

const mockGetProfileById = profileService.getProfileById as Mock;
const mockUpdateProfile = profileService.updateProfile as Mock;

describe('useProfile', () => {
  const mockUserId = 'user-123';
  const mockProfile = {
    id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: 'http://example.com/avatar.jpg',
    company_id: 'company-abc',
    role_id: 'role-employee',
    roles: { name: 'employee' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Fetch Profile', () => {
    it('should successfully fetch user profile', async () => {
      mockGetProfileById.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const { result } = renderHook(() => useProfile(mockUserId));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.error).toBeNull();
      expect(mockGetProfileById).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle "Failed to fetch profile" error when fetch fails', async () => {
      const mockError = { message: 'Database error', code: '500' };
      mockGetProfileById.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useProfile(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.error).toEqual(new Error('Database error'));
    });

    it('should handle exception during fetch with error message preserved', async () => {
      mockGetProfileById.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProfile(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.error).toEqual(new Error('Network error'));
    });

    it('should handle null userId gracefully', async () => {
      const { result } = renderHook(() => useProfile(null));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBeNull();
      expect(mockGetProfileById).not.toHaveBeenCalled();
    });

    it('should refetch profile when userId changes', async () => {
      const secondUserId = 'user-456';
      const secondProfile = { ...mockProfile, id: secondUserId };

      mockGetProfileById
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: secondProfile, error: null });

      const { result, rerender } = renderHook(
        ({ userId }) => useProfile(userId),
        { initialProps: { userId: mockUserId } }
      );

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // Change userId
      rerender({ userId: secondUserId });

      await waitFor(() => {
        expect(result.current.profile).toEqual(secondProfile);
      });

      expect(mockGetProfileById).toHaveBeenCalledTimes(2);
      expect(mockGetProfileById).toHaveBeenCalledWith(mockUserId);
      expect(mockGetProfileById).toHaveBeenCalledWith(secondUserId);
    });
  });

  describe('Update Profile', () => {
    it('should successfully update profile', async () => {
      mockGetProfileById.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const updatedData = { first_name: 'Jane', last_name: 'Smith' };
      mockUpdateProfile.mockResolvedValue({
        data: { ...mockProfile, ...updatedData },
        error: null,
      });

      const { result } = renderHook(() => useProfile(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.updateProfile(updatedData);

      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUserId, updatedData);
    });

    it('should handle update error when update fails', async () => {
      mockGetProfileById.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const mockError = { message: 'Update failed', code: '500' };
      mockUpdateProfile.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useProfile(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.updateProfile({ first_name: 'Jane' });

      expect(success).toBe(false);
      // Note: The error state is set, but we need to wait for it
      await waitFor(() => {
        expect(result.current.error).toEqual(new Error('Update failed'));
      });
    });

    it('should return false when userId is null', async () => {
      const { result } = renderHook(() => useProfile(null));

      const success = await result.current.updateProfile({ first_name: 'Jane' });

      expect(success).toBe(false);
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should handle exception during update with error message preserved', async () => {
      mockGetProfileById.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      mockUpdateProfile.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProfile(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.updateProfile({ first_name: 'Jane' });

      expect(success).toBe(false);
      // Note: The error state is set, but we need to wait for it
      await waitFor(() => {
        expect(result.current.error).toEqual(new Error('Network error'));
      });
    });
  });

  describe('Refetch Profile', () => {
    it('should successfully refetch profile', async () => {
      mockGetProfileById.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const { result } = renderHook(() => useProfile(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedProfile = { ...mockProfile, first_name: 'Jane' };
      mockGetProfileById.mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.profile).toEqual(updatedProfile);
      });

      expect(mockGetProfileById).toHaveBeenCalledTimes(2);
    });

    it('should handle "Failed to refetch profile" error', async () => {
      mockGetProfileById.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const { result } = renderHook(() => useProfile(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockError = { message: 'Refetch failed', code: '500' };
      mockGetProfileById.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.profile).toBeNull();
        expect(result.current.error).toEqual(new Error('Refetch failed'));
      });
    });

    it('should handle exception during refetch with error message preserved', async () => {
      mockGetProfileById.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const { result } = renderHook(() => useProfile(mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockGetProfileById.mockRejectedValue(new Error('Network error'));

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.profile).toBeNull();
        expect(result.current.error).toEqual(new Error('Network error'));
      });
    });

    it('should not refetch when userId is null', async () => {
      const { result } = renderHook(() => useProfile(null));

      mockGetProfileById.mockClear();

      await result.current.refetch();

      expect(mockGetProfileById).not.toHaveBeenCalled();
    });
  });
});
