# ScaleFlow Development Roadmap

**Last Updated:** January 23, 2026  
**Status:** Active Planning Phase  
**Current Version:** 0.1.0

---

## 📋 Executive Summary

This roadmap outlines the strategic development plan for ScaleFlow, a SaaS shift scheduling and workforce management platform. The plan is organized into 5 phases, prioritized by business impact, user value, and technical necessity.

**Current State:**

- ✅ 184 TypeScript files with 362 passing tests
- ✅ Comprehensive architecture documentation
- ✅ Role-based access control fully implemented
- ⚠️ 12 security vulnerabilities in dependencies (9 moderate, 3 high)
- ⚠️ Test coverage gaps in API layer
- ⚠️ Client-side data aggregation needs optimization

---

## 🎯 Strategic Priorities

### Business Goals

1. **Security First** - Maintain user trust and data protection
2. **User Experience** - Intuitive, accessible, and performant
3. **Reliability** - 99.9% uptime with comprehensive error handling
4. **Scalability** - Support growing user base and data volumes
5. **Feature Completeness** - Deliver high-value scheduling features

### Success Metrics

- **Security**: 0 high/critical vulnerabilities
- **Performance**: < 3s initial load, < 500ms page transitions
- **Reliability**: < 0.1% error rate
- **Testing**: > 80% code coverage
- **User Satisfaction**: > 4.5/5 rating

---

## 🔴 Phase 1: Security & Stability (CRITICAL - Weeks 1-2)

**Goal:** Eliminate security vulnerabilities and establish robust error handling.

### 1.1 Dependency Security Updates (2-3 days)

**High Priority:**

```bash
# React Router XSS Vulnerability (CVE-2024-XXXX)
npm install react-router-dom@latest  # Fix GHSA-2w69-qvjg-hvjx

# Lodash Prototype Pollution
npm install lodash@latest lodash-es@latest  # Fix GHSA-xxjr-mmjv-4gpg

# Vitest/esbuild Vulnerability
npm install vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest
```

**Verification Steps:**

1. Run `npm audit` - should show 0 high/critical
2. Run full test suite - all tests must pass
3. Manual security review of routing logic
4. Update `security-audit.txt` with new baseline

**Files to Review:**

- `/src/App.tsx` - Routing configuration
- `/src/components/ProtectedRoute.tsx` - Auth checks
- All components using `react-router-dom`

### 1.2 Input Validation & Sanitization (2-3 days)

**Security Improvements:**

```typescript
// src/utils/security.ts (NEW FILE)
export function sanitizeUrl(url: string): string {
  // Prevent XSS in redirect URLs
  const allowedProtocols = ['http:', 'https:'];
  try {
    const parsed = new URL(url);
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.href;
  } catch {
    return '/'; // Safe fallback
  }
}

export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const MIN_LENGTH = 12; // Increase from 6

  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain special character');
  }

  return { valid: errors.length === 0, errors };
}
```

**Files to Update:**

- `/src/pages/Register.tsx` - Add password strength validation
- `/src/components/InviteEmployeeForm.tsx` - Sanitize redirect URLs
- `/src/providers/SessionContextProvider.tsx` - Sanitize hash/search params
- `/src/components/ErrorBoundary.tsx` - Validate window.location assignments

### 1.3 Error Handling & Recovery (3-4 days)

**Priority Tasks:**

1. **Implement ConflictDialog Component**

   ```typescript
   // src/components/Calendar/ConflictDialog.tsx (NEW)
   interface ConflictDialogProps {
     conflicts: ShiftConflict[];
     onConfirm: () => void;
     onCancel: () => void;
   }
   ```

   - Show conflict details (double booking, rest period violations)
   - Allow manager override with confirmation
   - Log override actions for audit trail

2. **Add Page-Level Error Boundaries**

   ```typescript
   // Wrap all page routes with ErrorBoundary
   <ErrorBoundary fallback={<ErrorFallback />}>
     <SomePageComponent />
   </ErrorBoundary>
   ```

   - Pages: Workload, DemandForecast, SwapRequests, AdminUserManagement

