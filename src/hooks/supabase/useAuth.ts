/**
 * Custom hook for authentication operations
 * Wraps the auth service with React state management
 */

import { useState } from 'react';
import * as authService from '@/services/supabase/auth.service';
import type { SignUpData, SignInData, AuthResult } from '@/services/supabase/auth.service';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signUp = async (data: SignUpData): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signUp(data);
      if (result.error) {
        setError(new Error(result.error.message));
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setError(error);
      return { user: null, session: null, error: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signIn(data);
      if (result.error) {
        setError(new Error(result.error.message));
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error);
      return { user: null, session: null, error: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await authService.signOut();
      if (error) {
        setError(new Error(error.message));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await authService.resetPassword(email);
      if (error) {
        setError(new Error(error.message));
        return false;
      }
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Password reset failed');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await authService.updatePassword(newPassword);
      if (error) {
        setError(new Error(error.message));
        return false;
      }
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Password update failed');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isLoading,
    error,
  };
}
