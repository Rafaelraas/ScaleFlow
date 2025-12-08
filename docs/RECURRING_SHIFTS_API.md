# Recurring Shifts API Documentation

## Overview

ScaleFlow supports recurring shifts using the iCalendar RFC 5545 recurrence rule standard. This allows managers to create shift patterns that automatically repeat on a schedule.

## Database Schema

### New Fields in `shifts` Table

| Field                        | Type    | Description                                                     |
| ---------------------------- | ------- | --------------------------------------------------------------- |
| `is_recurring`               | BOOLEAN | Flag indicating if this shift is part of a recurring series     |
| `recurrence_rule`            | TEXT    | iCalendar RFC 5545 recurrence rule string                       |
| `recurrence_parent_id`       | UUID    | Reference to the parent shift (NULL for parent/template shifts) |
| `recurrence_exception_dates` | JSONB   | Array of ISO 8601 date strings for dates to skip                |

### Indexes

- `idx_shifts_recurrence_parent`: Index on `recurrence_parent_id` for efficient queries
- `idx_shifts_is_recurring`: Index on `is_recurring` flag

### Constraints

- `check_recurring_has_rule`: Ensures recurring shifts have a recurrence rule
- `check_no_self_reference`: Prevents shifts from referencing themselves
- `check_exception_dates_is_array`: Validates exception dates are stored as JSON array

## TypeScript Types

```typescript
// Recurrence frequency
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

// Day of week (iCalendar format)
export type WeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

// Recurrence rule object
export interface RecurrenceRule {
  freq: RecurrenceFrequency;
  interval: number; // 1 = every period, 2 = every 2 periods, etc.
  byDay?: WeekDay[]; // For weekly: ['MO', 'WE', 'FR']
  until?: string; // End date (ISO 8601)
  count?: number; // Or number of occurrences
}

// Shift interface with recurring fields
export interface Shift {
  id: string;
  company_id: string;
  employee_id: string | null;
  role_id: string | null;
  start_time: string;
  end_time: string;
  notes: string | null;
  published: boolean;
  created_at: string;
  // Recurring shift fields
  is_recurring?: boolean;
  recurrence_rule?: string | null;
  recurrence_parent_id?: string | null;
  recurrence_exception_dates?: string[] | null;
}
```

## Recurrence Rule Format

### iCalendar RFC 5545 Format

Recurrence rules follow the iCalendar standard format:

```
FREQ=<frequency>;INTERVAL=<interval>[;BYDAY=<days>][;UNTIL=<date>|COUNT=<count>]
```

### Examples

#### Weekly on Monday, Wednesday, Friday

```
FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;UNTIL=20241231T235959Z
```

#### Bi-weekly on Tuesday and Thursday

```
FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,TH;UNTIL=20250630T235959Z
```

#### Daily for 30 occurrences

```
FREQ=DAILY;INTERVAL=1;COUNT=30
```

#### Monthly on the first Monday

```
FREQ=MONTHLY;INTERVAL=1;COUNT=12
```

### Parameters

- **FREQ**: Required. One of DAILY, WEEKLY, MONTHLY
- **INTERVAL**: Required. Positive integer (1 = every period, 2 = every 2 periods)
- **BYDAY**: Optional. Comma-separated list of weekday codes (MO, TU, WE, TH, FR, SA, SU)
- **UNTIL**: Optional. End date in ISO 8601 format with timezone
- **COUNT**: Optional. Number of occurrences (mutually exclusive with UNTIL)

## Usage Examples

### Creating a Recurring Shift

```typescript
// Parent shift (template) with recurrence rule
const recurringShift = {
  company_id: 'company-uuid',
  employee_id: 'employee-uuid',
  start_time: '2024-01-01T09:00:00Z',
  end_time: '2024-01-01T17:00:00Z',
  notes: 'Morning shift - Monday, Wednesday, Friday',
  published: true,
  is_recurring: true,
  recurrence_rule: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;UNTIL=20240331T235959Z',
  recurrence_exception_dates: ['2024-01-01', '2024-02-14'], // Skip New Year's and Valentine's Day
};

const { data, error } = await supabase.from('shifts').insert(recurringShift).select().single();
```

