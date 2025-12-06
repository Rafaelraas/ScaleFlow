"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CompanySettingsForm from "@/components/CompanySettingsForm";
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client.ts";
import { showError } from "@/utils/toast";

const CompanySettings = () => {
  const { session, userProfile, userRole, isLoading } = useSession();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const fetchCompanyDetails = useCallback(async () => {
    if (!userProfile?.company_id || !session?.user?.id) {
      setLoadingCompany(false);
      return;
    }

    setLoadingCompany(true);
    const { data, error } = await supabase
      .from('companies')
      .select('name, owner_id')
      .eq('id', userProfile.company_id)
      .single();

    if (error) {
      showError("Failed to fetch company details: " + error.message);
      setCompanyName(null);
    } else if (data) {
      // Ensure only the owner can see/edit company settings
      if (data.owner_id === session.user.id) {
        setCompanyName(data.name);
      } else {
        showError("You are not the owner of this company.");
        setCompanyName(null); // Clear company name if not owner
      }
    }
    setLoadingCompany(false);
  }, [userProfile?.company_id, session?.user?.id]);

  useEffect(() => {
    if (!isLoading && userProfile?.company_id && session?.user?.id) {
      fetchCompanyDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, userProfile?.company_id, session?.user?.id]);

  if (isLoading || loadingCompany) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading company settings...</p>
      </div>
    );
  }

  if (userRole !== 'manager' || !companyName) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            You do not have permission to view this page or are not the company owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Company Settings</CardTitle>
          <CardDescription>Manage your company's general information.</CardDescription>
        </CardHeader>
        <CardContent>
          {userProfile?.company_id && companyName && (
            <CompanySettingsForm
              companyId={userProfile.company_id}
              initialCompanyName={companyName}
              onSuccess={fetchCompanyDetails} // Re-fetch to update local state if needed
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettings;