"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, LogOut, UserCircle } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client.ts";
import { showError, showSuccess } from "@/utils/toast";
import { ModeToggle } from "@/components/ModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { session, userProfile, userRole } = useSession();
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (userProfile?.company_id) {
        const { data, error } = await supabase
          .from('companies')
          .select('name')
          .eq('id', userProfile.company_id)
          .single();

        if (error) {
          console.error("Error fetching company name:", error.message);
          setCompanyName(null);
        } else {
          setCompanyName(data?.name || null);
        }
      } else {
        setCompanyName(null);
      }
    };

    fetchCompanyName();
  }, [userProfile?.company_id]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Failed to log out: " + error.message);
    } else {
      // The SessionContextProvider will handle navigation and success toast
    }
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
          <ModeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 flex items-center justify-center space-x-2 px-4">
                  <UserCircle className="h-5 w-5" />
                  <span className="hidden md:inline-block">
                    {userProfile?.first_name || session.user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                    {userRole && (
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                      </p>
                    )}
                    {companyName && (
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        Company: {companyName}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile-settings">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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