# Developer Tools & Monitoring

This document describes the developer experience tools and monitoring capabilities available in ScaleFlow.

## Table of Contents

- [Feature Flags](#feature-flags)
- [Performance Monitoring](#performance-monitoring)
- [Vercel Analytics](#vercel-analytics)
- [Best Practices](#best-practices)

---

## Feature Flags

Feature flags enable controlled feature rollouts, A/B testing, and quick rollback without deployments.

### Overview

The feature flag system supports:

- **Role-based access**: Restrict features to specific user roles
- **Environment-based enabling**: Enable features only in specific environments
- **Rollout percentage**: Gradually roll out features to a percentage of users
- **Consistent user assignment**: Same user always gets the same rollout decision

### Available Flags

Current feature flags defined in the system:

| Flag Name             | Description                                     | Status                           |
| --------------------- | ----------------------------------------------- | -------------------------------- |
| `CALENDAR_VIEW`       | Interactive calendar view for schedules         | Disabled (Dev only)              |
| `DARK_MODE_AUTO`      | Automatic dark mode based on system preferences | Enabled                          |
| `NEW_DASHBOARD`       | New dashboard with improved analytics           | Disabled (10% rollout, Manager+) |
| `SHIFT_BIDDING`       | Allow employees to bid on available shifts      | Disabled (Dev only)              |
| `IN_APP_MESSAGING`    | Direct messaging between users                  | Disabled (Dev only)              |
| `ADVANCED_ANALYTICS`  | Advanced analytics dashboard                    | Disabled (Manager+)              |
| `IMPROVED_ONBOARDING` | Improved onboarding flow                        | Enabled (50% rollout)            |
| `AI_SCHEDULING`       | AI-powered shift scheduling suggestions         | Disabled (Dev only, Manager)     |

### Using Feature Flags

#### With the Hook

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

function Schedules() {
  const hasCalendarView = useFeatureFlag(FEATURE_FLAGS.CALENDAR_VIEW);

  return (
    <div>
      {hasCalendarView ? (
        <button onClick={toggleView}>Toggle View</button>
      ) : null}

      {hasCalendarView ? <CalendarView /> : <ListView />}
    </div>
  );
}
```

#### With the Component

```typescript
import { FeatureFlag } from '@/components/FeatureFlag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Render new dashboard if feature is enabled */}
      <FeatureFlag flag={FEATURE_FLAGS.NEW_DASHBOARD}>
        <NewDashboard />
      </FeatureFlag>

      {/* Render with fallback */}
      <FeatureFlag
        flag={FEATURE_FLAGS.CALENDAR_VIEW}
        fallback={<ListView />}
      >
        <CalendarView />
      </FeatureFlag>
    </div>
  );
}
```

### Adding New Flags

1. **Define the flag** in `src/lib/feature-flags.ts`:

```typescript
export const FEATURE_FLAGS = {
  // ... existing flags
  MY_NEW_FEATURE: 'my-new-feature',
} as const;
```

2. **Configure the flag**:

```typescript
const featureFlagConfig: FeatureFlagConfig = {
  // ... existing config
  [FEATURE_FLAGS.MY_NEW_FEATURE]: {
    enabled: false, // Start disabled
    description: 'Description of what this feature does',
    rolloutPercentage: 0, // 0-100, optional
    environments: ['development'], // Optional restriction
    roles: ['manager'], // Optional role restriction
  },
};
```

3. **Use the flag** in your components using the hook or component shown above.

### Admin Panel

System administrators can view all feature flags at `/admin/feature-flags`.

The admin panel shows:

- Flag name and status (enabled/disabled)
- Description of the feature
- Rollout percentage (if applicable)
- Environment restrictions (if any)
- Role restrictions (if any)

---

## Performance Monitoring

ScaleFlow tracks Core Web Vitals to monitor real-world performance.

### Metrics Tracked

The following metrics are tracked:

1. **CLS (Cumulative Layout Shift)**
   - Measures visual stability
   - Good: < 0.1
   - Needs improvement: 0.1-0.25
   - Poor: > 0.25

2. **INP (Interaction to Next Paint)**
   - Measures interactivity
   - Good: < 200ms
   - Needs improvement: 200-500ms
   - Poor: > 500ms

3. **FCP (First Contentful Paint)**
   - Measures loading performance
   - Good: < 1.8s
   - Needs improvement: 1.8-3.0s
   - Poor: > 3.0s

4. **LCP (Largest Contentful Paint)**
   - Measures loading performance
   - Good: < 2.5s
   - Needs improvement: 2.5-4.0s
   - Poor: > 4.0s

5. **TTFB (Time to First Byte)**
   - Measures server response time
   - Good: < 800ms
   - Needs improvement: 800-1800ms
   - Poor: > 1800ms

### Development Monitor

In development mode, a performance monitor is displayed in the bottom-right corner showing real-time metrics.

The monitor displays:

- Current values for all 5 metrics
- Color-coded ratings (green/yellow/red)
- Link to Core Web Vitals documentation

### Production Tracking

In production, metrics are:

- Logged via the centralized logger system
- Can be sent to analytics services (configure in `src/lib/web-vitals.ts`)
- Automatically tracked by Vercel Analytics

### Improving Performance

If you see poor metrics:

**For CLS (Layout Shift):**

- Set explicit dimensions for images and videos
- Reserve space for ads and embeds
- Avoid inserting content above existing content

**For INP (Interactivity):**

- Reduce JavaScript execution time
- Break up long tasks
- Optimize event handlers

**For FCP/LCP (Loading):**

- Optimize images (use WebP format)
- Lazy load images and components
- Remove unused CSS and JavaScript
- Use code splitting

**For TTFB (Server Response):**

- Optimize database queries
- Use caching
- Consider a CDN
- Optimize Supabase RLS policies

---

## Vercel Analytics

Vercel Analytics is integrated to track:

- Page views
- User sessions
- Custom events (when configured)

Analytics data is only sent in production builds.

### Viewing Analytics

If deployed on Vercel:

1. Go to your Vercel dashboard
2. Select the ScaleFlow project
3. Click on "Analytics" tab

---

## Best Practices

### Feature Flags

1. **Start small**: Begin with flags disabled and a small rollout percentage
2. **Use descriptive names**: Make flag purposes clear
3. **Clean up old flags**: Remove flags after full rollout
4. **Test both states**: Always test with flags both on and off
5. **Document flags**: Keep descriptions up to date

### Performance Monitoring

1. **Check regularly**: Monitor metrics after each deployment
2. **Set up alerts**: Configure alerts for poor metrics
3. **Test on real devices**: Use Chrome DevTools device emulation
4. **Monitor trends**: Look at performance over time, not single snapshots
5. **Prioritize LCP and INP**: These have the biggest user impact

### General Development

1. **Use the dev monitor**: Keep an eye on performance while developing
2. **Test feature flags**: Verify both enabled and disabled states
3. **Check bundle size**: Use `npm run build` and check the stats
4. **Lint before commit**: Pre-commit hooks will catch issues
5. **Write tests**: Add tests for new features

---

## Related Documentation

- [Feature Flags Guide](./FEATURE_FLAGS.md) - Detailed feature flag documentation
- [Development Guide](./DEVELOPMENT_GUIDE.md) - General development practices
- [Architecture](./ARCHITECTURE.md) - Application architecture overview

---

**Last Updated**: December 7, 2024  
**Version**: 1.0
