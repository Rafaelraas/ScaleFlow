/**
 * FeatureFlag Component
 *
 * Conditionally renders children based on feature flag state.
 */

import { ReactNode } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FeatureFlag as FeatureFlagType } from '@/lib/feature-flags';

interface FeatureFlagProps {
  flag: FeatureFlagType;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally render children based on feature flag
 *
 * @param flag - The feature flag to check
 * @param children - Content to render when flag is enabled
 * @param fallback - Optional content to render when flag is disabled
 *
 * @example
 * ```typescript
 * <FeatureFlag flag={FEATURE_FLAGS.CALENDAR_VIEW}>
 *   <CalendarView />
 * </FeatureFlag>
 *
 * <FeatureFlag
 *   flag={FEATURE_FLAGS.CALENDAR_VIEW}
 *   fallback={<ListView />}
 * >
 *   <CalendarView />
 * </FeatureFlag>
 * ```
 */
export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag);

  return <>{isEnabled ? children : fallback}</>;
}
