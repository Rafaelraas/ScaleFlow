"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, setHours, setMinutes, addHours, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface Role {
  id: string;
  name: string;
}
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/providers/SessionContextProvider";
import { showError, showSuccess } from "@/utils/toast";

const formSchema = z.object({
  start_time: z.date({
    required_error: "Start time is required.",
  }),
  end_time: z.date({
    required_error: "End time is required.",
  }),
  employee_id: z.string().uuid().nullable().optional(),
  role_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).optional(),
  published: z.boolean().default(false),
});

interface ShiftFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    id?: string; // Optional for new shifts, required for editing
    start_time: string;
    end_time: string;
    employee_id: string | null;
    role_id: string | null;
    notes: string | null;
    published: boolean;
  };
}

interface ShiftTemplate {
  id: string;
  name: string;
  duration_hours: number;
  default_start_time: string; // HH:mm format
  default_role_id: string | null;
  default_notes: string | null;
}

const ShiftForm = ({ onSuccess, onCancel, initialData }: ShiftFormProps) => {
  const { userProfile } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start_time: initialData ? new Date(initialData.start_time) : undefined,
      end_time: initialData ? new Date(initialData.end_time) : undefined,
      employee_id: initialData?.employee_id || undefined,
      role_id: initialData?.role_id || undefined,
      notes: initialData?.notes || "",
      published: initialData?.published || false,
    },
  });

  useEffect(() => {
    const fetchDependencies = async () => {
      if (!userProfile?.company_id) {
        showError("Company ID not found for current user.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('company_id', userProfile.company_id);

      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('id, name');

      const { data: templatesData, error: templatesError } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('name', { ascending: true });

      if (employeesError) {
        showError("Failed to fetch employees: " + employeesError.message);
      } else {
        setEmployees(employeesData || []);
      }

      if (rolesError) {
        showError("Failed to fetch roles: " + rolesError.message);
      } else {
        setRoles(rolesData || []);
      }

      if (templatesError) {
        showError("Failed to fetch shift templates: " + templatesError.message);
      } else {
        setShiftTemplates(templatesData || []);
      }
      setLoading(false);
    };

    fetchDependencies();
  }, [userProfile?.company_id]);

  const handleTemplateChange = (templateId: string) => {
    if (!templateId) {
      // Clear template-related fields if "No template" is selected
      form.setValue("role_id", undefined);
      form.setValue("notes", "");
      // Don't clear dates, as user might have picked them already
      return;
    }

    const selectedTemplate = shiftTemplates.find(t => t.id === templateId);
    if (selectedTemplate) {
      const now = new Date();
      const [hours, minutes] = selectedTemplate.default_start_time.split(':').map(Number);
      
      // Set start time to today's date with template's default time
      let startTime = setHours(setMinutes(now, minutes), hours);
      
      // If the start time is in the past, set it for tomorrow
      if (startTime < now) {
        startTime = addHours(startTime, 24); // Add 24 hours to make it tomorrow
      }

      const endTime = addHours(startTime, selectedTemplate.duration_hours);

      form.setValue("start_time", startTime);
      form.setValue("end_time", endTime);
      form.setValue("role_id", selectedTemplate.default_role_id || undefined);
      form.setValue("notes", selectedTemplate.default_notes || "");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userProfile?.company_id) {
      showError("Company ID not found. Cannot create/update shift.");
      return;
    }

    if (initialData?.id) {
      // Update existing shift
      const { error } = await supabase
        .from('shifts')
        .update({
          start_time: values.start_time.toISOString(),
          end_time: values.end_time.toISOString(),
          employee_id: values.employee_id || null,
          role_id: values.role_id || null,
          notes: values.notes || null,
          published: values.published,
        })
        .eq('id', initialData.id);

      if (error) {
        showError("Failed to update shift: " + error.message);
      } else {
        showSuccess("Shift updated successfully!");
        onSuccess();
      }
    } else {
      // Create new shift
      const { error } = await supabase
        .from('shifts')
        .insert({
          company_id: userProfile.company_id,
          start_time: values.start_time.toISOString(),
          end_time: values.end_time.toISOString(),
          employee_id: values.employee_id || null,
          role_id: values.role_id || null,
          notes: values.notes || null,
          published: values.published,
        });

      if (error) {
        showError("Failed to create shift: " + error.message);
      } else {
        showSuccess("Shift created successfully!");
        onSuccess();
      }
    }
  };

  if (loading) {
    return <div>Loading form data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!initialData && ( // Only show template selector for new shifts
          <FormItem>
            <FormLabel>Apply Shift Template (Optional)</FormLabel>
            <Select onValueChange={handleTemplateChange} defaultValue="">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template to pre-fill details" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">No Template</SelectItem>
                {shiftTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.duration_hours}h, {template.default_start_time})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        const existingTime = field.value || new Date();
                        const newDateWithTime = setHours(setMinutes(date, existingTime.getMinutes()), existingTime.getHours());
                        field.onChange(newDateWithTime);
                      }
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={field.value ? format(field.value, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = field.value || new Date();
                        newDate.setHours(hours, minutes);
                        field.onChange(newDate);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        const existingTime = field.value || new Date();
                        const newDateWithTime = setHours(setMinutes(date, existingTime.getMinutes()), existingTime.getHours());
                        field.onChange(newDateWithTime);
                      }
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={field.value ? format(field.value, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = field.value || new Date();
                        newDate.setHours(hours, minutes);
                        field.onChange(newDate);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Employee (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
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
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Role (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Any Role</SelectItem>
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any specific instructions for this shift..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Publish Shift
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  If checked, this shift will be visible to assigned employees.
                </p>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (initialData?.id ? "Updating..." : "Creating...") : (initialData?.id ? "Update Shift" : "Create Shift")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShiftForm;