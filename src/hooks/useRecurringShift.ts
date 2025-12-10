/**
 * useRecurringShift Hook
 *
 * Manages state and logic for creating and editing recurring shifts.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  parseRecurrenceRule,
  stringifyRecurrenceRule,
  validateRecurrenceRule,
} from '@/lib/recurrence-parser';
import type { RecurrenceRule, RecurrenceFrequency, WeekDay } from '@/types/database';

interface RecurrenceFormData {
  isRecurring: boolean;
  frequency: RecurrenceFrequency | null;
  interval: number;
  byDay: WeekDay[];
  endType: 'never' | 'on' | 'after';
  until: string | null;
  count: number | null;
}

export interface UseRecurringShiftResult {
  formData: RecurrenceFormData;
  setIsRecurring: (value: boolean) => void;
  setFrequency: (value: RecurrenceFrequency | null) => void;
  setInterval: (value: number) => void;
  setByDay: (value: WeekDay[]) => void;
  setEndType: (value: 'never' | 'on' | 'after') => void;
  setUntil: (value: string | null) => void;
  setCount: (value: number | null) => void;
  recurrenceRule: RecurrenceRule | null;
  ruleString: string | null;
  isValid: boolean;
  validationError: string | null;
  reset: () => void;
}

const defaultFormData: RecurrenceFormData = {
  isRecurring: false,
  frequency: null,
  interval: 1,
  byDay: [],
  endType: 'never',
  until: null,
  count: null,
};

export function useRecurringShift(initialRuleString?: string | null): UseRecurringShiftResult {
  // Initialize state from rule string if provided
  const [formData, setFormData] = useState<RecurrenceFormData>(() => {
    if (!initialRuleString) {
      return defaultFormData;
    }

    try {
      const rule = parseRecurrenceRule(initialRuleString);
      return {
        isRecurring: true,
        frequency: rule.freq,
        interval: rule.interval,
        byDay: rule.byDay || [],
        endType: rule.until ? 'on' : rule.count ? 'after' : 'never',
        until: rule.until || null,
        count: rule.count || null,
      };
    } catch (error) {
      console.error('Failed to parse initial rule string:', error);
      return defaultFormData;
    }
  });

  // Setters
  const setIsRecurring = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, isRecurring: value }));
  }, []);

  const setFrequency = useCallback((value: RecurrenceFrequency | null) => {
    setFormData((prev) => ({ ...prev, frequency: value }));
  }, []);

  const setInterval = useCallback((value: number) => {
    setFormData((prev) => ({ ...prev, interval: Math.max(1, value) }));
  }, []);

  const setByDay = useCallback((value: WeekDay[]) => {
    setFormData((prev) => ({ ...prev, byDay: value }));
  }, []);

  const setEndType = useCallback((value: 'never' | 'on' | 'after') => {
    setFormData((prev) => ({ ...prev, endType: value }));
  }, []);

  const setUntil = useCallback((value: string | null) => {
    setFormData((prev) => ({ ...prev, until: value }));
  }, []);

  const setCount = useCallback((value: number | null) => {
    if (value === null || value === 0) {
      setFormData((prev) => ({ ...prev, count: null }));
    } else {
      setFormData((prev) => ({ ...prev, count: Math.max(1, value) }));
    }
  }, []);

  const reset = useCallback(() => {
    setFormData(defaultFormData);
  }, []);

  // Build recurrence rule from form data
  const { recurrenceRule, ruleString, isValid, validationError } = useMemo(() => {
    if (!formData.isRecurring || !formData.frequency) {
      return {
        recurrenceRule: null,
        ruleString: null,
        isValid: true,
        validationError: null,
      };
    }

    try {
      const rule: RecurrenceRule = {
        freq: formData.frequency,
        interval: formData.interval,
      };

      // Add byDay for weekly recurrence
      if (formData.frequency === 'WEEKLY' && formData.byDay.length > 0) {
        rule.byDay = formData.byDay;
      }

      // Add end condition
      if (formData.endType === 'on' && formData.until) {
        rule.until = formData.until;
      } else if (formData.endType === 'after' && formData.count) {
        rule.count = formData.count;
      }

      // Validate the rule
      validateRecurrenceRule(rule);

      // Check for weekly without days
      if (rule.freq === 'WEEKLY' && (!rule.byDay || rule.byDay.length === 0)) {
        throw new Error('Weekly recurrence requires at least one day to be selected');
      }

      const ruleStr = stringifyRecurrenceRule(rule);

      return {
        recurrenceRule: rule,
        ruleString: ruleStr,
        isValid: true,
        validationError: null,
      };
    } catch (error) {
      return {
        recurrenceRule: null,
        ruleString: null,
        isValid: false,
        validationError: error instanceof Error ? error.message : 'Invalid recurrence rule',
      };
    }
  }, [formData]);

  return {
    formData,
    setIsRecurring,
    setFrequency,
    setInterval,
    setByDay,
    setEndType,
    setUntil,
    setCount,
    recurrenceRule,
    ruleString,
    isValid,
    validationError,
    reset,
  };
}
