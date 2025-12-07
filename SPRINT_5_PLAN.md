# Sprint 5: Advanced Features & Polish

**Sprint Duration:** Week 5-6 (estimated 3-4 weeks)  
**Status:** 🎯 In Progress  
**Priority:** High 🔴  
**Main Goals:**

1. Interactive Calendar View for schedule visualization
2. Recurring Shifts for automated schedule generation

---

## 📋 Executive Summary

Sprint 5 adds two highly requested features that will significantly improve the user experience and reduce manual scheduling work. The calendar view provides intuitive visual scheduling, while recurring shifts automate repetitive schedule creation.

**Expected Impact:**

- 90%+ user adoption of calendar view
- 50% reduction in weekly schedule creation time
- Enhanced visual schedule management
- Automated recurring schedule generation

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Interactive Calendar View** (P1 - Critical)
   - Visual schedule display with monthly/weekly/daily views
   - Drag-and-drop shift management
   - Color-coded shifts for easy identification
   - Mobile-responsive design

2. **Recurring Shifts** (P2 - High)
   - Weekly/bi-weekly/monthly recurrence patterns
   - Bulk shift generation
   - Exception handling for holidays
   - Preview before creating

### Success Criteria

- [ ] Calendar renders 200+ shifts performantly (<2s load time)
- [ ] Drag-and-drop shift updates save in <500ms
- [ ] All calendar views (month/week/day) functional
- [ ] Recurring shifts generate 6-month schedules in <5 minutes
- [ ] Zero recurrence calculation bugs
- [ ] 166+ tests passing (add 20+ new tests)
- [ ] Mobile responsive on all screen sizes
- [ ] Documentation complete for both features

---

## 📦 Task Breakdown

### Task 1: Calendar Library Selection & Setup (4 hours)

**Priority:** Critical  
**Blockers:** None

**Subtasks:**

1. Research calendar libraries (FullCalendar vs React Big Calendar)
2. Evaluate:
   - Bundle size impact
   - TypeScript support
   - Mobile responsiveness
   - Drag-and-drop capabilities
   - License compatibility (MIT preferred)
3. Install selected library
4. Create basic Calendar component
5. Test with sample data

**Acceptance Criteria:**

- Library selected and documented in decision log
- Basic calendar renders with existing shifts
- No TypeScript errors
- Bundle size increase <100KB

**Files to Create/Modify:**

- `src/components/Calendar/Calendar.tsx` (new)
- `src/components/Calendar/CalendarView.tsx` (new)
- `package.json` (update dependencies)
- `docs/CALENDAR_LIBRARY_DECISION.md` (new)

---

### Task 2: Calendar View Modes (6 hours)

**Priority:** High  
**Dependencies:** Task 1

**Subtasks:**

1. Implement monthly calendar view
2. Implement weekly calendar view
3. Implement daily calendar view
4. Add view switching controls
5. Persist user's view preference
6. Add responsive breakpoints

**Features:**

- Month view: Full month grid with shifts
- Week view: 7-day detailed view
- Day view: Hourly breakdown
- View toggle buttons in header
- Mobile: Auto-switch to day/week view
- localStorage for view preference

**Acceptance Criteria:**

- All 3 views render correctly
- View switching is instant (<100ms)
- Mobile displays appropriate view
- User preference persists across sessions
- Shifts display correctly in all views

**Files to Create/Modify:**

- `src/components/Calendar/MonthView.tsx` (new)
- `src/components/Calendar/WeekView.tsx` (new)
- `src/components/Calendar/DayView.tsx` (new)
- `src/components/Calendar/ViewToggle.tsx` (new)
- `src/hooks/useCalendarView.ts` (new)

---

### Task 3: Shift Display & Color Coding (4 hours)

**Priority:** High  
**Dependencies:** Task 2

**Subtasks:**

1. Design color scheme for shifts
2. Implement color coding by:
   - Employee (unique color per employee)
   - Status (draft/published/completed)
   - Department (if implemented)
3. Add shift tooltips with details
4. Handle overlapping shifts
5. Add visual indicators (icons, badges)

**Color Scheme:**

