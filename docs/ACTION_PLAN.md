# ScaleFlow - Immediate Action Plan

**Created:** January 23, 2026  
**Priority:** HIGH  
**Target Completion:** February 20, 2026 (4 weeks)

---

## 🚨 CRITICAL: Week 1-2 (Security & Stability)

### Day 1-2: Dependency Security Updates

**Owner:** [@assign-developer]  
**Priority:** CRITICAL 🔴  
**Estimated Time:** 4-6 hours

#### Tasks

```bash
# 1. Update vulnerable packages
npm install react-router-dom@latest
npm install lodash@latest lodash-es@latest
npm install vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest

# 2. Verify no regressions
npm run lint
npm run test
npm run build

# 3. Update security baseline
npm audit > security-audit-new.txt
git add security-audit-new.txt
git commit -m "chore: update dependencies to fix security vulnerabilities"
```

#### Acceptance Criteria

- [ ] `npm audit` shows 0 high/critical vulnerabilities
- [ ] All 362 tests pass
- [ ] Build completes without errors
- [ ] Linting shows same or fewer warnings
- [ ] `security-audit.txt` updated with new baseline

#### Files to Review After Update

- [ ] `/src/App.tsx` - Routing still works
- [ ] `/src/components/ProtectedRoute.tsx` - Auth checks intact
- [ ] All pages with `useNavigate()` or `<Link>` components

---

### Day 3-4: Password Security Enhancement

**Owner:** [@assign-developer]  
**Priority:** HIGH 🔴  
**Estimated Time:** 6-8 hours

#### Tasks

**1. Create Security Utilities**

```bash
# Create new files
touch src/utils/security.ts
touch src/utils/security.test.ts
```

**Implementation:**

```typescript
// src/utils/security.ts
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};

export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Length check
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(`Must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`);
  } else {
    score += 25;
  }

  // Character type checks
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain uppercase letter');
    suggestions.push('Add uppercase letters (A-Z)');
  } else {
    score += 25;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Must contain lowercase letter');
    suggestions.push('Add lowercase letters (a-z)');
  } else {
    score += 25;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Must contain number');
    suggestions.push('Add numbers (0-9)');
  } else {
    score += 15;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Must contain special character');
    suggestions.push('Add special characters (!@#$%^&*)');
  } else {
    score += 10;
  }

  // Bonus points for length
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  return {
    valid: errors.length === 0,
    score: Math.min(score, 100),
    errors,
    suggestions,
  };
}

export function sanitizeUrl(url: string, defaultUrl: string = '/'): string {
  const allowedProtocols = ['http:', 'https:', 'mailto:'];

  try {
    const parsed = new URL(url, window.location.origin);
    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn(`[Security] Invalid protocol: ${parsed.protocol}`);
      return defaultUrl;
    }
    return parsed.href;
  } catch (error) {
    console.warn(`[Security] Invalid URL: ${url}`, error);
    return defaultUrl;
  }
}
```

**2. Update Register Page**

```typescript
// src/pages/Register.tsx - Add after password field
const [passwordStrength, setPasswordStrength] = useState<PasswordValidationResult | null>(null);

// In password onChange handler
const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newPassword = e.target.value;
  setPassword(newPassword);
  setPasswordStrength(validatePasswordStrength(newPassword));
};

// Add UI feedback
{passwordStrength && password && (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all",
            passwordStrength.score < 50 && "bg-red-500",
            passwordStrength.score >= 50 && passwordStrength.score < 75 && "bg-yellow-500",
            passwordStrength.score >= 75 && "bg-green-500"
          )}
          style={{ width: `${passwordStrength.score}%` }}
        />
      </div>
      <span className="text-sm font-medium">
        {passwordStrength.score < 50 && "Weak"}
        {passwordStrength.score >= 50 && passwordStrength.score < 75 && "Medium"}
        {passwordStrength.score >= 75 && "Strong"}
      </span>
    </div>
    {passwordStrength.errors.length > 0 && (
      <ul className="text-sm text-red-600 space-y-1">
        {passwordStrength.errors.map((error, i) => (
          <li key={i}>• {error}</li>
        ))}
      </ul>
    )}
  </div>
)}
```

**3. Add Tests**

