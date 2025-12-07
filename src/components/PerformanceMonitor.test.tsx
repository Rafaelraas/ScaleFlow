/**
 * Tests for PerformanceMonitor component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PerformanceMonitor } from './PerformanceMonitor';

// Mock web-vitals
vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

describe('PerformanceMonitor', () => {
  it('should render in development mode (test environment)', () => {
    // In test environment, PROD should be false
    render(<PerformanceMonitor />);

    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Collecting metrics...')).toBeInTheDocument();
  });

  it('should show link to web vitals documentation', () => {
    render(<PerformanceMonitor />);

    const link = screen.getByText('Learn about Core Web Vitals →');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://web.dev/vitals/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should have correct styling for dev mode', () => {
    const { container } = render(<PerformanceMonitor />);

    const monitor = container.firstChild as HTMLElement;
    expect(monitor).toHaveClass('fixed', 'bottom-4', 'right-4', 'z-50');
  });
});
