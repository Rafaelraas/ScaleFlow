# Sprint 7 Agent Prompt: Analytics & Reporting

## 🎯 Mission Brief

You are an expert full-stack developer implementing Sprint 7 for ScaleFlow. Your mission is to build **Advanced Analytics** and **Time Tracking** features that transform scheduling data into actionable business intelligence.

**Sprint Goals:**

1. ✅ Analytics dashboard with key metrics
2. ✅ Labor cost tracking and forecasting
3. ✅ Time tracking with clock in/out
4. ✅ Custom report builder
5. ✅ PDF/Excel export capabilities

**Expected Timeline:** 34-41 hours (~2 weeks)

---

## 📋 Context

### Sprint Status
- **Sprints 1-6:** ✅ Complete
- **Sprint 7:** 🎯 YOU ARE HERE

### Current State
- 211 tests passing
- Notifications & messaging working
- Ready for analytics layer

### Why This Matters
- **Data-Driven Decisions:** Managers need insights to optimize staffing
- **Cost Control:** Identify 30%+ cost savings opportunities
- **Compliance:** Accurate time tracking for payroll

---

## 🎯 Success Criteria

### Features ✅
- [ ] Analytics dashboard with 6+ key metrics
- [ ] Labor cost trends visualization
- [ ] Employee utilization tracking
- [ ] Time clock (clock in/out)
- [ ] Break time tracking
- [ ] Manager approval workflow
- [ ] Custom report builder
- [ ] PDF/Excel export

### Performance ✅
- [ ] Dashboard loads <3s with 6 months data
- [ ] Time tracking 99%+ accurate
- [ ] Reports generate <10s
- [ ] Real-time metrics update

### Quality ✅
- [ ] 211+ tests passing
- [ ] Mobile responsive
- [ ] Accessible (WCAG AA)

---

## 📦 Task List

### Phase 1: Analytics (Day 1-5)

#### Task 1: Analytics Schema (3h)

**Action:**
1. Create materialized view for daily analytics
2. Add employee utilization metrics table
3. Create refresh function
4. Add indexes
5. Test performance

**See SPRINT_7_PLAN.md Task 1 for SQL**

**Testing:**
```bash
# Apply migration
supabase migration up

# Test refresh
psql -d postgres -c "SELECT refresh_analytics_daily();"

# Check performance
psql -d postgres -c "EXPLAIN ANALYZE SELECT * FROM analytics_daily WHERE company_id = 'xxx' AND date >= '2024-01-01';"
```

---

#### Task 2: Analytics Service (5h)

**Action:**
1. Create AnalyticsService class
2. Implement getDashboardMetrics
3. Implement getLaborCostTrends
4. Implement getEmployeeUtilization
5. Implement getShiftCoverage
6. Write comprehensive tests

**Key Methods:**
```typescript
AnalyticsService.getDashboardMetrics(companyId, startDate, endDate)
AnalyticsService.getLaborCostTrends(companyId, startDate, endDate, 'week')
AnalyticsService.getEmployeeUtilization(companyId, startDate, endDate)
```

**Files to create:**
- `src/services/analytics.service.ts`
- `src/services/analytics.service.test.ts`

---

#### Task 3: Dashboard UI (6h)

**Action:**
1. Create AnalyticsPage layout
2. Add MetricCard components (4 key metrics)
3. Implement LaborCostChart (line chart)
4. Implement UtilizationChart (bar chart)
5. Implement ShiftCoverageChart (heatmap)
6. Add date range selector
7. Mobile responsive

**Charts Using Recharts:**
- Line chart for labor cost trends
- Bar chart for employee utilization
- Heatmap for shift coverage
- Pie chart for attendance rates

**Files to create:**
- `src/pages/Analytics.tsx`
- `src/components/Analytics/MetricCard.tsx`
- `src/components/Analytics/LaborCostChart.tsx`
- `src/components/Analytics/UtilizationChart.tsx`