```typescript
const SHIFT_COLORS = {
  draft: '#94a3b8', // Gray
  published: '#3b82f6', // Blue
  completed: '#22c55e', // Green
  cancelled: '#ef4444', // Red
};

// Employee colors: Generate from hash of employee ID
```

**Acceptance Criteria:**

- Shifts are visually distinct
- Colors follow accessibility guidelines (WCAG AA)
- Tooltips show: employee, time, status
- Overlapping shifts are visible
- Legend shows color meanings

**Files to Create/Modify:**

- `src/lib/calendar-colors.ts` (new)
- `src/components/Calendar/ShiftCard.tsx` (new)
- `src/components/Calendar/ShiftTooltip.tsx` (new)
- `src/components/Calendar/ColorLegend.tsx` (new)

---

### Task 4: Drag-and-Drop Shift Scheduling (8 hours)

**Priority:** Critical  
**Dependencies:** Task 3

**Subtasks:**

1. Implement drag-and-drop for shift creation
2. Implement drag-and-drop for shift rescheduling
3. Add visual feedback during drag
4. Implement conflict detection
5. Add optimistic updates
6. Handle validation errors
7. Add undo/redo capability
8. Test on mobile (touch events)

**Drag Operations:**

- **Create**: Click empty slot → open modal → create shift
- **Move**: Drag shift to new time/date → update shift
- **Resize**: Drag shift edges → adjust duration
- **Copy**: Ctrl+Drag → duplicate shift

**Acceptance Criteria:**

- Drag operations are smooth (60fps)
- Conflicts show warning before save
- Optimistic updates provide instant feedback
- Failed updates roll back gracefully
- Mobile touch gestures work
- Undo last 5 operations

**Files to Create/Modify:**

- `src/components/Calendar/DragDropProvider.tsx` (new)
- `src/hooks/useShiftDragDrop.ts` (new)
- `src/lib/shift-conflicts.ts` (new)
- `src/components/Calendar/ConflictDialog.tsx` (new)

---

### Task 5: Quick Shift Creation Modal (3 hours)

**Priority:** Medium  
**Dependencies:** Task 2

**Subtasks:**

1. Create modal for quick shift creation
2. Pre-fill date/time from clicked slot
3. Add employee selection
4. Add duration picker
5. Implement form validation
6. Add keyboard shortcuts (Esc to cancel)

**Modal Fields:**

- Employee (dropdown with search)
- Start time (pre-filled)
- End time (pre-filled + duration)
- Break duration (optional)
- Notes (optional)

**Acceptance Criteria:**

- Modal opens on slot click
- Date/time pre-filled correctly
- Form validates before submission
- Shift created and appears immediately
- Keyboard accessible
- Mobile friendly

**Files to Create/Modify:**

- `src/components/Calendar/QuickShiftModal.tsx` (new)
- `src/components/Calendar/EmployeeSelect.tsx` (new)
- `src/hooks/useQuickShiftCreate.ts` (new)

---

### Task 6: Calendar Navigation & Controls (3 hours)

**Priority:** High  
**Dependencies:** Task 2

**Subtasks:**

1. Add month/week/day navigation buttons
2. Implement "Today" button
3. Add date range display
4. Add keyboard shortcuts
5. Handle timezone correctly
6. Add print-friendly layout

**Navigation:**

- Previous/Next buttons
- Today button (jump to current date)
- Date picker for specific date
- Keyboard: Arrow keys, Home, End

**Acceptance Criteria:**

- Navigation is intuitive
- Keyboard shortcuts work
- Timezone handling is correct
- Print layout is clean
- Responsive on mobile

**Files to Create/Modify:**

- `src/components/Calendar/CalendarHeader.tsx` (new)
- `src/components/Calendar/DatePicker.tsx` (new)
- `src/hooks/useCalendarNavigation.ts` (new)
- `src/styles/calendar-print.css` (new)

---

### Task 7: Recurring Shifts - Database Schema (2 hours)

**Priority:** Critical  
**Blockers:** None

**Subtasks:**

1. Design recurrence rule schema
2. Create database migration
3. Add recurrence fields to shifts table
4. Create test data
5. Update API types

