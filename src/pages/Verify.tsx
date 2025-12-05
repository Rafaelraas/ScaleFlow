"use client";

import React, { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";

const Verify = () => {
  const location = useLocation();
  const [initialView, setInitialView] = React.useState<'sign_in' | 'update_password' | 'forgotten_password' | 'magic_link' | 'verify_otp'>('sign_in');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    
    const authFlowType = urlParams.get('type') || hashParams.get('type');

    // Determine the initial view based on the URL parameters
    if (authFlowType === 'recovery') {
      setInitialView('update_password');
    } else if (authFlowType === 'signup') {
      // This might be for email confirmation after signup
      setInitialView('verify_otp'); // Or 'sign_in' if email confirmation is handled differently
    } else {
      // Default to sign_in if no specific auth flow type is detected
      setInitialView('sign_in');
    }
  }, [location.search, location.hash]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete your action</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light"
            view={initialView}
            redirectTo={`${window.location.origin}${window.location.pathname}#/login`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;