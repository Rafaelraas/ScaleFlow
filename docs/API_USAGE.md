# API Usage Guide

This guide explains how to use the typed API layer in ScaleFlow for database operations.

## Overview

All database operations should go through the typed API functions located in `src/api/`. This provides:

- **Type Safety**: Full TypeScript support with auto-completion
- **Consistency**: Standardized error handling and return types
- **Security**: RLS policies are enforced automatically
- **Maintainability**: Centralized database logic

## Importing API Functions

```typescript
// Import specific functions
import { getCompanyEmployees, updateEmployeeRole } from '@/api/employees';
import { createShift, getCompanyShifts } from '@/api/schedules';

// Or import everything from a module
import * as EmployeeAPI from '@/api/employees';
```

## API Modules

### Companies API (`@/api/companies`)

**Available Functions:**
- `getCurrentUserCompany()` - Get the logged-in user's company
- `getCompanyById(companyId)` - Get a specific company
- `createCompany(name, settings?)` - Create a new company
- `updateCompany(companyId, updates)` - Update company details
- `listAllCompanies()` - List all companies (admin only)
- `deleteCompany(companyId)` - Delete a company (admin only)

**Example Usage:**
```typescript
import { createCompany, updateCompany } from '@/api/companies';

// Create a new company
async function handleCreateCompany() {
  try {
    const company = await createCompany('Acme Corp', {
      timezone: 'America/New_York',
      work_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });
    console.log('Created company:', company);
  } catch (error) {
    console.error('Failed to create company:', error);
  }
}

// Update company settings
async function handleUpdateSettings(companyId: string) {
  try {
    const updated = await updateCompany(companyId, {
      settings: { timezone: 'America/Los_Angeles' },
    });
    console.log('Updated company:', updated);
  } catch (error) {
    console.error('Failed to update company:', error);
  }
}
```

### Profiles API (`@/api/profiles`)

**Available Functions:**
- `getCurrentUserProfile()` - Get current user's profile
- `getProfileById(userId)` - Get a specific user's profile
- `updateCurrentUserProfile(updates)` - Update own profile
- `updateProfile(userId, updates)` - Update any profile (manager/admin)
- `listCompanyProfiles()` - List all profiles in company
- `listAllProfiles()` - List all profiles (admin only)
- `assignUserToCompany(userId, companyId, roleId)` - Assign user to company

**Example Usage:**
```typescript
import { getCurrentUserProfile, updateCurrentUserProfile } from '@/api/profiles';

// Get and update current user's profile
async function updateMyProfile() {
  try {
    const profile = await getCurrentUserProfile();
    
    const updated = await updateCurrentUserProfile({
      first_name: 'John',
      last_name: 'Doe',
    });
    
    console.log('Profile updated:', updated);
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
}
```

### Schedules API (`@/api/schedules`)

**Available Functions:**
- `getMyShifts(startDate?, endDate?)` - Get employee's own shifts
- `getCompanyShifts(startDate?, endDate?, published?)` - Get all company shifts (manager)
- `getShiftById(shiftId)` - Get a specific shift
- `createShift(shift)` - Create a new shift (manager)
- `updateShift(shiftId, updates)` - Update a shift (manager)
- `deleteShift(shiftId)` - Delete a shift (manager)
- `bulkCreateShifts(shifts)` - Create multiple shifts at once
- `publishShifts(shiftIds)` - Publish shifts to employees

**Example Usage:**
```typescript
import { createShift, getCompanyShifts, publishShifts } from '@/api/schedules';

// Create a new shift
async function createNewShift() {
  try {
    const shift = await createShift({
      company_id: 'company-123',
      employee_id: 'user-456',
      role_id: 'role-789',
      start_time: '2024-12-10T09:00:00Z',
      end_time: '2024-12-10T17:00:00Z',
      notes: 'Morning shift',
      published: false,
    });
    console.log('Created shift:', shift);
  } catch (error) {
    console.error('Failed to create shift:', error);
  }
}

// Get unpublished shifts and publish them
async function publishDraftShifts() {
  try {
    const drafts = await getCompanyShifts(undefined, undefined, false);
    const shiftIds = drafts.map(shift => shift.id);
    
    await publishShifts(shiftIds);
    console.log(`Published ${shiftIds.length} shifts`);
  } catch (error) {
    console.error('Failed to publish shifts:', error);
  }
}
```

### Swap Requests API (`@/api/swapRequests`)

**Available Functions:**
- `getMySwapRequests()` - Get swap requests you're involved in
- `getCompanySwapRequests()` - Get all company swap requests (manager)
- `getSwapRequestById(swapRequestId)` - Get a specific swap request
- `createSwapRequest(request)` - Create a new swap request
- `updateSwapRequestStatus(swapRequestId, status, reviewedBy?)` - Update status
- `cancelSwapRequest(swapRequestId)` - Cancel a request
- `approveSwapRequest(swapRequestId, managerId)` - Approve request (manager)
- `rejectSwapRequest(swapRequestId, managerId)` - Reject request (manager)

**Example Usage:**
```typescript
import { createSwapRequest, approveSwapRequest } from '@/api/swapRequests';

// Employee creates a swap request
async function requestSwap(myShiftId: string, targetUserId: string) {
  try {
    const request = await createSwapRequest({
      shift_id: myShiftId,
      requester_id: 'current-user-id',
      target_id: targetUserId,
      requested_shift_id: null,
      message: 'Can we swap shifts this week?',
    });
    console.log('Swap request created:', request);
  } catch (error) {
    console.error('Failed to create swap request:', error);
  }
}

// Manager approves a swap request
async function handleApproveSwap(requestId: string, managerId: string) {
  try {
    await approveSwapRequest(requestId, managerId);
    console.log('Swap request approved');
  } catch (error) {
    console.error('Failed to approve swap:', error);
  }
}
```