```typescript
// src/utils/security.test.ts
import { describe, it, expect } from 'vitest';
import { validatePasswordStrength, sanitizeUrl } from './security';

describe('validatePasswordStrength', () => {
  it('should reject password shorter than 12 characters', () => {
    const result = validatePasswordStrength('Short1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Must be at least 12 characters');
  });

  it('should accept strong password', () => {
    const result = validatePasswordStrength('MySecureP@ssw0rd2026');
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThan(75);
  });

  // Add more tests...
});

describe('sanitizeUrl', () => {
  it('should allow https URLs', () => {
    const result = sanitizeUrl('https://example.com/path');
    expect(result).toBe('https://example.com/path');
  });

  it('should reject javascript URLs', () => {
    const result = sanitizeUrl('javascript:alert(1)');
    expect(result).toBe('/');
  });

  // Add more tests...
});
```

#### Files to Update

- [ ] Create `/src/utils/security.ts`
- [ ] Create `/src/utils/security.test.ts`
- [ ] Update `/src/pages/Register.tsx`
- [ ] Update `/src/config/constants.ts` (add PASSWORD_REQUIREMENTS)

#### Acceptance Criteria

- [ ] Password must be 12+ characters
- [ ] Real-time strength indicator visible
- [ ] All requirements clearly displayed
- [ ] Tests pass with 100% coverage for security utils
- [ ] User-friendly error messages

---

### Day 5-7: Conflict Dialog Implementation

**Owner:** [@assign-developer]  
**Priority:** HIGH 🔴  
**Estimated Time:** 12-16 hours

#### Tasks

**1. Create Dialog Component**

```bash
touch src/components/Calendar/ConflictDialog.tsx
touch src/components/Calendar/ConflictDialog.test.tsx
```

```typescript
// src/components/Calendar/ConflictDialog.tsx
import { AlertTriangle, Clock, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShiftConflict } from '@/lib/shift-conflicts';
import { format, parseISO } from 'date-fns';

interface ConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ShiftConflict[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConflictDialog({
  open,
  onOpenChange,
  conflicts,
  onConfirm,
  onCancel,
  loading = false,
}: ConflictDialogProps) {
  const hasDoubleBooking = conflicts.some(c => c.type === 'double_booking');
  const hasRestPeriod = conflicts.some(c => c.type === 'insufficient_rest');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Schedule Conflict Detected
          </DialogTitle>
          <DialogDescription>
            This shift conflicts with existing schedules. Review the conflicts below
            and decide whether to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {conflicts.map((conflict, index) => (
            <div
              key={index}
              className="border border-red-200 bg-red-50 p-4 rounded-lg space-y-2"
            >
              <div className="flex items-start gap-2">
                {conflict.type === 'double_booking' ? (
                  <Users className="h-5 w-5 text-red-600 mt-0.5" />
                ) : (
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900">
                    {conflict.type === 'double_booking'
                      ? 'Double Booking'
                      : 'Insufficient Rest Period'}
                  </h4>
                  <p className="text-sm text-red-700">{conflict.message}</p>

                  {conflict.conflictingShift && (
                    <div className="mt-2 text-sm bg-white p-2 rounded border border-red-200">
                      <p className="font-medium">Conflicting Shift:</p>
                      <p>
                        {format(parseISO(conflict.conflictingShift.start_time), 'MMM dd, HH:mm')}
                        {' - '}
                        {format(parseISO(conflict.conflictingShift.end_time), 'HH:mm')}
                      </p>
                      {conflict.conflictingShift.title && (
                        <p className="text-gray-600">{conflict.conflictingShift.title}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Anyway (Override)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**2. Integrate with ShiftCalendar**

```typescript
// src/components/Calendar/ShiftCalendar.tsx
import { ConflictDialog } from './ConflictDialog';
import { detectConflicts, ShiftConflict } from '@/lib/shift-conflicts';

// Add state
const [conflicts, setConflicts] = useState<ShiftConflict[]>([]);
const [showConflictDialog, setShowConflictDialog] = useState(false);
const [pendingShift, setPendingShift] = useState<ShiftFormData | null>(null);

// Update handleSubmit
const handleSubmit = async (data: ShiftFormData) => {
  try {
    // Detect conflicts before creating
    const detectedConflicts = detectConflicts(
      data,
      existingShifts,
      data.id // exclude current shift if editing
    );

    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      setPendingShift(data);
      setShowConflictDialog(true);
      return; // Don't create yet
    }

    // No conflicts, proceed
    await createOrUpdateShift(data);
  } catch (error) {
    // Error handling
  }
};

// Handle conflict resolution
const handleConflictConfirm = async () => {
  if (!pendingShift) return;

  try {
    await createOrUpdateShift(pendingShift);
    setShowConflictDialog(false);
    setPendingShift(null);
    setConflicts([]);
  } catch (error) {
    // Error handling
  }
};

