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
      return null;
    } else if (profileData) {
      const profileWithRoleName: UserProfile = {
        ...profileData,
        role_name: (profileData.roles as { name: string }).name,
      };
      console.log("User profile fetched:", profileWithRoleName);
      setUserProfile(profileWithRoleName);
      setUserRole(profileWithRoleName.role_name);
      return profileWithRoleName;
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const handleSessionAndProfile = async (currentSession: Session | null, event?: string) => {
      if (!isMounted) return;

      setSession(currentSession);
      let profile: UserProfile | null = null;

      if (currentSession?.user?.id) {
        profile = await fetchUserProfileAndRole(currentSession.user.id);
      } else {
        setUserProfile(null);
        setUserRole(null);
      }

      // --- Redirection Logic ---
      let shouldRedirect = false;
      let redirectToPath = '';

      // Check if we are in an auth flow that requires staying on the current page
      // Check both query parameters (location.search) and hash parameters (location.hash)
      const urlParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove '#'
      
      const authFlowType = urlParams.get('type') || hashParams.get('type');
      const isAuthFlowPage = location.pathname === '/login' || location.pathname === '/register';

      if (isAuthFlowPage && (authFlowType === 'recovery' || authFlowType === 'signup')) {
        // If we are on an auth page and in a recovery/signup flow, DO NOT redirect away.
        // The user needs to complete the action on this page.
        console.log(`SessionContextProvider: Staying on auth page for type=${authFlowType}.`);
        if (isMounted) {
          setIsLoading(false); // Ensure loading state is cleared
        }
        return; // Exit early, prevent further redirection logic
      }

      // Original redirection logic (only if not in a special auth flow)
      if (!currentSession) {
        // No session: redirect to login/register if not already there
        if (!isAuthFlowPage) { // Already checked above, but good for clarity
          shouldRedirect = true;
          redirectToPath = '/login';
        }
      } else if (profile) {
        // Session exists and profile loaded
        if (!profile.company_id) {
          // User has no company: redirect to create-company if not already there
          if (location.pathname !== '/create-company') {
            shouldRedirect = true;
            redirectToPath = '/create-company';
          }
        } else {
          // User has a company: redirect to dashboard if on auth/create-company pages
          if (location.pathname === '/create-company' || isAuthFlowPage) {
            shouldRedirect = true;
            redirectToPath = '/dashboard';
          }
        }
      }
      // If session exists but profile is null (e.g., RLS error or new user without profile yet)
      // The `fetchUserProfileAndRole` already handles error and sets profile/role to null.
      // The `ProtectedRoute` will then handle access denial based on missing profile/role.

      if (shouldRedirect && redirectToPath !== location.pathname) {
        navigate(redirectToPath);
        if (event === 'SIGNED_IN') {
          showSuccess("Logged in successfully!");
        } else if (event === 'SIGNED_OUT') {
          showSuccess("Logged out successfully!");
        }
      }

      if (isMounted) {
        setIsLoading(false); // Ensure isLoading is set to false after all checks
      }
    };

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log("Initial getSession result:", initialSession);
      await handleSessionAndProfile(initialSession);
    }).catch(error => {
      console.error("Error during initial getSession:", error);
      if (isMounted) {
        setIsLoading(false); // Ensure loading state is cleared even on error
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change event:", event, "Session:", currentSession);
      await handleSessionAndProfile(currentSession, event);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, location.search, location.hash]); // Added location.hash to dependencies

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