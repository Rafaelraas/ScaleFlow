# Sprint 7: Analytics & Reporting

**Sprint Duration:** Week 11-12 (estimated 2-3 weeks)  
**Status:** 📋 Planned  
**Priority:** Critical 🔴  
**Main Goals:**

1. Advanced Analytics Dashboard
2. Time Tracking Integration
3. Labor Cost Analysis

---

## 📋 Executive Summary

Sprint 7 delivers comprehensive analytics and reporting capabilities that transform raw scheduling data into actionable business intelligence. Managers gain insights into labor costs, employee utilization, and scheduling efficiency.

**Expected Impact:**

- Identify 30%+ cost savings opportunities
- 90%+ managers use analytics weekly
- Reduce scheduling inefficiencies by 40%
- Enable data-driven workforce decisions

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Advanced Analytics Dashboard** (P1 - Critical)
   - Labor cost tracking and forecasting
   - Employee utilization metrics
   - Schedule adherence monitoring
   - Shift coverage analytics
   - Interactive charts and visualizations

2. **Time Tracking** (P2 - High)
   - Clock in/out functionality
   - Break time tracking
   - GPS verification (optional)
   - Actual vs scheduled hours comparison
   - Manager approval workflow

3. **Reporting & Export** (P3 - Medium)
   - Custom report builder
   - Scheduled email reports
   - PDF/Excel export
   - Historical data analysis

### Success Criteria

- [ ] Dashboard loads in <3s with 6 months of data
- [ ] Analytics update in real-time
- [ ] Time tracking accuracy >99%
- [ ] Reports generate in <10s
- [ ] 211+ tests passing (maintain from Sprint 6)
- [ ] Mobile responsive analytics
- [ ] Documentation complete

---

## 📦 Task Breakdown

### Task 1: Analytics Database Schema (3 hours)

**Priority:** Critical

**Database Design:**

```sql
-- Materialized view for daily analytics
CREATE MATERIALIZED VIEW analytics_daily AS
SELECT
  DATE(start_time) as date,
  company_id,
  COUNT(*) as total_shifts,
  COUNT(DISTINCT employee_id) as employees_scheduled,
  SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600) as total_hours,
  SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600 * hourly_rate) as labor_cost,
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))/3600) as avg_shift_length,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_shifts,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_shifts
FROM shifts
LEFT JOIN profiles ON shifts.employee_id = profiles.id
GROUP BY DATE(start_time), company_id;

CREATE INDEX idx_analytics_daily_company_date ON analytics_daily(company_id, date DESC);

-- Refresh materialized view (run daily via cron)
CREATE OR REPLACE FUNCTION refresh_analytics_daily() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily;
END;
$$ LANGUAGE plpgsql;

-- Employee utilization tracking
CREATE TABLE employee_utilization_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  week_start DATE NOT NULL,
  total_hours NUMERIC(10,2),
  regular_hours NUMERIC(10,2),
  overtime_hours NUMERIC(10,2),
  shifts_worked INT,
  shifts_missed INT,
  attendance_rate NUMERIC(5,2),
  calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_utilization_employee_week ON employee_utilization_metrics(employee_id, week_start DESC);
```

**Files to Create:**
- `supabase/migrations/[timestamp]_create_analytics.sql`
- `src/types/analytics.ts`

---

### Task 2: Analytics Service (5 hours)

**Priority:** Critical

**Service Implementation:**

```typescript
// src/services/analytics.service.ts

export interface AnalyticsMetrics {
  totalShifts: number;
  totalHours: number;
  laborCost: number;
  employeesScheduled: number;
  avgShiftLength: number;
  completionRate: number;
  utilization: number;
}

export class AnalyticsService {
  /**
   * Get dashboard metrics for date range
   */
  static async getDashboardMetrics(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsMetrics> {
    // Query materialized view for fast results
    // Aggregate metrics
    // Calculate rates and percentages
  }

  /**
   * Get labor cost trends
   */
  static async getLaborCostTrends(
    companyId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month'
  ): Promise<{ date: string; cost: number }[]> {
    // Group by period
    // Calculate costs
    // Return time series data
  }

  /**
   * Get employee utilization
   */
  static async getEmployeeUtilization(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    employeeId: string;
    employeeName: string;
    hoursWorked: number;
    scheduledHours: number;
    utilizationRate: number;
  }>> {
    // Calculate per-employee metrics
  }

  /**
   * Get shift coverage analysis
   */
  static async getShiftCoverage(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    date: string;
    hour: number;
    scheduledEmployees: number;
    requiredEmployees: number;
    coverageRate: number;
  }>> {
    // Analyze coverage by hour
  }

  /**
   * Get peak hours analysis
   */
  static async getPeakHours(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ hour: number; avgEmployees: number; avgShifts: number }[]> {
    // Find busiest hours
  }
}
```

