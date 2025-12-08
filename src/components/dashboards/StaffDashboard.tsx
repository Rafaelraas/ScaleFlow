'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CalendarDays, Settings, Repeat } from 'lucide-react';

interface StaffDashboardProps {
  userProfile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ userProfile }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {userProfile?.first_name || 'Staff Member'}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              My Schedule
            </CardTitle>
            <CardDescription>View your work schedule and upcoming shifts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/my-schedule">View Schedule</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Manage your work preferences and availability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/preferences">Manage Preferences</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Shift Swaps
            </CardTitle>
            <CardDescription>Request or approve shift swap requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/swap-requests">View Swap Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
