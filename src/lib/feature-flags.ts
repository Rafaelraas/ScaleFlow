/**
 * Feature Flag System for ScaleFlow
 *
 * Enables controlled feature rollouts, A/B testing, and quick rollback
 * without deployments.
 */

import { config } from '@/config/env';

/**
 * Feature flag definitions
 * Add new features here as they're developed
 */
export const FEATURE_FLAGS = {
  // UI Features
  CALENDAR_VIEW: 'calendar-view',
  DARK_MODE_AUTO: 'dark-mode-auto',
  NEW_DASHBOARD: 'new-dashboard',

  // Functionality
  SHIFT_BIDDING: 'shift-bidding',
  IN_APP_MESSAGING: 'in-app-messaging',
  ADVANCED_ANALYTICS: 'advanced-analytics',

  // Experiments
  IMPROVED_ONBOARDING: 'improved-onboarding',
  AI_SCHEDULING: 'ai-scheduling',
} as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

/**
 * Feature flag configuration
 * Maps flag names to enabled state and conditions
 */
interface FeatureFlagConfig {
  [key: string]: {
    enabled: boolean;
    description: string;
    rolloutPercentage?: number; // 0-100
    environments?: Array<'development' | 'production' | 'test'>;
    roles?: Array<'employee' | 'manager' | 'system_admin'>;
  };
}

const featureFlagConfig: FeatureFlagConfig = {
  [FEATURE_FLAGS.CALENDAR_VIEW]: {
    enabled: false,
    description: 'Interactive calendar view for schedules',
    rolloutPercentage: 0,
    environments: ['development'],
  },
  [FEATURE_FLAGS.DARK_MODE_AUTO]: {
    enabled: true,
    description: 'Automatic dark mode based on system preferences',
    environments: ['development', 'production'],
  },
  [FEATURE_FLAGS.NEW_DASHBOARD]: {
    enabled: false,
    description: 'New dashboard with improved analytics',
    rolloutPercentage: 10,
    roles: ['manager', 'system_admin'],
  },
  [FEATURE_FLAGS.SHIFT_BIDDING]: {
    enabled: false,
    description: 'Allow employees to bid on available shifts',
    environments: ['development'],
  },
  [FEATURE_FLAGS.IN_APP_MESSAGING]: {
    enabled: false,
    description: 'Direct messaging between users',
    environments: ['development'],
  },
  [FEATURE_FLAGS.ADVANCED_ANALYTICS]: {
    enabled: false,
    description: 'Advanced analytics dashboard',
    roles: ['manager', 'system_admin'],
  },
  [FEATURE_FLAGS.IMPROVED_ONBOARDING]: {
    enabled: true,
    description: 'Improved onboarding flow',
    rolloutPercentage: 50,
  },
  [FEATURE_FLAGS.AI_SCHEDULING]: {
    enabled: false,
    description: 'AI-powered shift scheduling suggestions',
    environments: ['development'],
    roles: ['manager'],
  },
};

/**
 * Check if a feature flag is enabled
 * Considers environment, rollout percentage, and user role
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  options?: {
    userId?: string;
    userRole?: 'employee' | 'manager' | 'system_admin';
  }
): boolean {
  const flagConfig = featureFlagConfig[flag];

  if (!flagConfig) {
    // Note: Using console.warn here instead of logger to avoid circular dependency
    // The logger imports from config, which may depend on feature flags
    console.warn(`Feature flag "${flag}" not found in configuration`);
    return false;
  }

  // Check if explicitly disabled
  if (!flagConfig.enabled) {
    return false;
  }

  // Check environment
  if (flagConfig.environments) {
    const currentEnv = config.app.env;
    if (!flagConfig.environments.includes(currentEnv)) {
      return false;
    }
  }

  // Check role
  if (flagConfig.roles && options?.userRole) {
    if (!flagConfig.roles.includes(options.userRole)) {
      return false;
    }
  }

  // Check rollout percentage
  if (flagConfig.rolloutPercentage !== undefined && options?.userId) {
    const userHash = hashUserId(options.userId);
    const userPercentage = userHash % 100;
    if (userPercentage >= flagConfig.rolloutPercentage) {
      return false;
    }
  }

  return true;
}

/**
 * Simple hash function for consistent user percentage assignment
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get all enabled feature flags
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.keys(featureFlagConfig).filter((flag) =>
    isFeatureEnabled(flag as FeatureFlag)
  ) as FeatureFlag[];
}

/**
 * Get feature flag configuration (for admin panel)
 */
export function getFeatureFlagConfig(): FeatureFlagConfig {
  return featureFlagConfig;
}
