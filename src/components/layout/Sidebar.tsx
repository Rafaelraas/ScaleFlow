"use client";

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Settings, LayoutDashboard } from "lucide-react";

interface SidebarProps {
  isMobile?: boolean;
}

export const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["manager", "employee"],
    },
    {
      name: "Schedules",
      href: "/schedules",
      icon: CalendarDays,
      roles: ["manager"],
    },
    {
      name: "Employees",
      href: "/employees",
      icon: Users,
      roles: ["manager"],
    },
    {
      name: "My Schedule",
      href: "/my-schedule",
      icon: CalendarDays,
      roles: ["employee"],
    },
    {
      name: "Preferences",
      href: "/preferences",
      icon: Settings,
      roles: ["employee"],
    },
    {
      name: "Swap Requests",
      href: "/swap-requests",
      icon: Users, // Placeholder icon, can be changed later
      roles: ["employee"],
    },
  ];

  // For now, we'll show all links. Later, this will be filtered by user role.
  const filteredNavItems = navItems; // .filter(item => item.roles.includes(currentUserRole));

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r",
        isMobile ? "w-full" : "w-64",
      )}
    >
      {!isMobile && (
        <div className="flex items-center justify-center h-16 border-b">
          <Link to="/" className="text-xl font-bold text-sidebar-primary-foreground">
            ScaleFlow
          </Link>
        </div>
      )}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => (
          <Button
            key={item.name}
            asChild
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Link to={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
};