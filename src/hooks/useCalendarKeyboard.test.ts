import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCalendarKeyboard } from './useCalendarKeyboard';

describe('useCalendarKeyboard', () => {
  const mockOnNavigate = vi.fn();
  const mockOnViewChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    vi.clearAllMocks();
  });

  it('should handle left arrow key for previous navigation', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);

    expect(mockOnNavigate).toHaveBeenCalledWith('PREV');
  });

  it('should handle right arrow key for next navigation', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(event);

    expect(mockOnNavigate).toHaveBeenCalledWith('NEXT');
  });

  it('should handle Home key for today navigation', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'Home' });
    window.dispatchEvent(event);

    expect(mockOnNavigate).toHaveBeenCalledWith('TODAY');
  });

  it('should handle T key for today navigation', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 't' });
    window.dispatchEvent(event);

    expect(mockOnNavigate).toHaveBeenCalledWith('TODAY');
  });

  it('should handle M key for month view', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'm' });
    window.dispatchEvent(event);

    expect(mockOnViewChange).toHaveBeenCalledWith('month');
  });

  it('should handle W key for week view', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'w' });
    window.dispatchEvent(event);

    expect(mockOnViewChange).toHaveBeenCalledWith('week');
  });

  it('should handle D key for day view', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'd' });
    window.dispatchEvent(event);

    expect(mockOnViewChange).toHaveBeenCalledWith('day');
  });

  it('should not trigger when disabled', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: false,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);

    expect(mockOnNavigate).not.toHaveBeenCalled();
  });

  it('should handle uppercase keys', () => {
    renderHook(() =>
      useCalendarKeyboard({
        onNavigate: mockOnNavigate,
        onViewChange: mockOnViewChange,
        enabled: true,
      })
    );

    const eventM = new KeyboardEvent('keydown', { key: 'M' });
    window.dispatchEvent(eventM);
    expect(mockOnViewChange).toHaveBeenCalledWith('month');

    const eventW = new KeyboardEvent('keydown', { key: 'W' });
    window.dispatchEvent(eventW);
    expect(mockOnViewChange).toHaveBeenCalledWith('week');

    const eventD = new KeyboardEvent('keydown', { key: 'D' });
    window.dispatchEvent(eventD);
    expect(mockOnViewChange).toHaveBeenCalledWith('day');
  });
});