**Database Changes:**

```sql
-- Migration: add recurrence support to shifts
ALTER TABLE shifts ADD COLUMN recurrence_rule TEXT;
ALTER TABLE shifts ADD COLUMN recurrence_parent_id UUID REFERENCES shifts(id);
ALTER TABLE shifts ADD COLUMN recurrence_exception_dates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE shifts ADD COLUMN is_recurring BOOLEAN DEFAULT false;

-- Index for performance
CREATE INDEX idx_shifts_recurrence_parent ON shifts(recurrence_parent_id) WHERE recurrence_parent_id IS NOT NULL;

-- RLS policies remain unchanged (company-scoped)
```

**Recurrence Rule Format (iCalendar RFC 5545):**

```typescript
interface RecurrenceRule {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number; // 1 = every week, 2 = every 2 weeks
  byDay?: string[]; // ['MO', 'WE', 'FR'] for Monday, Wednesday, Friday
  until?: string; // End date (ISO 8601)
  count?: number; // Or number of occurrences
}
```

**Acceptance Criteria:**

- Migration runs successfully
- Fields added to shifts table
- Type definitions updated
- No breaking changes to existing queries
- RLS policies still work

**Files to Create/Modify:**

- `supabase/migrations/YYYYMMDD_add_recurring_shifts.sql` (new)
- `src/types/shifts.ts` (update)
- `src/api/schedules.ts` (update types)

---

### Task 8: Recurrence Rule Parser (4 hours)

**Priority:** High  
**Dependencies:** Task 7

**Subtasks:**

1. Create recurrence rule parser
2. Implement rule validation
3. Generate occurrence dates
4. Handle edge cases (DST, leap years)
5. Add timezone support
6. Write comprehensive tests

**Parser Functions:**

```typescript
// Parse recurrence rule
function parseRecurrenceRule(rule: string): RecurrenceRule;

// Generate dates for next N occurrences
function generateOccurrences(rule: RecurrenceRule, startDate: Date, count: number): Date[];

// Check if date matches rule
function matchesRecurrence(rule: RecurrenceRule, date: Date): boolean;

// Apply exceptions (skip holidays)
function applyExceptions(dates: Date[], exceptions: Date[]): Date[];
```

**Edge Cases to Handle:**

- Daylight Saving Time transitions
- Leap years (Feb 29)
- Month end dates (Jan 31 → Feb 28/29)
- Timezone conversions
- Invalid rules

**Acceptance Criteria:**

- Parser handles all recurrence types
- Edge cases handled correctly
- Timezone-aware calculations
- 100% test coverage for parser
- Performance: Generate 100 occurrences in <100ms

**Files to Create/Modify:**

- `src/lib/recurrence-parser.ts` (new)
- `src/lib/recurrence-parser.test.ts` (new)
- `src/utils/date-utils.ts` (update)

---

### Task 9: Recurring Shift UI (5 hours)

**Priority:** High  
**Dependencies:** Task 7, Task 8

**Subtasks:**

1. Add "Make Recurring" checkbox to shift form
2. Create recurrence configuration panel
3. Implement preview before creation
4. Add edit options (this/all occurrences)
5. Create delete options (this/all/future)
6. Add validation and conflict detection

**UI Components:**

- Recurrence toggle
- Frequency selector (daily/weekly/monthly)
- Interval input (every N days/weeks/months)
- Day selector (for weekly: M T W T F S S)
- End date picker or occurrence count
- Exception dates manager
- Preview list (next 10 occurrences)

**Edit/Delete Modes:**

1. **This occurrence only** - Update/delete single instance
2. **This and future** - Update/delete from this date forward
3. **All occurrences** - Update/delete entire series

**Acceptance Criteria:**

- Intuitive recurrence configuration
- Preview shows accurate dates
- Edit/delete modes work correctly
- Validation prevents conflicts
- Mobile responsive
- Accessible (keyboard navigation)

**Files to Create/Modify:**

- `src/components/Shifts/RecurrencePanel.tsx` (new)
- `src/components/Shifts/RecurrencePreview.tsx` (new)
- `src/components/Shifts/EditRecurringModal.tsx` (new)
- `src/hooks/useRecurringShift.ts` (new)

