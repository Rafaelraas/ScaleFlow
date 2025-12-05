"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ShiftForm from "@/components/ShiftForm";
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Edit, Trash2, CalendarIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
}

interface RoleOption {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 10;

const Schedules = () => {
  const { userProfile, userRole } = useSession();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Filter states
  const [filterEmployeeId, setFilterEmployeeId] = useState<string | null>(null);
  const [filterRoleId, setFilterRoleId] = useState<string | null>(null);
  const [filterPublished, setFilterPublished] = useState<string | null>(null); // 'true', 'false', or null for all
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);

  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(true);

  // Fetch filter options (employees and roles)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!userProfile?.company_id) {
        setLoadingFilterOptions(false);
        return;
      }

      setLoadingFilterOptions(true);
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('company_id', userProfile.company_id)
        .order('last_name', { ascending: true });

      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('id, name')
        .order('name', { ascending: true });

      if (employeesError) {
        showError("Failed to fetch employee filter options: " + employeesError.message);
      } else {
        setEmployeeOptions(employeesData || []);
      }

      if (rolesError) {
        showError("Failed to fetch role filter options: " + rolesError.message);
      } else {
        setRoleOptions(rolesData || []);
      }
      setLoadingFilterOptions(false);
    };

    if (userProfile?.company_id) {
      fetchFilterOptions();
    }
  }, [userProfile?.company_id]);


  const fetchShifts = async () => {
    if (!userProfile?.company_id || userRole !== 'manager') {
      setLoadingShifts(false);
      return;
    }

    setLoadingShifts(true);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Helper function to apply filters to a query
    const applyFilters = <T extends { eq: (column: string, value: unknown) => T; gte: (column: string, value: string) => T; lte: (column: string, value: string) => T }>(query: T): T => {
      let filteredQuery = query;
      if (filterEmployeeId) {
        filteredQuery = filteredQuery.eq('employee_id', filterEmployeeId);
      }
      if (filterRoleId) {
        filteredQuery = filteredQuery.eq('role_id', filterRoleId);
      }
      if (filterPublished !== null) {
        filteredQuery = filteredQuery.eq('published', filterPublished === 'true');
      }
      if (filterStartDate) {
        filteredQuery = filteredQuery.gte('start_time', format(filterStartDate, 'yyyy-MM-dd'));
      }
      if (filterEndDate) {
        filteredQuery = filteredQuery.lte('end_time', format(filterEndDate, 'yyyy-MM-ddT23:59:59.999Z'));
      }
      return filteredQuery;
    };

    // Build and execute both queries in parallel
    const countQuery = applyFilters(
      supabase
        .from('shifts')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id)
    );

    const dataQuery = applyFilters(
      supabase
        .from('shifts')
        .select('*, profiles(first_name, last_name), roles(name)')
        .eq('company_id', userProfile.company_id)
        .order('start_time', { ascending: true })
        .range(from, to)
    );

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error) {
      showError("Failed to fetch shift count: " + countResult.error.message);
    } else {
      setTotalCount(countResult.count || 0);
    }

    if (dataResult.error) {
      showError("Failed to fetch shifts: " + dataResult.error.message);
      setShifts([]);
    } else {
      setShifts(dataResult.data as Shift[] || []);
    }
    setLoadingShifts(false);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterEmployeeId, filterRoleId, filterPublished, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchShifts();
  }, [userProfile?.company_id, userRole, filterEmployeeId, filterRoleId, filterPublished, filterStartDate, filterEndDate, currentPage]);

  const handleShiftFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingShift(null);
    setCurrentPage(1); // Reset to first page
    fetchShifts(); // Re-fetch shifts after create/update
  };

  const handleEditClick = (shift: Shift) => {
    setEditingShift(shift);
    setIsEditDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', shiftId);

    if (error) {
      showError("Failed to delete shift: " + error.message);
    } else {
      showSuccess("Shift deleted successfully!");
      fetchShifts(); // Re-fetch shifts after deletion
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedules Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>Create New Shift</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
            </DialogHeader>
            <ShiftForm onSuccess={handleShiftFormSuccess} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select onValueChange={(value) => setFilterEmployeeId(value === 'all' ? null : value)} value={filterEmployeeId || 'all'}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employeeOptions.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setFilterRoleId(value === 'all' ? null : value)} value={filterRoleId || 'all'}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roleOptions.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setFilterPublished(value === 'all' ? null : value)} value={filterPublished || 'all'}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Unpublished</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filterStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterStartDate ? format(filterStartDate, "PPP") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filterStartDate}
                onSelect={setFilterStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filterEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterEndDate ? format(filterEndDate, "PPP") : <span>End Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filterEndDate}
                onSelect={setFilterEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loadingShifts || loadingFilterOptions ? (
        <div className="rounded-md border">
          <Table>
            <TableCaption>Loading shifts...</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : shifts.length === 0 ? (
        <p className="text-center text-gray-500">No shifts found matching your criteria.</p>
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
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(shift)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the shift.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteShift(shift.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!loadingShifts && !loadingFilterOptions && totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first page, last page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <PaginationEllipsis key={`ellipsis-${page}`} />;
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} shifts
          </p>
        </div>
      )}

      {editingShift && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Shift</DialogTitle>
            </DialogHeader>
            <ShiftForm
              initialData={editingShift}
              onSuccess={handleShiftFormSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Schedules;