3. **Centralize Error Logging**
   ```typescript
   // src/services/error-logger.ts (NEW)
   export class ErrorLogger {
     static log(error: Error, context: ErrorContext): void {
       // Send to monitoring service (Sentry, LogRocket, etc.)
       console.error('[ErrorLogger]', error, context);
     }
   }
   ```

**Files to Create:**

- `/src/components/Calendar/ConflictDialog.tsx`
- `/src/components/Calendar/ConflictDialog.test.tsx`
- `/src/services/error-logger.ts`
- `/src/services/error-logger.test.ts`
- `/src/utils/security.ts`
- `/src/utils/security.test.ts`

**Files to Update:**

- `/src/components/Calendar/ShiftCalendar.tsx` - Implement TODO
- `/src/pages/Workload.tsx` - Add error boundary and better error handling
- `/src/pages/DemandForecast.tsx` - Same as above
- `/src/api/schedules.ts` - Add try-catch wrappers
- `/src/api/employees.ts` - Add try-catch wrappers

**Estimated Effort:** 7-10 days  
**Team Size:** 2 developers  
**Risk:** Low - Clear requirements, no external dependencies

---

## 🟡 Phase 2: Test Coverage & Code Quality (Weeks 3-4)

**Goal:** Achieve 80%+ test coverage and resolve technical debt.

### 2.1 API Layer Testing (3-4 days)

**Test Files to Create:**

1. `/src/api/employees.test.ts` - Test all CRUD operations
2. `/src/api/schedules.test.ts` - Test shift management
3. `/src/api/companies.test.ts` - Test company operations
4. `/src/api/profiles.test.ts` - Test profile management
5. `/src/api/preferences.test.ts` - Test preference submission
6. `/src/api/demand.test.ts` - Test forecasting
7. `/src/api/workload.test.ts` - Test workload management
8. `/src/api/swapRequests.test.ts` - Test swap workflows

**Test Pattern:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEmployeesByCompany } from './employees';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
    })),
  },
}));

