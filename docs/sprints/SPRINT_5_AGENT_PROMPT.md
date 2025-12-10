# Sprint 5 Agent Prompt: Advanced Features & Polish

## 🎯 Mission Brief

You are an expert full-stack developer tasked with implementing Sprint 5 for ScaleFlow. Your mission is to add **Interactive Calendar View** and **Recurring Shifts** features to transform the scheduling experience.

**Sprint Goals:**

1. ✅ Interactive calendar with month/week/day views
2. ✅ Drag-and-drop shift management
3. ✅ Recurring shifts with bulk generation
4. ✅ Mobile responsive design
5. ✅ Comprehensive testing and documentation

**Expected Timeline:** 55-66 hours (~3 weeks)

---

## 📋 Context

### Sprint Status

- **Sprint 1:** ✅ Code quality & foundation
- **Sprint 2:** ✅ Performance optimization (lazy loading, bundle monitoring)
- **Sprint 3:** ✅ Dependencies & stability
- **Sprint 4:** ✅ Developer experience (feature flags, monitoring)
- **Sprint 5:** 🎯 YOU ARE HERE

### Current State

- 166 tests passing
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase backend
- All previous sprints complete

### Why This Sprint Matters

- **#1 Most Requested Feature:** Calendar view
- **High Impact:** 50% reduction in scheduling time
- **User Adoption:** Expected 90%+ usage
- **Automation:** Recurring shifts save hours of manual work

---

## 🎯 Success Criteria

Sprint 5 is **COMPLETE** when:

### Core Features ✅

- [ ] Calendar displays shifts in month/week/day views
- [ ] Drag-and-drop to create/move shifts
- [ ] Color-coded shifts (by employee/status)
- [ ] Quick shift creation modal
- [ ] Recurring shift configuration UI
- [ ] Bulk shift generation (6-month schedules in <5 min)
- [ ] Exception handling for holidays

### Quality ✅

- [ ] 186+ tests passing (add 20+ new tests)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build succeeds (<10s)
- [ ] Lint passes
- [ ] CodeQL security scan clean

### Performance ✅

- [ ] Calendar loads 200 shifts in <2s
- [ ] Drag-and-drop response <500ms
- [ ] Bundle size increase <200KB
- [ ] Mobile responsive and performant

### Documentation ✅

- [ ] CALENDAR_VIEW.md user guide
- [ ] RECURRING_SHIFTS.md user guide
- [ ] API documentation updated
- [ ] README updated with new features

---

## 📦 Task List (Priority Order)

### Phase 1: Calendar Foundation (Day 1-3)

#### ✅ Task 1: Calendar Library Selection (4h)

**Priority:** CRITICAL - Everything depends on this

```bash
# Research and decide on calendar library
# Options: React Big Calendar vs FullCalendar vs Custom

# Decision criteria:
- Bundle size (<100KB ideal)
- TypeScript support (required)
- Drag-and-drop (required)
- Mobile responsive (required)
- Active maintenance (required)
- MIT license (preferred)

# Action items:
1. Research both options
2. Create comparison doc
3. Test both with sample data
4. Make decision
5. Install chosen library
6. Create basic Calendar component
```

**Files to create:**

- `docs/CALENDAR_LIBRARY_DECISION.md`
- `src/components/Calendar/Calendar.tsx`
- `src/components/Calendar/CalendarView.tsx`

**Testing:**

```bash
npm install [chosen-library]
npm test
npm run build  # Check bundle size
```

---

#### ✅ Task 2: Calendar View Modes (6h)

**Priority:** HIGH

```bash
# Implement three calendar views

# Month View: Full month grid
# Week View: 7-day detailed view
# Day View: Hourly breakdown
```

**Implementation:**