---

### Task 10: Bulk Shift Generation (4 hours)

**Priority:** High  
**Dependencies:** Task 8

**Subtasks:**

1. Create bulk generation API endpoint
2. Implement transaction handling
3. Add progress tracking
4. Handle conflicts automatically
5. Add rollback on errors
6. Create generation report

**Generation Process:**

1. Parse recurrence rule
2. Generate all occurrence dates
3. Apply exception dates
4. Check for conflicts
5. Create shifts in transaction
6. Return summary report

**API Endpoint:**

```typescript
POST /api/schedules/generate-recurring
{
  shiftTemplate: ShiftData,
  recurrenceRule: RecurrenceRule,
  generateUntil: Date,
  skipConflicts: boolean
}

Response:
{
  generated: number,
  skipped: number,
  conflicts: ShiftConflict[],
  shiftIds: string[]
}
```

**Acceptance Criteria:**

- Generates 100+ shifts in <5 seconds
- All-or-nothing transaction (rollback on error)
- Conflict detection works
- Progress feedback during generation
- Detailed report returned
- Database constraints respected

**Files to Create/Modify:**

- `src/api/recurring-shifts.ts` (new)
- `supabase/functions/generate-recurring-shifts/index.ts` (new)
- `src/components/Shifts/GenerationReport.tsx` (new)

---

### Task 11: Exception Handling (3 hours)

**Priority:** Medium  
**Dependencies:** Task 9

**Subtasks:**

1. Add exception date UI
2. Implement holiday calendar integration
3. Add skip/reschedule options
4. Create exception management interface
5. Test with various scenarios

**Exception Features:**

- Add single date exceptions
- Import holiday calendar (JSON/iCal)
- Skip or reschedule on exceptions
- Visual indicators for exceptions
- Edit exception list

**Acceptance Criteria:**

- Exceptions are respected in generation
- Holiday calendars import correctly
- Skip vs reschedule works as expected
- UI is intuitive
- Data persists correctly

**Files to Create/Modify:**

- `src/components/Shifts/ExceptionManager.tsx` (new)
- `src/lib/holiday-calendar.ts` (new)
- `src/data/holidays.json` (new - US holidays)

---

### Task 12: Calendar Integration & Testing (6 hours)

**Priority:** Critical  
**Dependencies:** All above tasks

**Subtasks:**

1. Integrate calendar with existing schedule pages
2. Add calendar view toggle to Schedules page
3. Ensure list and calendar views stay in sync
4. Add loading states and error handling
5. Optimize performance with large datasets
6. Comprehensive testing (unit + integration)
7. Mobile testing on real devices
8. Accessibility testing

**Integration Points:**

- Schedules page: Add calendar/list view toggle
- Dashboard: Add mini calendar widget (optional)
- Employee view: Show employee's shifts on calendar
- Print: Calendar view printable layout

**Performance Optimizations:**

- Virtualize long lists
- Lazy load shifts by date range
- Cache calendar data
- Debounce drag operations
- Optimize re-renders with React.memo

**Testing:**

- Unit tests for all new components
- Integration tests for calendar + API
- E2E tests for critical user flows
- Performance tests with 500+ shifts
- Mobile responsive tests
- Accessibility audit (WCAG AA)

**Acceptance Criteria:**

- Calendar and list views sync correctly
- Performance: <2s load for 200 shifts
- All new code has >80% test coverage
- No console errors or warnings
- Mobile fully functional
- Accessibility score >90

**Files to Create/Modify:**

- `src/pages/Schedules.tsx` (update - add calendar view)
- `src/components/Calendar/index.ts` (new - exports)
- `src/components/Calendar/Calendar.test.tsx` (new)
- `src/components/Shifts/RecurringShift.test.ts` (new)
- `src/hooks/useCalendar.test.ts` (new)

---

### Task 13: Documentation (3 hours)

**Priority:** Medium  
**Dependencies:** Task 12

**Subtasks:**

1. Write user guide for calendar view
2. Write user guide for recurring shifts
3. Update API documentation
4. Add code examples
5. Create troubleshooting section
6. Update README with new features

