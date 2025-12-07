import { SHIFT_STATUS_COLORS, getTextColor } from '@/lib/calendar-colors';
import { CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColorLegendProps {
  className?: string;
  showEmployeeColors?: boolean;
}

/**
 * ColorLegend component to explain shift color coding
 * Helps users understand what each color represents
 */
export const ColorLegend = ({ className, showEmployeeColors = false }: ColorLegendProps) => {
  const statusColors = [
    {
      color: SHIFT_STATUS_COLORS.draft,
      label: 'Draft',
      icon: <Clock className="h-3 w-3" />,
    },
    {
      color: SHIFT_STATUS_COLORS.published,
      label: 'Published',
      icon: <Calendar className="h-3 w-3" />,
    },
    {
      color: SHIFT_STATUS_COLORS.completed,
      label: 'Completed',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    {
      color: SHIFT_STATUS_COLORS.cancelled,
      label: 'Cancelled',
      icon: <XCircle className="h-3 w-3" />,
    },
  ];

  return (
    <div className={cn('flex flex-wrap gap-3 text-xs text-muted-foreground', className)}>
      <span className="font-semibold">Legend:</span>
      {statusColors.map(({ color, label, icon }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded border flex items-center justify-center"
            style={{
              backgroundColor: color,
              color: getTextColor(color),
              borderColor: color,
            }}
          >
            {icon}
          </div>
          <span>{label}</span>
        </div>
      ))}
      {showEmployeeColors && (
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <span>Employee Colors</span>
        </div>
      )}
    </div>
  );
};

export default ColorLegend;