```typescript
// src/components/Calendar/MonthView.tsx
export const MonthView = () => {
  // Render full month grid
  // Show shifts in date cells
  // Handle overflow with "more" button
};

// src/components/Calendar/WeekView.tsx
export const WeekView = () => {
  // Render 7-day week
  // Hourly time slots
  // Multiple shifts per slot
};

// src/components/Calendar/DayView.tsx
export const DayView = () => {
  // Render single day
  // Hour-by-hour breakdown
  // Detailed shift information
};

// View switcher
// src/components/Calendar/ViewToggle.tsx
export const ViewToggle = () => {
  // Buttons: Month | Week | Day
  // Save preference to localStorage
};
```

**Files to create:**

- `src/components/Calendar/MonthView.tsx`
- `src/components/Calendar/WeekView.tsx`
- `src/components/Calendar/DayView.tsx`
- `src/components/Calendar/ViewToggle.tsx`
- `src/hooks/useCalendarView.ts`

**Testing:**

```bash
# After implementation
npm test  # Run unit tests
npm run dev  # Manual test all views
# Test view switching
# Test preference persistence
```

---

#### ✅ Task 3: Shift Display & Colors (4h)

**Priority:** HIGH

```bash
# Color-code shifts for easy identification
```

**Color scheme:**

```typescript
// src/lib/calendar-colors.ts

const SHIFT_STATUS_COLORS = {
  draft: '#94a3b8', // Gray
  published: '#3b82f6', // Blue
  completed: '#22c55e', // Green
  cancelled: '#ef4444', // Red
};

// Generate unique colors per employee
export function getEmployeeColor(employeeId: string): string {
  // Hash employeeId to consistent color
  // Ensure good contrast for accessibility
}

// Check WCAG AA compliance
export function isAccessibleContrast(fg: string, bg: string): boolean {
  // Return true if contrast ratio >= 4.5:1
}
```

**Features:**

- Shift cards with color borders/backgrounds
- Tooltips on hover (employee, time, status)
- Visual indicators (icons for status)
- Color legend
- Overlapping shift handling

**Files to create:**

- `src/lib/calendar-colors.ts`
- `src/lib/calendar-colors.test.ts`
- `src/components/Calendar/ShiftCard.tsx`
- `src/components/Calendar/ShiftTooltip.tsx`
- `src/components/Calendar/ColorLegend.tsx`

---

### Phase 2: Interactivity (Day 4-7)

#### ✅ Task 4: Drag-and-Drop (8h)

**Priority:** CRITICAL

```bash
# Implement smooth drag-and-drop for shifts
```

**Features:**

- Create: Click empty slot → open modal
- Move: Drag shift to new time/date
- Resize: Drag edges to adjust duration
- Copy: Ctrl+Drag to duplicate
- Optimistic updates (instant feedback)
- Conflict detection
- Undo/redo last 5 operations
- Mobile touch support

**Implementation:**

```typescript
// src/hooks/useShiftDragDrop.ts
export const useShiftDragDrop = () => {
  const handleDragStart = (shift: Shift) => {
    // Store dragging shift
  };

  const handleDragOver = (date: Date) => {
    // Show drop target highlight
  };

  const handleDrop = async (shift: Shift, newDate: Date) => {
    // Optimistic update
    // Check for conflicts
    // Save to database
    // Roll back on error
  };

  const handleUndo = () => {
    // Revert last change
  };

  return { handleDragStart, handleDragOver, handleDrop, handleUndo };
};
```

**Conflict Detection:**

```typescript
// src/lib/shift-conflicts.ts
export function detectConflicts(shift: Shift, existingShifts: Shift[]): Conflict[] {
  // Check for:
  // - Employee double-booked
  // - Insufficient rest period
  // - Overtime violations
  // - Skill requirements not met
}
```

**Files to create:**

- `src/components/Calendar/DragDropProvider.tsx`
- `src/hooks/useShiftDragDrop.ts`
- `src/lib/shift-conflicts.ts`
- `src/lib/shift-conflicts.test.ts`
- `src/components/Calendar/ConflictDialog.tsx`

**Testing:**

