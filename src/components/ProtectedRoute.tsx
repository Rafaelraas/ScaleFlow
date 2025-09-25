"use client";

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/providers/SessionContextProvider";
import { MadeWithDyad } from "./made-with-dyad";

interface ProtectedRouteProps {
  requiresCompany?: boolean;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ requiresCompany = true, allowedRoles }: ProtectedRouteProps) => {
  const { session, isLoading, userProfile, userRole } = useSession();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading application...</p>
        <MadeWithDyad />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requiresCompany && !userProfile?.company_id) {
    return <Navigate to="/create-company" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            You do not have the necessary permissions to view this page.
          </p>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;