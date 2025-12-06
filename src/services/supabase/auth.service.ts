/**
 * Authentication service for Supabase
 * Handles user authentication operations
 */

import { supabase } from '@/integrations/supabase/client.ts';
import type { AuthError, Session, User } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
      },
    },
  });

  return {
    user: authData.user,
    session: authData.session,
    error,
  };
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData): Promise<AuthResult> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  return {
    user: authData.user,
    session: authData.session,
    error,
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current session
 */
export async function getSession(): Promise<{ data: { session: Session | null }; error: AuthError | null }> {
  return await supabase.auth.getSession();
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<{ data: { user: User | null }; error: AuthError | null }> {
  return await supabase.auth.getUser();
}

/**
 * Reset password for a user
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}#/verify`,
  });
  return { error };
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}
