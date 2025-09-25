"use client";

import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InviteEmployeeForm from "@/components/InviteEmployeeForm"; // Import the new form

interface EmployeeProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  roles: { name: string } | null;
}

const Employees = () => {
  const { userProfile, userRole } = useSession();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const fetchEmployees = async () => {
    if (!userProfile?.company_id || userRole !== 'manager') {
      setLoadingEmployees(false);
      return;
    }

    setLoadingEmployees(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, roles(name)')
      .eq('company_id', userProfile.company_id)
      .order('last_name', { ascending: true });

    if (error) {
      showError("Failed to fetch employees: " + error.message);
      setEmployees([]);
    } else {
      setEmployees(data || []);
    }
    setLoadingEmployees(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, [userProfile?.company_id, userRole]);

  const handleInviteSuccess = () => {
    setIsInviteDialogOpen(false);
    fetchEmployees(); // Re-fetch employees after a new one is invited
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
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsInviteDialogOpen(true)}>Invite Employee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite New Employee</DialogTitle>
            </DialogHeader>
            <InviteEmployeeForm onSuccess={handleInviteSuccess} onCancel={() => setIsInviteDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loadingEmployees ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <p className="text-center text-gray-500">No employees found for your company. Invite some to get started!</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of employees in your company.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead> {/* Placeholder for actions like edit/remove */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                  <TableCell>{employee.roles ? employee.roles.name : 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Remove</Button>
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

export default Employees;