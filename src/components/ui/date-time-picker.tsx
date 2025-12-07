import { format, setHours, setMinutes } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick a date and time',
}: DateTimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP HH:mm') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (date) {
              const existingTime = value || new Date();
              const newDateWithTime = setHours(
                setMinutes(date, existingTime.getMinutes()),
                existingTime.getHours()
              );
              onChange(newDateWithTime);
            }
          }}
          initialFocus
        />
        <div className="p-3 border-t">
          <Input
            type="time"
            value={value ? format(value, 'HH:mm') : ''}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':').map(Number);
              const newDate = new Date(value || new Date());
              newDate.setHours(hours, minutes);
              onChange(newDate);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
