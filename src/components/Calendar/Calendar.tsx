import { useMemo, useCallback, useEffect } from 'react';
import {
  Calendar as BigCalendar,
  momentLocalizer,
  View,
  SlotInfo,
  EventProps,
} from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { logger } from '@/utils/logger';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShiftCard } from './ShiftCard';

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: unknown;
  // Shift-specific properties for color coding
  published?: boolean;
  completed?: boolean;
  cancelled?: boolean;
  employeeId?: string;
}

export interface CalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  onNavigate?: (date: Date, view: View) => void;
  onView?: (view: View) => void;
  onEventDrop?: (args: EventInteractionArgs<CalendarEvent>) => void;
  onEventResize?: (args: EventInteractionArgs<CalendarEvent>) => void;
  defaultView?: View;
  view?: View;
  date?: Date;
  className?: string;
  enableDragAndDrop?: boolean;
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
  onEventDrop,
  onEventResize,
  defaultView = 'month',
  view,
  date,
  className = '',
  enableDragAndDrop = true,
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

  // Handle event drop (drag and drop)
  const handleEventDrop = useCallback(
    (args: EventInteractionArgs<CalendarEvent>) => {
      logger.debug('Event dropped:', args.event.id, 'to', args.start);
      onEventDrop?.(args);
    },
    [onEventDrop]
  );

  // Handle event resize
  const handleEventResize = useCallback(
    (args: EventInteractionArgs<CalendarEvent>) => {
      logger.debug('Event resized:', args.event.id, 'to', args.start, '-', args.end);
      onEventResize?.(args);
    },
    [onEventResize]
  );

  const CalendarComponent = enableDragAndDrop ? DragAndDropCalendar : BigCalendar;

  return (
    <div className={`calendar-container ${className}`}>
      <CalendarComponent
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
        onEventDrop={enableDragAndDrop ? handleEventDrop : undefined}
        onEventResize={enableDragAndDrop ? handleEventResize : undefined}
        draggableAccessor={() => enableDragAndDrop}
        resizable={enableDragAndDrop}
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
        // Custom event rendering with ShiftCard for color coding
        components={{
          event: ({ event }: EventProps<CalendarEvent>) => <ShiftCard event={event} />,
        }}
      />
    </div>
  );
};

export default Calendar;
