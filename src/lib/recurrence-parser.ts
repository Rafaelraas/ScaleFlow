/**
 * Recurrence Rule Parser
 *
 * Parses and generates dates based on iCalendar RFC 5545 recurrence rules.
 * Supports DAILY, WEEKLY, and MONTHLY frequencies with various options.
 *
 * @see docs/RECURRING_SHIFTS_API.md for usage examples
 * @see https://tools.ietf.org/html/rfc5545 for RFC 5545 specification
 */

import { addDays, addWeeks, addMonths, parseISO, isAfter, isBefore, format } from 'date-fns';
import type { RecurrenceRule, WeekDay } from '@/types/database';

/**
 * Parse a recurrence rule string into a RecurrenceRule object
 *
 * @param ruleString - iCalendar format recurrence rule (e.g., "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR")
 * @returns Parsed RecurrenceRule object
 * @throws Error if rule string is invalid
 */
export function parseRecurrenceRule(ruleString: string): RecurrenceRule {
  if (!ruleString || typeof ruleString !== 'string') {
    throw new Error('Recurrence rule must be a non-empty string');
  }

  const parts = ruleString.split(';');
  const rule: Partial<RecurrenceRule> = {};

  for (const part of parts) {
    const [key, value] = part.split('=');

    switch (key) {
      case 'FREQ': {
        if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(value)) {
          throw new Error(`Invalid frequency: ${value}. Must be DAILY, WEEKLY, or MONTHLY`);
        }
        rule.freq = value as RecurrenceRule['freq'];
        break;
      }

      case 'INTERVAL': {
        const interval = parseInt(value, 10);
        if (isNaN(interval) || interval < 1) {
          throw new Error(`Invalid interval: ${value}. Must be a positive integer`);
        }
        rule.interval = interval;
        break;
      }

      case 'BYDAY': {
        const days = value.split(',') as WeekDay[];
        const validDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
        for (const day of days) {
          if (!validDays.includes(day)) {
            throw new Error(`Invalid day: ${day}. Must be one of ${validDays.join(', ')}`);
          }
        }
        rule.byDay = days;
        break;
      }

      case 'UNTIL':
        rule.until = value;
        break;

      case 'COUNT': {
        const count = parseInt(value, 10);
        if (isNaN(count) || count < 1) {
          throw new Error(`Invalid count: ${value}. Must be a positive integer`);
        }
        rule.count = count;
        break;
      }

      default:
        // Ignore unknown parameters for forward compatibility
        break;
    }
  }

  // Validate required fields
  if (!rule.freq) {
    throw new Error('FREQ is required in recurrence rule');
  }
  if (!rule.interval) {
    throw new Error('INTERVAL is required in recurrence rule');
  }

  // Cannot have both UNTIL and COUNT
  if (rule.until && rule.count) {
    throw new Error('Cannot specify both UNTIL and COUNT in recurrence rule');
  }

  return rule as RecurrenceRule;
}

/**
 * Convert WeekDay to JavaScript day of week (0 = Sunday, 6 = Saturday)
 */
function weekDayToJsDay(weekDay: WeekDay): number {
  const map: Record<WeekDay, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };
  return map[weekDay];
}

/**
 * Check if a date matches the recurrence rule's day constraints
 */
function matchesDayConstraints(date: Date, rule: RecurrenceRule): boolean {
  if (!rule.byDay || rule.byDay.length === 0) {
    return true; // No day constraints
  }

  const dayOfWeek = date.getDay();
  return rule.byDay.some((weekDay) => weekDayToJsDay(weekDay) === dayOfWeek);
}

/**
 * Generate occurrence dates based on a recurrence rule
 *
 * @param rule - Parsed recurrence rule
 * @param startDate - Starting date for recurrence
 * @param maxCount - Maximum number of occurrences to generate (default: 100)
 * @returns Array of Date objects representing occurrences
 */
