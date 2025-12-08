import { describe, it, expect } from 'vitest';
import {
  parseRecurrenceRule,
  generateOccurrences,
  applyExceptions,
  validateRecurrenceRule,
  matchesRecurrence,
  stringifyRecurrenceRule,
} from './recurrence-parser';
import { parseISO, format } from 'date-fns';

describe('parseRecurrenceRule', () => {
  it('should parse a simple weekly rule', () => {
    const rule = parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR');

    expect(rule.freq).toBe('WEEKLY');
    expect(rule.interval).toBe(1);
    expect(rule.byDay).toEqual(['MO', 'WE', 'FR']);
  });

  it('should parse a rule with UNTIL', () => {
    const rule = parseRecurrenceRule('FREQ=DAILY;INTERVAL=1;UNTIL=20241231T235959Z');

    expect(rule.freq).toBe('DAILY');
    expect(rule.interval).toBe(1);
    expect(rule.until).toBe('20241231T235959Z');
  });

  it('should parse a rule with COUNT', () => {
    const rule = parseRecurrenceRule('FREQ=MONTHLY;INTERVAL=2;COUNT=10');

    expect(rule.freq).toBe('MONTHLY');
    expect(rule.interval).toBe(2);
    expect(rule.count).toBe(10);
  });

  it('should throw error for empty string', () => {
    expect(() => parseRecurrenceRule('')).toThrow('Recurrence rule must be a non-empty string');
  });

  it('should throw error for invalid frequency', () => {
    expect(() => parseRecurrenceRule('FREQ=YEARLY;INTERVAL=1')).toThrow('Invalid frequency');
  });

  it('should throw error for missing FREQ', () => {
    expect(() => parseRecurrenceRule('INTERVAL=1')).toThrow('FREQ is required');
  });

  it('should throw error for missing INTERVAL', () => {
    expect(() => parseRecurrenceRule('FREQ=WEEKLY')).toThrow('INTERVAL is required');
  });

  it('should throw error for invalid interval', () => {
    expect(() => parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=0')).toThrow('Invalid interval');
  });

  it('should throw error for invalid day', () => {
    expect(() => parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=1;BYDAY=XX')).toThrow('Invalid day');
  });

  it('should throw error for both UNTIL and COUNT', () => {
    expect(() =>
      parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=1;UNTIL=20241231T235959Z;COUNT=10')
    ).toThrow('Cannot specify both UNTIL and COUNT');
  });
});

describe('generateOccurrences', () => {
  it('should generate daily occurrences', () => {
    const rule = parseRecurrenceRule('FREQ=DAILY;INTERVAL=1;COUNT=5');
    const startDate = parseISO('2024-01-01T09:00:00Z');

    const occurrences = generateOccurrences(rule, startDate, 5);

    expect(occurrences).toHaveLength(5);
    expect(format(occurrences[0], 'yyyy-MM-dd')).toBe('2024-01-01');
    expect(format(occurrences[1], 'yyyy-MM-dd')).toBe('2024-01-02');
    expect(format(occurrences[4], 'yyyy-MM-dd')).toBe('2024-01-05');
  });

  it('should generate weekly occurrences on specific days', () => {
    const rule = parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;COUNT=6');
    const startDate = parseISO('2024-01-01T09:00:00Z'); // Monday

    const occurrences = generateOccurrences(rule, startDate, 6);

    expect(occurrences).toHaveLength(6);
    // First week: Mon (Jan 1), Wed (Jan 3), Fri (Jan 5)
    expect(format(occurrences[0], 'yyyy-MM-dd')).toBe('2024-01-01'); // Mon
    expect(format(occurrences[1], 'yyyy-MM-dd')).toBe('2024-01-03'); // Wed
    expect(format(occurrences[2], 'yyyy-MM-dd')).toBe('2024-01-05'); // Fri
    // Second week: Mon (Jan 8), Wed (Jan 10), Fri (Jan 12)
    expect(format(occurrences[3], 'yyyy-MM-dd')).toBe('2024-01-08'); // Mon
  });

  it('should generate bi-weekly occurrences', () => {
    const rule = parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;COUNT=3');
    const startDate = parseISO('2024-01-02T09:00:00Z'); // Tuesday

    const occurrences = generateOccurrences(rule, startDate, 3);

    expect(occurrences).toHaveLength(3);
    expect(format(occurrences[0], 'yyyy-MM-dd')).toBe('2024-01-02'); // Week 1
    expect(format(occurrences[1], 'yyyy-MM-dd')).toBe('2024-01-16'); // Week 3
    expect(format(occurrences[2], 'yyyy-MM-dd')).toBe('2024-01-30'); // Week 5
  });

  it('should generate monthly occurrences', () => {
    const rule = parseRecurrenceRule('FREQ=MONTHLY;INTERVAL=1;COUNT=3');
    const startDate = parseISO('2024-01-15T09:00:00Z');

    const occurrences = generateOccurrences(rule, startDate, 3);

    expect(occurrences).toHaveLength(3);
    expect(format(occurrences[0], 'yyyy-MM-dd')).toBe('2024-01-15');
    expect(format(occurrences[1], 'yyyy-MM-dd')).toBe('2024-02-15');
    expect(format(occurrences[2], 'yyyy-MM-dd')).toBe('2024-03-15');
  });

  it('should respect UNTIL date', () => {
    const rule = parseRecurrenceRule('FREQ=DAILY;INTERVAL=1;UNTIL=2024-01-05T23:59:59Z');
    const startDate = parseISO('2024-01-01T09:00:00Z');

    const occurrences = generateOccurrences(rule, startDate, 100);

    expect(occurrences.length).toBe(5);
    // Should include dates up to Jan 5
    expect(format(occurrences[0], 'yyyy-MM-dd')).toBe('2024-01-01');
    expect(format(occurrences[4], 'yyyy-MM-dd')).toBe('2024-01-05');
  });

  it('should handle COUNT limit', () => {
    const rule = parseRecurrenceRule('FREQ=DAILY;INTERVAL=1;COUNT=3');
    const startDate = parseISO('2024-01-01T09:00:00Z');

    const occurrences = generateOccurrences(rule, startDate);

    expect(occurrences).toHaveLength(3);
  });

  it('should handle leap year correctly', () => {
    const rule = parseRecurrenceRule('FREQ=DAILY;INTERVAL=1;COUNT=2');
    const startDate = parseISO('2024-02-28T09:00:00Z'); // 2024 is a leap year

    const occurrences = generateOccurrences(rule, startDate, 2);

    expect(occurrences).toHaveLength(2);
    expect(format(occurrences[0], 'yyyy-MM-dd')).toBe('2024-02-28');
    expect(format(occurrences[1], 'yyyy-MM-dd')).toBe('2024-02-29'); // Leap day
  });
});

describe('applyExceptions', () => {
  it('should filter out exception dates', () => {
    const dates = [
      parseISO('2024-01-01T09:00:00Z'),
      parseISO('2024-01-02T09:00:00Z'),
      parseISO('2024-01-03T09:00:00Z'),
      parseISO('2024-01-04T09:00:00Z'),
    ];
    const exceptions = ['2024-01-02', '2024-01-04'];

    const filtered = applyExceptions(dates, exceptions);

    expect(filtered).toHaveLength(2);
    expect(format(filtered[0], 'yyyy-MM-dd')).toBe('2024-01-01');
    expect(format(filtered[1], 'yyyy-MM-dd')).toBe('2024-01-03');
  });

  it('should return all dates when no exceptions', () => {
    const dates = [parseISO('2024-01-01T09:00:00Z'), parseISO('2024-01-02T09:00:00Z')];

    const filtered = applyExceptions(dates, []);

    expect(filtered).toHaveLength(2);
  });

  it('should handle whitespace in exception dates', () => {
    const dates = [parseISO('2024-01-01T09:00:00Z'), parseISO('2024-01-02T09:00:00Z')];
    const exceptions = [' 2024-01-01 ', '2024-01-02'];

    const filtered = applyExceptions(dates, exceptions);

    expect(filtered).toHaveLength(0);
  });
});

describe('validateRecurrenceRule', () => {
  it('should validate a correct rule', () => {
    const rule = parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR');
    const result = validateRecurrenceRule(rule);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject rule without FREQ', () => {
    const rule = { interval: 1 } as unknown as RecurrenceRule;
    const result = validateRecurrenceRule(rule);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('FREQ is required');
  });

  it('should reject rule with invalid interval', () => {
    const rule = { freq: 'WEEKLY' as const, interval: 0 };
    const result = validateRecurrenceRule(rule);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('INTERVAL');
  });

  it('should reject rule with invalid frequency', () => {
    const rule = { freq: 'YEARLY', interval: 1 } as unknown as RecurrenceRule;
    const result = validateRecurrenceRule(rule);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('FREQ');
  });

  it('should reject rule with both UNTIL and COUNT', () => {
    const rule = {
      freq: 'WEEKLY' as const,
      interval: 1,
      until: '2024-12-31T23:59:59Z',
      count: 10,
    };
    const result = validateRecurrenceRule(rule);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('both UNTIL and COUNT');
  });
});

describe('matchesRecurrence', () => {
  it('should match a date that follows the rule', () => {
    const rule = parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR');
    const startDate = parseISO('2024-01-01T09:00:00Z'); // Monday
    const testDate = parseISO('2024-01-03T09:00:00Z'); // Wednesday

    const matches = matchesRecurrence(rule, testDate, startDate);

    expect(matches).toBe(true);
  });

  it('should not match a date before start date', () => {
    const rule = parseRecurrenceRule('FREQ=DAILY;INTERVAL=1');
    const startDate = parseISO('2024-01-05T09:00:00Z');
    const testDate = parseISO('2024-01-03T09:00:00Z');

    const matches = matchesRecurrence(rule, testDate, startDate);

    expect(matches).toBe(false);
  });

  it('should not match a date after UNTIL', () => {
    const rule = parseRecurrenceRule('FREQ=DAILY;INTERVAL=1;UNTIL=2024-01-10T00:00:00Z');
    const startDate = parseISO('2024-01-01T09:00:00Z');
    const testDate = parseISO('2024-01-15T09:00:00Z');

    const matches = matchesRecurrence(rule, testDate, startDate);

    expect(matches).toBe(false);
  });

  it('should not match a date that does not follow day constraints', () => {
    const rule = parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR');
    const startDate = parseISO('2024-01-01T09:00:00Z'); // Monday
    const testDate = parseISO('2024-01-02T09:00:00Z'); // Tuesday

    const matches = matchesRecurrence(rule, testDate, startDate);

    expect(matches).toBe(false);
  });
});

describe('stringifyRecurrenceRule', () => {
  it('should convert rule object to string', () => {
    const rule = parseRecurrenceRule('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;COUNT=10');
    const stringified = stringifyRecurrenceRule(rule);

    expect(stringified).toBe('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;COUNT=10');
  });

  it('should handle rule with UNTIL', () => {
    const rule = parseRecurrenceRule('FREQ=DAILY;INTERVAL=1;UNTIL=2024-12-31T23:59:59Z');
    const stringified = stringifyRecurrenceRule(rule);

    expect(stringified).toBe('FREQ=DAILY;INTERVAL=1;UNTIL=2024-12-31T23:59:59Z');
  });

  it('should handle rule without optional fields', () => {
    const rule = parseRecurrenceRule('FREQ=MONTHLY;INTERVAL=2');
    const stringified = stringifyRecurrenceRule(rule);

    expect(stringified).toBe('FREQ=MONTHLY;INTERVAL=2');
  });

  it('should round-trip parse and stringify', () => {
    const original = 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;UNTIL=2024-12-31T23:59:59Z';
    const rule = parseRecurrenceRule(original);
    const stringified = stringifyRecurrenceRule(rule);

    expect(stringified).toBe(original);
  });
});
