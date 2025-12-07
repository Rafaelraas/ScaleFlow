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
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role_id: z.string().uuid({ message: 'Please select a role.' }),
});

interface InviteEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const InviteEmployeeForm = ({ onSuccess, onCancel }: InviteEmployeeFormProps) => {
  const { userProfile } = useSession();
  const { roles, loading: loadingRoles } = useRoles({ excludeSystemAdmin: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      role_id: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userProfile?.company_id) {
      showError('Company ID not found. Cannot invite employee.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.admin.inviteUserByEmail(values.email, {
        data: {
          first_name: values.first_name || null,
          last_name: values.last_name || null,
          company_id: userProfile.company_id,
          role_id: values.role_id,
        },
        redirectTo: `${window.location.origin}${window.location.pathname}#/login`,
      });

      if (error) {
        throw new Error(error.message);
      }

      showSuccess(`Invitation sent to ${values.email}!`);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error inviting employee', { error: errorMessage });
      showError('Failed to send invitation: ' + errorMessage);
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="employee@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role for the employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending Invitation...' : 'Invite Employee'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InviteEmployeeForm;
