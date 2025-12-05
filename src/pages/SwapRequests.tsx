"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InitiateSwapForm from "@/components/InitiateSwapForm";
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface ShiftDetails {
  id: string;
  start_time: string;
  end_time: string;
  roles: { name: string } | null; // Corrected to single object
}

interface EmployeeDetails {
  id: string;
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
  
  // Joined data - Corrected to single objects
  requested_shift: ShiftDetails | null;
  target_shift: ShiftDetails | null;
  requesting_employee: EmployeeDetails | null;
  target_employee: EmployeeDetails | null;
}

const SwapRequests = () => {
  const { session, isLoading, userRole, userProfile } = useSession();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isInitiateSwapDialogOpen, setIsInitiateSwapDialogOpen] = useState(false);

  const fetchSwapRequests = async () => {
    if (!session?.user?.id || !userProfile?.company_id) {
      setLoadingRequests(false);
      return;
    }

    setLoadingRequests(true);
    let query = supabase
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
        requested_shift:shifts!requested_shift_id (id, start_time, end_time, roles(name)),
        target_shift:shifts!target_shift_id (id, start_time, end_time, roles(name)),
        requesting_employee:profiles!requesting_employee_id (id, first_name, last_name),
        target_employee:profiles!target_employee_id (id, first_name, last_name)
      `)
      .eq('company_id', userProfile.company_id)
      .order('created_at', { ascending: false });

    if (userRole === 'employee') {
      query = query.or(`requesting_employee_id.eq.${session.user.id},target_employee_id.eq.${session.user.id}`);
    }
    // Managers see all requests for their company, which is covered by the initial .eq('company_id')

    const { data, error } = await query;

    if (error) {
      showError("Failed to fetch swap requests: " + error.message);
      setSwapRequests([]);
    } else {
      // Map to ensure nested relations are single objects, not arrays
      const formattedSwaps = (data || []).map(req => ({
        ...req,
        requested_shift: req.requested_shift?.[0] ? {
          ...req.requested_shift[0],
          roles: req.requested_shift[0].roles?.[0] || null,
        } : null,
        target_shift: req.target_shift?.[0] ? {
          ...req.target_shift[0],
          roles: req.target_shift[0].roles?.[0] || null,
        } : null,
        requesting_employee: req.requesting_employee?.[0] || null,
        target_employee: req.target_employee?.[0] || null,
      }));
      setSwapRequests(formattedSwaps as SwapRequest[] || []);
    }
    setLoadingRequests(false);
  };

  useEffect(() => {
    if (!isLoading) {
      fetchSwapRequests();
    }
  }, [session?.user?.id, userRole, isLoading, userProfile?.company_id]);

  const handleInitiateSwapSuccess = () => {
    setIsInitiateSwapDialogOpen(false);
    fetchSwapRequests();
  };

  const handleApproveSwap = async (request: SwapRequest) => {
    if (!request.requested_shift || !request.requesting_employee) {
      showError("Missing shift or employee data for approval.");
      return;
    }

    // Determine the new employee for the requested shift
    const newEmployeeForRequestedShift = request.target_employee_id;
    // Determine the new employee for the target shift (if it exists)
    const newEmployeeForTargetShift = request.requesting_employee_id;

    try {
      // 1. Update the status of the swap request
      const { error: swapError } = await supabase
        .from('swap_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (swapError) throw new Error(swapError.message);

      // 2. Update the shifts involved
      const updates = [];
      // Update the shift being given away by the requester
      updates.push(
        supabase
          .from('shifts')
          .update({ employee_id: newEmployeeForRequestedShift })
          .eq('id', request.requested_shift_id)
      );

      // If there's a target shift, update it as well
      if (request.target_shift_id && newEmployeeForTargetShift) {
        updates.push(
          supabase
            .from('shifts')
            .update({ employee_id: newEmployeeForTargetShift })
            .eq('id', request.target_shift_id)
        );
      }

      const results = await Promise.all(updates);
      for (const res of results) {
        if (res.error) throw new Error(res.error.message);
      }

      showSuccess("Shift swap approved and shifts updated!");
      fetchSwapRequests(); // Re-fetch to update UI
    } catch (error: any) {
      console.error("Error approving swap:", error.message);
      showError("Failed to approve swap: " + error.message);
    }
  };

  const handleDenySwap = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'denied' })
        .eq('id', requestId);

      if (error) throw new Error(error.message);

      showSuccess("Shift swap denied.");
      fetchSwapRequests(); // Re-fetch to update UI
    } catch (error: any) {
      console.error("Error denying swap:", error.message);
      showError("Failed to deny swap: " + error.message);
    }
  };

  const getShiftDisplay = (shift: ShiftDetails | null) => {
    if (!shift) return 'N/A';
    return `${format(new Date(shift.start_time), 'MMM dd HH:mm')} - ${format(new Date(shift.end_time), 'HH:mm')} (${shift.roles?.name || 'Any'})`;
  };

  const getEmployeeName = (employee: EmployeeDetails | null) => {
    return employee ? `${employee.first_name} ${employee.last_name}` : 'N/A';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading swap requests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shift Swap Requests</h1>
        {userRole === 'employee' && (
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
        )}
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
                  <TableCell className="flex space-x-2">
                    {userRole === 'manager' && request.status === 'pending_manager_approval' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleApproveSwap(request)}>Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDenySwap(request.id)}>Deny</Button>
                      </>
                    )}
                    {userRole === 'employee' && request.target_employee_id === session?.user?.id && request.status === 'pending_employee_approval' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleApproveSwap(request)}>Accept</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDenySwap(request.id)}>Decline</Button>
                      </>
                    )}
                    {userRole === 'employee' && request.requesting_employee_id === session?.user?.id && request.status === 'pending_employee_approval' && (
                      <Button variant="destructive" size="sm" onClick={() => handleDenySwap(request.id)}>Cancel</Button>
                    )}
                    {userRole === 'employee' && request.requesting_employee_id === session?.user?.id && request.status === 'pending_manager_approval' && (
                      <Button variant="destructive" size="sm" onClick={() => handleDenySwap(request.id)}>Cancel</Button>
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

export default SwapRequests;