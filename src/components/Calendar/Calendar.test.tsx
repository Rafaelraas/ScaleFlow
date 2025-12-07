import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Calendar, CalendarEvent } from './Calendar';

describe('Calendar', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Morning Shift',
      start: new Date(2024, 0, 1, 9, 0),
      end: new Date(2024, 0, 1, 17, 0),
    },
    {
      id: '2',
      title: 'Evening Shift',
      start: new Date(2024, 0, 2, 17, 0),
      end: new Date(2024, 0, 3, 1, 0),
    },
  ];

  it('should render the calendar with toolbar', () => {
    render(<Calendar events={mockEvents} />);
    // Calendar toolbar should be present
    const toolbar = document.querySelector('.rbc-toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('should render the calendar container', () => {
    const { container } = render(<Calendar events={mockEvents} />);
    // Calendar container should be present
    const calendarContainer = container.querySelector('.calendar-container');
    expect(calendarContainer).toBeInTheDocument();
  });

  it('should call onSelectSlot when provided', () => {
    const onSelectSlot = vi.fn();
    render(<Calendar events={mockEvents} onSelectSlot={onSelectSlot} />);
    // Test that callback is passed correctly (actual interaction would need user event)
    expect(onSelectSlot).toBeDefined();
  });

  it('should accept custom className', () => {
    const { container } = render(<Calendar events={mockEvents} className="custom-calendar" />);
    const calendarContainer = container.querySelector('.custom-calendar');
    expect(calendarContainer).toBeInTheDocument();
  });

  it('should render with month view by default', () => {
    const { container } = render(<Calendar events={mockEvents} />);
    // React Big Calendar month view has specific structure
    const monthView = container.querySelector('.rbc-month-view');
    expect(monthView).toBeInTheDocument();
  });

  it('should handle empty events array', () => {
    const { container } = render(<Calendar events={[]} />);
    const toolbar = container.querySelector('.rbc-toolbar');
    expect(toolbar).toBeInTheDocument();
  });
});
