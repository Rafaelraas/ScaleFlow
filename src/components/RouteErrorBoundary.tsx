import ErrorBoundary from './ErrorBoundary';
import { ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
}

/**
 * RouteErrorBoundary - Specialized error boundary for routes
 *
 * Wraps individual routes to provide route-specific error handling
 * and logging with route context.
 */
export function RouteErrorBoundary({ children, routeName }: RouteErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log route-specific error with context
    logger.error(`Error in route: ${routeName}`, {
      route: routeName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  };

  return <ErrorBoundary onError={handleError}>{children}</ErrorBoundary>;
}
