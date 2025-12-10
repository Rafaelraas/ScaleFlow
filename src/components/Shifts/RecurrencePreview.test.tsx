import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecurrencePreview } from './RecurrencePreview';
import type { RecurrenceRule } from '@/types/database';

describe('RecurrencePreview', () => {
  it('should show placeholder message when no recurrence rule is provided', () => {
    render(<RecurrencePreview recurrenceRule={null} startDate={null} />);

    expect(screen.getByText(/Configure recurrence settings to see preview/i)).toBeInTheDocument();
  });

  it('should show placeholder message when no start date is provided', () => {
    const rule: RecurrenceRule = {
      freq: 'DAILY',
      interval: 1,
    };

    render(<RecurrencePreview recurrenceRule={rule} startDate={null} />);

    expect(screen.getByText(/Configure recurrence settings to see preview/i)).toBeInTheDocument();
  });

  it('should display occurrence dates for daily recurrence', () => {
    const rule: RecurrenceRule = {
      freq: 'DAILY',
      interval: 1,
      count: 5,
    };
    const startDate = new Date('2024-01-01T09:00:00Z');

    render(<RecurrencePreview recurrenceRule={rule} startDate={startDate} maxOccurrences={5} />);

    expect(screen.getByText('Preview')).toBeInTheDocument();
    // Should show multiple occurrences
    const occurrences = screen.getAllByText(/Jan/);
    expect(occurrences.length).toBeGreaterThan(0);
  });

  it('should display occurrence dates for weekly recurrence', () => {
    const rule: RecurrenceRule = {
      freq: 'WEEKLY',
      interval: 1,
      byDay: ['MO', 'WE', 'FR'],
      count: 6,
    };
    const startDate = new Date('2024-01-01T09:00:00Z'); // Monday

    render(<RecurrencePreview recurrenceRule={rule} startDate={startDate} maxOccurrences={6} />);

    expect(screen.getByText('Preview')).toBeInTheDocument();
    // Should show multiple occurrences
    const occurrences = screen.getAllByText(/Jan|Feb/);
    expect(occurrences.length).toBeGreaterThan(0);
  });

  it('should display rule description for daily recurrence', () => {
    const rule: RecurrenceRule = {
      freq: 'DAILY',
      interval: 2,
      count: 5,
    };
    const startDate = new Date('2024-01-01T09:00:00Z');

    render(<RecurrencePreview recurrenceRule={rule} startDate={startDate} />);

    expect(screen.getByText(/Every 2 days/i)).toBeInTheDocument();
  });

  it('should display rule description for weekly recurrence with days', () => {
    const rule: RecurrenceRule = {
      freq: 'WEEKLY',
      interval: 1,
      byDay: ['MO', 'WE', 'FR'],
      count: 10,
    };
    const startDate = new Date('2024-01-01T09:00:00Z');

    render(<RecurrencePreview recurrenceRule={rule} startDate={startDate} />);

    expect(screen.getByText(/Every week/i)).toBeInTheDocument();
    expect(screen.getByText(/Mon, Wed, Fri/i)).toBeInTheDocument();
  });

  it('should display rule description with until date', () => {
    const rule: RecurrenceRule = {
      freq: 'DAILY',
      interval: 1,
      until: '2024-01-31T23:59:59Z',
    };
    const startDate = new Date('2024-01-01T09:00:00Z');

    render(<RecurrencePreview recurrenceRule={rule} startDate={startDate} />);

    expect(screen.getByText(/until Jan 31, 2024/i)).toBeInTheDocument();
  });

  it('should display rule description with count', () => {
    const rule: RecurrenceRule = {
      freq: 'WEEKLY',
      interval: 2,
      byDay: ['TU', 'TH'],
      count: 8,
    };
    const startDate = new Date('2024-01-02T09:00:00Z');

    render(<RecurrencePreview recurrenceRule={rule} startDate={startDate} />);

    expect(screen.getByText(/for 8 occurrences/i)).toBeInTheDocument();
  });

  it('should limit occurrences to maxOccurrences', () => {
    const rule: RecurrenceRule = {
      freq: 'DAILY',
      interval: 1,
      count: 100,
    };
    const startDate = new Date('2024-01-01T09:00:00Z');

    render(<RecurrencePreview recurrenceRule={rule} startDate={startDate} maxOccurrences={5} />);

    // Should show message about limiting
    expect(screen.getByText(/Showing first 5 occurrences/i)).toBeInTheDocument();
  });

  it('should handle invalid recurrence rules gracefully', () => {
    const invalidRule = {
      freq: 'INVALID' as unknown,
      interval: -1,
    } as RecurrenceRule;
    const startDate = new Date('2024-01-01T09:00:00Z');

    render(<RecurrencePreview recurrenceRule={invalidRule} startDate={startDate} />);

    // The component shows 'Invalid recurrence rule' text in the description or empty occurrences
    // Since generateOccurrences will fail, it should show empty/invalid state
    expect(screen.queryByText('Preview')).toBeInTheDocument();
  });
});
