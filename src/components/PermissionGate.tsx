/**
 * PermissionGate Component
 *
 * Conditionally renders children based on user permissions.
 * Useful for showing/hiding UI elements based on role capabilities.
 */

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PermissionGateProps {
  children: React.ReactNode;

  // Simple role-based check
  allowedRoles?: UserRole[];

  // Permission-based checks
  requireManageCompany?: boolean;
  requireManageSchedules?: boolean;
  requireManageEmployees?: boolean;
  requireViewEmployees?: boolean;
  requireApproveSwaps?: boolean;
  requireApprovePreferences?: boolean;
  requireViewReports?: boolean;
  requireAccessAdmin?: boolean;

  // Fallback content when permission denied
  fallback?: React.ReactNode;

  // Show tooltip with reason when access denied
  showTooltip?: boolean;
  tooltipMessage?: string;

  // Disable instead of hiding
  disableInstead?: boolean;
}

/**
 * Conditionally render children based on permissions
 */
export function PermissionGate({
  children,
  allowedRoles,
  requireManageCompany,
  requireManageSchedules,
  requireManageEmployees,
  requireViewEmployees,
  requireApproveSwaps,
  requireApprovePreferences,
  requireViewReports,
  requireAccessAdmin,
  fallback = null,
  showTooltip = false,
  tooltipMessage,
  disableInstead = false,
}: PermissionGateProps) {
  const permissions = usePermissions();

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!permissions.userRole || !allowedRoles.includes(permissions.userRole)) {
      return renderDenied();
    }
  }

  // Check permission-based access
  const permissionChecks = [
    { required: requireManageCompany, has: permissions.canManageCompany },
    { required: requireManageSchedules, has: permissions.canManageSchedules },
    { required: requireManageEmployees, has: permissions.canManageEmployees },
    { required: requireViewEmployees, has: permissions.canViewEmployees },
    { required: requireApproveSwaps, has: permissions.canApproveSwaps },
    { required: requireApprovePreferences, has: permissions.canApprovePreferences },
    { required: requireViewReports, has: permissions.canViewReports },
    { required: requireAccessAdmin, has: permissions.canAccessAdmin },
  ];

  for (const check of permissionChecks) {
    if (check.required && !check.has) {
      return renderDenied();
    }
  }

  // All checks passed
  return <>{children}</>;

  function renderDenied() {
    if (disableInstead) {
      const disabledChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement,
            {
              disabled: true,
              'aria-disabled': true,
            } as React.HTMLAttributes<HTMLElement>
          );
        }
        return child;
      });

      if (showTooltip) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>{disabledChildren}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltipMessage || 'You do not have permission to perform this action'}</p>
            </TooltipContent>
          </Tooltip>
        );
      }

      return <>{disabledChildren}</>;
    }

    if (showTooltip && fallback) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{fallback}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage || 'You do not have permission to view this content'}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return <>{fallback}</>;
  }
}

/**
 * Higher-order component version of PermissionGate
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  permissions: Omit<PermissionGateProps, 'children'>
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGate {...permissions}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

/**
 * Simple role-based gate
 */
interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  return (
    <PermissionGate allowedRoles={allowedRoles} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
