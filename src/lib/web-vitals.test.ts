/**
 * Tests for Web Vitals tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initWebVitals } from './web-vitals';
import * as webVitals from 'web-vitals';

// Mock web-vitals library
vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Web Vitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initWebVitals', () => {
    it('should initialize all web vitals listeners', () => {
      const mockedWebVitals = vi.mocked(webVitals);

      initWebVitals();

      expect(mockedWebVitals.onCLS).toHaveBeenCalledTimes(1);
      expect(mockedWebVitals.onINP).toHaveBeenCalledTimes(1);
      expect(mockedWebVitals.onFCP).toHaveBeenCalledTimes(1);
      expect(mockedWebVitals.onLCP).toHaveBeenCalledTimes(1);
      expect(mockedWebVitals.onTTFB).toHaveBeenCalledTimes(1);
    });

    it('should pass callback functions to each listener', () => {
      const mockedWebVitals = vi.mocked(webVitals);

      initWebVitals();

      expect(mockedWebVitals.onCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(mockedWebVitals.onINP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockedWebVitals.onFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockedWebVitals.onLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockedWebVitals.onTTFB).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