**Files to Create:**
- `src/services/analytics.service.ts`
- `src/services/analytics.service.test.ts`

---

### Task 3: Analytics Dashboard UI (6 hours)

**Priority:** High

**Dashboard Components:**

```typescript
// src/pages/Analytics.tsx
export const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subMonths(new Date(), 1),
    end: new Date(),
  });

  return (
    <Layout>
      <div className="space-y-6">
        <AnalyticsHeader dateRange={dateRange} onChangeDateRange={setDateRange} />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Labor Cost"
            value={formatCurrency(metrics.laborCost)}
            trend={calculateTrend(metrics.laborCost, previousMetrics.laborCost)}
          />
          <MetricCard title="Total Hours" value={metrics.totalHours} />
          <MetricCard title="Shifts Worked" value={metrics.totalShifts} />
          <MetricCard title="Completion Rate" value={`${metrics.completionRate}%`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LaborCostChart data={laborCostTrends} />
          <UtilizationChart data={utilization} />
          <ShiftCoverageChart data={coverage} />
          <PeakHoursChart data={peakHours} />
        </div>

        <EmployeeUtilizationTable data={employeeUtilization} />
      </div>
    </Layout>
  );
};

// src/components/Analytics/LaborCostChart.tsx
export const LaborCostChart = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Labor Cost Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="cost" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

**Charts to Implement:**
- Labor cost trends (line chart)
- Employee utilization (bar chart)
- Shift coverage heatmap
- Peak hours (bar chart)
- Attendance rates (pie chart)
- Cost breakdown (stacked bar)

**Files to Create:**
- `src/pages/Analytics.tsx`
- `src/components/Analytics/AnalyticsHeader.tsx`
- `src/components/Analytics/MetricCard.tsx`
- `src/components/Analytics/LaborCostChart.tsx`
- `src/components/Analytics/UtilizationChart.tsx`
- `src/components/Analytics/ShiftCoverageChart.tsx`

---

### Task 4: Time Tracking Schema (3 hours)

**Priority:** High

**Database Design:**

```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id),
  employee_id UUID REFERENCES profiles(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  break_start TIMESTAMP,
  break_end TIMESTAMP,
  break_duration_minutes INT DEFAULT 0,
  total_hours NUMERIC(10,2),
  clock_in_location POINT,
  clock_out_location POINT,
  clock_in_method TEXT CHECK (clock_in_method IN ('manual', 'gps', 'nfc')),
  notes TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_time_entries_employee ON time_entries(employee_id, clock_in DESC);
CREATE INDEX idx_time_entries_shift ON time_entries(shift_id);
CREATE INDEX idx_time_entries_pending ON time_entries(company_id, approved) WHERE approved = false;

-- Trigger to calculate total hours
CREATE OR REPLACE FUNCTION calculate_time_entry_hours() RETURNS trigger AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL THEN
    NEW.total_hours := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in))/3600 - (NEW.break_duration_minutes / 60.0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_entry_calculate_hours
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_hours();

-- RLS Policies
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY time_entries_employee_own 
  ON time_entries FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY time_entries_manager_company 
  ON time_entries FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'manager')
    )
  );
