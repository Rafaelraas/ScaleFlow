import { describe, it, expect } from 'vitest';
import {
  SHIFT_STATUS_COLORS,
  getEmployeeColor,
  getContrastRatio,
  isAccessibleContrast,
  getTextColor,
  getShiftStatusColor,
} from './calendar-colors';

describe('calendar-colors', () => {
  describe('SHIFT_STATUS_COLORS', () => {
    it('should have all required status colors', () => {
      expect(SHIFT_STATUS_COLORS).toHaveProperty('draft');
      expect(SHIFT_STATUS_COLORS).toHaveProperty('published');
      expect(SHIFT_STATUS_COLORS).toHaveProperty('completed');
      expect(SHIFT_STATUS_COLORS).toHaveProperty('cancelled');
    });

    it('should have valid hex colors', () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      expect(SHIFT_STATUS_COLORS.draft).toMatch(hexPattern);
      expect(SHIFT_STATUS_COLORS.published).toMatch(hexPattern);
      expect(SHIFT_STATUS_COLORS.completed).toMatch(hexPattern);
      expect(SHIFT_STATUS_COLORS.cancelled).toMatch(hexPattern);
    });
  });

  describe('getEmployeeColor', () => {
    it('should generate consistent colors for the same employee ID', () => {
      const employeeId = 'employee-123';
      const color1 = getEmployeeColor(employeeId);
      const color2 = getEmployeeColor(employeeId);
      expect(color1).toBe(color2);
    });

    it('should generate different colors for different employee IDs', () => {
      const color1 = getEmployeeColor('employee-1');
      const color2 = getEmployeeColor('employee-2');
      expect(color1).not.toBe(color2);
    });

    it('should return valid hex colors', () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      const color = getEmployeeColor('test-employee');
      expect(color).toMatch(hexPattern);
    });

    it('should handle UUID-style employee IDs', () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      const color = getEmployeeColor(uuidId);
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('getContrastRatio', () => {
    it('should return 21 for black and white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1 for identical colors', () => {
      const ratio = getContrastRatio('#ff0000', '#ff0000');
      expect(ratio).toBe(1);
    });

    it('should be symmetric', () => {
      const ratio1 = getContrastRatio('#ff0000', '#0000ff');
      const ratio2 = getContrastRatio('#0000ff', '#ff0000');
      expect(ratio1).toBe(ratio2);
    });

    it('should calculate ratio for status colors', () => {
      const ratio = getContrastRatio(SHIFT_STATUS_COLORS.published, '#ffffff');
      expect(ratio).toBeGreaterThan(1);
    });
  });

  describe('isAccessibleContrast', () => {
    it('should return true for black text on white background', () => {
      expect(isAccessibleContrast('#000000', '#ffffff')).toBe(true);
    });

    it('should return true for white text on black background', () => {
      expect(isAccessibleContrast('#ffffff', '#000000')).toBe(true);
    });

    it('should return false for light gray on white', () => {
      expect(isAccessibleContrast('#eeeeee', '#ffffff')).toBe(false);
    });

    it('should verify all status colors meet WCAG AA on white', () => {
      expect(isAccessibleContrast(SHIFT_STATUS_COLORS.draft, '#ffffff')).toBe(true);
      expect(isAccessibleContrast(SHIFT_STATUS_COLORS.published, '#ffffff')).toBe(true);
      expect(isAccessibleContrast(SHIFT_STATUS_COLORS.completed, '#ffffff')).toBe(true);
      expect(isAccessibleContrast(SHIFT_STATUS_COLORS.cancelled, '#ffffff')).toBe(true);
    });
  });

  describe('getTextColor', () => {
    it('should return white for dark backgrounds', () => {
      expect(getTextColor('#000000')).toBe('#ffffff');
      expect(getTextColor('#1a1a1a')).toBe('#ffffff');
      expect(getTextColor('#333333')).toBe('#ffffff');
    });

    it('should return black for light backgrounds', () => {
      expect(getTextColor('#ffffff')).toBe('#000000');
      expect(getTextColor('#f0f0f0')).toBe('#000000');
      expect(getTextColor('#cccccc')).toBe('#000000');
    });

    it('should return appropriate text color for status colors', () => {
      // These should all return white for good contrast
      const draftText = getTextColor(SHIFT_STATUS_COLORS.draft);
      const publishedText = getTextColor(SHIFT_STATUS_COLORS.published);
      const cancelledText = getTextColor(SHIFT_STATUS_COLORS.cancelled);

      // Verify they provide good contrast
      expect(isAccessibleContrast(draftText, SHIFT_STATUS_COLORS.draft)).toBe(true);
      expect(isAccessibleContrast(publishedText, SHIFT_STATUS_COLORS.published)).toBe(true);
      expect(isAccessibleContrast(cancelledText, SHIFT_STATUS_COLORS.cancelled)).toBe(true);
    });
  });

  describe('getShiftStatusColor', () => {
    it('should return draft for unpublished shifts', () => {
      const result = getShiftStatusColor(false, false, false);
      expect(result.color).toBe(SHIFT_STATUS_COLORS.draft);
      expect(result.label).toBe('Draft');
    });

    it('should return published for published but not completed shifts', () => {
      const result = getShiftStatusColor(true, false, false);
      expect(result.color).toBe(SHIFT_STATUS_COLORS.published);
      expect(result.label).toBe('Published');
    });

    it('should return completed for completed shifts', () => {
      const result = getShiftStatusColor(true, true, false);
      expect(result.color).toBe(SHIFT_STATUS_COLORS.completed);
      expect(result.label).toBe('Completed');
    });

    it('should return cancelled for cancelled shifts regardless of other status', () => {
      const result1 = getShiftStatusColor(false, false, true);
      expect(result1.color).toBe(SHIFT_STATUS_COLORS.cancelled);
      expect(result1.label).toBe('Cancelled');

      const result2 = getShiftStatusColor(true, true, true);
      expect(result2.color).toBe(SHIFT_STATUS_COLORS.cancelled);
      expect(result2.label).toBe('Cancelled');
    });

    it('should handle default parameters', () => {
      // Only published parameter is required
      const result = getShiftStatusColor(true);
      expect(result.color).toBe(SHIFT_STATUS_COLORS.published);
      expect(result.label).toBe('Published');
    });
  });
});
