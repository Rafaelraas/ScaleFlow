"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import UpdatePasswordForm from "@/components/UpdatePasswordForm"; // Import the new component
import { useSession } from "@/providers/SessionContextProvider";
import { Separator } from "@/components/ui/separator"; // Import Separator for visual division

const ProfileSettings = () => {
  const { isLoading, session } = useSession();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading profile settings...</p>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Profile Settings</CardTitle>
          <CardDescription>Manage your personal information and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Update Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;