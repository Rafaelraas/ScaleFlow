import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarHeader } from './CalendarHeader';

describe('CalendarHeader', () => {
  const mockOnNavigate = vi.fn();
  const mockOnViewChange = vi.fn();
  const testDate = new Date('2024-12-10T12:00:00');

  it('should render navigation buttons', () => {
    render(
      <CalendarHeader
        currentDate={testDate}
        view="month"
        onNavigate={mockOnNavigate}
        onViewChange={mockOnViewChange}
      />
    );

    expect(screen.getByTitle('Previous month')).toBeInTheDocument();
    expect(screen.getByTitle('Go to today')).toBeInTheDocument();
    expect(screen.getByTitle('Next month')).toBeInTheDocument();
  });

  it('should display month view date range', () => {
    render(
      <CalendarHeader
        currentDate={testDate}
        view="month"
        onNavigate={mockOnNavigate}
        onViewChange={mockOnViewChange}
      />
    );

    expect(screen.getByText('December 2024')).toBeInTheDocument();
  });

  it('should display day view date range', () => {
    render(
      <CalendarHeader
        currentDate={testDate}
        view="day"
        onNavigate={mockOnNavigate}
        onViewChange={mockOnViewChange}
      />
    );

    expect(screen.getByText('Tuesday, December 10, 2024')).toBeInTheDocument();
  });

  it('should have date picker button', () => {
    render(
      <CalendarHeader
        currentDate={testDate}
        view="month"
        onNavigate={mockOnNavigate}
        onViewChange={mockOnViewChange}
      />
    );

    expect(screen.getByTitle('Pick a date')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <CalendarHeader
        currentDate={testDate}
        view="month"
        onNavigate={mockOnNavigate}
        onViewChange={mockOnViewChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
