'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client.ts';
import { showError } from '@/utils/toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  company_id: string;
  role_id: string | null;
  roles: { name: string } | null;
  notes: string | null;
  published: boolean;
}

const MySchedule = () => {
  const { session, isLoading, userRole } = useSession();
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  const fetchMyShifts = useCallback(async () => {
    if (!session?.user?.id || userRole !== 'employee') {
      setLoadingShifts(false);
      return;
    }

    setLoadingShifts(true);
    const { data, error } = await supabase
      .from('shifts')
      .select('*, roles(name)')
      .eq('employee_id', session.user.id)
      .eq('published', true) // Only show published shifts
      .order('start_time', { ascending: true });

    if (error) {
      showError('Failed to fetch your shifts: ' + error.message);
      setMyShifts([]);
    } else {
      setMyShifts(data || []);
    }
    setLoadingShifts(false);
  }, [session?.user?.id, userRole]);

  useEffect(() => {
    if (!isLoading) {
      fetchMyShifts();
    }
  }, [isLoading, fetchMyShifts]);

  if (userRole !== 'employee') {
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
      <h1 className="text-3xl font-bold mb-6">My Personal Schedule</h1>

      {loadingShifts ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : myShifts.length === 0 ? (
        <p className="text-center text-gray-500">
          You currently have no published shifts assigned.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>Your assigned shifts.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{format(new Date(shift.start_time), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>{format(new Date(shift.end_time), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>{shift.roles ? shift.roles.name : 'Any'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{shift.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MySchedule;
