"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/providers/SessionContextProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client.ts";
import { showError } from "@/utils/toast";
import { format, isFuture, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  roles: { name: string } | null; // Corrected to single object
}

interface Preference {
  id: string;
  start_date: string;
  end_date: string;
  preference_type: string;
  status: string;
  profiles: { first_name: string; last_name: string } | null;
}

interface SwapRequest {
  id: string;
  status: string;
  requesting_employee: { first_name: string; last_name: string } | null; // Corrected to single object
  target_employee: { first_name: string; last_name: string } | null;     // Corrected to single object
  requested_shift: { start_time: string; end_time: string; roles: { name: string } | null } | null; // Corrected to single object
}

const Dashboard = () => {
  const { session, userProfile, userRole, isLoading } = useSession();
  const [nextShift, setNextShift] = useState<Shift | null>(null);
  const [pendingPreferences, setPendingPreferences] = useState<Preference[]>([]);
  const [pendingSwapRequests, setPendingSwapRequests] = useState<SwapRequest[]>([]);
  const [myPendingPreferencesCount, setMyPendingPreferencesCount] = useState(0);
  const [myPendingSwapRequestsCount, setMyPendingSwapRequestsCount] = useState(0);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Admin-specific states
  const [totalCompanies, setTotalCompanies] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) { // Removed userProfile?.company_id check here to allow system_admin without company_id
        setLoadingDashboard(false);
        return;
      }

      setLoadingDashboard(true);

      if (userRole === 'system_admin') {
        // Fetch total companies
        const { count: companiesCount, error: companiesError } = await supabase
          .from('companies')
          .select('id', { count: 'exact' });

        if (companiesError) {
          showError("Failed to fetch total companies: " + companiesError.message);
        } else {
          setTotalCompanies(companiesCount);
        }

        // Fetch total users (profiles)
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });

        if (usersError) {
          showError("Failed to fetch total users: " + usersError.message);
        } else {
          setTotalUsers(usersCount);
        }

      } else if (userRole === 'manager') {
        if (!userProfile?.company_id) { // Manager must have a company
          setLoadingDashboard(false);
          return;
        }
        // Fetch pending employee preferences for managers
        const { data: prefsData, error: prefsError } = await supabase
          .from('preferences')
          .select('*, profiles(first_name, last_name)')
          .eq('company_id', userProfile.company_id)
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (prefsError) {
          showError("Failed to fetch pending preferences: " + prefsError.message);
        } else {
          setPendingPreferences(prefsData as Preference[] || []);
        }

        // Fetch pending swap requests for managers
        const { data: swapsData, error: swapsError } = await supabase
          .from('swap_requests')
          .select(`
            id,
            status,
            requesting_employee:profiles!requesting_employee_id(first_name, last_name),
            target_employee:profiles!target_employee_id(first_name, last_name),
            requested_shift:shifts!requested_shift_id(start_time, end_time, roles(name))
          `)
          .eq('company_id', userProfile.company_id)
          .eq('status', 'pending_manager_approval')
          .order('created_at', { ascending: true });

        if (swapsError) {
          showError("Failed to fetch pending swap requests: " + swapsError.message);
        } else {
          // Supabase often returns nested relations as arrays even for single relationships.
          // We'll map to ensure the types match our interface expecting single objects.
          const formattedSwaps = (swapsData || []).map(req => ({
            ...req,
            requesting_employee: req.requesting_employee?.[0] || null,
            target_employee: req.target_employee?.[0] || null,
            requested_shift: req.requested_shift?.[0] ? {
              ...req.requested_shift[0],
              roles: req.requested_shift[0].roles?.[0] || null,
            } : null,
          }));
          setPendingSwapRequests(formattedSwaps as SwapRequest[] || []);
        }

      } else if (userRole === 'employee') {
        if (!userProfile?.company_id) { // Employee must have a company
          setLoadingDashboard(false);
          return;
        }
        // Fetch next upcoming shift for employees
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('id, start_time, end_time, roles(name)')
          .eq('employee_id', session.user.id)
          .eq('published', true)
          .order('start_time', { ascending: true })
          .limit(1);

        if (shiftsError) {
          showError("Failed to fetch next shift: " + shiftsError.message);
        } else if (shiftsData && shiftsData.length > 0) {
          const nextUpcoming = shiftsData.find(shift => isFuture(parseISO(shift.start_time)));
          if (nextUpcoming) {
            // Map to ensure roles is a single object
            const formattedShift: Shift = {
              ...nextUpcoming,
              roles: nextUpcoming.roles?.[0] || null,
            };
            setNextShift(formattedShift);
          } else {
            setNextShift(null);
          }
        } else {
          setNextShift(null);
        }

        // Fetch employee's pending preferences count
        const { count: myPrefsCount, error: myPrefsError } = await supabase
          .from('preferences')
          .select('id', { count: 'exact' })
          .eq('employee_id', session.user.id)
          .eq('status', 'pending');

        if (myPrefsError) {
          showError("Failed to fetch your pending preferences count: " + myPrefsError.message);
        } else {
          setMyPendingPreferencesCount(myPrefsCount || 0);
        }

        // Fetch employee's pending swap requests count
        const { count: mySwapsCount, error: mySwapsError } = await supabase
          .from('swap_requests')
          .select('id', { count: 'exact' })
          .or(`requesting_employee_id.eq.${session.user.id},target_employee_id.eq.${session.user.id}`)
          .in('status', ['pending_employee_approval', 'pending_manager_approval']);

        if (mySwapsError) {
          showError("Failed to fetch your pending swap requests count: " + mySwapsError.message);
        } else {
          setMyPendingSwapRequestsCount(mySwapsCount || 0);
        }
      }
      setLoadingDashboard(false);
    };

    if (!isLoading && session) {
      fetchDashboardData();
    }
  }, [session, userProfile, userRole, isLoading]);

  if (isLoading || loadingDashboard) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-1/3 mb-6" /> {/* Welcome message skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-1/4 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {userProfile?.first_name || session?.user?.email}!
      </h1>

      {userRole === 'system_admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Companies</CardTitle>
              <CardDescription>Number of companies registered on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-4">{totalCompanies !== null ? totalCompanies : <Skeleton className="h-10 w-1/4" />}</p>
              <Button asChild className="w-full">
                <Link to="/admin/companies">Manage Companies</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Number of user profiles across all companies.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-4">{totalUsers !== null ? totalUsers : <Skeleton className="h-10 w-1/4" />}</p>
              <Button asChild className="w-full">
                <Link to="/admin/users">Manage All Users</Link>
              </Button>
            </CardContent>
          </Card>
          {/* Add more system_admin-specific cards here */}
        </div>
      )}

      {userRole === 'manager' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Employee Preferences</CardTitle>
              <CardDescription>Preferences awaiting your review.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-4">{pendingPreferences.length}</p>
              {pendingPreferences.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground mb-4">
                  {pendingPreferences.slice(0, 3).map(pref => (
                    <li key={pref.id}>
                      {pref.profiles ? `${pref.profiles.first_name} ${pref.profiles.last_name}` : 'N/A'} - {pref.preference_type.replace(/_/g, ' ')}
                    </li>
                  ))}
                  {pendingPreferences.length > 3 && <li>...and {pendingPreferences.length - 3} more</li>}
                </ul>
              ) : (
                <p className="text-muted-foreground mb-4">No pending preferences.</p>
              )}
              <Button asChild className="w-full">
                <Link to="/employee-preferences">View All Preferences</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Shift Swap Requests</CardTitle>
              <CardDescription>Swap requests awaiting your approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-4">{pendingSwapRequests.length}</p>
              {pendingSwapRequests.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground mb-4">
                  {pendingSwapRequests.slice(0, 3).map(req => (
                    <li key={req.id}>
                      {req.requesting_employee?.first_name} wants to swap {format(parseISO(req.requested_shift?.start_time || ''), 'MMM dd HH:mm')}
                    </li>
                  ))}
                  {pendingSwapRequests.length > 3 && <li>...and {pendingSwapRequests.length - 3} more</li>}
                </ul>
              ) : (
                <p className="text-muted-foreground mb-4">No pending swap requests.</p>
              )}
              <Button asChild className="w-full">
                <Link to="/swap-requests">View All Swap Requests</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Add more manager-specific cards here */}
        </div>
      )}

      {userRole === 'employee' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Next Shift</CardTitle>
              <CardDescription>Your upcoming work assignment.</CardDescription>
            </CardHeader>
            <CardContent>
              {nextShift ? (
                <>
                  <p className="text-2xl font-bold mb-2">
                    {format(parseISO(nextShift.start_time), 'MMM dd, HH:mm')} - {format(parseISO(nextShift.end_time), 'HH:mm')}
                  </p>
                  <p className="text-muted-foreground mb-4">Role: {nextShift.roles?.name || 'Any'}</p>
                </>
              ) : (
                <p className="text-muted-foreground mb-4">No upcoming shifts assigned.</p>
              )}
              <Button asChild className="w-full">
                <Link to="/my-schedule">View Full Schedule</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Pending Preferences</CardTitle>
              <CardDescription>Work preferences awaiting manager review.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-4">{myPendingPreferencesCount}</p>
              <Button asChild className="w-full">
                <Link to="/preferences">Manage Preferences</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Pending Swap Requests</CardTitle>
              <CardDescription>Shift swap requests you've initiated or received.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-4">{myPendingSwapRequestsCount}</p>
              <Button asChild className="w-full">
                <Link to="/swap-requests">View Swap Requests</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Add more employee-specific cards here */}
        </div>
      )}

    </div>
  );
};

export default Dashboard;