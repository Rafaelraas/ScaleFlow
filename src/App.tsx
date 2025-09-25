import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateCompany from "./pages/CreateCompany";
import Dashboard from "./pages/Dashboard"; // Import Dashboard
import Schedules from "./pages/Schedules"; // Import Schedules
import Employees from "./pages/Employees"; // Import Employees
import MySchedule from "./pages/MySchedule"; // Import MySchedule
import Preferences from "./pages/Preferences"; // Import Preferences
import SwapRequests from "./pages/SwapRequests"; // Import SwapRequests
import { Layout } from "./components/layout/Layout";
import { useSession } from "./providers/SessionContextProvider";
import { MadeWithDyad } from "./components/made-with-dyad";

const queryClient = new QueryClient();

const App = () => {
  const { session, isLoading, userProfile } = useSession();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading application...</p>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {session ? (
            userProfile && userProfile.company_id === null ? (
              // If authenticated but no company, redirect to create company page
              <Route path="*" element={<CreateCompany />} />
            ) : (
              // If authenticated and has a company, show main app routes
              <>
                <Route path="/" element={<Layout><Index /></Layout>} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/schedules" element={<Layout><Schedules /></Layout>} />
                <Route path="/employees" element={<Layout><Employees /></Layout>} />
                <Route path="/my-schedule" element={<Layout><MySchedule /></Layout>} />
                <Route path="/preferences" element={<Layout><Preferences /></Layout>} />
                <Route path="/swap-requests" element={<Layout><SwapRequests /></Layout>} />
              </>
            )
          ) : (
            // If not authenticated, redirect to login for any protected route
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;