const handleConflictCancel = () => {
  setShowConflictDialog(false);
  setPendingShift(null);
  setConflicts([]);
};

// Add dialog to render
<ConflictDialog
  open={showConflictDialog}
  onOpenChange={setShowConflictDialog}
  conflicts={conflicts}
  onConfirm={handleConflictConfirm}
  onCancel={handleConflictCancel}
  loading={isCreating}
/>
```

**3. Add Tests**

```typescript
// src/components/Calendar/ConflictDialog.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConflictDialog } from './ConflictDialog';

describe('ConflictDialog', () => {
  const mockConflicts = [
    {
      type: 'double_booking',
      message: 'Employee is already scheduled',
      conflictingShift: {
        id: 'shift-1',
        start_time: '2026-01-23T09:00:00Z',
        end_time: '2026-01-23T17:00:00Z',
        title: 'Morning Shift',
      },
    },
  ];

  it('should display conflict details', () => {
    render(
      <ConflictDialog
        open={true}
        onOpenChange={vi.fn()}
        conflicts={mockConflicts}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Schedule Conflict Detected')).toBeInTheDocument();
    expect(screen.getByText('Double Booking')).toBeInTheDocument();
  });

  it('should call onConfirm when override clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConflictDialog
        open={true}
        onOpenChange={vi.fn()}
        conflicts={mockConflicts}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Create Anyway/));
    expect(onConfirm).toHaveBeenCalled();
  });

  // More tests...
});
```

#### Files to Update

- [ ] Create `/src/components/Calendar/ConflictDialog.tsx`
- [ ] Create `/src/components/Calendar/ConflictDialog.test.tsx`
- [ ] Update `/src/components/Calendar/ShiftCalendar.tsx`
- [ ] Remove TODO comment

#### Acceptance Criteria

- [ ] Dialog shows all conflicts clearly
- [ ] User can cancel or override
- [ ] Conflicts logged for audit
- [ ] Tests cover all scenarios
- [ ] TODO removed from codebase

---

### Day 8-10: Error Boundaries & Logging

**Owner:** [@assign-developer]  
**Priority:** MEDIUM 🟡  
**Estimated Time:** 10-12 hours

#### Tasks

**1. Create Error Logger**

```bash
touch src/services/error-logger.ts
touch src/services/error-logger.test.ts
```

```typescript
// src/services/error-logger.ts
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  companyId?: string;
  metadata?: Record<string, unknown>;
}

export class ErrorLogger {
  private static isDevelopment = import.meta.env.DEV;

  static log(error: Error, context?: ErrorContext): void {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context,
    };

    // Console log in development
    if (this.isDevelopment) {
      console.error('[ErrorLogger]', errorReport);
    }

    // Send to monitoring service in production
    // TODO: Integrate with Sentry, LogRocket, or similar
    // if (!this.isDevelopment) {
    //   Sentry.captureException(error, { contexts: { custom: context } });
    // }

    // Store in local storage for debugging (keep last 10)
    try {
      const stored = JSON.parse(localStorage.getItem('error_logs') || '[]');
      stored.push(errorReport);
      if (stored.length > 10) stored.shift();
      localStorage.setItem('error_logs', JSON.stringify(stored));
    } catch {
      // Ignore storage errors
    }
  }

  static clearLogs(): void {
    try {
      localStorage.removeItem('error_logs');
    } catch {
      // Ignore
    }
  }

  static getLogs(): Array<ErrorContext & { message: string; timestamp: string }> {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  }
}
```

**2. Add Error Boundaries to Pages**

```typescript
// Update App.tsx to wrap pages
import ErrorBoundary from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workload = lazy(() => import('./pages/Workload'));
const DemandForecast = lazy(() => import('./pages/DemandForecast'));

// In Routes
<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['manager', 'employee']}>
    <ErrorBoundary>
      <Layout><Dashboard /></Layout>
    </ErrorBoundary>
  </ProtectedRoute>
} />

<Route path="/workload" element={
  <ProtectedRoute allowedRoles={['manager']}>
    <ErrorBoundary>
      <Layout><Workload /></Layout>
    </ErrorBoundary>
  </ProtectedRoute>
} />
```

**3. Improve Error Handling in Pages**

```typescript
// src/pages/Workload.tsx - Replace console.error
import { ErrorLogger } from '@/services/error-logger';

