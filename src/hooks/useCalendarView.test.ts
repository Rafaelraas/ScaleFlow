import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendarView } from './useCalendarView';

describe('useCalendarView', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should initialize with default month view', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('should restore view from localStorage', () => {
    localStorage.setItem('scaleflow_calendar_view', 'week');
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('week');
  });

  it('should change view when setView is called', () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('week');
    });

    expect(result.current.view).toBe('week');
  });

  it('should persist view to localStorage', () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('day');
    });

    expect(localStorage.getItem('scaleflow_calendar_view')).toBe('day');
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock localStorage to throw an error
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setView('week');
    });

    // Should still update the view even if localStorage fails
    expect(result.current.view).toBe('week');

    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should use default view if localStorage has invalid value', () => {
    localStorage.setItem('scaleflow_calendar_view', 'invalid');
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });
});
