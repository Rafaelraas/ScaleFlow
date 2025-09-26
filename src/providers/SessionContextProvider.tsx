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
    console.log("Fetching user profile for userId:", userId);
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
      return null; // Return null on error
    } else if (profileData) {
      const profileWithRoleName: UserProfile = {
        ...profileData,
        role_name: (profileData.roles as { name: string }).name,
      };
      console.log("User profile fetched:", profileWithRoleName);
      setUserProfile(profileWithRoleName);
      setUserRole(profileWithRoleName.role_name);
      return profileWithRoleName; // Return the fetched profile
    }
    return null;
  };

  useEffect(() => {
    console.log("SessionContextProvider useEffect triggered.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change event:", event, "Session:", currentSession);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setSession(currentSession);
        if (currentSession?.user?.id) {
          const profile = await fetchUserProfileAndRole(currentSession.user.id);
          // Redirect from login/register to dashboard after successful auth
          if (profile && (location.pathname === '/login' || location.pathname === '/register')) {
            navigate('/dashboard');
            showSuccess("Logged in successfully!");
          } else if (profile && !profile.company_id && location.pathname !== '/create-company') {
            // If user has no company and is not on create-company page, redirect
            navigate('/create-company');
          } else if (profile && profile.company_id && (location.pathname === '/create-company' || location.pathname === '/login' || location.pathname === '/register')) {
            // If user has a company and is on an auth/create-company page, redirect to dashboard
            navigate('/dashboard');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserProfile(null);
        setUserRole(null);
        // Redirect to login if signed out and not already on login/register
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login');
          showSuccess("Logged out successfully!");
        }
      }
      setIsLoading(false);
      console.log("Auth state change processed. isLoading set to false.");
    });

    // Initial session check on component mount
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log("Initial getSession result:", initialSession);
      setSession(initialSession);
      if (initialSession?.user?.id) {
        const profile = await fetchUserProfileAndRole(initialSession.user.id);
        if (profile && !profile.company_id && location.pathname !== '/create-company') {
          navigate('/create-company');
        } else if (profile && profile.company_id && (location.pathname === '/create-company' || location.pathname === '/login' || location.pathname === '/register')) {
          navigate('/dashboard');
        }
      }
      setIsLoading(false);
      console.log("Initial session check completed. isLoading set to false.");
      
      // Only redirect to login if no session and not already on an auth page
      if (!initialSession && location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  console.log("SessionContext Render - isLoading:", isLoading, "session:", !!session, "userProfile:", !!userProfile, "userRole:", userRole);

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