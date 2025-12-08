# Workload and Demand Management

## Overview

ScaleFlow now includes comprehensive workload tracking and demand forecasting capabilities to help businesses optimize staffing levels and plan capacity effectively.

## Features

### 1. Workload Management

Track daily capacity, utilization, and staffing levels across your organization.

#### Key Metrics

- **Planned Capacity**: Total available hours for the day
- **Scheduled Hours**: Hours covered by scheduled shifts
- **Utilization Rate**: Percentage of capacity that is scheduled (auto-calculated)
- **Staff Counts**: Required vs scheduled staff levels
- **Staffing Gap**: Difference between required and scheduled staff (auto-calculated)

#### Access

- **Path**: `/workload`
- **Roles**: Manager, Schedule Manager, Operator
- **Tables**: `workload_metrics`, `workload_templates`

#### Features

1. **Daily Metrics View**
   - View capacity and staffing for each day
   - Color-coded utilization indicators
   - Staffing gap highlights (understaffed/overstaffed)
   - Historical data tracking

2. **Workload Templates**
   - Create reusable capacity patterns
   - Apply templates to multiple dates
   - Define patterns by day of week and month
   - Quick capacity planning

3. **Summary Statistics**
   - Average utilization across periods
   - Total scheduled vs planned hours
   - Days understaffed/overstaffed
   - At-a-glance performance metrics

4. **Automatic Updates**
   - Workload metrics automatically update when shifts are created/modified
   - Real-time capacity tracking
   - No manual data entry required

### 2. Demand Forecasting

Predict staffing needs based on historical data and business factors.

#### Key Metrics

- **Predicted Hours**: Expected workload demand
- **Predicted Staff**: Number of staff needed
- **Confidence Level**: Accuracy score (0-100%)
- **Priority Levels**: Low, Medium, High, Critical
- **Special Events**: Holidays, weekends, custom events

#### Access

- **Path**: `/demand-forecast`
- **Roles**: Manager, Schedule Manager
- **Tables**: `demand_forecasts`

#### Features

1. **Automatic Forecast Generation**
   - Click "Generate Forecasts" to create predictions for upcoming 14 days
   - Based on 30-day historical average
   - Accounts for weekend patterns (70% of weekday demand)
   - Confidence scoring based on data quality

2. **Forecast Management**
   - View all upcoming forecasts (30 days)
   - Edit predictions manually
   - Set priority levels for critical days
   - Add notes and recommendations

3. **Priority Alerts**
   - High-priority days highlighted
   - Critical staffing shortages flagged
   - Weekend and holiday detection
   - Actionable recommendations

4. **Forecast Accuracy**
   - Compare predictions with actual results
   - Track forecast accuracy over time
   - Improve predictions based on feedback
   - Variance analysis

## Database Schema

### workload_metrics

```sql
CREATE TABLE workload_metrics (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  date DATE NOT NULL,
  department TEXT,
  planned_capacity_hours DECIMAL(10, 2) NOT NULL,
  scheduled_hours DECIMAL(10, 2) NOT NULL,
  actual_hours DECIMAL(10, 2),
  required_staff_count INTEGER NOT NULL,
  scheduled_staff_count INTEGER NOT NULL,
  actual_staff_count INTEGER,
  utilization_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN planned_capacity_hours > 0
    THEN (scheduled_hours / planned_capacity_hours * 100)
    ELSE 0 END
  ) STORED,
  staffing_gap INTEGER GENERATED ALWAYS AS (
    required_staff_count - scheduled_staff_count
  ) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, date, department)
);
```

### demand_forecasts

```sql
CREATE TABLE demand_forecasts (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  forecast_date DATE NOT NULL,
  department TEXT,
  predicted_demand_hours DECIMAL(10, 2) NOT NULL,
  predicted_staff_count INTEGER NOT NULL,
  confidence_level DECIMAL(5, 2) DEFAULT 0.5,
  is_holiday BOOLEAN DEFAULT false,
  is_weekend BOOLEAN DEFAULT false,
  special_event TEXT,
  historical_average DECIMAL(10, 2),
  expected_volume DECIMAL(10, 2),
  expected_revenue DECIMAL(12, 2),
  recommended_action TEXT,
  recommendation_priority TEXT CHECK (
    recommendation_priority IN ('low', 'medium', 'high', 'critical')
  ),
  forecast_method TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  UNIQUE(company_id, forecast_date, department)
);
```

