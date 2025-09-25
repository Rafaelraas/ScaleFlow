"use client";

import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PreferenceForm from "@/components/PreferenceForm"; // Import the new PreferenceForm
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface Preference {
  id: string;
  start_date: string;
  end_date: string;
  preference_type: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const Preferences = () => {
  const { session, isLoading, userRole } = useSession();
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  const fetchPreferences = async () => {
    if (!session?.user?.id || userRole !== 'employee') {
      setLoadingPreferences(false);
      return;
    }

    setLoadingPreferences(true);
    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('employee_id', session.user.id)
      .order('start_date', { ascending: true });

    if (error) {
      showError("Failed to fetch your preferences: " + error.message);
      setPreferences([]);
    } else {
      setPreferences(data || []);
    }
    setLoadingPreferences(false);
  };

  useEffect(() => {
    if (!isLoading) {
      fetchPreferences();
    }
  }, [session?.user?.id, userRole, isLoading]);

  const handlePreferenceFormSuccess = () => {
    setIsDialogOpen(false);
    fetchPreferences(); // Re-fetch preferences after a new one is created
  };

  if (userRole !== 'employee') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            You do not have permission to view this page.
          </p>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Work Preferences</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>Submit New Preference</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit New Work Preference</DialogTitle>
            </DialogHeader>
            <PreferenceForm onSuccess={handlePreferenceFormSuccess} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loadingPreferences ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : preferences.length === 0 ? (
        <p className="text-center text-gray-500">You have not submitted any work preferences yet.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>Your submitted work preferences.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preferences.map((preference) => (
                <TableRow key={preference.id}>
                  <TableCell>{format(new Date(preference.start_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(preference.end_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{preference.preference_type.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{preference.notes || '-'}</TableCell>
                  <TableCell>{preference.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default Preferences;