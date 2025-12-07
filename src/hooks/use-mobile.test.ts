import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

const MOBILE_BREAKPOINT = 768;

// Mock window.matchMedia
const createMatchMedia = (width: number) => ({
  matches: width < MOBILE_BREAKPOINT,
  media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('useIsMobile', () => {
  let matchMediaMock: ReturnType<typeof createMatchMedia>;

  beforeEach(() => {
    // Reset mocks before each test
    matchMediaMock = createMatchMedia(1024); // Default to desktop
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => matchMediaMock)
    );
    vi.stubGlobal('innerWidth', 1024); // Default window width
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false for desktop width initially', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true for mobile width initially', () => {
    vi.stubGlobal('innerWidth', 375);
    matchMediaMock = createMatchMedia(375);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => matchMediaMock)
    );

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should update isMobile when window resizes to mobile', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false); // Initial desktop

    act(() => {
      vi.stubGlobal('innerWidth', 375);
      // Manually trigger the event listener added by the hook
      const changeEvent = new Event('change');
      Object.defineProperty(changeEvent, 'matches', { value: true }); // Simulate matchMedia.matches becoming true
      matchMediaMock.addEventListener.mock.calls[0][1](changeEvent);
    });

    expect(result.current).toBe(true);
  });

  it('should update isMobile when window resizes to desktop', () => {
    vi.stubGlobal('innerWidth', 375);
    matchMediaMock = createMatchMedia(375);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => matchMediaMock)
    );

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true); // Initial mobile

    act(() => {
      vi.stubGlobal('innerWidth', 1024);
      // Manually trigger the event listener added by the hook
      const changeEvent = new Event('change');
      Object.defineProperty(changeEvent, 'matches', { value: false }); // Simulate matchMedia.matches becoming false
      matchMediaMock.addEventListener.mock.calls[0][1](changeEvent);
    });

    expect(result.current).toBe(false);
  });

  it('should add and remove event listener', () => {
    const { unmount } = renderHook(() => useIsMobile());

    expect(matchMediaMock.addEventListener).toHaveBeenCalledTimes(1);
    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(matchMediaMock.removeEventListener).toHaveBeenCalledTimes(1);
    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
