# API Guidelines

## Overview

This document outlines the guidelines for interacting with ScaleFlow's backend through Supabase. While ScaleFlow doesn't currently expose a public REST API, this guide helps developers understand the internal API patterns and prepares for future API development.

## Supabase Client Usage

### Initialization

The Supabase client is configured in `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Authentication

All authenticated requests automatically include the JWT token from the current session:

```typescript
// Supabase handles auth headers automatically
const { data, error } = await supabase
  .from('profiles')
  .select('*');
```

## Data Access Patterns

### Read Operations

#### Basic Query

```typescript
// Fetch all records
const { data, error } = await supabase
  .from('table_name')
  .select('*');

if (error) {
  console.error('Query error:', error);
  throw error;
}
```

#### Filtered Query

```typescript
// Single filter
const { data, error } = await supabase
  .from('shifts')
  .select('*')
  .eq('company_id', companyId);

// Multiple filters
const { data, error } = await supabase
  .from('shifts')
  .select('*')
  .eq('company_id', companyId)
  .eq('status', 'scheduled')
  .gte('start_time', startDate);
```

#### Select Specific Columns

```typescript
// Only select needed columns for better performance
const { data, error } = await supabase
  .from('profiles')
  .select('id, first_name, last_name, avatar_url')
  .eq('company_id', companyId);
```

#### Joins (Foreign Key Expansion)

```typescript
// One-to-one relationship
const { data, error } = await supabase
  .from('profiles')
  .select('*, roles(name)')
  .eq('id', userId)
  .single();

// One-to-many relationship
const { data, error } = await supabase
  .from('shifts')
  .select('*, profiles:assigned_to(first_name, last_name)')
  .eq('company_id', companyId);
```

#### Ordering

```typescript
const { data, error } = await supabase
  .from('shifts')
  .select('*')
  .order('start_time', { ascending: true });

// Multiple order columns
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .order('last_name', { ascending: true })
  .order('first_name', { ascending: true });
```

#### Pagination

```typescript
// Range-based pagination (recommended)
const page = 1;
const pageSize = 10;
const start = (page - 1) * pageSize;
const end = start + pageSize - 1;

const { data, error } = await supabase
  .from('shifts')
  .select('*')
  .range(start, end);

// Get total count
const { count, error } = await supabase
  .from('shifts')
  .select('*', { count: 'exact', head: true });
```

#### Text Search

```typescript
// Case-insensitive search
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .ilike('first_name', '%john%');

// Full-text search (if configured)
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .textSearch('full_name', 'john');
```

### Write Operations

#### Insert Single Record

```typescript
const { data, error } = await supabase
  .from('shifts')
  .insert({
    company_id: companyId,
    title: 'Morning Shift',
    start_time: new Date('2024-01-15T08:00:00'),
    end_time: new Date('2024-01-15T16:00:00'),
    created_by: userId,
  })
  .select()
  .single();

if (error) throw error;
```

#### Insert Multiple Records

```typescript
const { data, error } = await supabase
  .from('shifts')
  .insert([
    { title: 'Morning Shift', start_time: '2024-01-15T08:00:00' },
    { title: 'Evening Shift', start_time: '2024-01-15T16:00:00' },
  ])
  .select();
```

#### Update Record

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    first_name: 'John',
    last_name: 'Doe',
    updated_at: new Date().toISOString(),
  })
  .eq('id', userId)
  .select()
  .single();

if (error) throw error;
```

#### Upsert (Insert or Update)

```typescript
const { data, error } = await supabase
  .from('preferences')
  .upsert({
    profile_id: profileId,
    preferred_days: ['Monday', 'Wednesday', 'Friday'],
    max_hours_week: 40,
  }, {
    onConflict: 'profile_id',
  })
  .select();
```

#### Delete Record

```typescript
const { error } = await supabase
  .from('shifts')
  .delete()
  .eq('id', shiftId);

if (error) throw error;
```

### Error Handling

#### Standard Error Pattern

```typescript
import { showError, showSuccess } from '@/utils/toast';

try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) throw error;
  
  // Process data
  showSuccess('Operation successful');
  return data;
} catch (error) {
  console.error('Operation failed:', error);
  showError('Failed to complete operation');
  throw error;
}
```

#### Specific Error Handling

```typescript
const { data, error } = await supabase
  .from('profiles')
  .insert(newProfile)
  .select()
  .single();

if (error) {
  if (error.code === '23505') {
    showError('A user with this email already exists');
  } else if (error.code === '23503') {
    showError('Invalid company or role reference');
  } else {
    showError('Failed to create profile');
  }
  throw error;
}
```

## Integration with TanStack Query