export function generateOccurrences(
  rule: RecurrenceRule,
  startDate: Date,
  maxCount: number = 100
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = new Date(startDate);
  const untilDate = rule.until ? parseISO(rule.until) : null;
  const targetCount = rule.count || maxCount;

  // Safety limit to prevent infinite loops
  const safetyLimit = Math.min(targetCount * 10, 1000);
  let iterations = 0;

  while (occurrences.length < targetCount && iterations < safetyLimit) {
    iterations++;

    // Check if we've passed the until date
    if (untilDate && isAfter(currentDate, untilDate)) {
      break;
    }

    // Check if this date matches the day constraints
    if (matchesDayConstraints(currentDate, rule)) {
      occurrences.push(new Date(currentDate));
    }

    // Move to next candidate date based on frequency
    switch (rule.freq) {
      case 'DAILY':
        currentDate = addDays(currentDate, rule.interval);
        break;

      case 'WEEKLY':
        if (rule.byDay && rule.byDay.length > 0) {
          // For weekly with specific days, move to next day
          currentDate = addDays(currentDate, 1);

          // If we've cycled through all days of the week, skip to next interval week
          const dayOfWeek = currentDate.getDay();
          if (dayOfWeek === 0 && !matchesDayConstraints(currentDate, rule)) {
            // Start of new week, apply interval
            currentDate = addWeeks(currentDate, rule.interval - 1);
          }
        } else {
          // Weekly without specific days, just add interval weeks
          currentDate = addWeeks(currentDate, rule.interval);
        }
        break;

      case 'MONTHLY':
        currentDate = addMonths(currentDate, rule.interval);
        break;
    }
  }

  if (iterations >= safetyLimit) {
    console.warn(
      'Recurrence generation hit safety limit. Generated',
      occurrences.length,
      'occurrences.'
    );
  }

  return occurrences;
}

/**
 * Apply exception dates to filter out specific occurrences
 *
 * @param dates - Array of occurrence dates
 * @param exceptions - Array of exception date strings (ISO 8601 format: YYYY-MM-DD)
 * @returns Filtered array with exception dates removed
 */
export function applyExceptions(dates: Date[], exceptions: string[]): Date[] {
  if (!exceptions || exceptions.length === 0) {
    return dates;
  }

  const exceptionSet = new Set(exceptions.map((d) => d.trim()));

  return dates.filter((date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return !exceptionSet.has(dateString);
  });
}

/**
 * Validate a recurrence rule
 *
 * @param rule - Recurrence rule to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateRecurrenceRule(rule: RecurrenceRule): { isValid: boolean; error?: string } {
  try {
    // Check required fields
    if (!rule.freq) {
      return { isValid: false, error: 'FREQ is required' };
    }

    if (!rule.interval || rule.interval < 1) {
      return { isValid: false, error: 'INTERVAL must be a positive integer' };
    }

    // Check frequency value
    if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(rule.freq)) {
      return { isValid: false, error: 'FREQ must be DAILY, WEEKLY, or MONTHLY' };
    }

    // Check BYDAY if specified
    if (rule.byDay) {
      const validDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
      for (const day of rule.byDay) {
        if (!validDays.includes(day)) {
          return { isValid: false, error: `Invalid day: ${day}` };
        }
      }
    }

    // Check UNTIL if specified
    if (rule.until) {
      try {
        parseISO(rule.until);
      } catch {
        return { isValid: false, error: 'UNTIL must be a valid ISO 8601 date' };
      }
    }

    // Check COUNT if specified
    if (rule.count !== undefined && (rule.count < 1 || !Number.isInteger(rule.count))) {
      return { isValid: false, error: 'COUNT must be a positive integer' };
    }

    // Cannot have both UNTIL and COUNT
    if (rule.until && rule.count) {
      return { isValid: false, error: 'Cannot specify both UNTIL and COUNT' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check if a specific date matches a recurrence rule
 *
 * @param rule - Recurrence rule
 * @param date - Date to check
 * @param startDate - Starting date of the recurrence
 * @returns True if the date matches the rule
 */
export function matchesRecurrence(rule: RecurrenceRule, date: Date, startDate: Date): boolean {
  // Check if date is before start date
  if (isBefore(date, startDate)) {
    return false;
  }

  // Check if date is after until date
  if (rule.until) {
    const untilDate = parseISO(rule.until);
    if (isAfter(date, untilDate)) {
      return false;
    }
  }

  // Check day constraints
  if (!matchesDayConstraints(date, rule)) {
    return false;
  }

  // For more complex matching, generate occurrences and check if date is in the list
  // This is simpler than implementing complex date arithmetic
  const occurrences = generateOccurrences(rule, startDate, rule.count || 100);
  const dateString = format(date, 'yyyy-MM-dd');

  return occurrences.some((occ) => format(occ, 'yyyy-MM-dd') === dateString);
}

/**
 * Convert a RecurrenceRule object to iCalendar format string
 *
 * @param rule - RecurrenceRule object
 * @returns iCalendar format string
 */
export function stringifyRecurrenceRule(rule: RecurrenceRule): string {
  const parts: string[] = [];

  parts.push(`FREQ=${rule.freq}`);
  parts.push(`INTERVAL=${rule.interval}`);

  if (rule.byDay && rule.byDay.length > 0) {
    parts.push(`BYDAY=${rule.byDay.join(',')}`);
  }

  if (rule.until) {
    parts.push(`UNTIL=${rule.until}`);
  } else if (rule.count) {
    parts.push(`COUNT=${rule.count}`);
  }

  return parts.join(';');
}
