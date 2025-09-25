"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  company_id: string | null; // Ensure company_id is part of the profile
  role_id: string;
  role_name: string;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  userRole: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfileAndRole = async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      showError("Failed to load user profile.");
      setUserProfile(null);
      setUserRole(null);
    } else if (profileData) {
      const profileWithRoleName: UserProfile = {
        ...profileData,
        role_name: (profileData.roles as { name: string }).name,
      };
      setUserProfile(profileWithRoleName);
      setUserRole(profileWithRoleName.role_name);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setSession(currentSession);
        if (currentSession?.user?.id) {
          await fetchUserProfileAndRole(currentSession.user.id);
        }
        if (location.pathname === '/login' || location.pathname === '/register') {
          navigate('/');
          showSuccess("Logged in successfully!");
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserProfile(null);
        setUserRole(null);
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login');
          showSuccess("Logged out successfully!");
        }
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user?.id) {
        await fetchUserProfileAndRole(initialSession.user.id);
      }
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
    <SessionContext.Provider value={{ session, isLoading, userProfile, userRole }}>
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