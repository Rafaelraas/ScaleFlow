"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { useSession } from "@/providers/SessionContextProvider";

const ProfileSettings = () => {
  const { isLoading, session } = useSession();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading profile settings...</p>
        <MadeWithDyad />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            You must be logged in to view this page.
          </p>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Profile Settings</CardTitle>
          <CardDescription>Manage your personal information and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default ProfileSettings;