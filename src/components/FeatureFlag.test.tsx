/**
 * Tests for FeatureFlag component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlag } from './FeatureFlag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

// Mock dependencies
vi.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: vi.fn(),
}));

const mockUseFeatureFlag = vi.mocked((await import('@/hooks/useFeatureFlag')).useFeatureFlag);

describe('FeatureFlag', () => {
  it('should render children when flag is enabled', () => {
    mockUseFeatureFlag.mockReturnValue(true);

    render(
      <FeatureFlag flag={FEATURE_FLAGS.DARK_MODE_AUTO}>
        <div>Feature Enabled Content</div>
      </FeatureFlag>
    );

    expect(screen.getByText('Feature Enabled Content')).toBeInTheDocument();
  });

  it('should not render children when flag is disabled', () => {
    mockUseFeatureFlag.mockReturnValue(false);

    render(
      <FeatureFlag flag={FEATURE_FLAGS.CALENDAR_VIEW}>
        <div>Feature Enabled Content</div>
      </FeatureFlag>
    );

    expect(screen.queryByText('Feature Enabled Content')).not.toBeInTheDocument();
  });

  it('should render fallback when flag is disabled and fallback provided', () => {
    mockUseFeatureFlag.mockReturnValue(false);

    render(
      <FeatureFlag flag={FEATURE_FLAGS.CALENDAR_VIEW} fallback={<div>Fallback Content</div>}>
        <div>Feature Enabled Content</div>
      </FeatureFlag>
    );

    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
    expect(screen.queryByText('Feature Enabled Content')).not.toBeInTheDocument();
  });

  it('should render null when flag is disabled and no fallback provided', () => {
    mockUseFeatureFlag.mockReturnValue(false);

    const { container } = render(
      <FeatureFlag flag={FEATURE_FLAGS.CALENDAR_VIEW}>
        <div>Feature Enabled Content</div>
      </FeatureFlag>
    );

    expect(container.textContent).toBe('');
  });

  it('should switch between enabled and disabled content', () => {
    mockUseFeatureFlag.mockReturnValue(true);

    const { rerender } = render(
      <FeatureFlag flag={FEATURE_FLAGS.NEW_DASHBOARD} fallback={<div>Old Dashboard</div>}>
        <div>New Dashboard</div>
      </FeatureFlag>
    );

    expect(screen.getByText('New Dashboard')).toBeInTheDocument();

    // Simulate flag being disabled
    mockUseFeatureFlag.mockReturnValue(false);
    rerender(
      <FeatureFlag flag={FEATURE_FLAGS.NEW_DASHBOARD} fallback={<div>Old Dashboard</div>}>
        <div>New Dashboard</div>
      </FeatureFlag>
    );

    expect(screen.getByText('Old Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('New Dashboard')).not.toBeInTheDocument();
  });
});