### workload_templates

```sql
CREATE TABLE workload_templates (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  template_capacity_hours DECIMAL(10, 2) NOT NULL,
  template_staff_count INTEGER NOT NULL,
  applies_to_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  applies_to_months INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  UNIQUE(company_id, name)
);
```

## API Functions

### Workload API (`src/api/workload.ts`)

```typescript
// Get workload metrics for a date range
getWorkloadMetrics(companyId, startDate, endDate, department?)

// Get metrics for a specific date
getWorkloadMetricByDate(companyId, date, department?)

// Create or update metrics
upsertWorkloadMetric(metric)

// Delete metrics
deleteWorkloadMetric(id)

// Get summary statistics
getWorkloadSummary(companyId, startDate, endDate)

// Template management
getWorkloadTemplates(companyId)
getActiveWorkloadTemplates(companyId)
createWorkloadTemplate(template)
updateWorkloadTemplate(id, updates)
deleteWorkloadTemplate(id)
applyWorkloadTemplate(templateId, dates)
```

### Demand API (`src/api/demand.ts`)

```typescript
// Get forecasts for a date range
getDemandForecasts(companyId, startDate, endDate, department?)

// Get forecast for specific date
getDemandForecastByDate(companyId, date, department?)

// Create or update forecast
upsertDemandForecast(forecast)

// Delete forecast
deleteDemandForecast(id)

// Get high priority forecasts
getHighPriorityForecasts(companyId, startDate, endDate)

// Generate automatic forecasts
generateAutoForecasts(companyId, daysAhead?)

// Calculate historical average
calculateHistoricalAverage(companyId, department?, daysBack?)

// Get summary statistics
getDemandForecastSummary(companyId, startDate, endDate)

// Compare forecast with actual
compareForecastWithActual(companyId, date, department?)

// Bulk update priorities
updateForecastPriorities(companyId, updates)
```

## Usage Examples

### 1. View Workload Metrics

```typescript
import { getWorkloadMetrics, getWorkloadSummary } from '@/api/workload';

// Get metrics for this week
const metrics = await getWorkloadMetrics(companyId, '2024-12-08', '2024-12-14');

// Get summary statistics
const summary = await getWorkloadSummary(companyId, '2024-12-08', '2024-12-14');

console.log(`Average utilization: ${summary.avgUtilization}%`);
console.log(`Days understaffed: ${summary.daysUnderStaffed}`);
```

### 2. Generate Demand Forecasts

```typescript
import { generateAutoForecasts, getDemandForecasts } from '@/api/demand';

// Generate forecasts for next 2 weeks
const count = await generateAutoForecasts(companyId, 14);
console.log(`Generated ${count} forecasts`);

// Fetch the forecasts
const forecasts = await getDemandForecasts(companyId, '2024-12-09', '2024-12-22');
```

### 3. Create Workload Template

```typescript
import { createWorkloadTemplate, applyWorkloadTemplate } from '@/api/workload';

// Create a template for typical weekdays
const template = await createWorkloadTemplate({
  company_id: companyId,
  name: 'Standard Weekday',
  description: 'Typical Monday-Friday capacity',
  department: 'General',
  template_capacity_hours: 80, // 10 staff × 8 hours
  template_staff_count: 10,
  applies_to_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  applies_to_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  is_active: true,
  created_by: userId,
});

// Apply template to specific dates
await applyWorkloadTemplate(template.id, ['2024-12-09', '2024-12-10', '2024-12-11']);
```

### 4. Check Forecast Accuracy

```typescript
import { compareForecastWithActual } from '@/api/demand';

// Compare forecast with actual workload
const comparison = await compareForecastWithActual(companyId, '2024-12-08');

if (comparison.variance) {
  console.log(`Hours variance: ${comparison.variance.hours_variance}`);
  console.log(`Staff variance: ${comparison.variance.staff_variance}`);
  console.log(`Accuracy: ${comparison.variance.accuracy_percentage}%`);
}
```

## Automated Features

### 1. Automatic Workload Updates

Workload metrics are automatically updated when shifts are created, modified, or deleted via a database trigger:

```sql
CREATE TRIGGER trigger_update_workload_on_shift_change
  AFTER INSERT OR UPDATE OR DELETE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workload_metrics_from_shifts();
```

This ensures workload data is always accurate without manual intervention.

