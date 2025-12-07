/**
 * Centralized logging utility for ScaleFlow
 *
 * In development: logs to console
 * In production: can be configured to send to monitoring service
 */

import { config } from '@/config/env';

type LogValue = string | number | boolean | null | undefined;

interface LogContext {
  [key: string]: LogValue | LogValue[] | { [key: string]: LogValue };
}

class Logger {
  private isDevelopment = config.app.isDev;
  private isTest = config.app.isTest;

  /**
   * Log error messages
   * In production, these should be sent to error tracking service
   *
   * NOTE: Errors are intentionally not logged to console in production.
   * Uncomment one of the integration options below to enable production error tracking.
   */
  error(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, context || '');
    } else if (!this.isTest) {
      // Production error tracking integration examples (uncomment one):
      // Option 1: Sentry
      // import * as Sentry from '@sentry/react';
      // Sentry.captureException(new Error(message), {
      //   extra: context,
      //   level: 'error'
      // });
      // Option 2: LogRocket
      // import LogRocket from 'logrocket';
      // LogRocket.captureException(new Error(message), {
      //   tags: context
      // });
      // Option 3: Datadog
      // import { datadogLogs } from '@datadog/browser-logs';
      // datadogLogs.logger.error(message, context);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    // Warnings typically don't need to be sent to monitoring in production
  }

  /**
   * Log info messages
   * Useful for debugging flows in development
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }
}

export const logger = new Logger();
