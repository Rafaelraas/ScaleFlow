import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useSession } from '@/hooks/useSession';

// Mock do useSession
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

const mockUseSession = useSession as Mock;

describe('Sidebar', () => {
  it('should render correct navigation items for a system_admin', () => {
    mockUseSession.mockReturnValue({
      userRole: 'system_admin',
      isLoading: false,
      session: {},
      userProfile: { company_id: 'any-company-id' },
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Schedules')).toBeInTheDocument();
    expect(screen.getByText('Shift Templates')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Employee Preferences')).toBeInTheDocument();
    expect(screen.queryByText('My Schedule')).not.toBeInTheDocument(); // Employee specific
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument(); // Employee specific
    expect(screen.getByText('Swap Requests')).toBeInTheDocument();
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Company Settings')).toBeInTheDocument();
    expect(screen.getByText('Admin Companies')).toBeInTheDocument();
    expect(screen.getByText('Admin Users')).toBeInTheDocument();
  });

  it('should render correct navigation items for a manager', () => {
    mockUseSession.mockReturnValue({
      userRole: 'manager',
      isLoading: false,
      session: {},
      userProfile: { company_id: 'company-123' },
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Schedules')).toBeInTheDocument();
    expect(screen.getByText('Shift Templates')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Employee Preferences')).toBeInTheDocument();
    expect(screen.queryByText('My Schedule')).not.toBeInTheDocument();
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();
    expect(screen.getByText('Swap Requests')).toBeInTheDocument();
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Company Settings')).toBeInTheDocument();
    expect(screen.queryByText('Admin Companies')).not.toBeInTheDocument(); // Admin specific
    expect(screen.queryByText('Admin Users')).not.toBeInTheDocument();     // Admin specific
  });

  it('should render correct navigation items for an employee', () => {
    mockUseSession.mockReturnValue({
      userRole: 'employee',
      isLoading: false,
      session: {},
      userProfile: { company_id: 'company-123' },
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Schedules')).not.toBeInTheDocument(); // Manager specific
    expect(screen.queryByText('Shift Templates')).not.toBeInTheDocument(); // Manager specific
    expect(screen.queryByText('Employees')).not.toBeInTheDocument(); // Manager specific
    expect(screen.queryByText('Employee Preferences')).not.toBeInTheDocument(); // Manager specific
    expect(screen.getByText('My Schedule')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Swap Requests')).toBeInTheDocument();
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.queryByText('Company Settings')).not.toBeInTheDocument(); // Manager specific
    expect(screen.queryByText('Admin Companies')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Users')).not.toBeInTheDocument();
  });

  it('should render no navigation items when userRole is null (unauthenticated)', () => {
    mockUseSession.mockReturnValue({
      userRole: null,
      isLoading: false,
      session: null,
      userProfile: null,
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar />
      </MemoryRouter>
    );

    // Expect no navigation items to be rendered.
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Schedules')).not.toBeInTheDocument();
    expect(screen.queryByText('My Schedule')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument();
  });

  it('should render nothing when isLoading is true', () => {
    mockUseSession.mockReturnValue({
      userRole: null,
      isLoading: true,
      session: null,
      userProfile: null,
    });

    const { container } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar />
      </MemoryRouter>
    );

    // Expect the sidebar container to be present, but no navigation items inside
    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
});