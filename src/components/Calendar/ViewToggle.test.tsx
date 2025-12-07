import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle } from './ViewToggle';

describe('ViewToggle', () => {
  it('should render all three view options', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle currentView="month" onViewChange={onViewChange} />);

    expect(screen.getByLabelText('Switch to Month view')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to Week view')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to Day view')).toBeInTheDocument();
  });

  it('should highlight the current view', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle currentView="week" onViewChange={onViewChange} />);

    const weekButton = screen.getByLabelText('Switch to Week view');
    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onViewChange when a view is clicked', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle currentView="month" onViewChange={onViewChange} />);

    const dayButton = screen.getByLabelText('Switch to Day view');
    fireEvent.click(dayButton);

    expect(onViewChange).toHaveBeenCalledWith('day');
  });

  it('should allow switching between all views', () => {
    const onViewChange = vi.fn();
    render(<ViewToggle currentView="month" onViewChange={onViewChange} />);

    // Switch to week
    fireEvent.click(screen.getByLabelText('Switch to Week view'));
    expect(onViewChange).toHaveBeenCalledWith('week');

    // Switch to day
    fireEvent.click(screen.getByLabelText('Switch to Day view'));
    expect(onViewChange).toHaveBeenCalledWith('day');

    // Switch back to month
    fireEvent.click(screen.getByLabelText('Switch to Month view'));
    expect(onViewChange).toHaveBeenCalledWith('month');
  });

  it('should apply custom className', () => {
    const onViewChange = vi.fn();
    const { container } = render(
      <ViewToggle currentView="month" onViewChange={onViewChange} className="custom-class" />
    );

    const toggleContainer = container.firstChild as HTMLElement;
    expect(toggleContainer).toHaveClass('custom-class');
  });
});