try {
  const data = await getWorkloadMetrics(companyId, startDate, endDate);
  setWorkloadData(data);
} catch (error) {
  ErrorLogger.log(error as Error, {
    component: 'Workload',
    action: 'loadWorkloadData',
    companyId,
    metadata: { startDate, endDate },
  });
  toast.error('Failed to load workload data. Please try again.');
}
```

#### Files to Update

- [ ] Create `/src/services/error-logger.ts`
- [ ] Create `/src/services/error-logger.test.ts`
- [ ] Update `/src/App.tsx` (add ErrorBoundary wrappers)
- [ ] Update `/src/pages/Workload.tsx`
- [ ] Update `/src/pages/DemandForecast.tsx`
- [ ] Update `/src/pages/SwapRequests.tsx`

#### Acceptance Criteria

- [ ] All pages wrapped in ErrorBoundary
- [ ] console.error replaced with ErrorLogger
- [ ] Errors logged with context
- [ ] User-friendly error messages shown
- [ ] Error logs viewable in dev tools

---

## 📊 Week 3-4 (Testing & Quality)

### Testing Sprint Overview

**Goal:** Achieve 80% code coverage  
**Current:** ~60% estimated  
**Gap:** API layer + 4 page components

### Priority Order

1. **Week 3**: API layer tests (highest ROI)
2. **Week 4**: Page components + code quality

---

### API Testing Checklist

**Files to Create:**

- [ ] `/src/api/employees.test.ts` (6-8 hours)
- [ ] `/src/api/schedules.test.ts` (6-8 hours)
- [ ] `/src/api/companies.test.ts` (4-6 hours)
- [ ] `/src/api/profiles.test.ts` (4-6 hours)
- [ ] `/src/api/preferences.test.ts` (4-6 hours)
- [ ] `/src/api/demand.test.ts` (4-6 hours)
- [ ] `/src/api/workload.test.ts` (4-6 hours)
- [ ] `/src/api/swapRequests.test.ts` (4-6 hours)

**Total Estimated Time:** 36-52 hours (1.5 developers for 2 weeks)

### Code Quality Checklist

**ESLint Warnings (8 instances):**

- [ ] `/src/components/PermissionGate.tsx` - Extract PERMISSIONS const
- [ ] `/src/components/ui/badge.tsx` - Extract badgeVariants
- [ ] `/src/components/ui/button.tsx` - Extract buttonVariants
- [ ] `/src/components/ui/form.tsx` - Extract useFormField
- [ ] `/src/components/ui/navigation-menu.tsx` - Extract navigationMenuTriggerStyle
- [ ] `/src/components/ui/sidebar.tsx` - Extract SIDEBAR\_\* constants
- [ ] `/src/components/ui/toggle.tsx` - Extract toggleVariants
- [ ] `/src/providers/SessionContextProvider.tsx` - Extract SessionContext

**Constants Centralization:**

```typescript
// src/config/constants.ts
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const AUTH = {
  MIN_PASSWORD_LENGTH: 12,
  SESSION_TIMEOUT_MS: 3600000,
};

export const STORAGE_KEYS = {
  CALENDAR_VIEW: 'scaleflow_calendar_view',
  THEME: 'scaleflow_theme',
  ERROR_LOGS: 'scaleflow_error_logs',
};

export const SHIFT = {
  MIN_REST_HOURS: 8,
  MAX_HISTORY: 10,
};
```

---

## 📈 Progress Tracking

### Daily Standup Template

```
Yesterday:
- [x] What I completed
- [ ] What I'm working on
- ⚠️ What's blocked

Today:
- [ ] Task 1 (2h)
- [ ] Task 2 (4h)
- [ ] Task 3 (2h)

Blockers:
- None / [Issue description]
```

### Weekly Review Checklist

- [ ] All planned tasks completed
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Demo prepared

---

## 🎯 Success Metrics

### Week 1-2 Targets

- ✅ 0 high/critical npm vulnerabilities
- ✅ ConflictDialog implemented
- ✅ Password strength validation added
- ✅ Error logging infrastructure ready

### Week 3-4 Targets

- ✅ 80%+ test coverage
- ✅ 0 ESLint warnings
- ✅ All API functions tested
- ✅ Constants centralized

---

## 📞 Need Help?

**Questions?** Create an issue or ping in team chat  
**Blockers?** Escalate immediately to tech lead  
**Progress Updates?** Use `report_progress` tool

---

**Last Updated:** January 23, 2026  
**Next Review:** January 30, 2026
