import { useState, useCallback, useMemo } from 'react';
import { View, SlotInfo } from 'react-big-calendar';
import { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { Calendar, CalendarEvent } from './Calendar';
import { ViewToggle } from './ViewToggle';
import { ColorLegend } from './ColorLegend';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useShiftDragDrop } from '@/hooks/useShiftDragDrop';
import { Button } from '@/components/ui/button';
import { CalendarDays, List, Undo2, Redo2 } from 'lucide-react';
import { logger } from '@/utils/logger';
import { detectConflicts, formatConflictsMessage } from '@/lib/shift-conflicts';

interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  employee_id: string | null;
  profiles: { first_name: string; last_name: string } | null;
  published: boolean;
  notes: string | null;
}

export interface ShiftCalendarProps {
  shifts: Shift[];
  onSelectShift?: (shift: Shift) => void;
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  onToggleView?: (isCalendarView: boolean) => void;
  onShiftUpdate?: (shiftId: string, updates: Partial<Shift>) => void;
  showViewToggle?: boolean;
  enableDragAndDrop?: boolean;
  className?: string;
}

/**
 * ShiftCalendar component wraps the Calendar with shift-specific functionality
 * Handles data transformation and provides view controls
 */
export const ShiftCalendar = ({
  shifts,
  onSelectShift,
  onSelectSlot,
  onToggleView,
  onShiftUpdate,
  showViewToggle = true,
  enableDragAndDrop = true,
  className = '',
}: ShiftCalendarProps) => {
  const { view, setView } = useCalendarView();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarView, setIsCalendarView] = useState(true);

  // Drag and drop functionality
  const { handleDrop, handleUndo, handleRedo, canUndo, canRedo } = useShiftDragDrop({
    shifts: shifts.map((s) => ({
      id: s.id,
      employee_id: s.employee_id,
      start_time: s.start_time,
      end_time: s.end_time,
    })),
    onShiftUpdate: (shiftId, updates) => {
      onShiftUpdate?.(shiftId, updates);
    },
    onConflictDetected: (conflicts) => {
      // Conflict handling: Block errors, allow warnings
      // TODO: Implement ConflictDialog component for user confirmation
      // For now, automatically allow warnings (like insufficient rest)
      const message = formatConflictsMessage(conflicts);
      logger.warn('Conflicts detected during drag:', message);

      // Block error-level conflicts (double-booking)
      // Allow warning-level conflicts (insufficient rest) automatically
      return conflicts.every((c) => c.severity === 'warning');
    },
  });

  // Transform shifts to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    logger.debug(`Transforming ${shifts.length} shifts to calendar events`);
    return shifts.map((shift) => ({
      id: shift.id,
      title: shift.profiles
        ? `${shift.profiles.first_name} ${shift.profiles.last_name}`
        : 'Unassigned',
      start: new Date(shift.start_time),
      end: new Date(shift.end_time),
      resource: shift,
      published: shift.published,
      completed: new Date(shift.end_time) < new Date(),
      cancelled: false,
      employeeId: shift.employee_id || undefined,
    }));
  }, [shifts]);

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      logger.debug('Shift selected from calendar:', event.id);
      if (onSelectShift && event.resource) {
        onSelectShift(event.resource as Shift);
      }
    },
    [onSelectShift]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      logger.debug('Calendar slot selected:', slotInfo);
      if (onSelectSlot) {
        onSelectSlot(slotInfo);
      }
    },
    [onSelectSlot]
  );

  const handleNavigate = useCallback((date: Date, view: View) => {
    logger.debug('Calendar navigated:', date, view);
    setCurrentDate(date);
  }, []);

  const handleToggleListView = () => {
    setIsCalendarView(!isCalendarView);
    if (onToggleView) {
      onToggleView(!isCalendarView);
    }
  };

  // Handle event drop from drag and drop
  const handleEventDrop = useCallback(
    (args: EventInteractionArgs<CalendarEvent>) => {
      const { event, start, end } = args;
      logger.debug('Event dropped:', event.id, start, end);
      handleDrop(event.id, start, end);
    },
    [handleDrop]
  );

  // Handle event resize
  const handleEventResize = useCallback(
    (args: EventInteractionArgs<CalendarEvent>) => {
      const { event, start, end } = args;
      logger.debug('Event resized:', event.id, start, end);
      handleDrop(event.id, start, end);
    },
    [handleDrop]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {isCalendarView ? 'Calendar View' : 'List View'}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({events.length} shift{events.length !== 1 ? 's' : ''})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Undo/Redo buttons */}
          {enableDragAndDrop && isCalendarView && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="gap-2"
                title="Undo last change"
              >
                <Undo2 className="h-4 w-4" />
                <span className="hidden sm:inline">Undo</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="gap-2"
                title="Redo last change"
              >
                <Redo2 className="h-4 w-4" />
                <span className="hidden sm:inline">Redo</span>
              </Button>
            </>
          )}

          {/* View Toggle (Calendar/List) */}
          {showViewToggle && (
            <Button variant="outline" size="sm" onClick={handleToggleListView} className="gap-2">
              {isCalendarView ? (
                <>
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List View</span>
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar View</span>
                </>
              )}
            </Button>
          )}

          {/* Calendar View Mode Toggle (Month/Week/Day) */}
          {isCalendarView && <ViewToggle currentView={view} onViewChange={setView} />}
        </div>
      </div>

      {/* Color Legend */}
      {isCalendarView && <ColorLegend showEmployeeColors />}

      {/* Calendar or message */}
      {isCalendarView ? (
        events.length > 0 ? (
          <Calendar
            events={events}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onNavigate={handleNavigate}
            onView={setView}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            view={view}
            date={currentDate}
            enableDragAndDrop={enableDragAndDrop}
            className="bg-background rounded-lg border shadow-sm"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-96 border rounded-lg bg-muted/10">
            <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No shifts to display</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create shifts to see them on the calendar
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center h-96 border rounded-lg bg-muted/10">
          <List className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">List view</p>
          <p className="text-sm text-muted-foreground mt-1">Switch back to see the calendar</p>
        </div>
      )}
    </div>
  );
};

export default ShiftCalendar;
