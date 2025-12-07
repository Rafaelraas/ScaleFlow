# Feature Flags Guide

Complete guide to using and managing feature flags in ScaleFlow.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Rollout Strategies](#rollout-strategies)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

Feature flags (also known as feature toggles) allow you to:

- Roll out features gradually to users
- Test features in production with limited exposure
- Quickly disable problematic features without deployment
- Run A/B tests
- Provide role-specific features
- Maintain separate feature sets per environment

### Benefits

- **Risk mitigation**: Roll back features instantly without redeploying
- **Gradual rollout**: Release to 10% of users, then 50%, then 100%
- **A/B testing**: Compare feature variations
- **Role-based features**: Different features for different user types
- **Environment control**: Development-only features

---

## Architecture

### Core Components

1. **Feature Flag Definition** (`src/lib/feature-flags.ts`)
   - Central registry of all flags
   - Configuration for each flag

2. **Hook** (`src/hooks/useFeatureFlag.ts`)
   - React hook for checking flag state
   - Integrates with user session

3. **Component** (`src/components/FeatureFlag.tsx`)
   - Declarative way to conditionally render based on flags
   - Supports fallback content

4. **Admin Panel** (`src/pages/FeatureFlagAdmin.tsx`)
   - View all flags and their configuration
   - System admin access only

### How It Works

```
User Request → useFeatureFlag() → Check:
  1. Is flag enabled globally?
  2. Does environment match?
  3. Does user role match?
  4. Does user fall in rollout percentage?
→ Return true/false
```

---

## Usage Examples

### Example 1: Simple Toggle

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

function MyComponent() {
  const showNewFeature = useFeatureFlag(FEATURE_FLAGS.MY_NEW_FEATURE);

  return (
    <div>
      {showNewFeature && <NewFeature />}
    </div>
  );
}
```

### Example 2: With Fallback

```typescript
import { FeatureFlag } from '@/components/FeatureFlag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

function ScheduleView() {
  return (
    <FeatureFlag
      flag={FEATURE_FLAGS.CALENDAR_VIEW}
      fallback={<ListScheduleView />}
    >
      <CalendarScheduleView />
    </FeatureFlag>
  );
}
```

### Example 3: Multiple Checks

```typescript
function Dashboard() {
  const hasAdvancedAnalytics = useFeatureFlag(FEATURE_FLAGS.ADVANCED_ANALYTICS);
  const hasNewDashboard = useFeatureFlag(FEATURE_FLAGS.NEW_DASHBOARD);

  if (hasNewDashboard) {
    return <NewDashboard showAnalytics={hasAdvancedAnalytics} />;
  }

  return <OldDashboard />;
}
```

### Example 4: Feature-Specific UI Elements

```typescript
function Navigation() {
  const hasMessaging = useFeatureFlag(FEATURE_FLAGS.IN_APP_MESSAGING);

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/schedules">Schedules</Link>
      {hasMessaging && <Link to="/messages">Messages</Link>}
    </nav>
  );
}
```

---

## Configuration

### Flag Definition

Each flag has these properties:

```typescript
{
  enabled: boolean,              // Master on/off switch
  description: string,           // What the feature does
  rolloutPercentage?: number,    // 0-100, optional
  environments?: string[],       // ['development', 'production', 'test']
  roles?: string[],             // ['employee', 'manager', 'system_admin']
}
```

### Configuration Examples

#### Development-Only Feature

```typescript
[FEATURE_FLAGS.EXPERIMENTAL_FEATURE]: {
  enabled: true,
  description: 'Experimental feature in development',
  environments: ['development'],
}
```

#### Gradual Rollout

```typescript
[FEATURE_FLAGS.NEW_FEATURE]: {
  enabled: true,
  description: 'New feature rolling out gradually',
  rolloutPercentage: 25, // 25% of users
}
```

#### Role-Restricted Feature

```typescript
[FEATURE_FLAGS.ADMIN_FEATURE]: {
  enabled: true,
  description: 'Feature for managers only',
  roles: ['manager', 'system_admin'],
}
```

#### Combined Restrictions

```typescript
[FEATURE_FLAGS.BETA_FEATURE]: {
  enabled: true,
  description: 'Beta feature for managers in development',
  environments: ['development'],
  roles: ['manager'],
  rolloutPercentage: 50,
}
```

---

## Rollout Strategies

### Strategy 1: Dark Launch

Test in production without user exposure:

```typescript
{
  enabled: true,
  rolloutPercentage: 0, // No users see it yet
  // Monitor logs, check for errors
}
```

### Strategy 2: Gradual Rollout

Incrementally increase exposure:

```typescript
// Week 1: 10%
rolloutPercentage: 10;

// Week 2: 25%
rolloutPercentage: 25;

// Week 3: 50%
rolloutPercentage: 50;

// Week 4: 100%
rolloutPercentage: 100;
// Then remove the flag entirely
```

### Strategy 3: Role-Based Rollout

Start with power users:

```typescript
// Phase 1: Managers only
{
  enabled: true,
  roles: ['manager'],
}

