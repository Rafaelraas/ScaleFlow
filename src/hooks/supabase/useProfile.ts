/**
 * Custom hook for profile operations
 * Wraps the profile service with React state management
 */

import { useState, useEffect } from 'react';
import * as profileService from '@/services/supabase/profile.service';
import type { ProfileWithRole, Profile } from '@/types/database';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<ProfileWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await profileService.getProfileById(userId);
        if (fetchError) {
          setError(new Error(fetchError.message));
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch profile');
        setError(error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!userId) return false;

    setError(null);
    try {
      const { data, error: updateError } = await profileService.updateProfile(userId, updates);
      if (updateError) {
        setError(new Error(updateError.message));
        return false;
      }
      if (data && profile) {
        // Preserve the roles property from the existing profile
        setProfile({ ...profile, ...data, roles: profile.roles });
      }
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      return false;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await profileService.getProfileById(userId);
        if (fetchError) {
          setError(new Error(fetchError.message));
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to refetch profile');
        setError(error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    },
  };
}
