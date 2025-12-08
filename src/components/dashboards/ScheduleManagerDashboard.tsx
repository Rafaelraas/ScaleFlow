'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Users, ListChecks, Repeat } from 'lucide-react';

interface ScheduleManagerDashboardProps {
  userProfile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const ScheduleManagerDashboard: React.FC<ScheduleManagerDashboardProps> = ({
  userProfile,
}) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {userProfile?.first_name || 'Schedule Manager'}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Schedules
            </CardTitle>
            <CardDescription>Create and manage employee schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/schedules">Manage Schedules</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Shift Templates
            </CardTitle>
            <CardDescription>Manage reusable shift templates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/shift-templates">View Templates</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>View team members and their availability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/employees">View Team</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Employee Preferences
            </CardTitle>
            <CardDescription>Review and approve employee preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/employee-preferences">View Preferences</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Shift Swaps
            </CardTitle>
            <CardDescription>Approve shift swap requests.</CardDescription>
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