**Testing:**
```bash
npm run dev
# Navigate to /analytics
# Test date range changes
# Verify charts load
# Test on mobile
```

---

### Phase 2: Time Tracking (Day 6-8)

#### Task 4: Time Tracking Schema (3h)

**Action:**
1. Create time_entries table
2. Add calculate_hours trigger
3. Set up RLS policies
4. Update TypeScript types

**See SPRINT_7_PLAN.md Task 4 for SQL**

---

#### Task 5: Time Tracking UI (6h)

**Action:**
1. Create ClockInOut component
2. Add GPS location capture (optional)
3. Create BreakTimer component
4. Build TimeSheets page
5. Implement approval workflow
6. Mobile-optimized clock interface

**Components:**
```typescript
<ClockInOut />  // Big button, show current time, status
<BreakTimer />  // Start/end break
<TimeSheetTable />  // Manager approval interface
```

**Files to create:**
- `src/components/TimeTracking/ClockInOut.tsx`
- `src/components/TimeTracking/BreakTimer.tsx`
- `src/pages/TimeSheets.tsx`
- `src/services/time-tracking.service.ts`

---

### Phase 3: Reporting (Day 9-10)

#### Task 6: Report Builder (5h)

**Action:**
1. Create ReportBuilder component
2. Implement report type selector
3. Add metric selector
4. Build filter interface
5. Add PDF export
6. Add Excel export
7. Implement scheduled reports (optional)

**Report Types:**
- Labor cost report
- Employee utilization report
- Attendance report
- Overtime report
- Payroll export

**Export Libraries:**
- PDF: jsPDF or react-pdf
- Excel: xlsx

**Files to create:**
- `src/components/Reports/ReportBuilder.tsx`
- `src/services/report.service.ts`
- `src/utils/pdf-export.ts`
- `src/utils/excel-export.ts`

---

#### Task 7: Integration & Testing (4h)

**Testing:**
```bash
# Unit tests
npm test  # 211+ tests must pass

# Performance
- Dashboard <3s load
- Time tracking accurate
- Reports <10s generation

# Manual testing
- Desktop: All analytics features
- Mobile: Time clock functionality
- Export: PDF and Excel downloads
```

---

#### Task 8: Documentation (2h)

**Documents:**
- `docs/ANALYTICS_GUIDE.md` - Using analytics dashboard
- `docs/TIME_TRACKING_GUIDE.md` - Clock in/out procedures
- `docs/REPORTING_GUIDE.md` - Creating reports

---

## 🔧 Technical Guidelines

### Analytics Best Practices
- Use materialized views for performance
- Refresh views daily via cron
- Cache expensive queries
- Lazy load charts
- Optimize SQL with proper indexes

### Time Tracking Best Practices
- Validate clock times server-side
- Store in UTC, display in user timezone
- GPS is optional, not required
- Round to nearest minute
- Prevent duplicate clock-ins

---

## 🚨 Common Pitfalls

### ❌ Don't Do This
- Query raw shifts table for analytics
- Allow clock in without validation
- Generate reports synchronously
- Skip timezone conversions
- Export sensitive data without permission

### ✅ Do This
- Use materialized views
- Validate all time entries
- Queue report generation
- Always convert timezones
- Check permissions before export

---

## 🎯 Final Checklist

### Features ✅
- [ ] Analytics dashboard working
- [ ] Charts displaying correctly
- [ ] Time clock functional
- [ ] Time sheets with approval
- [ ] Report builder working
- [ ] PDF/Excel export

### Quality ✅
- [ ] 211+ tests passing
- [ ] Dashboard <3s load
- [ ] Time tracking accurate
- [ ] Mobile responsive
- [ ] Documentation complete

---

## 🚀 Let's Begin!

**First Task:** Task 1 - Analytics Database Schema

1. Create materialized view
2. Add employee metrics table
3. Test performance
4. Update types
5. Report progress

**Remember:** Focus on performance and accuracy!

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 7 - Analytics & Reporting