describe('employees API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch employees by company', async () => {
    // Test implementation
  });

  it('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

### 2.2 Service Layer Testing (2 days)

**Files to Test:**

- `/src/services/supabase/error-handler.test.ts`
- `/src/services/supabase/auth.service.test.ts`

### 2.3 Page Component Testing (2-3 days)

**Priority Pages:**

1. `/src/pages/Workload.test.tsx`
2. `/src/pages/DemandForecast.test.tsx`
3. `/src/pages/AdminUserManagement.test.tsx`
4. `/src/pages/AdminCompanyManagement.test.tsx`

### 2.4 Code Quality Improvements (2-3 days)

**Tasks:**

1. **Resolve ESLint Warnings** (8 instances)
   - Extract exports from component files
   - Follow react-refresh best practices

2. **Centralize Constants**

   ```typescript
   // src/config/constants.ts (NEW)
   export const PAGINATION = {
     ITEMS_PER_PAGE: 10,
     MAX_PAGE_SIZE: 100,
   };

   export const AUTH = {
     MIN_PASSWORD_LENGTH: 12,
     SESSION_TIMEOUT: 3600000, // 1 hour
   };

   export const STORAGE_KEYS = {
     CALENDAR_VIEW: 'scaleflow_calendar_view',
     THEME: 'scaleflow_theme',
   };
   ```

3. **Document Technical Debt**
   ```typescript
   // Document any types that remain
   /**
    * @todo Convert to proper type after schema update
    * Tracking: https://github.com/Rafaelraas/ScaleFlow/issues/XX
    */
   const data: unknown = response.data;
   ```

**Estimated Effort:** 10-14 days  
**Team Size:** 2-3 developers  
**Risk:** Low - Standard testing practices

---

## 🟠 Phase 3: Performance Optimization (Weeks 5-6)

**Goal:** Improve application performance and scalability.

### 3.1 Database Optimization (3-4 days)

**Move Aggregations to Database:**

```sql
-- Migration: create_summary_functions.sql
CREATE OR REPLACE FUNCTION get_demand_forecast_summary(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  avg_forecasted_demand DECIMAL,
  avg_actual_demand DECIMAL,
  avg_accuracy_rate DECIMAL,
  total_records INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(forecasted_demand)::DECIMAL,
    AVG(actual_demand)::DECIMAL,
    AVG(CASE
      WHEN actual_demand > 0
      THEN (forecasted_demand::DECIMAL / actual_demand) * 100
      ELSE 0
    END)::DECIMAL,
    COUNT(*)::INTEGER
  FROM demand_forecasts
  WHERE company_id = p_company_id
    AND forecast_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_workload_summary(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  avg_utilization_rate DECIMAL,
  avg_overtime_hours DECIMAL,
  total_shifts INTEGER,
  peak_utilization_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(utilization_rate)::DECIMAL,
    AVG(overtime_hours)::DECIMAL,
    COUNT(*)::INTEGER,
    (SELECT date FROM workload_metrics
     WHERE company_id = p_company_id
     ORDER BY utilization_rate DESC
     LIMIT 1)
  FROM workload_metrics
  WHERE company_id = p_company_id
    AND date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;
```

**Update API Functions:**

```typescript
// src/api/demand.ts
export async function getDemandForecastSummary(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<DemandSummary> {
  const { data, error } = await supabase.rpc('get_demand_forecast_summary', {
    p_company_id: companyId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
}
```

### 3.2 Client-Side Optimization (2-3 days)

**Memoization & Caching:**

```typescript
// src/hooks/useDemandData.ts
import { useQuery } from '@tanstack/react-query';

export function useDemandData(companyId: string, dateRange: DateRange) {
  return useQuery({
    queryKey: ['demand', companyId, dateRange],
    queryFn: () => getDemandForecasts(companyId, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
```

**Pagination:**

```typescript
// src/pages/DemandForecast.tsx
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 30;

const { data, isLoading } = useQuery({
  queryKey: ['demand', companyId, page],
  queryFn: () => getDemandForecastsPaginated(companyId, page, ITEMS_PER_PAGE),
});
```

### 3.3 Bundle Optimization (1-2 days)

**Code Splitting:**

```typescript
// src/App.tsx - Already implemented ✅
// Ensure all large pages are lazy loaded
const HeavyComponent = lazy(() => import('./pages/HeavyComponent'));
```

**Bundle Analysis:**

```bash
npm run build:analyze
# Review stats.html to identify large dependencies
```

**Estimated Effort:** 6-9 days  
**Team Size:** 2 developers (1 backend, 1 frontend)  
**Risk:** Medium - Requires database changes

---

## 🟢 Phase 4: Feature Development (Weeks 7-12)

**Goal:** Deliver high-value user features.

### 4.1 Interactive Calendar (Week 7-8)

**Priority:** HIGH 🔴  
**User Impact:** VERY HIGH  
**Complexity:** HIGH

**Features:**

1. **Drag-and-Drop Scheduling**
   - Drag shifts to different time slots
   - Drag shifts to different employees
   - Visual feedback during drag
   - Conflict detection on drop
   - Undo/redo support

2. **Multiple Views**
   - Month view (overview)
   - Week view (detailed)
   - Day view (hourly breakdown)
   - Agenda view (list format)

3. **Quick Actions**
   - Click to create shift
   - Right-click context menu
   - Bulk selection
   - Copy/paste shifts

**Implementation:**

```typescript
// src/components/Calendar/InteractiveCalendar.tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar, momentLocalizer } from 'react-big-calendar';

export function InteractiveCalendar() {
  // Implementation
}
```

**Dependencies:**

- `react-big-calendar` - Already installed ✅
- `react-dnd` - Already installed ✅
- `moment` - Already installed ✅

### 4.2 Progressive Web App (Week 9)

**Priority:** HIGH 🔴  
**User Impact:** HIGH  
**Complexity:** MEDIUM

**Features:**

1. Service worker for offline access
2. Install to home screen
3. Push notifications
4. Offline schedule viewing
5. Background sync

**Implementation:**

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ScaleFlow',
        short_name: 'ScaleFlow',
        description: 'Shift Scheduling & Management',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### 4.3 Accessibility Improvements (Week 10)

**Priority:** HIGH 🔴  
**User Impact:** HIGH  
**Complexity:** MEDIUM

**WCAG 2.1 Level AA Compliance:**

1. **Keyboard Navigation**
   - Tab order logical
   - All interactive elements accessible
   - Skip navigation links
   - Focus indicators visible

2. **Screen Reader Support**
   - ARIA labels on all controls
   - Semantic HTML elements
   - Alt text on images
   - Form field descriptions

3. **Visual Accessibility**
   - Color contrast > 4.5:1
   - Text resizable to 200%
   - High contrast mode
   - Reduced motion support

**Testing Tools:**

```bash
npm install -D @axe-core/react
npm install -D pa11y
```

### 4.4 Analytics Dashboard (Week 11-12)

**Priority:** MEDIUM 🟡  
**User Impact:** HIGH  
**Complexity:** HIGH

**Metrics to Display:**

1. **Labor Analytics**
   - Total hours scheduled
   - Overtime hours
   - Labor cost
   - Cost per shift

2. **Schedule Analytics**
   - Coverage percentage
   - Fill rate
   - Shift distribution
   - Employee utilization

3. **Trend Analysis**
   - Week-over-week changes
   - Monthly patterns
   - Seasonal trends
   - Forecasting

**Visualizations:**

```typescript
// src/components/Analytics/AnalyticsDashboard.tsx
import { LineChart, BarChart, PieChart } from 'recharts';

export function AnalyticsDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LaborCostCard />
      <UtilizationChart />
      <CoverageHeatmap />
      <TrendLineChart />
      <DistributionPieChart />
      <ComparisonBarChart />
    </div>
  );
}
```

**Estimated Effort:** 6 weeks  
**Team Size:** 2-3 developers  
**Risk:** Medium - Multiple complex features

---

## 🔵 Phase 5: Platform Enhancements (Ongoing)

**Goal:** Scale platform for enterprise use.

### 5.1 Integration Capabilities (Months 4-5)

**Priority:** MEDIUM 🟡  
**Complexity:** HIGH

**Integrations:**

1. **Calendar Sync**
   - Google Calendar API
   - Outlook Calendar API
   - iCal format export
   - Two-way sync

2. **Communication**
   - Slack webhooks
   - Microsoft Teams webhooks
   - Email notifications
   - SMS alerts (Twilio)

3. **HRIS Systems**
   - BambooHR API
   - Workday API
   - Generic CSV import/export

### 5.2 Public API (Months 5-6)

**Priority:** MEDIUM 🟡  
**Complexity:** VERY HIGH

**API Design:**

```
GET    /api/v1/shifts?start_date=2026-01-01&end_date=2026-01-31
POST   /api/v1/shifts
PUT    /api/v1/shifts/:id
DELETE /api/v1/shifts/:id

GET    /api/v1/employees
POST   /api/v1/employees
PUT    /api/v1/employees/:id
DELETE /api/v1/employees/:id

GET    /api/v1/schedules/:date
POST   /api/v1/schedules/publish
```

**Authentication:**

- OAuth 2.0
- API key authentication
- Rate limiting (100 req/min)
- Webhook subscriptions

### 5.3 Advanced Features (Months 6+)

**Multi-Location Support:**

- Location management
- Cross-location transfers
- Location-based reporting
- Travel time calculation

**Department Management:**

- Department hierarchy
- Department-specific schedules
- Manager delegation
- Budget tracking

**Skills & Certifications:**

- Skill profiles
- Certification tracking
- Expiry notifications
- Compliance tracking

---

## 📊 Resource Planning

### Team Structure

**Core Team:**

- 1 Tech Lead / Senior Developer
- 2 Full-Stack Developers
- 1 Frontend Specialist
- 1 QA Engineer
- 1 Product Manager

**External Resources:**

- Security Consultant (Phase 1)
- UX Designer (Phase 4)
- DevOps Engineer (Phase 5)

### Budget Estimate

| Phase                | Duration     | Effort (weeks)   | Cost Estimate |
| -------------------- | ------------ | ---------------- | ------------- |
| Phase 1: Security    | 2 weeks      | 4 dev-weeks      | $20,000       |
| Phase 2: Testing     | 2 weeks      | 5 dev-weeks      | $25,000       |
| Phase 3: Performance | 2 weeks      | 3 dev-weeks      | $15,000       |
| Phase 4: Features    | 6 weeks      | 15 dev-weeks     | $75,000       |
| Phase 5: Platform    | 12 weeks     | 30 dev-weeks     | $150,000      |
| **Total**            | **24 weeks** | **57 dev-weeks** | **$285,000**  |

---

## 🎯 Success Criteria

### Phase 1 (Security)

- ✅ 0 high/critical vulnerabilities in `npm audit`
- ✅ All password fields use 12+ char minimum with complexity
- ✅ ConflictDialog component implemented and tested
- ✅ Error boundaries on all page components

### Phase 2 (Testing)

- ✅ 80%+ code coverage (up from ~60%)
- ✅ All API functions have unit tests
- ✅ 0 ESLint warnings
- ✅ All constants centralized

### Phase 3 (Performance)

- ✅ Initial load < 3 seconds
- ✅ Page transitions < 500ms
- ✅ Database aggregations reduced client processing by 90%
- ✅ Lighthouse score > 90

### Phase 4 (Features)

- ✅ Interactive calendar with drag-and-drop
- ✅ PWA installable on mobile devices
- ✅ WCAG 2.1 AA compliant
- ✅ Analytics dashboard with 10+ metrics

### Phase 5 (Platform)

- ✅ At least 2 external integrations live
- ✅ Public API v1.0 documented and available
- ✅ Multi-location support deployed
- ✅ 99.9% uptime maintained

---

## 🚨 Risk Management

### High-Risk Items

**1. Security Updates Breaking Changes**

- **Risk:** Dependency updates may break existing functionality
- **Mitigation:** Comprehensive testing before deployment
- **Contingency:** Rollback plan, feature flags for gradual rollout

**2. Database Performance**

- **Risk:** Moving aggregations to DB may impact query performance
- **Mitigation:** Query optimization, indexing strategy
- **Contingency:** Keep client-side fallback for 2 weeks

**3. Third-Party API Reliability**

- **Risk:** External integrations may be unreliable
- **Mitigation:** Retry logic, circuit breakers, fallbacks
- **Contingency:** Graceful degradation, clear error messages

### Medium-Risk Items

**1. PWA Browser Support**

- **Risk:** Not all browsers support all PWA features
- **Mitigation:** Progressive enhancement approach
- **Contingency:** Feature detection, fallback UI

**2. Test Coverage Goals**

- **Risk:** 80% coverage may be time-consuming
- **Mitigation:** Focus on critical paths first
- **Contingency:** Adjust target to 70% if needed

---

## 📅 Milestones & Checkpoints

### Q1 2026

- ✅ **Jan 23**: Roadmap approved
- 🎯 **Feb 6**: Phase 1 complete (Security)
- 🎯 **Feb 20**: Phase 2 complete (Testing)

### Q2 2026

- 🎯 **Mar 6**: Phase 3 complete (Performance)
- 🎯 **Apr 17**: Phase 4 complete (Features)
- 🎯 **May 1**: Beta testing begins

### Q3 2026

- 🎯 **Jul 1**: Public API v1.0 launch
- 🎯 **Aug 1**: Multi-location support
- 🎯 **Sep 1**: Phase 5 milestone review

---

## 📝 Next Steps

### Immediate Actions (This Week)

1. ✅ Review and approve roadmap
2. ⏳ Create GitHub project board with all tasks
3. ⏳ Schedule Phase 1 kickoff meeting
4. ⏳ Assign Phase 1 tasks to team members
5. ⏳ Set up monitoring for security advisories

### Week 1

1. Update vulnerable dependencies
2. Begin password strength improvements
3. Create ConflictDialog component
4. Set up error logging infrastructure

### Week 2

1. Complete input sanitization
2. Add page error boundaries
3. Finish ConflictDialog implementation
4. Phase 1 review and demo

---

## 📚 References

### Internal Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Feature Ideas](./FEATURE_IDEAS.md)
- [Security Guidelines](./SECURITY.md)
- [Testing Guide](../vitest.setup.ts)
- [API Guidelines](./API_GUIDELINES.md)

### External Resources

- [React Router v6 Docs](https://reactrouter.com/)
- [Supabase Docs](https://supabase.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

---

**Document Owner:** Development Team  
**Review Cycle:** Monthly  
**Last Reviewed:** January 23, 2026  
**Next Review:** February 23, 2026
