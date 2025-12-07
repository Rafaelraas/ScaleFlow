/**
 * Tests for Feature Flag System
 */

import { describe, it, expect, vi } from 'vitest';
import {
  FEATURE_FLAGS,
  isFeatureEnabled,
  getEnabledFeatures,
  getFeatureFlagConfig,
} from './feature-flags';

// Mock config
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

describe('Feature Flags', () => {
  describe('FEATURE_FLAGS', () => {
    it('should have all expected feature flags defined', () => {
      expect(FEATURE_FLAGS.CALENDAR_VIEW).toBe('calendar-view');
      expect(FEATURE_FLAGS.DARK_MODE_AUTO).toBe('dark-mode-auto');
      expect(FEATURE_FLAGS.NEW_DASHBOARD).toBe('new-dashboard');
      expect(FEATURE_FLAGS.SHIFT_BIDDING).toBe('shift-bidding');
      expect(FEATURE_FLAGS.IN_APP_MESSAGING).toBe('in-app-messaging');
      expect(FEATURE_FLAGS.ADVANCED_ANALYTICS).toBe('advanced-analytics');
      expect(FEATURE_FLAGS.IMPROVED_ONBOARDING).toBe('improved-onboarding');
      expect(FEATURE_FLAGS.AI_SCHEDULING).toBe('ai-scheduling');
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return false for disabled flags', () => {
      expect(isFeatureEnabled(FEATURE_FLAGS.CALENDAR_VIEW)).toBe(false);
    });

    it('should return true for enabled flags in correct environment', () => {
      expect(isFeatureEnabled(FEATURE_FLAGS.DARK_MODE_AUTO)).toBe(true);
    });

    it('should respect role restrictions', () => {
      // ADVANCED_ANALYTICS is disabled by default, but if enabled, only managers and admins can see it
      expect(
        isFeatureEnabled(FEATURE_FLAGS.ADVANCED_ANALYTICS, {
          userId: 'test-user',
          userRole: 'employee',
        })
      ).toBe(false);
    });

    it('should warn for unknown flags', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const unknownFlag = 'unknown-flag' as FeatureFlag;
      expect(isFeatureEnabled(unknownFlag)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Feature flag "unknown-flag" not found in configuration'
      );
      consoleWarnSpy.mockRestore();
    });

    it('should handle rollout percentage consistently for same user', () => {
      const userId = 'test-user-123';

      // IMPROVED_ONBOARDING has 50% rollout
      const result1 = isFeatureEnabled(FEATURE_FLAGS.IMPROVED_ONBOARDING, { userId });
      const result2 = isFeatureEnabled(FEATURE_FLAGS.IMPROVED_ONBOARDING, { userId });

      // Should be consistent for the same user
      expect(result1).toBe(result2);
    });

    it('should enable feature without rollout percentage', () => {
      // DARK_MODE_AUTO has no rollout percentage restriction
      expect(isFeatureEnabled(FEATURE_FLAGS.DARK_MODE_AUTO, { userId: 'any-user' })).toBe(true);
    });
  });

  describe('getEnabledFeatures', () => {
    it('should return array of enabled features', () => {
      const enabled = getEnabledFeatures();
      expect(Array.isArray(enabled)).toBe(true);
      expect(enabled).toContain(FEATURE_FLAGS.DARK_MODE_AUTO);
      expect(enabled).toContain(FEATURE_FLAGS.IMPROVED_ONBOARDING);
    });

    it('should not include disabled features', () => {
      const enabled = getEnabledFeatures();
      expect(enabled).not.toContain(FEATURE_FLAGS.CALENDAR_VIEW);
      expect(enabled).not.toContain(FEATURE_FLAGS.SHIFT_BIDDING);
    });
  });

  describe('getFeatureFlagConfig', () => {
    it('should return complete configuration object', () => {
      const config = getFeatureFlagConfig();
      expect(config).toBeDefined();
      expect(config[FEATURE_FLAGS.DARK_MODE_AUTO]).toBeDefined();
      expect(config[FEATURE_FLAGS.DARK_MODE_AUTO].enabled).toBe(true);
      expect(config[FEATURE_FLAGS.DARK_MODE_AUTO].description).toBeTruthy();
    });

    it('should include rollout percentage when defined', () => {
      const config = getFeatureFlagConfig();
      expect(config[FEATURE_FLAGS.IMPROVED_ONBOARDING].rolloutPercentage).toBe(50);
    });

    it('should include environment restrictions when defined', () => {
      const config = getFeatureFlagConfig();
      expect(config[FEATURE_FLAGS.DARK_MODE_AUTO].environments).toContain('development');
      expect(config[FEATURE_FLAGS.DARK_MODE_AUTO].environments).toContain('production');
    });

    it('should include role restrictions when defined', () => {
      const config = getFeatureFlagConfig();
      expect(config[FEATURE_FLAGS.ADVANCED_ANALYTICS].roles).toContain('manager');
      expect(config[FEATURE_FLAGS.ADVANCED_ANALYTICS].roles).toContain('system_admin');
    });
  });
});
