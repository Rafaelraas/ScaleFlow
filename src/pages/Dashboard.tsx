"use client";

import React from "react";
import { useSession } from "@/providers/SessionContextProvider";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Dashboard = () => {
  const { userProfile, userRole } = useSession();

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to your {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ''} Dashboard!
        </h1>
        {userProfile?.company_id && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Company ID: {userProfile.company_id}
          </p>
        )}
        <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
          This is a placeholder for your dashboard content.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;