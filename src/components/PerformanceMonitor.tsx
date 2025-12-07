/**
 * Performance Monitor Component
 *
 * Displays real-time Web Vitals metrics in development mode.
 * Only visible when running in development environment.
 */

import { useEffect, useState } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      setMetrics((prev) => {
        // Update existing metric or add new one
        const existingIndex = prev.findIndex((m) => m.name === metric.name);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = metric;
          return updated;
        }
        return [...prev, metric];
      });
    };

    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, []);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-3 text-sm">Performance Metrics</h3>
      {metrics.length === 0 ? (
        <p className="text-xs text-muted-foreground">Collecting metrics...</p>
      ) : (
        <div className="space-y-2 text-xs">
          {metrics.map((metric, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="font-medium">{metric.name}:</span>
              <div className="flex items-center gap-2">
                <span className={getMetricColor(metric.rating)}>
                  {formatMetricValue(metric.name, metric.value)}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs ${getRatingBadgeColor(metric.rating)}`}
                >
                  {metric.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        <a
          href="https://web.dev/vitals/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Learn about Core Web Vitals →
        </a>
      </div>
    </div>
  );
}

/**
 * Get color class based on metric rating
 */
function getMetricColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'text-green-600 dark:text-green-400 font-semibold';
    case 'needs-improvement':
      return 'text-yellow-600 dark:text-yellow-400 font-semibold';
    case 'poor':
      return 'text-red-600 dark:text-red-400 font-semibold';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Get badge color based on rating
 */
function getRatingBadgeColor(rating: string): string {
  switch (rating) {
    case 'good':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'needs-improvement':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'poor':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

/**
 * Format metric value based on metric type
 */
function formatMetricValue(name: string, value: number): string {
  // CLS is a unitless score
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  // All other metrics are in milliseconds
  return `${Math.round(value)}ms`;
}
