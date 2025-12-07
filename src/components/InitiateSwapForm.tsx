"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client.ts";
import { useSession } from '@/hooks/useSession';
import { showError, showSuccess } from "@/utils/toast";
import { format } from "date-fns";

interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  roles: { name: string } | null;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

const formSchema = z.object({
  requested_shift_id: z.string().uuid({ message: "Please select a shift you want to give away." }),
  target_employee_id: z.string().uuid().nullable().optional(),
  target_shift_id: z.string().uuid().nullable().optional(),
  request_notes: z.string().max(500).optional(),
}).refine((data) => {
  // If a target employee is selected, a target shift must also be selected.
  if (data.target_employee_id && !data.target_shift_id) {
    return false;
  }
  return true;
}, {
  message: "If you select a target employee, you must also select a target shift.",
  path: ["target_shift_id"],
});

interface InitiateSwapFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const InitiateSwapForm = ({ onSuccess, onCancel }: InitiateSwapFormProps) => {
  const { session, userProfile } = useSession();
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [otherEmployees, setOtherEmployees] = useState<Employee[]>([]);
  const [targetEmployeeShifts, setTargetEmployeeShifts] = useState<Shift[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requested_shift_id: "",
      target_employee_id: undefined,
      target_shift_id: undefined,
      request_notes: "",
    },
  });

  const selectedTargetEmployeeId = form.watch("target_employee_id");

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!session?.user?.id || !userProfile?.company_id) {
        showError("User not authenticated or company ID not found.");
        setLoadingData(false);
        return;
      }

      setLoadingData(true);

      // Fetch current employee's published shifts
      const { data: myShiftsData, error: myShiftsError } = await supabase
        .from('shifts')
        .select('id, start_time, end_time, roles(name)')
        .eq('employee_id', session.user.id)
        .eq('published', true)
        .order('start_time', { ascending: true });

      if (myShiftsError) {
        showError("Failed to fetch your shifts: " + myShiftsError.message);
      } else {
        setMyShifts(myShiftsData || []);
      }

      // Fetch other employees in the same company
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('company_id', userProfile.company_id)
        .neq('id', session.user.id) // Exclude current user
        .order('last_name', { ascending: true });

      if (employeesError) {
        showError("Failed to fetch other employees: " + employeesError.message);
      } else {
        setOtherEmployees(employeesData || []);
      }

      setLoadingData(false);
    };

    fetchInitialData();
  }, [session?.user?.id, userProfile?.company_id]);

  useEffect(() => {
    const fetchTargetEmployeeShifts = async () => {
      if (selectedTargetEmployeeId) {
        const { data, error } = await supabase
          .from('shifts')
          .select('id, start_time, end_time, roles(name)')
          .eq('employee_id', selectedTargetEmployeeId)
          .eq('published', true)
          .order('start_time', { ascending: true });

        if (error) {
          showError("Failed to fetch target employee's shifts: " + error.message);
          setTargetEmployeeShifts([]);
        } else {
          setTargetEmployeeShifts(data || []);
        }
      } else {
        setTargetEmployeeShifts([]);
        form.setValue("target_shift_id", undefined); // Clear target shift if no employee selected
      }
    };

    fetchTargetEmployeeShifts();
  }, [selectedTargetEmployeeId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id || !userProfile?.company_id) {
      showError("User not authenticated or company ID not found.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('swap_requests')
      .insert({
        company_id: userProfile.company_id,
        requesting_employee_id: session.user.id,
        requested_shift_id: values.requested_shift_id,
        target_employee_id: values.target_employee_id || null,
        target_shift_id: values.target_shift_id || null,
        request_notes: values.request_notes || null,
        status: values.target_employee_id ? 'pending_employee_approval' : 'pending_manager_approval', // If target employee, they approve first
      });

    if (error) {
      showError("Failed to initiate swap request: " + error.message);
    } else {
      showSuccess("Shift swap request initiated successfully!");
      onSuccess();
    }
    setIsSubmitting(false);
  };

  if (loadingData) {
    return <div>Loading data for swap request...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="requested_shift_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Shift to Give Away</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your shift" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {myShifts.length === 0 ? (
                    <SelectItem value="" disabled>No shifts available to swap</SelectItem>
                  ) : (
                    myShifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {format(new Date(shift.start_time), 'MMM dd, HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')} ({shift.roles?.name || 'Any'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Employee (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee to swap with" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Open Request (No specific employee)</SelectItem>
                  {otherEmployees.map((employee) => (
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

        {selectedTargetEmployeeId && (
          <FormField
            control={form.control}
            name="target_shift_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Employee's Shift (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select their shift to take" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No specific shift (Open swap)</SelectItem>
                    {targetEmployeeShifts.length === 0 ? (
                      <SelectItem value="" disabled>No shifts available for this employee</SelectItem>
                    ) : (
                      targetEmployeeShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {format(new Date(shift.start_time), 'MMM dd, HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')} ({shift.roles?.name || 'Any'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="request_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes for the swap request..." {...field} />
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
            {isSubmitting ? "Initiating..." : "Initiate Swap Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InitiateSwapForm;