/**
 * Centralized error handling for Supabase operations
 */

import { PostgrestError, AuthError } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';
import { logger } from '@/utils/logger';

export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Parse Supabase errors into a standardized format
 */
export function parseSupabaseError(
  error: PostgrestError | AuthError | Error | null
): SupabaseError | null {
  if (!error) return null;

  if ('code' in error && 'details' in error) {
    // PostgrestError
    return {
      message: error.message || 'Database operation failed',
      code: error.code,
      details: error.details,
    };
  }

  if ('status' in error) {
    // AuthError
    return {
      message: error.message || 'Authentication failed',
      code: String(error.status),
    };
  }

  // Generic Error
  return {
    message: error.message || 'An unexpected error occurred',
  };
}

/**
 * Get user-friendly error messages
 */
export function getUserFriendlyMessage(error: PostgrestError | AuthError | Error | null): string {
  if (!error) return 'An unknown error occurred';

  const parsedError = parseSupabaseError(error);
  if (!parsedError) return 'An unknown error occurred';

  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    '23505': 'This record already exists',
    '23503': 'Cannot delete: related records exist',
    '42501': 'You do not have permission to perform this action',
    PGRST116: 'No matching records found',
    '22P02': 'Invalid data format',
    '23502': 'Required field is missing',
    '401': 'Invalid email or password',
    '422': 'Invalid input data',
  };

  if (parsedError.code && errorMessages[parsedError.code]) {
    return errorMessages[parsedError.code];
  }

  return parsedError.message;
}

/**
 * Handle and display error to user
 */
export function handleSupabaseError(
  error: PostgrestError | AuthError | Error | null,
  customMessage?: string
): void {
  const message = customMessage || getUserFriendlyMessage(error);
  showError(message);

  // Log detailed error for debugging
  logger.error('Supabase Error:', { error: parseSupabaseError(error) });
}

/**
 * Check if an error is a specific type
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'name' in error &&
    'message' in error &&
    typeof (error as { status: unknown }).status === 'number'
  );
}

export function isPostgrestError(error: unknown): error is PostgrestError {
  return typeof error === 'object' && error !== null && 'code' in error && 'details' in error;
}

/**
 * Retry logic for transient errors
 */
export async function retryOnError<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Operation failed');

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
}