```

**Files to Create:**
- `supabase/migrations/[timestamp]_create_time_tracking.sql`
- `src/types/time-entries.ts`

---

### Task 5: Time Tracking UI (6 hours)

**Priority:** High

**Clock In/Out Interface:**

```typescript
// src/components/TimeTracking/ClockInOut.tsx
export const ClockInOut = () => {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  const handleClockIn = async () => {
    // Get location if GPS enabled
    if (gpsEnabled) {
      const position = await getCurrentPosition();
      setLocation(position);
    }

    // Create time entry
    await TimeTrackingService.clockIn({
      employeeId: session.user.id,
      shiftId: upcomingShift?.id,
      location: location ? {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      } : undefined,
    });
  };

  const handleClockOut = async () => {
    await TimeTrackingService.clockOut(currentEntry.id, {
      location: gpsEnabled ? await getCurrentPosition() : undefined,
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Time Clock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{currentTime}</div>
          <div className="text-sm text-muted-foreground">{currentDate}</div>
        </div>

        {currentEntry ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Clocked in at</p>
              <p className="text-lg font-semibold">
                {format(currentEntry.clock_in, 'h:mm a')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Duration: {formatDuration(currentEntry.clock_in, new Date())}
              </p>
            </div>
            
            <Button onClick={handleClockOut} className="w-full" size="lg">
              Clock Out
            </Button>
          </div>
        ) : (
          <Button onClick={handleClockIn} className="w-full" size="lg">
            Clock In
            </Button>
        )}
      </CardContent>
    </Card>
  );
};

// src/pages/TimeSheets.tsx
export const TimeSheetsPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>Time Sheets</h1>
          <Button onClick={() => exportTimeSheets()}>
            Export to Excel
          </Button>
        </div>

        <TimeSheetFilters 
          onFilterChange={setFilters}
          onDateRangeChange={setDateRange}
        />

        <TimeSheetTable 
          entries={timeEntries}
          onApprove={handleApprove}
          onEdit={handleEdit}
        />
      </div>
    </Layout>
  );
};
```

**Files to Create:**
- `src/components/TimeTracking/ClockInOut.tsx`
- `src/components/TimeTracking/BreakTimer.tsx`
- `src/pages/TimeSheets.tsx`
- `src/components/TimeTracking/TimeSheetTable.tsx`
- `src/services/time-tracking.service.ts`

---

### Task 6: Report Builder (5 hours)

**Priority:** Medium

**Custom Report Interface:**

```typescript
// src/components/Reports/ReportBuilder.tsx
export const ReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'labor_cost',
    dateRange: { start: subMonths(new Date(), 1), end: new Date() },
    metrics: ['total_cost', 'total_hours', 'avg_hourly_rate'],
    groupBy: 'week',
    filters: {},
  });

  const handleGenerate = async () => {
    const report = await ReportService.generateReport(reportConfig);
    setReportData(report);
  };

  return (
    <div className="space-y-6">
      <ReportTypeSelector value={reportConfig.type} onChange={...} />
      <DateRangePicker value={reportConfig.dateRange} onChange={...} />
      <MetricSelector value={reportConfig.metrics} onChange={...} />
      <FilterBuilder filters={reportConfig.filters} onChange={...} />
      
      <Button onClick={handleGenerate}>Generate Report</Button>

      {reportData && (
        <div className="space-y-4">
          <ReportVisualization data={reportData} config={reportConfig} />
          <ReportExportButtons 
            onExportPDF={() => exportToPDF(reportData)}
            onExportExcel={() => exportToExcel(reportData)}
            onSchedule={() => scheduleReport(reportConfig)}
          />
        </div>
      )}
    </div>
  );
};
```

**Report Types:**
- Labor cost report
- Employee utilization report
- Shift coverage report
- Attendance report
- Overtime report
- Payroll export

**Files to Create:**
- `src/components/Reports/ReportBuilder.tsx`
- `src/components/Reports/ReportVisualization.tsx`
- `src/services/report.service.ts`
- `src/utils/pdf-export.ts`
- `src/utils/excel-export.ts`

---

### Task 7: Integration & Testing (4 hours)

**Testing Checklist:**
- [ ] Analytics load in <3s
- [ ] Time tracking accurate to the minute
- [ ] Reports generate successfully
- [ ] Export formats valid (PDF, Excel)
- [ ] GPS location capture works
- [ ] Approval workflow functions
- [ ] Mobile time clock works
- [ ] 211+ tests passing

**Files to Create:**
- `src/services/analytics.service.test.ts`
- `src/services/time-tracking.service.test.ts`
- `src/components/Analytics/Analytics.test.tsx`

---

### Task 8: Documentation (2 hours)

**Documents to Create:**

1. **ANALYTICS_GUIDE.md** - How to use analytics dashboard
2. **TIME_TRACKING_GUIDE.md** - Clock in/out procedures
3. **REPORTING_GUIDE.md** - Creating custom reports

**Files to Create:**
- `docs/ANALYTICS_GUIDE.md`
- `docs/TIME_TRACKING_GUIDE.md`
- `docs/REPORTING_GUIDE.md`

---

## 📊 Time Estimates

| Task | Hours | Priority |
|------|-------|----------|
| 1. Analytics Schema | 3 | Critical |
| 2. Analytics Service | 5 | Critical |
| 3. Dashboard UI | 6 | High |
| 4. Time Tracking Schema | 3 | High |
| 5. Time Tracking UI | 6 | High |
| 6. Report Builder | 5 | Medium |
| 7. Integration & Testing | 4 | Critical |
| 8. Documentation | 2 | Medium |
| **TOTAL** | **34 hours** | **~2 weeks** |

**Buffer:** Add 20% = **41 hours total**

---

## 🎯 Success Metrics

- [ ] Dashboard loads <3s with 6 months data
- [ ] Time tracking 99%+ accurate
- [ ] Reports generate <10s
- [ ] 90%+ managers use analytics weekly
- [ ] Identify 30%+ cost savings opportunities

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 7 - Analytics & Reporting  
**Estimated Completion:** Week 12 (late January 2025)
