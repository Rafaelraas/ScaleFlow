import { useMemo, useCallback, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { logger } from '@/utils/logger';
import { useIsMobile } from '@/hooks/use-mobile';

const localizer = momentLocalizer(moment);

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: unknown;
}

export interface CalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  onNavigate?: (date: Date, view: View) => void;
  onView?: (view: View) => void;
  defaultView?: View;
  view?: View;
  date?: Date;
  className?: string;
}

/**
 * Calendar component wrapper for React Big Calendar
 * Provides shift scheduling visualization with month/week/day views
 * Automatically switches to appropriate view on mobile devices
 */
export const Calendar = ({
  events,
  onSelectEvent,
  onSelectSlot,
  onNavigate,
  onView,
  defaultView = 'month',
  view,
  date,
  className = '',
}: CalendarProps) => {
  const isMobile = useIsMobile();

  // On mobile, suggest switching to week or day view for better UX
  useEffect(() => {
    if (isMobile && view === 'month' && onView) {
      logger.debug('Mobile device detected, suggesting week view for better UX');
      // Note: We don't force the change, just log it
      // The ViewToggle component will handle the actual switching
    }
  }, [isMobile, view, onView]);

  // Convert events to calendar format
  const calendarEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  }, [events]);

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      logger.debug('Calendar event selected:', event.id);
      onSelectEvent?.(event);
    },
    [onSelectEvent]
  );

  // Handle slot selection (for creating new events)
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      logger.debug('Calendar slot selected:', slotInfo);
      onSelectSlot?.(slotInfo);
    },
    [onSelectSlot]
  );

  // Handle navigation (date change)
  const handleNavigate = useCallback(
    (newDate: Date, newView: View) => {
      logger.debug('Calendar navigated to:', newDate, newView);
      onNavigate?.(newDate, newView);
    },
    [onNavigate]
  );

  // Handle view change
  const handleViewChange = useCallback(
    (newView: View) => {
      logger.debug('Calendar view changed to:', newView);
      onView?.(newView);
    },
    [onView]
  );

  return (
    <div className={`calendar-container ${className}`}>
      <BigCalendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{
          height: isMobile ? 'calc(100vh - 250px)' : 'calc(100vh - 200px)',
          minHeight: isMobile ? '400px' : '500px',
        }}
        defaultView={defaultView}
        view={view}
        date={date}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        views={['month', 'week', 'day']}
        step={30}
        showMultiDayTimes
        messages={{
          today: 'Today',
          previous: 'Back',
          next: 'Next',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          agenda: 'Agenda',
        }}
        // Mobile-friendly event rendering
        components={{
          event: ({ event }) => (
            <div className="text-xs sm:text-sm truncate p-1">{event.title}</div>
          ),
        }}
      />
    </div>
  );
};

export default Calendar;
