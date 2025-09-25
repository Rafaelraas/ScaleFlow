"use client";

import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InitiateSwapForm from "@/components/InitiateSwapForm"; // Import the new form
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface ShiftDetails {
  start_time: string;
  end_time: string;
  roles: { name: string } | null;
}

interface EmployeeDetails {
  first_name: string;
  last_name: string;
}

interface SwapRequest {
  id: string;
  requesting_employee_id: string;
  requested_shift_id: string;
  target_employee_id: string | null;
  target_shift_id: string | null;
  status: string;
  request_notes: string | null;
  created_at: string;
  
  // Joined data
  requested_shift: ShiftDetails | null;
  target_shift: ShiftDetails | null;
  requesting_employee: EmployeeDetails | null;
  target_employee: EmployeeDetails | null;
}

const SwapRequests = () => {
  const { session, isLoading, userRole } = useSession();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isInitiateSwapDialogOpen, setIsInitiateSwapDialogOpen] = useState(false);

  const fetchSwapRequests = async () => {
    if (!session?.user?.id || userRole !== 'employee') {
      setLoadingRequests(false);
      return;
    }

    setLoadingRequests(true);
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        id,
        requesting_employee_id,
        requested_shift_id,
        target_employee_id,
        target_shift_id,
        status,
        request_notes,
        created_at,
        requested_shift:shifts!requested_shift_id (start_time, end_time, roles(name)),
        target_shift:shifts!target_shift_id (start_time, end_time, roles(name)),
        requesting_employee:profiles!requesting_employee_id (first_name, last_name),
        target_employee:profiles!target_employee_id (first_name, last_name)
      `)
      .or(`requesting_employee_id.eq.${session.user.id},target_employee_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      showError("Failed to fetch swap requests: " + error.message);
      setSwapRequests([]);
    } else {
      setSwapRequests(data || []);
    }
    setLoadingRequests(false);
  };

  useEffect(() => {
    if (!isLoading) {
      fetchSwapRequests();
    }
  }, [session?.user?.id, userRole, isLoading]);

  const handleInitiateSwapSuccess = () => {
    setIsInitiateSwapDialogOpen(false);
    fetchSwapRequests(); // Re-fetch requests after a new one is initiated
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

  const getShiftDisplay = (shift: ShiftDetails | null) => {
    if (!shift) return 'N/A';
    return `${format(new Date(shift.start_time), 'MMM dd HH:mm')} - ${format(new Date(shift.end_time), 'HH:mm')} (${shift.roles?.name || 'Any'})`;
  };

  const getEmployeeName = (employee: EmployeeDetails | null) => {
    return employee ? `${employee.first_name} ${employee.last_name}` : 'N/A';
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shift Swap Requests</h1>
        <Dialog open={isInitiateSwapDialogOpen} onOpenChange={setIsInitiateSwapDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsInitiateSwapDialogOpen(true)}>Initiate New Swap</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Initiate New Shift Swap</DialogTitle>
            </DialogHeader>
            <InitiateSwapForm onSuccess={handleInitiateSwapSuccess} onCancel={() => setIsInitiateSwapDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loadingRequests ? (
        <p>Loading swap requests...</p>
      ) : swapRequests.length === 0 ? (
        <p className="text-center text-gray-500">You have no active shift swap requests.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>Your shift swap requests.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Requested Shift</TableHead>
                <TableHead>Target Shift</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Target Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swapRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{getShiftDisplay(request.requested_shift)}</TableCell>
                  <TableCell>{request.target_shift ? getShiftDisplay(request.target_shift) : 'Open Request'}</TableCell>
                  <TableCell>{getEmployeeName(request.requesting_employee)}</TableCell>
                  <TableCell>{request.target_employee ? getEmployeeName(request.target_employee) : 'Open'}</TableCell>
                  <TableCell>{request.status.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{request.request_notes || '-'}</TableCell>
                  <TableCell>
                    {/* Placeholder for actions like Accept/Decline/Cancel */}
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
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

export default SwapRequests;