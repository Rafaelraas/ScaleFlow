'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Users,
  Settings,
  LayoutDashboard,
  Repeat,
  ListChecks,
  User,
  Building,
  Clock,
  Briefcase,
  UserCog,
  Flag,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { UserRole } from '@/types/roles';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  section?: string;
}

interface SidebarProps {
  isMobile?: boolean;
}

export const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const { userRole } = useSession();

  // Organized navigation items by section
  const navItems: NavItem[] = [
    // General
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['manager', 'employee', 'system_admin', 'operator', 'schedule_manager', 'staff'],
      section: 'General',
    },

    // Schedule Management
    {
      name: 'Schedules',
      href: '/schedules',
      icon: CalendarDays,
      roles: ['manager', 'schedule_manager'],
      section: 'Schedule Management',
    },
    {
      name: 'Shift Templates',
      href: '/shift-templates',
      icon: Clock,
      roles: ['manager', 'schedule_manager'],
      section: 'Schedule Management',
    },
    {
      name: 'Employee Preferences',
      href: '/employee-preferences',
      icon: ListChecks,
      roles: ['manager', 'schedule_manager'],
      section: 'Schedule Management',
    },

    // Employee Management
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['manager', 'schedule_manager', 'operator'],
      section: 'Team',
    },

    // Personal
    {
      name: 'My Schedule',
      href: '/my-schedule',
      icon: CalendarDays,
      roles: ['employee', 'staff', 'operator'],
      section: 'Personal',
    },
    {
      name: 'Preferences',
      href: '/preferences',
      icon: Settings,
      roles: ['employee', 'staff'],
      section: 'Personal',
    },
    {
      name: 'Swap Requests',
      href: '/swap-requests',
      icon: Repeat,
      roles: ['employee', 'manager', 'system_admin', 'operator', 'schedule_manager', 'staff'],
      section: 'Personal',
    },
    {
      name: 'Profile Settings',
      href: '/profile-settings',
      icon: User,
      roles: ['manager', 'employee', 'system_admin', 'operator', 'schedule_manager', 'staff'],
      section: 'Personal',
    },

    // Company
    {
      name: 'Company Settings',
      href: '/company-settings',
      icon: Building,
      roles: ['manager'],
      section: 'Company',
    },

    // System Admin
    {
      name: 'Admin Companies',
      href: '/admin/companies',
      icon: Briefcase,
      roles: ['system_admin'],
      section: 'System Admin',
    },
    {
      name: 'Admin Users',
      href: '/admin/users',
      icon: UserCog,
      roles: ['system_admin'],
      section: 'System Admin',
    },
    {
      name: 'Feature Flags',
      href: '/admin/feature-flags',
      icon: Flag,
      roles: ['system_admin'],
      section: 'System Admin',
    },
  ];

  const filteredNavItems = userRole ? navItems.filter((item) => item.roles.includes(userRole)) : [];

  // Don't render sidebar if there are no navigation items
  if (filteredNavItems.length === 0) {
    return null;
  }

  // Group items by section
  const groupedItems = filteredNavItems.reduce(
    (acc, item) => {
      const section = item.section || 'Other';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(item);
      return acc;
    },
    {} as Record<string, NavItem[]>
  );

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-sidebar text-sidebar-foreground border-r',
        isMobile ? 'w-full' : 'w-64'
      )}
    >
      {!isMobile && (
        <div className="flex items-center justify-center h-16 border-b">
          <Link to="/" className="text-xl font-bold text-sidebar-primary-foreground">
            ScaleFlow
          </Link>
        </div>
      )}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section}>
            <h3 className="mb-2 px-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              {section}
            </h3>
            <div className="space-y-1">
              {items.map((item) => (
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
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};
