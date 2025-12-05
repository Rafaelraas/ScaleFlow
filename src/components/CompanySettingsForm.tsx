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
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/providers/SessionContextProvider";
import { showError, showSuccess } from "@/utils/toast";

const formSchema = z.object({
  name: z.string().min(1, { message: "Company name cannot be empty." }),
});

interface CompanySettingsFormProps {
  companyId: string;
  initialCompanyName: string;
  onSuccess: () => void;
}

const CompanySettingsForm = ({ companyId, initialCompanyName, onSuccess }: CompanySettingsFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialCompanyName,
    },
  });

  // Update form default when initialCompanyName changes
  useEffect(() => {
    form.reset({ name: initialCompanyName });
  }, [initialCompanyName, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('companies')
        .update({ name: values.name })
        .eq('id', companyId);

      if (error) {
        throw new Error(error.message);
      }

      showSuccess("Company name updated successfully!");
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error updating company name:", errorMessage);
      showError("Failed to update company name: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Company Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};

export default CompanySettingsForm;