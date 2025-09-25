"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const { session } = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center">
          <Link to="/" className="text-lg font-bold mr-6">
            ScaleFlow
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {session ? (
            <Button asChild variant="ghost" onClick={handleLogout}>
              <Link to="#">Logout</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0">
                <Sidebar isMobile={true} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};