### 2. Historical Average Calculation

The system automatically calculates historical averages for forecasting:

```sql
SELECT public.calculate_historical_average(
  company_id,
  'General',
  30  -- Look back 30 days
);
```

### 3. Auto-Forecast Generation

Generate forecasts for upcoming dates with one function call:

```sql
SELECT public.generate_auto_forecasts(
  company_id,
  14  -- Generate for next 14 days
);
```

## Permissions

### Workload Management

- **View**: Manager, Schedule Manager, Operator
- **Edit**: Manager, Schedule Manager
- **Templates**: Manager, Schedule Manager

### Demand Forecasting

- **View**: Manager, Schedule Manager, Operator
- **Edit**: Manager, Schedule Manager
- **Generate**: Manager, Schedule Manager

All permissions are enforced via RLS policies at the database level.

## Best Practices

### 1. Workload Planning

1. **Set Realistic Capacity**: Define planned capacity based on actual available hours
2. **Use Templates**: Create templates for recurring patterns (weekdays, weekends, holidays)
3. **Monitor Utilization**: Aim for 80-90% utilization (not too low, not overbooked)
4. **Review Gaps**: Address understaffing issues before they become critical
5. **Track Actuals**: Record actual hours worked for better future planning

### 2. Demand Forecasting

1. **Generate Regularly**: Run auto-forecasts weekly for the next 2-4 weeks
2. **Adjust Manually**: Override predictions for known events (holidays, promotions)
3. **Set Priorities**: Mark high-demand days as high or critical priority
4. **Review Accuracy**: Compare forecasts with actual results monthly
5. **Refine Method**: Improve forecasting by adjusting for seasonal patterns

### 3. Integration with Scheduling

1. **Check Forecasts First**: Review demand forecasts before creating schedules
2. **Address Gaps**: Use workload metrics to identify and fix staffing gaps
3. **Optimize Utilization**: Aim to schedule near predicted demand
4. **Balance Workload**: Distribute capacity evenly across team members
5. **Plan Ahead**: Use 2-week rolling forecasts for proactive scheduling

## Troubleshooting

### Workload Metrics Not Updating

**Issue**: Metrics don't reflect recent shift changes

**Solutions**:

1. Check if trigger is enabled: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_workload_on_shift_change'`
2. Verify shifts exist: `SELECT COUNT(*) FROM shifts WHERE company_id = 'your-company-id'`
3. Check for errors in logs
4. Manually upsert metrics if needed

### Forecasts Inaccurate

**Issue**: Predictions don't match actual demand

**Solutions**:

1. Increase historical period: Use 60-90 days instead of 30
2. Account for seasonality: Create separate forecasts for different seasons
3. Manual adjustments: Override automatic forecasts for special events
4. Update method: Enhance the forecast algorithm with more factors
5. Track variance: Monitor accuracy and adjust confidence levels

### Low Confidence Scores

**Issue**: Forecasts have low confidence levels (<50%)

**Causes**:

1. Insufficient historical data (less than 30 days)
2. High variance in historical patterns
3. Seasonal changes not accounted for
4. Special events skewing averages

**Solutions**:

1. Wait for more historical data to accumulate
2. Create separate forecasts for different patterns
3. Manually set confidence for known-accurate forecasts
4. Filter outliers from historical averages

## Future Enhancements

### Planned Features

1. **AI/ML Forecasting**
   - Machine learning models for prediction
   - Pattern recognition for seasonal trends
   - Anomaly detection for unusual demand

2. **Advanced Analytics**
   - Interactive charts and visualizations
   - Trend analysis over time
   - Comparative metrics (week-over-week, year-over-year)

3. **Integration Features**
   - Export to external systems
   - Import demand from business systems
   - API webhooks for real-time updates

4. **Optimization Tools**
   - Automatic schedule suggestions
   - Cost optimization recommendations
   - Load balancing across departments

5. **Mobile Access**
   - Mobile-responsive views
   - Push notifications for critical alerts
   - Quick actions for on-the-go managers

## Related Documentation

- [API Guidelines](./API_GUIDELINES.md)
- [Database Schema](./DATABASE.md)
- [Routing Architecture](./ROUTING_AND_DATABASE_ARCHITECTURE.md)
- [Permission System](./PERMISSION_SYSTEM_USAGE.md)

---

**Last Updated**: 2024-12-08  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