### Preferences API (`@/api/preferences`)

**Available Functions:**
- `getMyPreferences()` - Get current user's preferences
- `getCompanyPreferences()` - Get all company preferences (manager)
- `getPreferenceById(preferenceId)` - Get a specific preference
- `createPreference(preference)` - Create a new preference
- `updatePreference(preferenceId, updates)` - Update a preference
- `approvePreference(preferenceId)` - Approve preference (manager)
- `rejectPreference(preferenceId)` - Reject preference (manager)
- `deletePreference(preferenceId)` - Delete a preference

**Example Usage:**
```typescript
import { createPreference, approvePreference } from '@/api/preferences';

// Employee creates a preference
async function createTimeOffPreference() {
  try {
    const preference = await createPreference({
      profile_id: 'user-123',
      preference_type: 'time_off',
      preference_value: {
        dates: ['2024-12-25', '2024-12-26'],
        reason: 'Holiday',
      },
      status: 'pending',
    });
    console.log('Preference created:', preference);
  } catch (error) {
    console.error('Failed to create preference:', error);
  }
}

// Manager approves a preference
async function handleApprovePreference(preferenceId: string) {
  try {
    await approvePreference(preferenceId);
    console.log('Preference approved');
  } catch (error) {
    console.error('Failed to approve preference:', error);
  }
}
```

### Employees API (`@/api/employees`)

**Available Functions:**
- `getCompanyEmployees()` - Get all employees in company (manager)
- `getEmployeeById(employeeId)` - Get a specific employee
- `updateEmployeeRole(employeeId, roleId)` - Update employee's role (manager)
- `removeEmployeeFromCompany(employeeId)` - Remove employee (manager)
- `getEmployeesByRole(roleName)` - Get employees by role
- `getEmployeeStatistics()` - Get employee statistics

**Example Usage:**
```typescript
import { getCompanyEmployees, updateEmployeeRole } from '@/api/employees';

// List all employees
async function listEmployees() {
  try {
    const employees = await getCompanyEmployees();
    console.log(`Found ${employees.length} employees`);
    return employees;
  } catch (error) {
    console.error('Failed to list employees:', error);
  }
}

// Promote an employee to manager
async function promoteToManager(employeeId: string, managerRoleId: string) {
  try {
    await updateEmployeeRole(employeeId, managerRoleId);
    console.log('Employee promoted to manager');
  } catch (error) {
    console.error('Failed to promote employee:', error);
  }
}
```

## Using with React Query

The API functions work great with TanStack Query (React Query):

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanyShifts, createShift } from '@/api/schedules';

// Fetch shifts
function useShifts(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['shifts', startDate, endDate],
    queryFn: () => getCompanyShifts(startDate, endDate),
  });
}

// Create shift mutation
function useCreateShift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      // Invalidate and refetch shifts
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

// Usage in component
function ShiftsPage() {
  const { data: shifts, isLoading, error } = useShifts();
  const createMutation = useCreateShift();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {shifts?.map(shift => (
        <div key={shift.id}>{/* render shift */}</div>
      ))}
      <button onClick={() => createMutation.mutate({/* shift data */})}>
        Create Shift
      </button>
    </div>
  );
}
```

## Error Handling

All API functions throw errors that should be caught and handled:

```typescript
import { createShift } from '@/api/schedules';
import { showError } from '@/utils/toast';

async function handleCreateShift(shiftData) {
  try {
    const shift = await createShift(shiftData);
    showSuccess('Shift created successfully');
    return shift;
  } catch (error) {
    // Error from Supabase or network
    console.error('Failed to create shift:', error);
    showError('Failed to create shift. Please try again.');
    throw error; // Re-throw if needed
  }
}
```

## RLS Policy Enforcement

Remember that all API functions respect Row-Level Security policies:

- **Employees** can only access their own data
- **Managers** can access all data within their company
- **System Admins** can access all data

If an operation fails due to RLS, you'll get an error from Supabase. The API layer doesn't add additional permission checks - it relies on the database policies.

## Best Practices

1. **Always use the API layer** - Don't call `supabase.from()` directly in components
2. **Handle errors gracefully** - Wrap API calls in try-catch blocks
3. **Use React Query** - Cache and synchronize server state efficiently
4. **Type everything** - The API functions are fully typed; use them!
5. **Check RLS policies** - If an operation fails, verify the RLS policy allows it

## Adding New API Functions

When adding new API functions:

1. Add the function to the appropriate file in `src/api/`
2. Export it from `src/api/index.ts`
3. Add JSDoc comments documenting the RLS policy
4. Use TypeScript types from `src/types/database.ts`
5. Add tests if needed

Example:

```typescript
/**
 * Get shift statistics for a company
 * RLS Policy: managers can view stats for their company
 */
export async function getShiftStatistics(companyId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('company_id', companyId);

  if (error) throw error;
  
  // Process and return statistics
  return {
    total: data.length,
    published: data.filter(s => s.published).length,
    unpublished: data.filter(s => !s.published).length,
  };
}
```

## Related Documentation

- [Security and Roles](./security-and-roles.md) - Security model and RLS policies
- [Database Schema](./DATABASE.md) - Database structure and relationships
- [Type Definitions](../src/types/database.ts) - TypeScript types for all tables

---

**Need help?** Check the source code in `src/api/` for more examples and documentation.