### Query Pattern

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useShifts = (companyId: string) => {
  return useQuery({
    queryKey: ['shifts', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*, profiles:assigned_to(first_name, last_name)')
        .eq('company_id', companyId)
        .order('start_time');
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### Mutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shiftData: ShiftInput) => {
      const { data, error } = await supabase
        .from('shifts')
        .insert(shiftData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      showSuccess('Shift created successfully');
    },
    onError: (error) => {
      console.error('Failed to create shift:', error);
      showError('Failed to create shift');
    },
  });
};
```

### Optimistic Updates

```typescript
export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Shift> }) => {
      const { data: updated, error } = await supabase
        .from('shifts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['shifts'] });
      
      // Snapshot the previous value
      const previousShifts = queryClient.getQueryData(['shifts']);
      
      // Optimistically update
      queryClient.setQueryData(['shifts'], (old: Shift[] | undefined) => {
        if (!old) return old;
        return old.map(shift => 
          shift.id === id ? { ...shift, ...data } : shift
        );
      });
      
      return { previousShifts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousShifts) {
        queryClient.setQueryData(['shifts'], context.previousShifts);
      }
      showError('Failed to update shift');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};
```

## Real-time Subscriptions

### Basic Subscription

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useShiftsSubscription = (companyId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('shifts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shifts',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          console.log('Shift change:', payload);
          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['shifts', companyId] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);
};
```

### Specific Event Subscription

```typescript
const channel = supabase
  .channel('custom-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'shifts' },
    (payload) => {
      console.log('New shift:', payload.new);
    }
  )
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'shifts' },
    (payload) => {
      console.log('Updated shift:', payload.new);
    }
  )
  .subscribe();
```

## API Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad
const { data } = await supabase.from('table').select('*');

// ✅ Good
const { data, error } = await supabase.from('table').select('*');
if (error) throw error;
```

### 2. Select Only Needed Columns

```typescript
// ❌ Bad - Fetches all columns
const { data } = await supabase.from('profiles').select('*');

// ✅ Good - Only fetch what you need
const { data } = await supabase
  .from('profiles')
  .select('id, first_name, last_name');
```

### 3. Use Pagination for Large Datasets

```typescript
// ❌ Bad - Fetches all records
const { data } = await supabase.from('shifts').select('*');

// ✅ Good - Use pagination
const { data } = await supabase
  .from('shifts')
  .select('*')
  .range(0, 9); // First 10 records
```

### 4. Use Proper Query Keys

```typescript
// ❌ Bad - Not specific enough
useQuery({ queryKey: ['data'], ... });

// ✅ Good - Hierarchical and specific
useQuery({ 
  queryKey: ['shifts', companyId, 'scheduled', { date: selectedDate }],
  ...
});
```

### 5. Invalidate Queries After Mutations

```typescript
// ✅ Good - Invalidate related queries
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['shifts'] });
  queryClient.invalidateQueries({ queryKey: ['schedules'] });
}
```

### 6. Use TypeScript Types

```typescript
// Define types
interface Shift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  company_id: string;
  assigned_to?: string;
}

// Use in queries
const { data } = await supabase
  .from('shifts')
  .select('*')
  .returns<Shift[]>();
```

## Rate Limiting

Currently, rate limiting is handled by Supabase:
- Anonymous requests: ~100 requests/second
- Authenticated requests: Higher limits based on plan

For future public API:
- Implement rate limiting per user/API key
- Return proper HTTP headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- Return 429 status code when limit exceeded

## Future API Development

### REST API Considerations

When building a public REST API:

1. **Authentication**
   - Use API keys or OAuth 2.0
   - JWT tokens for session management
   - Refresh token rotation

2. **Versioning**
   - URL versioning: `/api/v1/shifts`
   - Header versioning: `Accept: application/vnd.scaleflow.v1+json`

3. **Response Format**
   ```json
   {
     "data": [...],
     "meta": {
       "page": 1,
       "per_page": 10,
       "total": 100
     },
     "links": {
       "next": "/api/v1/shifts?page=2",
       "prev": null
     }
   }
   ```

4. **Error Format**
   ```json
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Invalid input data",
       "details": [
         {
           "field": "start_time",
           "message": "Start time must be before end time"
         }
       ]
     }
   }
   ```

5. **HTTP Status Codes**
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 422: Unprocessable Entity
   - 429: Too Many Requests
   - 500: Internal Server Error

### GraphQL Considerations

Alternative to REST:

```graphql
query GetShifts($companyId: ID!, $date: DateTime) {
  shifts(companyId: $companyId, date: $date) {
    id
    title
    startTime
    endTime
    assignedTo {
      id
      firstName
      lastName
    }
  }
}
```

## Testing API Calls

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('useShifts', () => {
  it('should fetch shifts for company', async () => {
    const mockData = [{ id: '1', title: 'Morning Shift' }];
    
    vi.spyOn(supabase.from('shifts'), 'select').mockResolvedValue({
      data: mockData,
      error: null,
    });
    
    const { result } = renderHook(() => useShifts('company-123'));
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
```

### Integration Tests

```typescript
// Test actual Supabase calls in test environment
describe('Shift API', () => {
  it('should create and fetch shift', async () => {
    const newShift = {
      company_id: testCompanyId,
      title: 'Test Shift',
      start_time: new Date(),
      end_time: new Date(),
    };
    
    const { data: created } = await supabase
      .from('shifts')
      .insert(newShift)
      .select()
      .single();
    
    expect(created).toBeDefined();
    expect(created.title).toBe('Test Shift');
    
    // Clean up
    await supabase.from('shifts').delete().eq('id', created.id);
  });
});
```

## Conclusion

These guidelines ensure consistent, efficient, and maintainable API interactions throughout the ScaleFlow application. Following these patterns will help maintain code quality and make future API development smoother.
