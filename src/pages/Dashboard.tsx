"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/providers/SessionContextProvider";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { format, isFuture, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Shift {
  id: string;
  start_time: string;
  end_time: string;
  roles: { name: string } | null;
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
  requesting_employee: { first_name: string; last_name: string } | null;
  target_employee: { first_name: string; last_name: string } | null;
  requested_shift: { start_time: string; end_time: string; roles: { name: string } | null } | null;
}

const Dashboard = () => {
  const { session, userProfile, userRole, isLoading } = useSession();
  const [nextShift, setNextShift] = useState<Shift | null>(null);
  const [pendingPreferences, setPendingPreferences] = useState<Preference[]>([]);
  const [pendingSwapRequests, setPendingSwapRequests] = useState<SwapRequest[]>([]);
  const [myPendingPreferencesCount, setMyPendingPreferencesCount] = useState(0);
  const [myPendingSwapRequestsCount, setMyPendingSwapRequestsCount] = useState(0);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id || !userProfile?.company_id) {
        setLoadingDashboard(false);
        return;
      }

      setLoadingDashboard(true);

      if (userRole === 'manager') {
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
          setPendingPreferences(prefsData || []);
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
          setPendingSwapRequests(swapsData || []);
        }

      } else if (userRole === 'employee') {
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
          setNextShift(nextUpcoming || null);
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
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {userProfile?.first_name || session?.user?.email}!
      </h1>

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
                      {pref.profiles?.first_name} {pref.profiles?.last_name} - {pref.preference_type.replace(/_/g, ' ')}
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

      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;