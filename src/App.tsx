import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom"; // Removido BrowserRouter
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import { Layout } from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import Dashboard from "./pages/Dashboard"; // Import Dashboard
import Schedules from "./pages/Schedules"; // Import Schedules
import Employees from "./pages/Employees"; // Import Employees
import MySchedule from "./pages/MySchedule"; // Import MySchedule
import Preferences from "./pages/Preferences"; // Import Preferences
import SwapRequests from "./pages/SwapRequests"; // Import SwapRequests
import ProfileSettings from "./pages/ProfileSettings"; // Import ProfileSettings
import CompanySettings from "./pages/CompanySettings"; // Import CompanySettings
import ShiftTemplates from "./pages/ShiftTemplates"; // Import ShiftTemplates
import EmployeePreferences from "./pages/EmployeePreferences"; // Import EmployeePreferences
import CreateCompany from "./pages/CreateCompany"; // Import CreateCompany
import AdminCompanyManagement from "./pages/AdminCompanyManagement"; // Import AdminCompanyManagement
import AdminUserManagement from "./pages/AdminUserManagement"; // Import AdminUserManagement


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* BrowserRouter removido daqui, pois já está em main.tsx */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/" element={<Layout><Index /></Layout>} />
        <Route path="/create-company" element={<ProtectedRoute requiresCompany={false} allowedRoles={['manager', 'employee']} />}>
          <Route index element={<Layout><CreateCompany /></Layout>} />
        </Route>

        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/profile-settings" element={<Layout><ProfileSettings /></Layout>} />
          <Route path="/swap-requests" element={<Layout><SwapRequests /></Layout>} />
        </Route>

        {/* Rotas Protegidas para Gerentes */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route path="/schedules" element={<Layout><Schedules /></Layout>} />
          <Route path="/employees" element={<Layout><Employees /></Layout>} />
          <Route path="/company-settings" element={<Layout><CompanySettings /></Layout>} />
          <Route path="/shift-templates" element={<Layout><ShiftTemplates /></Layout>} />
          <Route path="/employee-preferences" element={<Layout><EmployeePreferences /></Layout>} />
        </Route>

        {/* Rotas Protegidas para Funcionários */}
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route path="/my-schedule" element={<Layout><MySchedule /></Layout>} />
          <Route path="/preferences" element={<Layout><Preferences /></Layout>} />
        </Route>

        {/* Rotas Protegidas para Administradores do Sistema */}
        <Route element={<ProtectedRoute allowedRoles={['system_admin']} requiresCompany={false} />}>
          <Route path="/admin/companies" element={<Layout><AdminCompanyManagement /></Layout>} />
          <Route path="/admin/users" element={<Layout><AdminUserManagement /></Layout>} />
        </Route>

        {/* Rota catch-all para 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;