```bash
npm test
# Manual testing:
# - Drag shift to new day
# - Drag to same employee
# - Drag to different employee (should warn)
# - Test undo
# - Test on mobile (touch)
```

---

#### ✅ Task 5: Quick Shift Creation (3h)

**Priority:** MEDIUM

```bash
# Modal for rapid shift creation
```

**Modal Features:**

- Opens on calendar slot click
- Pre-filled date/time
- Employee dropdown (with search)
- Duration picker
- Break duration (optional)
- Notes (optional)
- Keyboard shortcuts (Esc to cancel, Enter to submit)

**Files to create:**

- `src/components/Calendar/QuickShiftModal.tsx`
- `src/components/Calendar/EmployeeSelect.tsx`
- `src/hooks/useQuickShiftCreate.ts`

---

#### ✅ Task 6: Calendar Navigation (3h)

**Priority:** HIGH

```bash
# Add intuitive navigation controls
```

**Features:**

- Previous/Next buttons
- Today button
- Date picker for specific date
- Keyboard shortcuts (arrows, Home, End)
- Timezone handling
- Print-friendly layout

**Files to create:**

- `src/components/Calendar/CalendarHeader.tsx`
- `src/components/Calendar/DatePicker.tsx`
- `src/hooks/useCalendarNavigation.ts`
- `src/styles/calendar-print.css`

---

### Phase 3: Recurring Shifts (Day 8-12)

#### ✅ Task 7: Database Schema (2h)

**Priority:** CRITICAL

```sql
-- supabase/migrations/YYYYMMDD_add_recurring_shifts.sql

ALTER TABLE shifts ADD COLUMN recurrence_rule TEXT;
ALTER TABLE shifts ADD COLUMN recurrence_parent_id UUID REFERENCES shifts(id);
ALTER TABLE shifts ADD COLUMN recurrence_exception_dates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE shifts ADD COLUMN is_recurring BOOLEAN DEFAULT false;

CREATE INDEX idx_shifts_recurrence_parent
  ON shifts(recurrence_parent_id)
  WHERE recurrence_parent_id IS NOT NULL;

-- No changes to RLS policies needed
```

**Recurrence Rule Format (RFC 5545):**

```
FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;UNTIL=20250331T235959Z
```

**Files to create/update:**

- `supabase/migrations/[timestamp]_add_recurring_shifts.sql`
- `src/types/shifts.ts` (add recurrence fields)
- `src/api/schedules.ts` (update types)

---

#### ✅ Task 8: Recurrence Parser (4h)

**Priority:** HIGH

```bash
# Parse and generate recurring shift dates
```

**Implementation:**

```typescript
// src/lib/recurrence-parser.ts

export interface RecurrenceRule {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number; // 1, 2, 3...
  byDay?: string[]; // ['MO', 'WE', 'FR']
  until?: string; // ISO 8601 end date
  count?: number; // Number of occurrences
}

export function parseRecurrenceRule(rule: string): RecurrenceRule {
  // Parse iCalendar format string
}

export function generateOccurrences(rule: RecurrenceRule, startDate: Date, count: number): Date[] {
  // Generate next N occurrence dates
  // Handle DST transitions
  // Handle leap years
  // Apply timezone
}

export function applyExceptions(dates: Date[], exceptions: Date[]): Date[] {
  // Remove exception dates (holidays, etc.)
}
```

**Edge Cases:**

- Daylight Saving Time
- Leap years (Feb 29)
- Month-end dates (Jan 31 → Feb 28/29)
- Timezone conversions

**Files to create:**

- `src/lib/recurrence-parser.ts`
- `src/lib/recurrence-parser.test.ts` (COMPREHENSIVE tests!)

---

#### ✅ Task 9: Recurring Shift UI (5h)

**Priority:** HIGH

```bash
# User interface for configuring recurring shifts
```

**UI Components:**

