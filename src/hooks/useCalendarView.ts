import { useState, useCallback, useEffect } from 'react';
import { View } from 'react-big-calendar';
import { logger } from '@/utils/logger';

const CALENDAR_VIEW_KEY = 'scaleflow_calendar_view';
const DEFAULT_VIEW: View = 'month';

/**
 * Hook to manage calendar view state and persistence
 * Stores user's preferred view (month/week/day) in localStorage
 */
export const useCalendarView = () => {
  // Initialize from localStorage or use default
  const [view, setViewState] = useState<View>(() => {
    try {
      const savedView = localStorage.getItem(CALENDAR_VIEW_KEY);
      if (savedView && ['month', 'week', 'day'].includes(savedView)) {
        logger.debug('Restored calendar view from localStorage:', savedView);
        return savedView as View;
      }
    } catch (error) {
      logger.error('Failed to load calendar view from localStorage:', error);
    }
    return DEFAULT_VIEW;
  });

  // Update localStorage when view changes
  useEffect(() => {
    try {
      localStorage.setItem(CALENDAR_VIEW_KEY, view);
      logger.debug('Saved calendar view to localStorage:', view);
    } catch (error) {
      logger.error('Failed to save calendar view to localStorage:', error);
    }
  }, [view]);

  const setView = useCallback((newView: View) => {
    logger.debug('Changing calendar view to:', newView);
    setViewState(newView);
  }, []);

  return {
    view,
    setView,
  };
};