// Phase 2: All users
{
  enabled: true,
  // No role restriction
}
```

### Strategy 4: Environment Progression

Test in each environment:

```typescript
// Week 1: Development
environments: ['development']

// Week 2: Production with limited rollout
environments: ['development', 'production'],
rolloutPercentage: 10

// Week 3: Full production
environments: ['development', 'production'],
// Remove percentage
```

---

## Testing

### Testing Flags in Development

1. **Enable the flag** in `feature-flags.ts`:

   ```typescript
   enabled: true,
   environments: ['development'],
   ```

2. **Test both states**:
   - With flag enabled: Test new feature works
   - With flag disabled: Test fallback/old feature works

3. **Test different roles**:
   - Log in as different user types
   - Verify role restrictions work

### Automated Testing

```typescript
// Mock the hook
vi.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: vi.fn(),
}));

describe('MyComponent', () => {
  it('shows new feature when flag enabled', () => {
    mockUseFeatureFlag.mockReturnValue(true);
    render(<MyComponent />);
    expect(screen.getByText('New Feature')).toBeInTheDocument();
  });

  it('shows old feature when flag disabled', () => {
    mockUseFeatureFlag.mockReturnValue(false);
    render(<MyComponent />);
    expect(screen.getByText('Old Feature')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Flag Not Working

**Problem**: Feature not showing even though flag is enabled.

**Checks**:

1. Is the flag enabled globally? (`enabled: true`)
2. Does current environment match? (`environments` includes current env)
3. Does user role match? (`roles` includes user's role)
4. Does user fall in rollout percentage? (try with `rolloutPercentage: 100`)

**Solution**: Check each condition in `isFeatureEnabled()` function.

### Inconsistent Behavior

**Problem**: Feature appears for user sometimes but not always.

**Cause**: Rollout percentage creates consistent but distributed access.

**Solution**:

- For testing: Set `rolloutPercentage: 100`
- For specific user: Check if their user ID hash falls in percentage range

### Flag Not Showing in Admin Panel

**Problem**: New flag doesn't appear in admin panel.

**Cause**: Flag not added to configuration object.

**Solution**: Ensure flag is in `featureFlagConfig` in `feature-flags.ts`.

---

## Best Practices

### Naming Conventions

- Use `SCREAMING_SNAKE_CASE` for flag names
- Be descriptive: `NEW_DASHBOARD` not `FEAT1`
- Include scope: `EMPLOYEE_SHIFT_BIDDING` vs `SHIFT_BIDDING`

### Flag Lifecycle

1. **Creation**: Add flag, start disabled
2. **Development**: Enable in dev only
3. **Testing**: Enable with small rollout percentage
4. **Rollout**: Gradually increase percentage
5. **Completion**: Enable for 100%
6. **Cleanup**: Remove flag, make feature permanent

### When to Use Flags

**Good use cases**:

- Major new features
- Risky changes
- A/B tests
- Role-specific features
- Beta features

**Don't use for**:

- Bug fixes (just fix and deploy)
- Minor UI tweaks
- Configuration changes
- Database migrations

### Documentation

Always document:

- What the flag controls
- Why it exists
- When it was created
- Rollout plan
- Expected removal date

### Cleanup

Remove flags when:

- Feature is rolled out to 100%
- Feature is stable for 2+ weeks
- No need to roll back

Steps to remove:

1. Remove flag check from code
2. Remove flag configuration
3. Remove from `FEATURE_FLAGS` constant
4. Update tests
5. Update documentation

---

## Example Workflow

### Adding a New Feature with Flags

1. **Define the flag**:

```typescript
// src/lib/feature-flags.ts
export const FEATURE_FLAGS = {
  // ... existing
  SHIFT_TEMPLATES: 'shift-templates',
};
```

2. **Configure the flag**:

```typescript
[FEATURE_FLAGS.SHIFT_TEMPLATES]: {
  enabled: true,
  description: 'Reusable shift templates for managers',
  environments: ['development'],
  roles: ['manager'],
},
```

3. **Implement the feature**:

```typescript
// src/pages/Schedules.tsx
import { FeatureFlag } from '@/components/FeatureFlag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

function Schedules() {
  return (
    <div>
      <h1>Schedules</h1>

      <FeatureFlag flag={FEATURE_FLAGS.SHIFT_TEMPLATES}>
        <ShiftTemplatesButton />
      </FeatureFlag>

      {/* rest of component */}
    </div>
  );
}
```

4. **Test in development**:
   - Verify feature appears for managers
   - Verify feature hidden for employees
   - Test feature functionality

5. **Roll out gradually**:

```typescript
// Update configuration
environments: ['development', 'production'],
rolloutPercentage: 10, // Start with 10%
```

6. **Monitor and increase**:
   - Watch for errors
   - Increase to 25%, 50%, 100%

7. **Clean up**:
   - Remove flag after stable
   - Make feature permanent

---

## Related Documentation

- [Developer Tools](./DEVELOPER_TOOLS.md) - General developer tools guide
- [Architecture](./ARCHITECTURE.md) - Application architecture

---

**Last Updated**: December 7, 2024  
**Version**: 1.0