**Documentation to Create:**

1. **CALENDAR_VIEW.md** (User Guide)
   - Overview of calendar views
   - How to navigate
   - Drag-and-drop instructions
   - Keyboard shortcuts
   - Mobile usage tips
   - Troubleshooting

2. **RECURRING_SHIFTS.md** (User Guide)
   - What are recurring shifts
   - How to create recurring shifts
   - Edit options explained
   - Exception handling
   - Best practices
   - Examples and use cases

3. **API_RECURRING_SHIFTS.md** (Developer Guide)
   - API endpoints
   - Request/response formats
   - Recurrence rule syntax
   - Code examples
   - Error handling

**Acceptance Criteria:**

- All documentation complete
- Examples are tested and working
- Screenshots included where helpful
- Links updated in main README
- Markdown properly formatted

**Files to Create/Modify:**

- `docs/CALENDAR_VIEW.md` (new)
- `docs/RECURRING_SHIFTS.md` (new)
- `docs/API_RECURRING_SHIFTS.md` (new)
- `docs/INDEX.md` (update)
- `README.md` (update - add features)

---

## 📊 Time Estimates

| Task                          | Estimated Hours | Priority     |
| ----------------------------- | --------------- | ------------ |
| 1. Calendar Library Selection | 4               | Critical     |
| 2. Calendar View Modes        | 6               | High         |
| 3. Shift Display & Colors     | 4               | High         |
| 4. Drag-and-Drop              | 8               | Critical     |
| 5. Quick Shift Modal          | 3               | Medium       |
| 6. Calendar Navigation        | 3               | High         |
| 7. Recurrence Schema          | 2               | Critical     |
| 8. Recurrence Parser          | 4               | High         |
| 9. Recurring Shift UI         | 5               | High         |
| 10. Bulk Generation           | 4               | High         |
| 11. Exception Handling        | 3               | Medium       |
| 12. Integration & Testing     | 6               | Critical     |
| 13. Documentation             | 3               | Medium       |
| **TOTAL**                     | **55 hours**    | **~3 weeks** |

**Buffer:** Add 20% for unexpected issues = **66 hours total**

---

## 🎯 Success Metrics

### Performance Metrics

- [ ] Calendar loads 200 shifts in <2s
- [ ] Drag-and-drop response <500ms
- [ ] Recurring shift generation (6 months) <5 minutes
- [ ] Bundle size increase <200KB

### Quality Metrics

- [ ] 186+ tests passing (20+ new tests)
- [ ] Test coverage >80% for new code
- [ ] Zero TypeScript errors
- [ ] Zero accessibility violations (critical)
- [ ] Lighthouse score >90

### User Experience Metrics

- [ ] Calendar works on mobile/tablet/desktop
- [ ] All 3 calendar views functional
- [ ] Drag-and-drop on desktop works smoothly
- [ ] Touch gestures on mobile work
- [ ] Recurring shifts generate correctly

### Feature Adoption (post-launch)

- [ ] 90%+ users adopt calendar view
- [ ] 50% reduction in schedule creation time
- [ ] 80%+ managers use recurring shifts
- [ ] Zero critical bugs in first week

---

## 🚨 Risks & Mitigations

### Risk 1: Calendar Library Complexity

**Impact:** High  
**Probability:** Medium

**Mitigation:**

- Research thoroughly before selection
- Choose well-maintained library with TypeScript support
- Start with basic implementation
- Have fallback to simpler table-based view

### Risk 2: Performance with Large Datasets

**Impact:** High  
**Probability:** Medium

**Mitigation:**

- Implement virtualization early
- Load only visible date range
- Test with 500+ shifts regularly
- Add pagination if needed

### Risk 3: Timezone Edge Cases

**Impact:** Medium  
**Probability:** High

**Mitigation:**

- Use date-fns for all date operations
- Store all dates in UTC
- Convert to user timezone on display
- Comprehensive test coverage for DST

### Risk 4: Mobile Drag-and-Drop

**Impact:** Medium  
**Probability:** Medium

**Mitigation:**

