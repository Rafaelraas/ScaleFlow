import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Layout } from "./components/layout/Layout";
import { SessionContextProvider } from "./contexts/SessionContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout><Index /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/dashboard" element={<Layout><Index /></Layout>} />
            <Route path="/schedules" element={<Layout><div>Schedules Page</div></Layout>} />
            <Route path="/employees" element={<Layout><div>Employees Page</div></Layout>} />
            <Route path="/my-schedule" element={<Layout><div>My Schedule Page</div></Layout>} />
            <Route path="/preferences" element={<Layout><div>Preferences Page</div></Layout>} />
            <Route path="/swap-requests" element={<Layout><div>Swap Requests Page</div></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;