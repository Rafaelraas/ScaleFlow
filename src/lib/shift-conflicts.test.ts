import { describe, it, expect } from 'vitest';
import {
  detectConflicts,
  hasBlockingConflicts,
  formatConflictsMessage,
  MIN_REST_HOURS,
  ShiftData,
} from './shift-conflicts';

describe('shift-conflicts', () => {
  const baseShift: ShiftData = {
    id: 'shift-1',
    employee_id: 'emp-1',
    start_time: new Date('2024-12-10T09:00:00'),
    end_time: new Date('2024-12-10T17:00:00'),
  };

  describe('detectConflicts', () => {
    it('should return no conflicts when no existing shifts', () => {
      const conflicts = detectConflicts(baseShift, []);
      expect(conflicts).toHaveLength(0);
    });

    it('should return no conflicts when shift has no employee', () => {
      const unassignedShift: ShiftData = {
        ...baseShift,
        employee_id: null,
      };
      const existingShifts = [baseShift];
      const conflicts = detectConflicts(unassignedShift, existingShifts);
      expect(conflicts).toHaveLength(0);
    });

    it('should return no conflicts for different employees', () => {
      const existingShift: ShiftData = {
        id: 'shift-2',
        employee_id: 'emp-2', // Different employee
        start_time: new Date('2024-12-10T09:00:00'),
        end_time: new Date('2024-12-10T17:00:00'),
      };
      const conflicts = detectConflicts(baseShift, [existingShift]);
      expect(conflicts).toHaveLength(0);
    });

    it('should detect exact time overlap (double booking)', () => {
      const existingShift: ShiftData = {
        id: 'shift-2',
        employee_id: 'emp-1',
        start_time: new Date('2024-12-10T09:00:00'),
        end_time: new Date('2024-12-10T17:00:00'),
      };
      const conflicts = detectConflicts(baseShift, [existingShift]);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('double_booking');
      expect(conflicts[0].severity).toBe('error');
    });

    it('should detect partial time overlap', () => {
      const newShift: ShiftData = {
        id: 'shift-new',
        employee_id: 'emp-1',
        start_time: new Date('2024-12-10T15:00:00'), // Starts before baseShift ends
        end_time: new Date('2024-12-10T19:00:00'),
      };
      const conflicts = detectConflicts(newShift, [baseShift]);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('double_booking');
    });

    it('should detect overlap when new shift contains existing shift', () => {
      const newShift: ShiftData = {
        id: 'shift-new',
        employee_id: 'emp-1',
        start_time: new Date('2024-12-10T08:00:00'),
        end_time: new Date('2024-12-10T18:00:00'), // Encompasses baseShift
      };
      const conflicts = detectConflicts(newShift, [baseShift]);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('double_booking');
    });

    it('should detect insufficient rest period before shift', () => {
      // Existing shift ends at 17:00, new shift starts at 20:00 (3 hours rest)
      const newShift: ShiftData = {
        id: 'shift-new',
        employee_id: 'emp-1',
        start_time: new Date('2024-12-10T20:00:00'),
        end_time: new Date('2024-12-10T23:00:00'),
      };
      const conflicts = detectConflicts(newShift, [baseShift]);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('insufficient_rest');
      expect(conflicts[0].severity).toBe('warning');
      expect(conflicts[0].message).toContain('3.0 hours');
    });

    it('should detect insufficient rest period after shift', () => {
      // New shift ends at 06:00, existing shift starts at 09:00 (3 hours rest)
      const newShift: ShiftData = {
        id: 'shift-new',
        employee_id: 'emp-1',
        start_time: new Date('2024-12-10T03:00:00'),
        end_time: new Date('2024-12-10T06:00:00'),
      };
      const conflicts = detectConflicts(newShift, [baseShift]);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('insufficient_rest');
    });

    it('should allow sufficient rest period', () => {
      // Existing shift ends at 17:00, new shift starts at 01:00+1 day (8+ hours rest)
      const newShift: ShiftData = {
        id: 'shift-new',
        employee_id: 'emp-1',
        start_time: new Date('2024-12-11T01:00:00'),
        end_time: new Date('2024-12-11T09:00:00'),
      };
      const conflicts = detectConflicts(newShift, [baseShift]);
      expect(conflicts).toHaveLength(0);
    });

    it('should exclude specified shift from conflict check', () => {
      const existingShift: ShiftData = {
        id: 'shift-2',
        employee_id: 'emp-1',
        start_time: new Date('2024-12-10T09:00:00'),
        end_time: new Date('2024-12-10T17:00:00'),
      };
      // Should find conflict without exclusion
      const conflictsWithout = detectConflicts(baseShift, [existingShift]);
      expect(conflictsWithout).toHaveLength(1);

      // Should not find conflict when excluding the conflicting shift
      const conflictsWith = detectConflicts(baseShift, [existingShift], 'shift-2');
      expect(conflictsWith).toHaveLength(0);
    });

    it('should detect multiple conflicts', () => {
      const existingShifts: ShiftData[] = [
        {
          id: 'shift-2',
          employee_id: 'emp-1',
          start_time: new Date('2024-12-10T09:00:00'),
          end_time: new Date('2024-12-10T12:00:00'), // Overlaps
        },
        {
          id: 'shift-3',
          employee_id: 'emp-1',
          start_time: new Date('2024-12-10T19:00:00'),
          end_time: new Date('2024-12-10T22:00:00'), // Insufficient rest (2 hours)
        },
      ];
      const conflicts = detectConflicts(baseShift, existingShifts);
      expect(conflicts).toHaveLength(2);
      expect(conflicts.some((c) => c.type === 'double_booking')).toBe(true);
      expect(conflicts.some((c) => c.type === 'insufficient_rest')).toBe(true);
    });

    it('should handle string dates', () => {
      const shiftWithStrings: ShiftData = {
        id: 'shift-1',
        employee_id: 'emp-1',
        start_time: '2024-12-10T09:00:00Z',
        end_time: '2024-12-10T17:00:00Z',
      };
      const existingShift: ShiftData = {
        id: 'shift-2',
        employee_id: 'emp-1',
        start_time: '2024-12-10T09:00:00Z',
        end_time: '2024-12-10T17:00:00Z',
      };
      const conflicts = detectConflicts(shiftWithStrings, [existingShift]);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('double_booking');
    });

    it('should not check rest period when shifts overlap', () => {
      // This test ensures we don't report both overlap AND insufficient rest
      const existingShift: ShiftData = {
        id: 'shift-2',
        employee_id: 'emp-1',
        start_time: new Date('2024-12-10T15:00:00'),
        end_time: new Date('2024-12-10T19:00:00'),
      };
      const conflicts = detectConflicts(baseShift, [existingShift]);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('double_booking');
      // Should not also report insufficient rest
    });
  });

  describe('hasBlockingConflicts', () => {
    it('should return false when no conflicts', () => {
      expect(hasBlockingConflicts([])).toBe(false);
    });

    it('should return true when error conflicts exist', () => {
      const conflicts = [
        {
          type: 'double_booking' as const,
          message: 'Overlap',
          conflictingShiftId: 'shift-2',
          severity: 'error' as const,
        },
      ];
      expect(hasBlockingConflicts(conflicts)).toBe(true);
    });

    it('should return false when only warning conflicts exist', () => {
      const conflicts = [
        {
          type: 'insufficient_rest' as const,
          message: 'Short rest',
          conflictingShiftId: 'shift-2',
          severity: 'warning' as const,
        },
      ];
      expect(hasBlockingConflicts(conflicts)).toBe(false);
    });

    it('should return true when mixed error and warning conflicts exist', () => {
      const conflicts = [
        {
          type: 'double_booking' as const,
          message: 'Overlap',
          conflictingShiftId: 'shift-2',
          severity: 'error' as const,
        },
        {
          type: 'insufficient_rest' as const,
          message: 'Short rest',
          conflictingShiftId: 'shift-3',
          severity: 'warning' as const,
        },
      ];
      expect(hasBlockingConflicts(conflicts)).toBe(true);
    });
  });

  describe('formatConflictsMessage', () => {
    it('should return no conflicts message when empty', () => {
      const message = formatConflictsMessage([]);
      expect(message).toBe('No conflicts detected');
    });

    it('should format error conflicts', () => {
      const conflicts = [
        {
          type: 'double_booking' as const,
          message: 'Employee is already scheduled',
          conflictingShiftId: 'shift-2',
          severity: 'error' as const,
        },
      ];
      const message = formatConflictsMessage(conflicts);
      expect(message).toContain('1 error(s)');
      expect(message).toContain('Employee is already scheduled');
    });

    it('should format warning conflicts', () => {
      const conflicts = [
        {
          type: 'insufficient_rest' as const,
          message: 'Only 3.0 hours of rest',
          conflictingShiftId: 'shift-2',
          severity: 'warning' as const,
        },
      ];
      const message = formatConflictsMessage(conflicts);
      expect(message).toContain('1 warning(s)');
      expect(message).toContain('Only 3.0 hours of rest');
    });

    it('should format mixed conflicts', () => {
      const conflicts = [
        {
          type: 'double_booking' as const,
          message: 'Overlap detected',
          conflictingShiftId: 'shift-2',
          severity: 'error' as const,
        },
        {
          type: 'insufficient_rest' as const,
          message: 'Short rest period',
          conflictingShiftId: 'shift-3',
          severity: 'warning' as const,
        },
      ];
      const message = formatConflictsMessage(conflicts);
      expect(message).toContain('1 error(s)');
      expect(message).toContain('1 warning(s)');
      expect(message).toContain('Overlap detected');
      expect(message).toContain('Short rest period');
    });
  });

  describe('MIN_REST_HOURS', () => {
    it('should be defined as 8 hours', () => {
      expect(MIN_REST_HOURS).toBe(8);
    });
  });
});
