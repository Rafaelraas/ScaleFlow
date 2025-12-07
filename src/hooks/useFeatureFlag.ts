/**
 * Feature Flag Hook
 *
 * React hook to check if a feature flag is enabled for the current user.
 */

import { useSession } from '@/hooks/useSession';
import { isFeatureEnabled, type FeatureFlag } from '@/lib/feature-flags';

/**
 * Hook to check if a feature flag is enabled for current user
 *
 * @param flag - The feature flag to check
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * ```typescript
 * const hasCalendar = useFeatureFlag(FEATURE_FLAGS.CALENDAR_VIEW);
 * if (hasCalendar) {
 *   return <CalendarView />;
 * }
 * ```
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { session, userRole } = useSession();

  return isFeatureEnabled(flag, {
    userId: session?.user?.id,
    userRole: userRole,
  });
}
