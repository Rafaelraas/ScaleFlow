import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecurringShift } from './useRecurringShift';

describe('useRecurringShift', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRecurringShift());

    expect(result.current.formData.isRecurring).toBe(false);
    expect(result.current.formData.frequency).toBe(null);
    expect(result.current.formData.interval).toBe(1);
    expect(result.current.formData.byDay).toEqual([]);
    expect(result.current.formData.endType).toBe('never');
    expect(result.current.recurrenceRule).toBe(null);
    expect(result.current.ruleString).toBe(null);
    expect(result.current.isValid).toBe(true);
  });

  it('should parse initial rule string correctly', () => {
    const ruleString = 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR';
    const { result } = renderHook(() => useRecurringShift(ruleString));

    expect(result.current.formData.isRecurring).toBe(true);
    expect(result.current.formData.frequency).toBe('WEEKLY');
    expect(result.current.formData.interval).toBe(1);
    expect(result.current.formData.byDay).toEqual(['MO', 'WE', 'FR']);
  });

  it('should update frequency', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setIsRecurring(true);
      result.current.setFrequency('DAILY');
    });

    expect(result.current.formData.frequency).toBe('DAILY');
  });

  it('should update interval', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setInterval(2);
    });

    expect(result.current.formData.interval).toBe(2);
  });

  it('should update byDay array', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setByDay(['MO', 'WE', 'FR']);
    });

    expect(result.current.formData.byDay).toEqual(['MO', 'WE', 'FR']);
  });

  it('should update end type', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setEndType('on');
    });

    expect(result.current.formData.endType).toBe('on');
  });

  it('should update until date', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setUntil('2024-12-31T23:59:59Z');
    });

    expect(result.current.formData.until).toBe('2024-12-31T23:59:59Z');
  });

  it('should update count', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setCount(10);
    });

    expect(result.current.formData.count).toBe(10);
  });

  it('should build valid daily recurrence rule', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setIsRecurring(true);
      result.current.setFrequency('DAILY');
      result.current.setInterval(1);
    });

    expect(result.current.recurrenceRule).not.toBe(null);
    expect(result.current.recurrenceRule?.freq).toBe('DAILY');
    expect(result.current.recurrenceRule?.interval).toBe(1);
    expect(result.current.isValid).toBe(true);
    expect(result.current.ruleString).toBe('FREQ=DAILY;INTERVAL=1');
  });

  it('should build valid weekly recurrence rule with days', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setIsRecurring(true);
      result.current.setFrequency('WEEKLY');
      result.current.setInterval(1);
      result.current.setByDay(['MO', 'WE', 'FR']);
    });

    expect(result.current.recurrenceRule).not.toBe(null);
    expect(result.current.recurrenceRule?.freq).toBe('WEEKLY');
    expect(result.current.recurrenceRule?.byDay).toEqual(['MO', 'WE', 'FR']);
    expect(result.current.isValid).toBe(true);
  });

  it('should build recurrence rule with until date', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setIsRecurring(true);
      result.current.setFrequency('DAILY');
      result.current.setInterval(1);
      result.current.setEndType('on');
      result.current.setUntil('2024-12-31T23:59:59Z');
    });

    expect(result.current.recurrenceRule?.until).toBe('2024-12-31T23:59:59Z');
    expect(result.current.isValid).toBe(true);
  });

  it('should build recurrence rule with count', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setIsRecurring(true);
      result.current.setFrequency('DAILY');
      result.current.setInterval(1);
      result.current.setEndType('after');
      result.current.setCount(10);
    });

    expect(result.current.recurrenceRule?.count).toBe(10);
    expect(result.current.isValid).toBe(true);
  });

  it('should mark weekly rule without days as invalid', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setIsRecurring(true);
      result.current.setFrequency('WEEKLY');
      result.current.setInterval(1);
      result.current.setByDay([]);
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationError).toContain('at least one day');
  });

  it('should reset to default values', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setIsRecurring(true);
      result.current.setFrequency('DAILY');
      result.current.setInterval(2);
      result.current.reset();
    });

    expect(result.current.formData.isRecurring).toBe(false);
    expect(result.current.formData.frequency).toBe(null);
    expect(result.current.formData.interval).toBe(1);
  });

  it('should enforce minimum interval of 1', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setInterval(0);
    });

    expect(result.current.formData.interval).toBe(1);
  });

  it('should treat count of 0 as null', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setCount(0);
    });

    expect(result.current.formData.count).toBe(null);
  });

  it('should handle invalid initial rule string gracefully', () => {
    const { result } = renderHook(() => useRecurringShift('INVALID_RULE'));

    expect(result.current.formData.isRecurring).toBe(false);
    expect(result.current.formData.frequency).toBe(null);
  });

  it('should return null rule when not recurring', () => {
    const { result } = renderHook(() => useRecurringShift());

    act(() => {
      result.current.setIsRecurring(false);
      result.current.setFrequency('DAILY');
    });

    expect(result.current.recurrenceRule).toBe(null);
    expect(result.current.ruleString).toBe(null);
  });
});
