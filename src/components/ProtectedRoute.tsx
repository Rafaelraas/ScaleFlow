"use client";

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/providers/SessionContextProvider";

interface ProtectedRouteProps {
  requiresCompany?: boolean;
  allowedRoles?: string[];
  children?: React.ReactNode; // Adicionado children prop
}

const ProtectedRoute = ({ requiresCompany = true, allowedRoles, children }: ProtectedRouteProps) => {
  const { session, userProfile, userRole, isLoading } = useSession(); // Get isLoading here
  const location = useLocation();

  console.log("ProtectedRoute Render - session:", !!session, "userProfile:", userProfile, "userRole:", userRole, "isLoading:", isLoading, "location:", location.pathname);

  // If session data is still loading, render nothing (or a loading spinner)
  if (isLoading) {
    console.log("ProtectedRoute: Session is still loading, rendering nothing.");
    return null;
  }

  // Se não há sessão, redirecionar para a página de login.
  if (!session) {
    console.log("ProtectedRoute: No session, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // Se uma empresa é necessária e o perfil do usuário não tem company_id
  if (requiresCompany && !userProfile?.company_id) {
    console.log("ProtectedRoute: No company_id, redirecting to /create-company");
    return <Navigate to="/create-company" replace />;
  }

  // Se papéis específicos são permitidos e o papel do usuário não está entre eles
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    console.log("ProtectedRoute: Access denied for role", userRole);
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

  // Se todas as verificações passarem, renderizar as rotas filhas
  console.log("ProtectedRoute: Access granted, rendering Outlet.");
  // Para testes, renderizamos children diretamente se fornecido. Em uso normal, Outlet é para rotas aninhadas.
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;