import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Layout } from "./components/layout/Layout"; // Import the new Layout component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout><Index /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/dashboard" element={<Layout><Index /></Layout>} /> {/* Placeholder for dashboard */}
          <Route path="/schedules" element={<Layout><div>Schedules Page</div></Layout>} /> {/* Placeholder */}
          <Route path="/employees" element={<Layout><div>Employees Page</div></Layout>} /> {/* Placeholder */}
          <Route path="/my-schedule" element={<Layout><div>My Schedule Page</div></Layout>} /> {/* Placeholder */}
          <Route path="/preferences" element={<Layout><div>Preferences Page</div></Layout>} /> {/* Placeholder */}
          <Route path="/swap-requests" element={<Layout><div>Swap Requests Page</div></Layout>} /> {/* Placeholder */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;