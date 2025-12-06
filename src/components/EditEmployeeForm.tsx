"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client.ts";
import { showError, showSuccess } from "@/utils/toast";
import { useRoles } from "@/hooks/useRoles";

const formSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role_id: z.string().uuid({ message: "Please select a role." }),
});

interface EditEmployeeFormProps {
  employee: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role_id: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const EditEmployeeForm = ({ employee, onSuccess, onCancel }: EditEmployeeFormProps) => {
  const { roles, loading: loadingRoles } = useRoles({ excludeSystemAdmin: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      role_id: employee.role_id,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name || null,
          last_name: values.last_name || null,
          role_id: values.role_id,
        })
        .eq('id', employee.id);

      if (error) {
        throw new Error(error.message);
      }

      showSuccess(`Employee ${values.first_name || ''} ${values.last_name || ''}'s profile updated!`);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error updating employee:", errorMessage);
      showError("Failed to update employee: " + errorMessage);
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
            {isSubmitting ? "Updating..." : "Update Employee"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditEmployeeForm;