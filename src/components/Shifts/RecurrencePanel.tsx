/**
 * RecurrencePanel Component
 *
 * UI panel for configuring recurrence rules for shifts.
 * Supports daily, weekly, and monthly frequencies with various options.
 */

import React from 'react';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { RecurrenceFrequency, WeekDay } from '@/types/database';

interface RecurrencePanelProps {
  control: Control<unknown>;
  watch: UseFormWatch<unknown>;
  setValue: UseFormSetValue<unknown>;
}

const WEEKDAYS: { value: WeekDay; label: string }[] = [
  { value: 'MO', label: 'Mon' },
  { value: 'TU', label: 'Tue' },
  { value: 'WE', label: 'Wed' },
  { value: 'TH', label: 'Thu' },
  { value: 'FR', label: 'Fri' },
  { value: 'SA', label: 'Sat' },
  { value: 'SU', label: 'Sun' },
];

export const RecurrencePanel: React.FC<RecurrencePanelProps> = ({ control, watch, setValue }) => {
  const frequency = watch('recurrence_frequency') as RecurrenceFrequency | undefined;
  const selectedDays = (watch('recurrence_byDay') as WeekDay[] | undefined) || [];
  const endType = watch('recurrence_end_type') as 'never' | 'on' | 'after' | undefined;

  const handleDayToggle = (day: WeekDay) => {
    const current = selectedDays;
    const updated = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    setValue('recurrence_byDay', updated);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
      <h3 className="font-semibold text-sm">Recurrence Settings</h3>

      {/* Frequency Selector */}
      <FormField
        control={control}
        name="recurrence_frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Repeat</FormLabel>
            <Select onValueChange={field.onChange} value={field.value as string}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Interval Input */}
      <FormField
        control={control}
        name="recurrence_interval"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Repeat every{' '}
              {frequency === 'DAILY'
                ? 'day(s)'
                : frequency === 'WEEKLY'
                  ? 'week(s)'
                  : frequency === 'MONTHLY'
                    ? 'month(s)'
                    : ''}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                max="99"
                placeholder="1"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Weekly: Day Selector */}
      {frequency === 'WEEKLY' && (
        <FormItem>
          <FormLabel>Repeat on</FormLabel>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <Button
                key={day.value}
                type="button"
                variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                size="sm"
                className="w-14"
                onClick={() => handleDayToggle(day.value)}
              >
                {day.label}
              </Button>
            ))}
          </div>
          {selectedDays.length === 0 && (
            <p className="text-sm text-destructive mt-1">Please select at least one day</p>
          )}
        </FormItem>
      )}

      {/* End Type Selector */}
      <FormField
        control={control}
        name="recurrence_end_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ends</FormLabel>
            <Select onValueChange={field.onChange} value={field.value as string}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select end type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="on">On date</SelectItem>
                <SelectItem value="after">After occurrences</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* End Date (if endType is 'on') */}
      {endType === 'on' && (
        <FormField
          control={control}
          name="recurrence_until"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value as string), 'PPP')
                      ) : (
                        <span>Pick an end date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value as string) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* End Count (if endType is 'after') */}
      {endType === 'after' && (
        <FormField
          control={control}
          name="recurrence_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of occurrences</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  placeholder="10"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default RecurrencePanel;
