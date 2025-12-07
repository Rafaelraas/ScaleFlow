"use client";

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Settings, LayoutDashboard, Repeat, ListChecks, User, Building, Clock, Briefcase, UserCog } from "lucide-react"; // Added Briefcase and UserCog icons
import { useSession } from '@/hooks/useSession';

interface SidebarProps {
  isMobile?: boolean;
}

export const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const { userRole } = useSession();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["manager", "employee", "system_admin"],
    },
    {
      name: "Schedules",
      href: "/schedules",
      icon: CalendarDays,
      roles: ["manager", "system_admin"],
    },
    {
      name: "Shift Templates",
      href: "/shift-templates",
      icon: Clock,
      roles: ["manager", "system_admin"],
    },
    {
      name: "Employees",
      href: "/employees",
      icon: Users,
      roles: ["manager", "system_admin"],
    },
    {
      name: "Employee Preferences",
      href: "/employee-preferences",
      icon: ListChecks,
      roles: ["manager", "system_admin"],
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
      icon: Repeat,
      roles: ["employee", "manager", "system_admin"],
    },
    {
      name: "Profile Settings",
      href: "/profile-settings",
      icon: User,
      roles: ["manager", "employee", "system_admin"],
    },
    {
      name: "Company Settings",
      href: "/company-settings",
      icon: Building,
      roles: ["manager", "system_admin"],
    },
    {
      name: "Admin Companies", // New item for system admin
      href: "/admin/companies",
      icon: Briefcase, // Using Briefcase icon
      roles: ["system_admin"],
    },
    {
      name: "Admin Users", // New item for system admin
      href: "/admin/users",
      icon: UserCog, // Using UserCog icon
      roles: ["system_admin"],
    },
  ];

  const filteredNavItems = userRole
    ? navItems.filter((item) => item.roles.includes(userRole))
    : [];

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