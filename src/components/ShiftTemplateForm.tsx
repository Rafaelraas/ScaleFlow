'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client.ts';
import { useSession } from '@/hooks/useSession';
import { showError, showSuccess } from '@/utils/toast';
import { useRoles } from '@/hooks/useRoles';
import { logger } from '@/utils/logger';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Template name is required.' }),
  duration_hours: z.coerce
    .number()
    .min(0.5, { message: 'Duration must be at least 0.5 hours.' })
    .max(24, { message: 'Duration cannot exceed 24 hours.' }),
  default_start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm).' }),
  default_role_id: z.string().uuid().nullable().optional(),
  default_notes: z.string().max(500).optional(),
});

interface ShiftTemplateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    id?: string;
    name: string;
    duration_hours: number;
    default_start_time: string;
    default_role_id: string | null;
    default_notes: string | null;
  };
}

const ShiftTemplateForm = ({ onSuccess, onCancel, initialData }: ShiftTemplateFormProps) => {
  const { userProfile } = useSession();
  const { roles, loading: loadingRoles } = useRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      duration_hours: initialData?.duration_hours || 8,
      default_start_time: initialData?.default_start_time || '09:00',
      default_role_id: initialData?.default_role_id || undefined,
      default_notes: initialData?.default_notes || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userProfile?.company_id) {
      showError('Company ID not found. Cannot create/update shift template.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        // Update existing template
        const { error } = await supabase
          .from('shift_templates')
          .update({
            name: values.name,
            duration_hours: values.duration_hours,
            default_start_time: values.default_start_time,
            default_role_id: values.default_role_id || null,
            default_notes: values.default_notes || null,
          })
          .eq('id', initialData.id);

        if (error) throw new Error(error.message);
        showSuccess('Shift template updated successfully!');
      } else {
        // Create new template
        const { error } = await supabase.from('shift_templates').insert({
          company_id: userProfile.company_id,
          name: values.name,
          duration_hours: values.duration_hours,
          default_start_time: values.default_start_time,
          default_role_id: values.default_role_id || null,
          default_notes: values.default_notes || null,
        });

        if (error) throw new Error(error.message);
        showSuccess('Shift template created successfully!');
      }
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error saving shift template', { error: errorMessage });
      showError('Failed to save shift template: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingRoles) {
    return <div>Loading roles...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning Shift" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (Hours)</FormLabel>
              <FormControl>
                <Input type="number" step="0.5" placeholder="8" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="default_start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Start Time (HH:mm)</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="default_role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Role (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a default role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">No default role</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="default_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Includes 30 min break" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? initialData?.id
                ? 'Updating...'
                : 'Creating...'
              : initialData?.id
                ? 'Update Template'
                : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShiftTemplateForm;
