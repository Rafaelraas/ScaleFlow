import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { View } from 'react-big-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export interface CalendarHeaderProps {
  currentDate: Date;
  view: View;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE', date?: Date) => void;
  onViewChange?: (view: View) => void;
  className?: string;
}

/**
 * CalendarHeader - Enhanced navigation controls for the calendar
 *
 * Features:
 * - Previous/Next navigation buttons
 * - Today button (jump to current date)
 * - Date picker for specific date selection
 * - Current date range display
 * - View mode indicators
 *
 * @see docs/CALENDAR_VIEW.md for usage guide
 */
export const CalendarHeader = ({
  currentDate,
  view,
  onNavigate,
  onViewChange,
  className = '',
}: CalendarHeaderProps) => {
  const handlePrevious = () => {
    onNavigate('PREV');
  };

  const handleNext = () => {
    onNavigate('NEXT');
  };

  const handleToday = () => {
    onNavigate('TODAY');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onNavigate('DATE', date);
    }
  };

  // Format the displayed date range based on view
  const getDateRangeLabel = (): string => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week': {
        // For week view, show the week range
        const start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          className="h-8 w-8 p-0"
          title={`Previous ${view}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="h-8 px-3"
          title="Go to today"
        >
          Today
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0"
          title={`Next ${view}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Date Range Display */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        <h3 className="text-lg font-semibold">{getDateRangeLabel()}</h3>

        {/* Date Picker Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Pick a date">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Spacer for alignment */}
      <div className="w-32" />
    </div>
  );
};
