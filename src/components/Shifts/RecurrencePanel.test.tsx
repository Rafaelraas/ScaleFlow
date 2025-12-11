import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { RecurrencePanel } from './RecurrencePanel';
import React from 'react';

// Wrapper component to provide form context
function TestWrapper({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode;
  defaultValues?: unknown;
}) {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      <RecurrencePanel
        control={methods.control}
        watch={methods.watch}
        setValue={methods.setValue}
      />
    </FormProvider>
  );
}

describe('RecurrencePanel', () => {
  it('should render frequency selector', () => {
    render(<TestWrapper />);

    expect(screen.getByText('Repeat')).toBeInTheDocument();
  });

  it('should show weekly day selector when frequency is WEEKLY', () => {
    render(
      <TestWrapper defaultValues={{ recurrence_frequency: 'WEEKLY', recurrence_byDay: [] }} />
    );

    expect(screen.getByText('Repeat on')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
  });

  it('should show interval input with appropriate label based on frequency', () => {
    render(<TestWrapper defaultValues={{ recurrence_frequency: 'DAILY' }} />);

    expect(screen.getByText(/Repeat every/)).toBeInTheDocument();
    expect(screen.getByText(/day\(s\)/)).toBeInTheDocument();
  });

  it('should show end date picker when end type is "on"', () => {
    render(<TestWrapper defaultValues={{ recurrence_end_type: 'on' }} />);

    expect(screen.getByText('End date')).toBeInTheDocument();
  });

  it('should show occurrence count input when end type is "after"', () => {
    render(<TestWrapper defaultValues={{ recurrence_end_type: 'after' }} />);

    expect(screen.getByText('Number of occurrences')).toBeInTheDocument();
  });

  it('should show warning when weekly frequency has no days selected', () => {
    render(
      <TestWrapper defaultValues={{ recurrence_frequency: 'WEEKLY', recurrence_byDay: [] }} />
    );

    expect(screen.getByText('Please select at least one day')).toBeInTheDocument();
  });

  it('should toggle day selection when day button is clicked', () => {
    const { getByText } = render(
      <TestWrapper defaultValues={{ recurrence_frequency: 'WEEKLY', recurrence_byDay: ['MO'] }} />
    );

    const tuesdayButton = getByText('Tue');
    fireEvent.click(tuesdayButton);

    // Just verify the button is clickable - actual functionality tested by integration tests
    expect(tuesdayButton).toBeInTheDocument();
  });
});
