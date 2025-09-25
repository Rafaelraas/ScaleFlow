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
import Dashboard from "./pages/Dashboard";
import Schedules from "./pages/Schedules";
import Employees from "./pages/Employees";
import EmployeePreferences from "./pages/EmployeePreferences";
import MySchedule from "./pages/MySchedule";
import Preferences from "./pages/Preferences";
import SwapRequests from "./pages/SwapRequests"; // Import new page
import ProfileSettings from "./pages/ProfileSettings";
import CompanySettings from "./pages/CompanySettings";
import { Layout } from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import { MadeWithDyad } from "./components/made-with-dyad";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-company" element={<CreateCompany />} />
          <Route path="/index" element={<Layout><Index /></Layout>} /> {/* Keep Index accessible directly */}

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Default authenticated route */}
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/profile-settings" element={<Layout><ProfileSettings /></Layout>} />
            <Route path="/swap-requests" element={<Layout><SwapRequests /></Layout>} /> {/* New route */}
          </Route>

          {/* Manager-specific routes */}
          <Route element={<ProtectedRoute allowedRoles={['manager', 'system_admin']} />}>
            <Route path="/schedules" element={<Layout><Schedules /></Layout>} />
            <Route path="/employees" element={<Layout><Employees /></Layout>} />
            <Route path="/employee-preferences" element={<Layout><EmployeePreferences /></Layout>} />
            <Route path="/company-settings" element={<Layout><CompanySettings /></Layout>} />
          </Route>

          {/* Employee-specific routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'manager', 'system_admin']} />}> {/* Managers can also view their own schedule/preferences */}
            <Route path="/my-schedule" element={<Layout><MySchedule /></Layout>} />
            <Route path="/preferences" element={<Layout><Preferences /></Layout>} />
          </Route>

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;