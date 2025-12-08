import { useEffect } from 'react';
import { View } from 'react-big-calendar';
import { logger } from '@/utils/logger';

export interface UseCalendarKeyboardOptions {
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onViewChange?: (view: View) => void;
  enabled?: boolean;
}

/**
 * useCalendarKeyboard - Hook for calendar keyboard shortcuts
 *
 * Keyboard shortcuts:
 * - Left Arrow: Navigate to previous period
 * - Right Arrow: Navigate to next period
 * - Home/T: Go to today
 * - M: Switch to month view
 * - W: Switch to week view
 * - D: Switch to day view
 *
 * @param options Configuration options
 * @returns void
 *
 * @example
 * ```tsx
 * useCalendarKeyboard({
 *   onNavigate: handleNavigate,
 *   onViewChange: setView,
 *   enabled: true,
 * });
 * ```
 */
export const useCalendarKeyboard = ({
  onNavigate,
  onViewChange,
  enabled = true,
}: UseCalendarKeyboardOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Navigation shortcuts
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          logger.debug('Keyboard shortcut: Previous period');
          onNavigate('PREV');
          break;

        case 'ArrowRight':
          e.preventDefault();
          logger.debug('Keyboard shortcut: Next period');
          onNavigate('NEXT');
          break;

        case 'Home':
        case 't':
        case 'T':
          e.preventDefault();
          logger.debug('Keyboard shortcut: Go to today');
          onNavigate('TODAY');
          break;

        // View change shortcuts
        case 'm':
        case 'M':
          if (onViewChange) {
            e.preventDefault();
            logger.debug('Keyboard shortcut: Month view');
            onViewChange('month');
          }
          break;

        case 'w':
        case 'W':
          if (onViewChange) {
            e.preventDefault();
            logger.debug('Keyboard shortcut: Week view');
            onViewChange('week');
          }
          break;

        case 'd':
        case 'D':
          if (onViewChange) {
            e.preventDefault();
            logger.debug('Keyboard shortcut: Day view');
            onViewChange('day');
          }
          break;

        default:
          // No action for other keys
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onNavigate, onViewChange]);
};
