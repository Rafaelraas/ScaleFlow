import { View } from 'react-big-calendar';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ViewToggleProps {
  currentView: View;
  onViewChange: (view: View) => void;
  className?: string;
}

/**
 * Toggle buttons for switching between calendar views
 * Provides month, week, and day view options
 */
export const ViewToggle = ({ currentView, onViewChange, className }: ViewToggleProps) => {
  const views: Array<{ value: View; label: string; icon: React.ReactNode }> = [
    { value: 'month', label: 'Month', icon: <Calendar className="h-4 w-4" /> },
    { value: 'week', label: 'Week', icon: <CalendarDays className="h-4 w-4" /> },
    { value: 'day', label: 'Day', icon: <CalendarRange className="h-4 w-4" /> },
  ];

  return (
    <div className={cn('flex gap-1 rounded-md border p-1', className)}>
      {views.map(({ value, label, icon }) => (
        <Button
          key={value}
          variant={currentView === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(value)}
          className={cn('flex items-center gap-2', currentView === value && 'shadow-sm')}
          aria-label={`Switch to ${label} view`}
          aria-pressed={currentView === value}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default ViewToggle;
