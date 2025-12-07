import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addHours, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEmployees } from '@/hooks/useEmployees';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { logger } from '@/utils/logger';

// Form validation schema
const quickShiftSchema = z
  .object({
    employee_id: z.string().min(1, 'Employee is required'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    break_minutes: z.number().min(0).max(480).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['end_time'],
    }
  );

type QuickShiftFormData = z.infer<typeof quickShiftSchema>;

export interface QuickShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate: Date;
  endDate?: Date;
  onSuccess?: () => void;
}

/**
 * QuickShiftModal - A streamlined modal for rapid shift creation
 *
 * Features:
 * - Pre-filled date/time from calendar slot
 * - Employee selection with search
 * - Duration picker
 * - Optional break duration
 * - Optional notes
 * - Keyboard shortcuts (Esc to cancel, Enter to submit when valid)
 */
export const QuickShiftModal = ({
  open,
  onOpenChange,
  startDate,
  endDate,
  onSuccess,
}: QuickShiftModalProps) => {
  const { userProfile } = useSession();
  const { employees, loading: loadingEmployees } = useEmployees(userProfile?.company_id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate default end time (8 hours after start)
  const defaultEndDate = endDate || addHours(startDate, 8);

  const form = useForm<QuickShiftFormData>({
    resolver: zodResolver(quickShiftSchema),
    defaultValues: {
      employee_id: '',
      start_time: startDate.toISOString(),
      end_time: defaultEndDate.toISOString(),
      break_minutes: 30,
      notes: '',
    },
  });

  // Update form when startDate/endDate changes
  useEffect(() => {
    if (open) {
      const newEndDate = endDate || addHours(startDate, 8);
      form.reset({
        employee_id: '',
        start_time: startDate.toISOString(),
        end_time: newEndDate.toISOString(),
        break_minutes: 30,
        notes: '',
      });
    }
  }, [open, startDate, endDate, form]);

  const onSubmit = async (data: QuickShiftFormData) => {
    if (!userProfile?.company_id) {
      showError('Company ID not found');
      return;
    }

    setIsSubmitting(true);
    logger.debug('Creating quick shift:', data);

    try {
      const { error } = await supabase.from('shifts').insert({
        company_id: userProfile.company_id,
        employee_id: data.employee_id,
        start_time: data.start_time,
        end_time: data.end_time,
        notes: data.notes || null,
        published: false, // Quick shifts start as drafts
      });

      if (error) throw error;

      showSuccess('Shift created successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      logger.error('Error creating shift:', error);
      showError('Failed to create shift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Create Quick Shift</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingEmployees ? (
                        <SelectItem value="loading" disabled>
                          Loading employees...
                        </SelectItem>
                      ) : employees.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No employees found
                        </SelectItem>
                      ) : (
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Time */}
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        field.onChange(date.toISOString());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Time */}
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        field.onChange(date.toISOString());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Break Duration */}
            <FormField
              control={form.control}
              name="break_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="480"
                      placeholder="30"
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                        field.onChange(value);
                      }}
                      value={field.value === undefined ? '' : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this shift..."
                      maxLength={500}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingEmployees}>
                {isSubmitting ? 'Creating...' : 'Create Shift'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