### Querying Recurring Shifts

```typescript
// Get all parent recurring shifts for a company
const { data: parentShifts } = await supabase
  .from('shifts')
  .select('*')
  .eq('company_id', companyId)
  .eq('is_recurring', true)
  .is('recurrence_parent_id', null);

// Get all instances of a recurring shift
const { data: instances } = await supabase
  .from('shifts')
  .select('*')
  .eq('recurrence_parent_id', parentShiftId);
```

### Updating Recurring Shifts

#### Update Single Instance

```typescript
// Update only one occurrence
await supabase.from('shifts').update({ notes: 'Updated notes' }).eq('id', instanceId);
```

#### Update All Future Instances

```typescript
// Update parent shift to affect all future generated instances
await supabase
  .from('shifts')
  .update({
    employee_id: newEmployeeId,
    notes: 'Reassigned employee',
  })
  .eq('id', parentShiftId);
```

### Deleting Recurring Shifts

#### Delete Single Instance

```typescript
// Delete one occurrence
await supabase.from('shifts').delete().eq('id', instanceId);
```

#### Delete All Occurrences

```typescript
// Delete parent shift (CASCADE will delete all instances)
await supabase.from('shifts').delete().eq('id', parentShiftId);
```

## Exception Handling

Exception dates allow skipping specific dates in a recurring series (e.g., holidays).

### Format

Exception dates are stored as an array of ISO 8601 date strings (YYYY-MM-DD):

```json
["2024-01-01", "2024-07-04", "2024-12-25"]
```

### Adding Exceptions

```typescript
const { data } = await supabase
  .from('shifts')
  .update({
    recurrence_exception_dates: ['2024-01-01', '2024-12-25'],
  })
  .eq('id', parentShiftId);
```

## Best Practices

### Performance

1. **Index Usage**: Queries on `recurrence_parent_id` and `is_recurring` are optimized with indexes
2. **Batch Generation**: Generate shift instances in batches to avoid timeout issues
3. **Lazy Loading**: Generate instances as needed rather than all at once

### Data Integrity

1. **Parent Shifts**: Always maintain the parent shift as the source of truth
2. **Cascading Deletes**: Deleting a parent shift will automatically delete all instances
3. **Validation**: Ensure recurrence rules are valid before saving

### User Experience

1. **Preview**: Show users a preview of generated dates before creating
2. **Conflict Detection**: Check for scheduling conflicts before generating instances
3. **Exception Management**: Provide UI for adding/removing exception dates

## Security

All recurring shifts inherit the same Row Level Security (RLS) policies as regular shifts:

- Users can only view shifts for their company
- Managers can create/update/delete shifts
- Employees can only view published shifts

## Migration

To add recurring shift support to an existing database:

```bash
# Run the migration
psql -h your-db-host -U your-user -d your-database -f supabase/migrations/20241208000001_add_recurring_shifts.sql
```

## Future Enhancements

Planned features for recurring shifts:

1. **Advanced Patterns**: Support for monthly patterns (e.g., "second Tuesday of each month")
2. **Timezone Support**: Handle DST transitions and timezone changes
3. **Conflict Resolution**: Automatic conflict resolution during generation
4. **Bulk Operations**: Update multiple recurring series at once
5. **Calendar Export**: Export recurring shifts to iCalendar format

## References

- [iCalendar RFC 5545](https://tools.ietf.org/html/rfc5545)
- [Recurrence Rule Specification](https://icalendar.org/iCalendar-RFC-5545/3-3-10-recurrence-rule.html)

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2024  
**Sprint:** 5 - Task 7
