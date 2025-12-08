# Permission System Usage Guide

This guide shows how to use the ScaleFlow permission system in your components.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Using the usePermissions Hook](#using-the-usepermissions-hook)
3. [Using PermissionGate Component](#using-permissiongate-component)
4. [Route Protection](#route-protection)
5. [Common Patterns](#common-patterns)
6. [Examples](#examples)

---

## Quick Start

### Check if User Can Perform Action

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function SchedulePage() {
  const permissions = usePermissions();

  return (
    <div>
      <h1>Schedules</h1>
      {permissions.canManageSchedules && <button>Create Schedule</button>}
    </div>
  );
}
```

### Conditionally Render Component

```tsx
import { PermissionGate } from '@/components/PermissionGate';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <PermissionGate requireManageCompany>
        <CompanySettingsPanel />
      </PermissionGate>

      <PermissionGate requireViewEmployees>
        <EmployeeList />
      </PermissionGate>
    </div>
  );
}
```

### Role-Based Rendering

```tsx
import { RoleGate } from '@/components/PermissionGate';

function AdminPanel() {
  return (
    <RoleGate allowedRoles={['system_admin']}>
      <div>System Admin Only Content</div>
    </RoleGate>
  );
}
```

---

## Using the usePermissions Hook

The `usePermissions` hook provides access to all permission checks and user context.

### Basic Usage

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const permissions = usePermissions();

  console.log(permissions.userRole); // Current user's role
  console.log(permissions.userId); // Current user's ID
  console.log(permissions.companyId); // Current user's company ID

  return <div>...</div>;
}
```

### Available Permission Flags

```tsx
const permissions = usePermissions();

// Company management
permissions.canManageCompany; // Manager only

// Schedule management
permissions.canManageSchedules; // Manager, Schedule Manager

// Employee management
permissions.canManageEmployees; // Manager only
permissions.canViewEmployees; // Manager, Schedule Manager, Operator

// Approvals
permissions.canApproveSwaps; // Manager, Schedule Manager
permissions.canApprovePreferences; // Manager, Schedule Manager

// Reporting
permissions.canViewReports; // Manager, Schedule Manager, Operator

// Admin access
permissions.canAccessAdmin; // System Admin only

// Company requirement
permissions.requiresCompany; // True for all except system_admin
```

### Function-Based Checks

```tsx
const permissions = usePermissions();

// Check if user can access a specific route
const canAccess = permissions.canAccessRoute(['manager', 'schedule_manager'], true);

// Check if user can manage another user
const canManageThisUser = permissions.canManageUser(targetUser.company_id);

// Check if user can modify a shift
const canEditShift = permissions.canModifyShift(shift.company_id);

// Check if user can view a shift
const canSeeShift = permissions.canViewShift(shift.employee_id, shift.company_id, shift.published);

// Check if user can approve a swap
const canApprove = permissions.canApproveSwapRequest(shift.company_id);

// Check if user can assign a role
const canAssign = permissions.canAssignRole('manager');

// Get all roles this user can assign
const assignableRoles = permissions.assignableRoles;

// Get user's capabilities
const capabilities = permissions.capabilities;
```

---

## Using PermissionGate Component

The `PermissionGate` component conditionally renders children based on permissions.

### Basic Role Check

```tsx
import { PermissionGate } from '@/components/PermissionGate';

<PermissionGate allowedRoles={['manager', 'schedule_manager']}>
  <button>Edit Schedule</button>
</PermissionGate>;
```

### Permission-Based Check

```tsx
<PermissionGate requireManageSchedules>
  <CreateShiftButton />
</PermissionGate>

<PermissionGate requireViewEmployees>
  <EmployeeListView />
</PermissionGate>

<PermissionGate requireAccessAdmin>
  <AdminDashboard />
</PermissionGate>
```

### With Fallback Content

```tsx
<PermissionGate requireManageCompany fallback={<p>You don't have permission to view this.</p>}>
  <CompanySettings />
</PermissionGate>
```

### With Tooltip

```tsx
<PermissionGate
  requireManageSchedules
  showTooltip
  tooltipMessage="Only managers and schedule managers can create schedules"
  fallback={<button disabled>Create Schedule</button>}
>
  <button>Create Schedule</button>
</PermissionGate>
```

### Disable Instead of Hide

```tsx
<PermissionGate
  requireManageEmployees
  disableInstead
  showTooltip
  tooltipMessage="You don't have permission to delete employees"
>
  <button>Delete Employee</button>
</PermissionGate>
```

### Multiple Permission Checks

```tsx
<PermissionGate requireManageSchedules requireViewEmployees>
  <AdvancedSchedulingPanel />
</PermissionGate>
```

---

## Route Protection

Routes are protected using the `ProtectedRoute` component in `App.tsx`.

### Basic Protected Route

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### Role-Restricted Route

```tsx
<Route
  path="/schedules"
  element={
    <ProtectedRoute allowedRoles={['manager', 'schedule_manager']}>
      <Layout>
        <Schedules />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### Route Without Company Requirement

```tsx
<Route
  path="/admin/companies"
  element={
    <ProtectedRoute allowedRoles={['system_admin']} requiresCompany={false}>
      <Layout>
        <AdminCompanyManagement />
      </Layout>
    </ProtectedRoute>
  }
/>
```

---

## Common Patterns

### Pattern 1: Conditional Action Buttons

```tsx
function ShiftCard({ shift }) {
  const permissions = usePermissions();

  return (
    <div className="shift-card">
      <h3>{shift.name}</h3>
      <p>
        {shift.start_time} - {shift.end_time}
      </p>

      {permissions.canModifyShift(shift.company_id) && (
        <div className="actions">
          <button onClick={() => handleEdit(shift)}>Edit</button>
          <button onClick={() => handleDelete(shift)}>Delete</button>
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Role-Based Navigation

```tsx
function Navigation() {
  const { userRole } = useSession();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>

      {(userRole === 'manager' || userRole === 'schedule_manager') && (
        <Link to="/schedules">Schedules</Link>
      )}

      {userRole === 'system_admin' && <Link to="/admin">Admin Panel</Link>}
    </nav>
  );
}
```

### Pattern 3: Permission-Based Forms

```tsx
function EmployeeForm({ employee }) {
  const permissions = usePermissions();
  const isEditable = permissions.canManageEmployees;

  return (
    <form>
      <input name="name" defaultValue={employee.name} disabled={!isEditable} />

      <PermissionGate requireManageEmployees>
        <select name="role">
          {permissions.assignableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </PermissionGate>

      {isEditable && <button type="submit">Save</button>}
    </form>
  );
}
```

### Pattern 4: Approval Workflows

```tsx
function SwapRequestCard({ request, shift }) {
  const permissions = usePermissions();
  const canApprove = permissions.canApproveSwapRequest(shift.company_id);

  return (
    <div className="swap-request">
      <p>Request from {request.requester.name}</p>
      <p>Shift: {shift.start_time}</p>

      {canApprove ? (
        <div className="actions">
          <button onClick={() => handleApprove(request)}>Approve</button>
          <button onClick={() => handleReject(request)}>Reject</button>
        </div>
      ) : (
        <p className="status">{request.status}</p>
      )}
    </div>
  );
}
```

### Pattern 5: Multi-Level Access

```tsx
function ReportsPage() {
  const permissions = usePermissions();

  return (
    <div>
      <h1>Reports</h1>

      {/* All managers, schedule managers, and operators can view */}
      {permissions.canViewReports && (
        <section>
          <h2>Basic Reports</h2>
          <BasicReports />
        </section>
      )}

      {/* Only managers and schedule managers can view */}
      {permissions.canManageSchedules && (
        <section>
          <h2>Schedule Analytics</h2>
          <ScheduleAnalytics />
        </section>
      )}

      {/* Only managers can view */}
      {permissions.canManageCompany && (
        <section>
          <h2>Financial Reports</h2>
          <FinancialReports />
        </section>
      )}
    </div>
  );
}
```

---

## Examples

### Example 1: Schedule Management Page

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/PermissionGate';

function SchedulesPage() {
  const permissions = usePermissions();
  const [shifts, setShifts] = useState([]);

  const canModify = permissions.canManageSchedules;

  return (
    <div className="schedules-page">
      <div className="header">
        <h1>Schedules</h1>

        <PermissionGate requireManageSchedules>
          <button onClick={handleCreateShift}>Create New Shift</button>
        </PermissionGate>
      </div>

      <div className="shift-list">
        {shifts.map((shift) => (
          <ShiftCard key={shift.id} shift={shift} canEdit={canModify} canDelete={canModify} />
        ))}
      </div>

      <PermissionGate requireManageSchedules>
        <div className="bulk-actions">
          <button onClick={handlePublishAll}>Publish All</button>
          <button onClick={handleExport}>Export Schedule</button>
        </div>
      </PermissionGate>
    </div>
  );
}
```

### Example 2: Employee Management Page

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate, RoleGate } from '@/components/PermissionGate';

function EmployeesPage() {
  const permissions = usePermissions();
  const [employees, setEmployees] = useState([]);

  return (
    <div className="employees-page">
      <div className="header">
        <h1>Employees</h1>

        <PermissionGate requireManageEmployees>
          <button onClick={handleAddEmployee}>Add Employee</button>
        </PermissionGate>
      </div>

      <div className="employee-list">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            canEdit={permissions.canManageEmployees}
            canViewDetails={permissions.canViewEmployees}
          />
        ))}
      </div>

      {/* Only managers can see role management */}
      <RoleGate allowedRoles={['manager']}>
        <RoleManagementPanel assignableRoles={permissions.assignableRoles} />
      </RoleGate>
    </div>
  );
}
```

### Example 3: Dashboard with Role-Specific Content

```tsx
import { useSession } from '@/hooks/useSession';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/PermissionGate';

function Dashboard() {
  const { userRole } = useSession();
  const permissions = usePermissions();

  return (
    <div className="dashboard">
      <h1>Welcome to ScaleFlow</h1>

      {/* Show different content based on role */}
      {userRole === 'system_admin' && <SystemAdminDashboard />}
      {userRole === 'manager' && <ManagerDashboard />}
      {userRole === 'schedule_manager' && <ScheduleManagerDashboard />}
      {userRole === 'operator' && <OperatorDashboard />}
      {(userRole === 'employee' || userRole === 'staff') && <EmployeeDashboard />}

      {/* Widgets based on permissions */}
      <div className="widgets">
        <PermissionGate requireManageSchedules>
          <UpcomingShiftsWidget />
        </PermissionGate>

        <PermissionGate requireViewEmployees>
          <TeamOverviewWidget />
        </PermissionGate>

        <PermissionGate requireApproveSwaps>
          <PendingApprovalsWidget />
        </PermissionGate>

        {/* Everyone sees their own schedule */}
        <MyScheduleWidget />
      </div>
    </div>
  );
}
```

### Example 4: Settings Page with Granular Permissions

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/PermissionGate';

function SettingsPage() {
  const permissions = usePermissions();

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-sections">
        {/* Profile settings - everyone */}
        <section>
          <h2>Profile</h2>
          <ProfileSettings />
        </section>

        {/* Company settings - managers only */}
        <PermissionGate requireManageCompany>
          <section>
            <h2>Company Settings</h2>
            <CompanySettings />
          </section>
        </PermissionGate>

        {/* Schedule settings - managers and schedule managers */}
        <PermissionGate requireManageSchedules>
          <section>
            <h2>Schedule Settings</h2>
            <ScheduleSettings />
          </section>
        </PermissionGate>

        {/* System settings - system admins only */}
        <PermissionGate requireAccessAdmin>
          <section>
            <h2>System Configuration</h2>
            <SystemSettings />
          </section>
        </PermissionGate>
      </div>
    </div>
  );
}
```

---

## Testing Permissions

### Unit Testing

```tsx
import { describe, it, expect } from 'vitest';
import { getRolePermissions, canModifyShift } from '@/lib/permissions';

describe('Permissions', () => {
  it('should allow manager to modify shifts', () => {
    const permissions = getRolePermissions('manager');
    expect(permissions.canManageSchedules).toBe(true);

    const canModify = canModifyShift('manager', 'company1', 'company1');
    expect(canModify).toBe(true);
  });

  it('should deny employee from modifying shifts', () => {
    const permissions = getRolePermissions('employee');
    expect(permissions.canManageSchedules).toBe(false);

    const canModify = canModifyShift('employee', 'company1', 'company1');
    expect(canModify).toBe(false);
  });
});
```

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the useSession hook
vi.mock('@/hooks/useSession', () => ({
  useSession: () => ({
    userRole: 'manager',
    userProfile: { company_id: 'company1' },
    session: { user: { id: 'user1' } },
  }),
}));

describe('SchedulesPage', () => {
  it('should show create button for managers', () => {
    render(
      <MemoryRouter>
        <SchedulesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Create New Shift')).toBeInTheDocument();
  });
});
```

---

## Best Practices

1. **Always use RLS policies as the primary security layer** - Frontend permissions are for UX only
2. **Use PermissionGate for complex conditional rendering** - Keeps components clean
3. **Use direct hook checks for simple conditions** - More readable for basic if/else
4. **Combine role and permission checks** - Use the most specific check available
5. **Provide helpful error messages** - Use tooltips to explain why access is denied
6. **Test with multiple roles** - Ensure permissions work correctly for each role
7. **Don't expose sensitive data** - Even if hidden, don't fetch data users can't access

---

## Related Documentation

- [Routing and Database Architecture](./ROUTING_AND_DATABASE_ARCHITECTURE.md)
- [Permission Matrix](./PERMISSION_MATRIX.md)
- [Role Types](../src/types/roles.ts)

---

**Last Updated**: 2024-12-08
**Version**: 1.0.0
