"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from '@/hooks/useSession';
import { supabase } from "@/integrations/supabase/client.ts";
import { showError, showSuccess } from "@/utils/toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface EmployeePreference {
  id: string;
  start_date: string;
  end_date: string;
  preference_type: string;
  notes: string | null;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
}

const EmployeePreferences = () => {
  const { userProfile, userRole, isLoading } = useSession();
  const [preferences, setPreferences] = useState<EmployeePreference[]>([]);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  const fetchEmployeePreferences = useCallback(async () => {
    if (!userProfile?.company_id || userRole !== 'manager') {
      setLoadingPreferences(false);
      return;
    }

    setLoadingPreferences(true);
    const { data, error } = await supabase
      .from('preferences')
      .select('*, profiles(first_name, last_name)')
      .eq('company_id', userProfile.company_id)
      .order('created_at', { ascending: false });

    if (error) {
      showError("Failed to fetch employee preferences: " + error.message);
      setPreferences([]);
    } else {
      setPreferences(data as EmployeePreference[] || []);
    }
    setLoadingPreferences(false);
  }, [userProfile?.company_id, userRole]);

  useEffect(() => {
    if (!isLoading) {
      fetchEmployeePreferences();
    }
  }, [isLoading, fetchEmployeePreferences]);

  const handleUpdatePreferenceStatus = async (preferenceId: string, newStatus: string) => {
    const { error } = await supabase
      .from('preferences')
      .update({ status: newStatus })
      .eq('id', preferenceId);

    if (error) {
      showError("Failed to update preference status: " + error.message);
    } else {
      showSuccess(`Preference status updated to ${newStatus}.`);
      fetchEmployeePreferences(); // Re-fetch to update UI
    }
  };

  if (userRole !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Employee Work Preferences</h1>

      {loadingPreferences ? (
        <p>Loading employee preferences...</p>
      ) : preferences.length === 0 ? (
        <p className="text-center text-gray-500">No employee preferences have been submitted yet.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of all submitted employee work preferences.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preferences.map((preference) => (
                <TableRow key={preference.id}>
                  <TableCell>
                    {preference.profiles ? `${preference.profiles.first_name} ${preference.profiles.last_name}` : 'N/A'}
                  </TableCell>
                  <TableCell>{format(new Date(preference.start_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(preference.end_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{preference.preference_type.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{preference.notes || '-'}</TableCell>
                  <TableCell>{preference.status}</TableCell>
                  <TableCell className="flex space-x-2">
                    {preference.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleUpdatePreferenceStatus(preference.id, 'approved')}>Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleUpdatePreferenceStatus(preference.id, 'denied')}>Deny</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EmployeePreferences;