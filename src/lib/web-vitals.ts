/**
 * Web Vitals Performance Monitoring
 *
 * Tracks Core Web Vitals metrics for performance monitoring.
 * Sends metrics to logging system in development and analytics in production.
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { logger } from '@/utils/logger';

/**
 * Send metric to analytics service
 *
 * In development: Logs to console
 * In production: Can be configured to send to analytics service
 */
function sendToAnalytics(metric: Metric) {
  // Log to console in development
  logger.info('Web Vitals', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
  });

  // In production, send to analytics service
  if (import.meta.env.PROD) {
    // Example: Send to Google Analytics
    // if (window.gtag) {
    //   window.gtag('event', metric.name, {
    //     value: Math.round(metric.value),
    //     metric_rating: metric.rating,
    //     metric_delta: metric.delta,
    //   });
    // }
    // Example: Send to custom analytics endpoint
    // try {
    //   fetch('/api/analytics/web-vitals', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(metric),
    //   });
    // } catch (error) {
    //   logger.error('Failed to send web vitals metric', { error, metric });
    // }
  }
}

/**
 * Initialize Web Vitals tracking
 *
 * Tracks the following Core Web Vitals:
 * - CLS (Cumulative Layout Shift): Visual stability
 * - INP (Interaction to Next Paint): Interactivity (replaces FID in web-vitals v5)
 * - FCP (First Contentful Paint): Loading performance
 * - LCP (Largest Contentful Paint): Loading performance
 * - TTFB (Time to First Byte): Server response time
 */
export function initWebVitals() {
  // Cumulative Layout Shift - measures visual stability
  onCLS(sendToAnalytics);

  // Interaction to Next Paint - measures interactivity (replaces FID)
  onINP(sendToAnalytics);

  // First Contentful Paint - measures loading
  onFCP(sendToAnalytics);

  // Largest Contentful Paint - measures loading
  onLCP(sendToAnalytics);

  // Time to First Byte - measures server response time
  onTTFB(sendToAnalytics);
}