- "Make Recurring" toggle on shift form
- Frequency selector (daily/weekly/monthly)
- Interval input (every N periods)
- Day selector (weekly: M T W T F S S)
- End condition (date or count)
- Exception date manager
- Preview (next 10 occurrences)

**Edit/Delete Modes:**

1. **This occurrence** - Single instance
2. **This and future** - From this date forward
3. **All occurrences** - Entire series

**Files to create:**

- `src/components/Shifts/RecurrencePanel.tsx`
- `src/components/Shifts/RecurrencePreview.tsx`
- `src/components/Shifts/EditRecurringModal.tsx`
- `src/hooks/useRecurringShift.ts`

---

#### ✅ Task 10: Bulk Generation (4h)

**Priority:** HIGH

```bash
# Generate hundreds of shifts from recurrence rule
```

**API Endpoint:**

```typescript
// src/api/recurring-shifts.ts

export async function generateRecurringShifts(
  shiftTemplate: ShiftData,
  recurrenceRule: RecurrenceRule,
  generateUntil: Date,
  skipConflicts: boolean = true
): Promise<{
  generated: number;
  skipped: number;
  conflicts: ShiftConflict[];
  shiftIds: string[];
}> {
  // 1. Parse recurrence rule
  // 2. Generate all dates
  // 3. Apply exceptions
  // 4. Check conflicts
  // 5. Create shifts in transaction
  // 6. Return summary
}
```

**Performance:**

- Generate 100 shifts in <5 seconds
- Use database transactions (all-or-nothing)
- Show progress during generation
- Detailed report after completion

**Files to create:**

- `src/api/recurring-shifts.ts`
- `src/components/Shifts/GenerationReport.tsx`

---

#### ✅ Task 11: Exception Handling (3h)

**Priority:** MEDIUM

```bash
# Handle holidays and special exceptions
```

**Features:**

- Add single date exceptions
- Import holiday calendar (JSON)
- Skip or reschedule on exceptions
- Visual indicators
- Exception management UI

**Files to create:**

- `src/components/Shifts/ExceptionManager.tsx`
- `src/lib/holiday-calendar.ts`
- `src/data/holidays.json` (US holidays)

---

### Phase 4: Integration & Polish (Day 13-15)

#### ✅ Task 12: Integration & Testing (6h)

**Priority:** CRITICAL

```bash
# Bring it all together and test thoroughly
```

**Integration:**

- Add calendar/list toggle to Schedules page
- Ensure views stay in sync
- Add loading states
- Error handling
- Performance optimization

**Testing Checklist:**

```bash
# Unit Tests
npm test  # All 186+ tests must pass

# Integration Tests
- Calendar loads shifts correctly
- Drag-and-drop updates database
- Recurring shifts generate correctly
- Exception dates are respected

# Manual Testing
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Android Chrome
- Tablet: iPad, Android tablet

# Performance
- Load 200 shifts: <2s
- Load 500 shifts: <5s
- Drag response: <500ms
- Generate 100 recurring shifts: <5s

# Accessibility
- Keyboard navigation works
- Screen reader compatible
- Color contrast WCAG AA
- Focus indicators visible
```

**Files to create/update:**

- `src/pages/Schedules.tsx` (add calendar toggle)
- `src/components/Calendar/Calendar.test.tsx`
- `src/components/Shifts/RecurringShift.test.ts`
- `src/hooks/useCalendar.test.ts`

---

#### ✅ Task 13: Documentation (3h)

**Priority:** MEDIUM

```bash
# Write comprehensive guides
```

**Documents to create:**

1. **CALENDAR_VIEW.md** - User guide
   - Overview
   - Navigation
   - Drag-and-drop
   - Keyboard shortcuts
   - Mobile tips
   - Troubleshooting

2. **RECURRING_SHIFTS.md** - User guide
   - What are recurring shifts
   - How to create
   - Edit options
   - Exceptions
   - Best practices
   - Examples

