/**
 * Shift Conflict Detection
 *
 * Utilities for detecting scheduling conflicts such as:
 * - Employee double-booking
 * - Insufficient rest periods
 * - Overlapping shifts
 */

import { logger } from '@/utils/logger';

export interface ShiftData {
  id: string;
  employee_id: string | null;
  start_time: string | Date;
  end_time: string | Date;
  published?: boolean;
}

export interface ConflictInfo {
  type: 'double_booking' | 'insufficient_rest' | 'overlap';
  message: string;
  conflictingShiftId: string;
  severity: 'error' | 'warning';
}

/**
 * Minimum rest period between shifts in hours
 * This follows common labor law requirements
 */
export const MIN_REST_HOURS = 8;

/**
 * Convert string or Date to Date object
 * @param dateInput - Input date as ISO string or Date object
 * @returns Date object for consistent date operations
 */
function toDate(dateInput: string | Date): Date {
  return typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
}

/**
 * Check if two time ranges overlap
 */
function doTimesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  // Overlap occurs if start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Calculate hours between two dates
 */
function hoursBetween(date1: Date, date2: Date): number {
  const milliseconds = Math.abs(date2.getTime() - date1.getTime());
  return milliseconds / (1000 * 60 * 60);
}

/**
 * Detect conflicts for a shift against existing shifts
 *
 * @param shift The shift to check
 * @param existingShifts Array of existing shifts to check against
 * @param excludeShiftId Optional ID of shift to exclude from conflict check (useful when updating)
 * @returns Array of conflicts found
 */
export function detectConflicts(
  shift: ShiftData,
  existingShifts: ShiftData[],
  excludeShiftId?: string
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];

  // If shift has no employee, no conflicts possible
  if (!shift.employee_id) {
    logger.debug('Shift has no employee assigned, skipping conflict check');
    return conflicts;
  }

  const shiftStart = toDate(shift.start_time);
  const shiftEnd = toDate(shift.end_time);

  // Check against all existing shifts for the same employee
  const employeeShifts = existingShifts.filter(
    (s) => s.employee_id === shift.employee_id && s.id !== shift.id && s.id !== excludeShiftId
  );

  logger.debug(
    `Checking ${employeeShifts.length} existing shifts for employee ${shift.employee_id}`
  );

  for (const existingShift of employeeShifts) {
    const existingStart = toDate(existingShift.start_time);
    const existingEnd = toDate(existingShift.end_time);

    // Check for direct time overlap (double booking)
    if (doTimesOverlap(shiftStart, shiftEnd, existingStart, existingEnd)) {
      conflicts.push({
        type: 'double_booking',
        message: `Employee is already scheduled during this time`,
        conflictingShiftId: existingShift.id,
        severity: 'error',
      });
      logger.warn(
        `Double booking detected for employee ${shift.employee_id} with shift ${existingShift.id}`
      );
      continue; // Skip rest period check if there's overlap
    }

    // Check for insufficient rest period
    // Calculate rest time between shifts
    let restHours: number;
    if (shiftStart > existingEnd) {
      // New shift is after existing shift
      restHours = hoursBetween(existingEnd, shiftStart);
    } else if (existingStart > shiftEnd) {
      // New shift is before existing shift
      restHours = hoursBetween(shiftEnd, existingStart);
    } else {
      // Should not reach here if overlap check passed
      continue;
    }

    if (restHours < MIN_REST_HOURS) {
      conflicts.push({
        type: 'insufficient_rest',
        message: `Only ${restHours.toFixed(1)} hours of rest between shifts (minimum: ${MIN_REST_HOURS} hours)`,
        conflictingShiftId: existingShift.id,
        severity: 'warning',
      });
      logger.warn(
        `Insufficient rest period for employee ${shift.employee_id}: ${restHours.toFixed(1)} hours`
      );
    }
  }

  return conflicts;
}

/**
 * Check if any conflicts are errors (blocking conflicts)
 */
export function hasBlockingConflicts(conflicts: ConflictInfo[]): boolean {
  return conflicts.some((c) => c.severity === 'error');
}

/**
 * Format conflicts into a human-readable message
 */
export function formatConflictsMessage(conflicts: ConflictInfo[]): string {
  if (conflicts.length === 0) {
    return 'No conflicts detected';
  }

  const errors = conflicts.filter((c) => c.severity === 'error');
  const warnings = conflicts.filter((c) => c.severity === 'warning');

  const messages: string[] = [];

  if (errors.length > 0) {
    messages.push(`${errors.length} error(s):`);
    errors.forEach((e) => messages.push(`  • ${e.message}`));
  }

  if (warnings.length > 0) {
    messages.push(`${warnings.length} warning(s):`);
    warnings.forEach((w) => messages.push(`  • ${w.message}`));
  }

  return messages.join('\n');
}
