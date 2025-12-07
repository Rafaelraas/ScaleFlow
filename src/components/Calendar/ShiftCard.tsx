import { CalendarEvent } from './Calendar';
import { getShiftStatusColor, getEmployeeColor, getTextColor } from '@/lib/calendar-colors';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ShiftCardProps {
  event: CalendarEvent & {
    published?: boolean;
    completed?: boolean;
    cancelled?: boolean;
    employeeId?: string;
  };
  className?: string;
}

/**
 * ShiftCard component for displaying shift information on the calendar
 * Uses color coding based on status and employee
 */
export const ShiftCard = ({ event, className }: ShiftCardProps) => {
  // Determine color based on status or employee
  const useStatusColor = event.published !== undefined;
  const backgroundColor = useStatusColor
    ? getShiftStatusColor(
        event.published ?? false,
        event.completed ?? false,
        event.cancelled ?? false
      ).color
    : event.employeeId
      ? getEmployeeColor(event.employeeId)
      : '#64748b'; // Default gray

  const textColor = getTextColor(backgroundColor);

  // Get status icon
  const getStatusIcon = () => {
    if (event.cancelled) {
      return <XCircle className="h-3 w-3 inline-block mr-1" />;
    }
    if (event.completed) {
      return <CheckCircle2 className="h-3 w-3 inline-block mr-1" />;
    }
    if (!event.published) {
      return <Clock className="h-3 w-3 inline-block mr-1" />;
    }
    return null;
  };

  return (
    <div
      className={cn('text-xs sm:text-sm truncate p-1 rounded border-l-2', className)}
      style={{
        backgroundColor,
        color: textColor,
        borderLeftColor: textColor,
        borderLeftWidth: '3px',
      }}
    >
      {getStatusIcon()}
      <span className="font-medium">{event.title}</span>
    </div>
  );
};

export default ShiftCard;
