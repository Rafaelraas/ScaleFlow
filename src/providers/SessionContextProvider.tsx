"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setSession(currentSession);
        if (location.pathname === '/login' || location.pathname === '/register') {
          navigate('/');
          showSuccess("Logged in successfully!");
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login');
          showSuccess("Logged out successfully!");
        }
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setIsLoading(false);
      if (!initialSession && location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      } else if (initialSession && (location.pathname === '/login' || location.pathname === '/register')) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionContextProvider");
  }
  return context;
};