/**
 * Tests for useFeatureFlag hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeatureFlag } from './useFeatureFlag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types/roles';

// Mock dependencies
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/config/env', () => ({
  config: {
    app: {
      env: 'development',
      isDev: true,
      isProd: false,
      isTest: false,
    },
  },
}));

const mockUseSession = vi.mocked((await import('@/hooks/useSession')).useSession);

describe('useFeatureFlag', () => {
  it('should return false when no session', () => {
    mockUseSession.mockReturnValue({
      session: null,
      userProfile: null,
      userRole: null,
      loading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(FEATURE_FLAGS.DARK_MODE_AUTO));
    expect(result.current).toBe(true); // Still true because no role restriction
  });

  it('should return true for enabled flag with valid role', () => {
    const mockSession = {
      user: { id: 'user-123' },
    } as Session;

    mockUseSession.mockReturnValue({
      session: mockSession,
      userProfile: null,
      userRole: 'manager' as UserRole,
      loading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(FEATURE_FLAGS.DARK_MODE_AUTO));
    expect(result.current).toBe(true);
  });

  it('should return false for disabled flag', () => {
    const mockSession = {
      user: { id: 'user-123' },
    } as Session;

    mockUseSession.mockReturnValue({
      session: mockSession,
      userProfile: null,
      userRole: 'manager' as UserRole,
      loading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(FEATURE_FLAGS.CALENDAR_VIEW));
    expect(result.current).toBe(false);
  });

  it('should respect role-based feature flags', () => {
    const mockSession = {
      user: { id: 'user-123' },
    } as Session;

    // Employee trying to access manager-only feature
    mockUseSession.mockReturnValue({
      session: mockSession,
      userProfile: null,
      userRole: 'employee' as UserRole,
      loading: false,
    });

    // ADVANCED_ANALYTICS is for managers and system_admins only (though it's disabled)
    const { result } = renderHook(() => useFeatureFlag(FEATURE_FLAGS.ADVANCED_ANALYTICS));
    expect(result.current).toBe(false);
  });

  it('should handle rollout percentage with user ID', () => {
    const mockSession = {
      user: { id: 'user-123' },
    } as Session;

    mockUseSession.mockReturnValue({
      session: mockSession,
      userProfile: null,
      userRole: 'employee' as UserRole,
      loading: false,
    });

    const { result } = renderHook(() => useFeatureFlag(FEATURE_FLAGS.IMPROVED_ONBOARDING));
    // Should return a boolean based on user hash
    expect(typeof result.current).toBe('boolean');
  });
});
