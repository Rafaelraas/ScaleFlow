"use client";

import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ShiftForm from "@/components/ShiftForm"; // Import the new ShiftForm
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  employee_id: string | null;
  profiles: { first_name: string; last_name: string } | null;
  role_id: string | null;
  roles: { name: string } | null;
  notes: string | null;
  published: boolean;
}

const Schedules = () => {
  const { userProfile, userRole } = useSession();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(true);

  const fetchShifts = async () => {
    if (!userProfile?.company_id || userRole !== 'manager') {
      setLoadingShifts(false);
      return;
    }

    setLoadingShifts(true);
    const { data, error } = await supabase
      .from('shifts')
      .select('*, profiles(first_name, last_name), roles(name)')
      .eq('company_id', userProfile.company_id)
      .order('start_time', { ascending: true });

    if (error) {
      showError("Failed to fetch shifts: " + error.message);
      setShifts([]);
    } else {
      setShifts(data || []);
    }
    setLoadingShifts(false);
  };

  useEffect(() => {
    fetchShifts();
  }, [userProfile?.company_id, userRole]);

  const handleShiftFormSuccess = () => {
    setIsDialogOpen(false);
    fetchShifts(); // Re-fetch shifts after a new one is created
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
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedules Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>Create New Shift</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
            </DialogHeader>
            <ShiftForm onSuccess={handleShiftFormSuccess} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loadingShifts ? (
        <p>Loading shifts...</p>
      ) : shifts.length === 0 ? (
        <p className="text-center text-gray-500">No shifts found for your company. Start by creating one!</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of your company's shifts.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{format(new Date(shift.start_time), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>{format(new Date(shift.end_time), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {shift.profiles ? `${shift.profiles.first_name} ${shift.profiles.last_name}` : 'Unassigned'}
                  </TableCell>
                  <TableCell>{shift.roles ? shift.roles.name : 'Any'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{shift.notes || '-'}</TableCell>
                  <TableCell>{shift.published ? 'Yes' : 'No'}</TableCell>
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

export default Schedules;