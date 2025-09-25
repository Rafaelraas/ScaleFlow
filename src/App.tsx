import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Layout } from "./components/layout/Layout";
import { useSession } from "./providers/SessionContextProvider";
import { MadeWithDyad } from "./components/made-with-dyad";

const queryClient = new QueryClient();

const App = () => {
  const { session, isLoading } = useSession();

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
            <>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/dashboard" element={<Layout><Index /></Layout>} />
              <Route path="/schedules" element={<Layout><div>Schedules Page</div></Layout>} />
              <Route path="/employees" element={<Layout><div>Employees Page</div></Layout>} />
              <Route path="/my-schedule" element={<Layout><div>My Schedule Page</div></Layout>} />
              <Route path="/preferences" element={<Layout><div>Preferences Page</div></Layout>} />
              <Route path="/swap-requests" element={<Layout><div>Swap Requests Page</div></Layout>} />
            </>
          ) : (
            <Route path="/" element={<Login />} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;