3. **API_RECURRING_SHIFTS.md** - Developer guide
   - API endpoints
   - Request/response formats
   - Recurrence syntax
   - Code examples

**Files to create:**

- `docs/CALENDAR_VIEW.md`
- `docs/RECURRING_SHIFTS.md`
- `docs/API_RECURRING_SHIFTS.md`
- Update `docs/INDEX.md`
- Update `README.md`

---

## 🔧 Technical Guidelines

### Code Style

- Follow existing patterns in the codebase
- Use TypeScript strict mode
- Use Tailwind CSS for styling (NO custom CSS files)
- Use shadcn/ui components when possible
- Use centralized logger (not console statements)
- Use API functions from `src/api/` (not direct Supabase)

### Component Structure

```typescript
// Component template
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

interface MyComponentProps {
  // Props with TypeScript
}

export const MyComponent = ({ ...props }: MyComponentProps) => {
  // Hooks
  // Logic
  // Return JSX
};
```

### Testing

```typescript
// Test template
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });
});
```

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Do This

- Edit shadcn/ui components in `src/components/ui/`
- Use `any` type in TypeScript
- Skip testing after changes
- Use console.log (use logger)
- Call Supabase directly (use API functions)
- Forget mobile testing
- Ignore accessibility
- Break existing features

### ✅ Do This

- Test frequently (after each task)
- Commit often with clear messages
- Use existing patterns
- Write tests for new code
- Check mobile responsiveness
- Test accessibility
- Report progress regularly
- Ask for help when stuck

---

## 📊 Progress Tracking

Use this template when reporting progress:

```markdown
## Sprint 5 Progress - [Date]

### Completed ✅

- [x] Task 1: Calendar library selected (React Big Calendar)
- [x] Task 2: Month/week/day views implemented
- [x] Task 3: Shift colors and tooltips

### In Progress 🔄

- [ ] Task 4: Drag-and-drop (60% complete)
  - ✅ Basic drag working
  - ✅ Conflict detection
  - ⏳ Undo/redo
  - ⏳ Mobile touch

### Pending ⏸️

- [ ] Task 5: Quick shift modal
- [ ] Task 6: Calendar navigation
- [ ] Tasks 7-13: Recurring shifts

### Metrics 📊

- Tests passing: 175/175
- Bundle size: +85KB (under budget)
- Performance: Calendar loads in 1.2s (200 shifts)

### Issues 🐛

- None currently

### Next Steps 🎯

1. Complete drag-and-drop (undo/redo)
2. Test on mobile
3. Start Task 5 (quick modal)
```

---

## 🎯 Final Checklist

Before marking Sprint 5 complete:

### Features ✅

- [ ] Calendar month/week/day views working
- [ ] Drag-and-drop functional
- [ ] Color-coded shifts
- [ ] Quick shift creation
- [ ] Calendar navigation
- [ ] Recurring shift configuration
- [ ] Bulk generation working
- [ ] Exception handling

### Quality ✅

- [ ] 186+ tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build succeeds
- [ ] Lint passes
- [ ] CodeQL passes

### Performance ✅

- [ ] 200 shifts load in <2s
- [ ] Drag response <500ms
- [ ] Bundle increase <200KB

### Mobile ✅

- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Touch gestures work
- [ ] Responsive design

### Documentation ✅

- [ ] CALENDAR_VIEW.md
- [ ] RECURRING_SHIFTS.md
- [ ] API docs
- [ ] README updated

---

## 🚀 Let's Begin!

**Your first task:** Task 1 - Calendar Library Selection

1. Research React Big Calendar vs FullCalendar
2. Create comparison document
3. Test both with sample data
4. Make decision and document rationale
5. Install chosen library
6. Create basic Calendar component
7. Run tests and build

**Remember:**

- Test after each task
- Commit frequently
- Report progress
- Ask for help if stuck

**Good luck! You've got this! 🎉**

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 5 - Advanced Features & Polish  
**Estimated Timeline:** 55-66 hours (~3 weeks)
