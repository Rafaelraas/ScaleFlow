'use client';

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { UserRole } from '@/types/roles';

interface ProtectedRouteProps {
  requiresCompany?: boolean;
  allowedRoles?: UserRole[];
  children?: React.ReactNode; // Adicionado children prop
}

const ProtectedRoute = ({
  requiresCompany = true,
  allowedRoles,
  children,
}: ProtectedRouteProps) => {
  const { session, userProfile, userRole, isLoading } = useSession();

  // Show loading state while session data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no session exists
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to create company page if company is required but user has none
  // Exception: system_admin can access routes even without a company
  if (requiresCompany && !userProfile?.company_id && userRole !== 'system_admin') {
    return <Navigate to="/create-company" replace />;
  }

  // Check role-based access
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            You do not have the necessary permissions to view this page.
          </p>
        </div>
      </div>
    );
  }

  // Render children or outlet if all checks pass
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