- Test on real mobile devices early
- Use library with touch support
- Provide alternative input methods
- Consider mobile-first modal for editing

### Risk 5: Recurring Shift Conflicts

**Impact:** High  
**Probability:** Medium

**Mitigation:**

- Implement robust conflict detection
- Show conflicts before generation
- Allow skip or manual resolution
- Transaction rollback on errors

---

## 🔧 Technical Decisions

### Calendar Library: TBD (Research in Task 1)

**Options:**

1. **React Big Calendar**
   - Pros: Lightweight, flexible, MIT license
   - Cons: Less features, more custom work

2. **FullCalendar**
   - Pros: Feature-rich, excellent docs
   - Cons: Larger bundle, complex API

3. **Custom Implementation**
   - Pros: Full control, minimal dependencies
   - Cons: More development time, maintenance burden

**Decision Criteria:**

- Bundle size impact (<100KB preferred)
- TypeScript support (must have)
- Mobile responsive (must have)
- Drag-and-drop (must have or easy to add)
- Active maintenance (last update <6 months)
- License (MIT preferred)

### Recurrence Rule Format: iCalendar RFC 5545

**Rationale:**

- Industry standard
- Well-documented
- Many parsing libraries available
- Extensible for future needs
- Compatible with external calendars

**Example:**

```
FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;UNTIL=20250331T235959Z
```

---

## 📝 Pre-Sprint Checklist

Before starting Sprint 5:

- [x] Sprint 1-4 completed and merged
- [x] All 166 tests passing
- [x] No blocking issues
- [x] Dependencies up to date
- [ ] Team review of sprint plan
- [ ] Confirm calendar library choice
- [ ] Database migration ready
- [ ] Test data prepared

---

## 🎉 Sprint Completion Checklist

Sprint 5 is complete when:

### Features

- [ ] Calendar view with month/week/day modes
- [ ] Drag-and-drop shift scheduling
- [ ] Color-coded shifts
- [ ] Quick shift creation
- [ ] Calendar navigation working
- [ ] Recurring shifts configurable
- [ ] Bulk shift generation functional
- [ ] Exception handling implemented

### Quality

- [ ] 186+ tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build succeeds
- [ ] Lint passes
- [ ] CodeQL security scan passes

### Documentation

- [ ] CALENDAR_VIEW.md complete
- [ ] RECURRING_SHIFTS.md complete
- [ ] API_RECURRING_SHIFTS.md complete
- [ ] README updated
- [ ] Code comments added

### Testing

- [ ] Manual testing on desktop
- [ ] Manual testing on mobile
- [ ] Accessibility tested
- [ ] Performance tested with 500+ shifts
- [ ] Cross-browser tested

### Deployment

- [ ] Database migration applied
- [ ] Environment variables set
- [ ] Build deployed to staging
- [ ] Smoke tests pass on staging
- [ ] Ready for production

---

## 📚 Resources

### Libraries to Evaluate

- [React Big Calendar](https://github.com/jquense/react-big-calendar)
- [FullCalendar React](https://fullcalendar.io/docs/react)
- [React Calendar](https://github.com/wojtekmaj/react-calendar)

### Recurrence Libraries

- [rrule.js](https://github.com/jakubroztocil/rrule) - iCalendar recurrence rules
- [date-fns](https://date-fns.org/) - Date manipulation

### Documentation

- [iCalendar RFC 5545](https://tools.ietf.org/html/rfc5545)
- [React DnD](https://react-dnd.github.io/react-dnd/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🔄 Sprint Workflow

### Daily

1. Start with highest priority incomplete task
2. Write tests first (TDD)
3. Implement feature
4. Run tests + lint + build
5. Manual testing
6. Commit with clear message
7. Report progress

### Weekly

1. Review completed tasks
2. Update progress in PR
3. Adjust priorities if needed
4. Team sync (if applicable)

### End of Sprint

1. Complete all tasks
2. Full test suite passes
3. Documentation reviewed
4. Code review
5. Merge to main
6. Deploy to production
7. Create completion summary

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 5 - Advanced Features & Polish  
**Estimated Completion:** Week 8-9 (mid-January 2025)
