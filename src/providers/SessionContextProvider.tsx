"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";
import { UserRole, isValidRole } from "@/types/roles";
import { getUnauthenticatedPaths, isAuthFlowRoute } from "@/config/routes";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  company_id: string | null;
  role_id: string;
  role_name: UserRole;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  userRole: UserRole | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = getUnauthenticatedPaths();

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfileAndRole = useCallback(async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second base delay

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, roles(name)')
        .eq('id', userId)
        .single();

      if (profileError) {
        // Check if this is a "not found" error which might be a race condition
        const isNotFoundError = profileError.code === 'PGRST116' || profileError.message?.includes('not found');
        
        if (isNotFoundError && retryCount < MAX_RETRIES) {
          // Profile might not be created yet by trigger - retry after delay
          console.log(`Profile not found, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return fetchUserProfileAndRole(userId, retryCount + 1);
        }
        
        console.error("Error fetching user profile:", profileError);
        showError("Failed to load user profile.");
        setUserProfile(null);
        setUserRole(null);
        return null;
      }

      if (profileData) {
        const rawRoleName = (profileData.roles as { name: string } | null)?.name || 'employee';
        const roleName: UserRole = isValidRole(rawRoleName) ? rawRoleName : 'employee';

        const profileWithRoleName: UserProfile = {
          id: profileData.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          avatar_url: profileData.avatar_url,
          company_id: profileData.company_id,
          role_id: profileData.role_id,
          role_name: roleName,
        };

        setUserProfile(profileWithRoleName);
        setUserRole(profileWithRoleName.role_name);
        return profileWithRoleName;
      }

      return null;
    } catch (error) {
      console.error("Unexpected error fetching user profile:", error);
      
      // Retry on unexpected errors too (network issues, etc.)
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying after error... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return fetchUserProfileAndRole(userId, retryCount + 1);
      }
      
      showError("Failed to load user profile.");
      setUserProfile(null);
      setUserRole(null);
      return null;
    }
  }, []);

  // Determine the appropriate redirect path based on session and profile
  const getRedirectPath = useCallback((
    currentSession: Session | null,
    profile: UserProfile | null,
    currentPath: string
  ): string | null => {
    const isPublicRoute = PUBLIC_ROUTES.includes(currentPath);
    const isAuthFlowPage = isAuthFlowRoute(currentPath);

    // No session - redirect to login if not on public route
    if (!currentSession) {
      return !isPublicRoute ? '/login' : null;
    }

    // Session exists but no profile - stay where we are (error will be shown)
    if (!profile) {
      return null;
    }

    // System admin without company - can access dashboard
    if (profile.role_name === 'system_admin' && !profile.company_id) {
      return (currentPath === '/create-company' || isAuthFlowPage) ? '/dashboard' : null;
    }

    // Non-admin without company - must create company
    if (!profile.company_id) {
      return currentPath !== '/create-company' ? '/create-company' : null;
    }

    // User has company - redirect to dashboard if on auth pages
    return (currentPath === '/create-company' || isAuthFlowPage) ? '/dashboard' : null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Demo mode - skip auth checks
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const handleSessionAndProfile = async (currentSession: Session | null, event?: string) => {
      if (!isMounted) return;

      setSession(currentSession);
      
      // Fetch profile if session exists
      let profile: UserProfile | null = null;
      if (currentSession?.user?.id) {
        profile = await fetchUserProfileAndRole(currentSession.user.id);
      } else {
        setUserProfile(null);
        setUserRole(null);
      }

      // Check for special auth flows that should not trigger redirects
      const urlParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const authFlowType = urlParams.get('type') || hashParams.get('type');
      
      if (isAuthFlowRoute(location.pathname) && 
          (authFlowType === 'recovery' || authFlowType === 'signup')) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      // Determine redirect path
      const redirectPath = getRedirectPath(currentSession, profile, location.pathname);
      
      if (redirectPath && redirectPath !== location.pathname) {
        navigate(redirectPath);
        
        // Show success messages for auth events
        if (event === 'SIGNED_IN') {
          showSuccess("Logged in successfully!");
        } else if (event === 'SIGNED_OUT') {
          showSuccess("Logged out successfully!");
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    // Initial session check
    supabase.auth.getSession()
      .then(async ({ data: { session: initialSession } }) => {
        await handleSessionAndProfile(initialSession);
      })
      .catch(error => {
        console.error("Error during initial getSession:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        await handleSessionAndProfile(currentSession, event);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, location.search, location.hash, fetchUserProfileAndRole, getRedirectPath]);
  // Note: location.search and location.hash are needed to detect auth flow types (recovery, signup)

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