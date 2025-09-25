"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { MadeWithDyad } from "@/components/made-with-dyad";

const CreateCompany = () => {
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session, userProfile } = useSession();
  const navigate = useNavigate();

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !userProfile) {
      showError("User not authenticated.");
      return;
    }
    if (!companyName.trim()) {
      showError("Company name cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the new company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({ name: companyName, owner_id: session.user.id })
        .select()
        .single();

      if (companyError) {
        throw new Error(companyError.message);
      }

      const newCompanyId = companyData.id;

      // 2. Get the manager role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'manager')
        .single();

      if (roleError) {
        throw new Error(roleError.message);
      }

      const managerRoleId = roleData.id;

      // 3. Update the user's profile with the new company_id and manager role_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: newCompanyId, role_id: managerRoleId })
        .eq('id', session.user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      showSuccess(`Company "${companyName}" created successfully! You are now a manager.`);
      navigate('/dashboard'); // Redirect to dashboard after successful creation
    } catch (error: any) {
      console.error("Error creating company:", error.message);
      showError("Failed to create company: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your Company</CardTitle>
          <CardDescription>
            Start by creating your company. You will automatically become its manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="e.g., My Awesome Shifts Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Company..." : "Create Company"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default CreateCompany;