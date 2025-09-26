"use client";

import React, { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";

const Login = () => {
  const location = useLocation();
  const [initialView, setInitialView] = React.useState<'sign_in' | 'update_password'>('sign_in');
  const [authRedirectTo, setAuthRedirectTo] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    
    const authFlowType = urlParams.get('type') || hashParams.get('type');
    let newRedirectTo: string;

    if (authFlowType === 'recovery') {
      setInitialView('update_password');
      // Para recuperação, redirecionar para a URL completa atual para garantir que o Auth UI processe os tokens
      newRedirectTo = window.location.href;
    } else {
      setInitialView('sign_in');
      // Para outros fluxos, redirecionar para a origem
      newRedirectTo = window.location.origin;
    }
    setAuthRedirectTo(newRedirectTo);
    console.log("[Login.tsx Debug] authRedirectTo set to:", newRedirectTo);

  }, [location.search, location.hash]);

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
            view={initialView}
            redirectTo={authRedirectTo} // Usar a URL de redirecionamento determinada dinamicamente
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