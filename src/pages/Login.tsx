"use client";

import React from "react"; // Removed useEffect
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom"; // useLocation is still useful for debugging if needed, but not for setting initialView

const Login = () => {
  // Removed initialView state and useEffect
  // const location = useLocation();
  // const [initialView, setInitialView] = React.useState<'sign_in' | 'update_password'>('sign_in');

  // useEffect(() => {
  //   const urlParams = new URLSearchParams(location.search);
  //   const hashParams = new URLSearchParams(location.hash.substring(1));
    
  //   const authFlowType = urlParams.get('type') || hashParams.get('type');

  //   if (authFlowType === 'recovery') {
  //     setInitialView('update_password');
  //   } else {
  //     setInitialView('sign_in');
  //   }
  // }, [location.search, location.hash]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to ScaleFlow</CardTitle>
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
            // Removed view prop, let Auth UI infer it from URL
            // view={initialView} 
            redirectTo={window.location.origin} // Keep redirectTo
          />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;