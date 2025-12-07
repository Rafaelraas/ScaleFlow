'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

type ErrorCategory = 'network' | 'auth' | 'render' | 'unknown';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCategory: ErrorCategory;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCategory: 'unknown',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Categorize error
    const errorCategory = ErrorBoundary.categorizeError(error);

    return {
      hasError: true,
      error,
      errorCategory,
    };
  }

  static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed to fetch')
    ) {
      return 'network';
    }
    if (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('session')
    ) {
      return 'auth';
    }
    if (message.includes('render') || error.name === 'RenderError') {
      return 'render';
    }

    return 'unknown';
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development
    logger.error('Error boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      category: this.state.errorCategory,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, this could send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      errorInfo,
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCategory: 'unknown',
    });
  };

  renderErrorMessage(): { title: string; description: string; action: string } {
    const { errorCategory } = this.state;

    switch (errorCategory) {
      case 'network':
        return {
          title: 'Connection Problem',
          description: 'Unable to connect to the server. Please check your internet connection.',
          action: 'Retry',
        };
      case 'auth':
        return {
          title: 'Authentication Error',
          description: 'Your session may have expired. Please try logging in again.',
          action: 'Go to Login',
        };
      case 'render':
        return {
          title: 'Display Error',
          description: 'Something went wrong while displaying this page.',
          action: 'Go Home',
        };
      default:
        return {
          title: 'Unexpected Error',
          description: 'An unexpected error occurred. We have been notified and are working on it.',
          action: 'Reload Page',
        };
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title, description, action } = this.renderErrorMessage();
      const isDev = import.meta.env.DEV;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDev && this.state.error && (
                <div className="rounded-md bg-muted p-4 text-sm">
                  <p className="font-medium text-destructive mb-2">{this.state.error.toString()}</p>
                  {this.state.error.stack && (
                    <pre className="text-xs overflow-auto max-h-40 text-muted-foreground">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReload} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {action}
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
                {isDev && (
                  <Button onClick={this.handleReset} variant="ghost" className="w-full">
                    <Bug className="mr-2 h-4 w-4" />
                    Reset Error
                  </Button>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                If this problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
