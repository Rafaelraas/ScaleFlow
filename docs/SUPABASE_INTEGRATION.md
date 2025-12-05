# Supabase Integration Architecture

This document explains the Supabase integration architecture in ScaleFlow, including best practices, patterns, and guidelines for working with the database.

## Table of Contents

- [Overview](#overview)
- [Architecture Layers](#architecture-layers)
- [Directory Structure](#directory-structure)
- [Usage Patterns](#usage-patterns)
- [Type Safety](#type-safety)
- [Error Handling](#error-handling)
- [Security Best Practices](#security-best-practices)
- [Performance Optimization](#performance-optimization)

## Overview

ScaleFlow uses a **layered architecture** for Supabase integration:

1. **Client Layer** (`src/integrations/supabase/client.ts`) - Single Supabase client instance
2. **Service Layer** (`src/services/supabase/`) - Business logic and data access
3. **Hook Layer** (`src/hooks/supabase/`) - React hooks for component integration
4. **Type Layer** (`src/types/database.ts`) - TypeScript definitions for type safety

This separation provides:
- ✅ **Type Safety** - Full TypeScript support across all layers
- ✅ **Reusability** - Services and hooks can be used across components
- ✅ **Testability** - Each layer can be tested independently
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Security** - Centralized error handling and validation

## Architecture Layers

### 1. Client Layer

**Location:** `src/integrations/supabase/client.ts`

The client layer provides a single, configured Supabase client instance used throughout the application.

```typescript
import { supabase } from '@/integrations/supabase/client';
```

**Key Features:**
- Loads configuration from environment variables
- Validates required environment variables at startup
- Provides a single point of configuration
- Never import `@supabase/supabase-js` directly in other files

**⚠️ Important:** Always use the exported `supabase` client, never create new instances.

### 2. Service Layer

**Location:** `src/services/supabase/`

Services encapsulate all database operations and business logic. They provide a clean API for data access.

**Available Services:**
- `auth.service.ts` - Authentication operations
- `profile.service.ts` - User profile operations
- `error-handler.ts` - Centralized error handling

**Example Service:**

```typescript
// src/services/supabase/profile.service.ts
export async function getProfileById(userId: string): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}
```

**Service Guidelines:**
- Always return structured results: `{ data, error }`
- Include proper TypeScript types for parameters and returns
- Handle errors gracefully
- Keep services focused on a single entity or domain

### 3. Hook Layer

**Location:** `src/hooks/supabase/`

Custom React hooks wrap services and provide state management for components.

**Available Hooks:**
- `useAuth()` - Authentication operations with loading states
- `useProfile(userId)` - Profile data fetching and updating

**Example Hook:**

```typescript
import { useProfile } from '@/hooks/supabase/useProfile';

function MyComponent() {
  const { profile, isLoading, error, updateProfile } = useProfile(userId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Welcome, {profile?.first_name}!</div>;
}
```

**Hook Benefits:**
- Automatic loading states
- Error handling
- React-friendly API
- Refetch capabilities

### 4. Type Layer

**Location:** `src/types/database.ts`

TypeScript definitions for all database entities, ensuring type safety across the application.

**Available Types:**
- `Profile`, `Company`, `Role`, `Shift`, `ShiftTemplate`, `Preference`, `SwapRequest`
- Extended types: `ProfileWithRole`, `ShiftWithDetails`, etc.
- Result types: `QueryResult<T>`, `QueryResultArray<T>`

**Example Type Usage:**

```typescript
import type { Profile, ProfileWithRole } from '@/types/database';

const profile: ProfileWithRole = {
  id: '123',
  first_name: 'John',
  last_name: 'Doe',
  avatar_url: null,
  company_id: 'company-123',
  role_id: 'role-manager',
  roles: { name: 'manager' },
};
```

## Directory Structure

```
src/
├── integrations/
│   └── supabase/
│       └── client.ts              # Supabase client instance
├── services/
│   └── supabase/
│       ├── auth.service.ts        # Authentication service
│       ├── profile.service.ts     # Profile service
│       └── error-handler.ts       # Error handling utilities
├── hooks/
│   └── supabase/
│       ├── useAuth.ts             # Authentication hook
│       └── useProfile.ts          # Profile hook
├── types/
│   └── database.ts                # Database type definitions
└── providers/
    └── SessionContextProvider.tsx # Global session management
```

## Usage Patterns

### Pattern 1: Using Services Directly

Best for: Server-side operations, utilities, or non-React contexts.

```typescript
import * as authService from '@/services/supabase/auth.service';

async function handleSignIn(email: string, password: string) {
  const { user, error } = await authService.signIn({ email, password });
  
  if (error) {
    console.error('Sign in failed:', error.message);
    return;
  }
  
  console.log('User signed in:', user);
}
```

### Pattern 2: Using Hooks in Components

Best for: React components that need reactive data and loading states.

```typescript
import { useProfile } from '@/hooks/supabase/useProfile';
import { useSession } from '@/providers/SessionContextProvider';

function ProfilePage() {
  const { session } = useSession();
  const { profile, isLoading, error, updateProfile } = useProfile(session?.user?.id ?? null);
  
  const handleUpdate = async () => {
    const success = await updateProfile({ first_name: 'New Name' });
    if (success) {
      console.log('Profile updated!');
    }
  };
  
  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {profile && (
        <div>
          <h1>{profile.first_name} {profile.last_name}</h1>
          <button onClick={handleUpdate}>Update</button>
        </div>
      )}
    </div>
  );
}
```

### Pattern 3: Custom Queries in Components

When you need a one-off query not covered by existing services:

```typescript
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/services/supabase/error-handler';

async function fetchCustomData() {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, profiles(*), roles(*)')
    .eq('published', true)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });
  
  if (error) {
    handleSupabaseError(error, 'Failed to load shifts');
    return [];
  }
  
  return data || [];
}
```

## Type Safety

### Database Types

All database types are defined in `src/types/database.ts`. Use these types for:

1. **Query Results:**
```typescript
import type { Profile } from '@/types/database';

const profiles: Profile[] = data || [];
```

2. **Function Parameters:**
```typescript
function updateProfile(profile: Partial<Profile>) {
  // ...
}
```

3. **Component Props:**
```typescript
interface ProfileCardProps {
  profile: ProfileWithRole;
}
```

### Type Inference

Supabase's TypeScript support provides automatic type inference:

```typescript
// TypeScript knows the exact shape of `data`
const { data, error } = await supabase
  .from('profiles')
  .select('id, first_name, last_name')
  .single();

// data is typed as: { id: string; first_name: string | null; last_name: string | null }
```

## Error Handling

### Centralized Error Handler

Use the `error-handler.ts` utility for consistent error handling:

```typescript
import { handleSupabaseError, getUserFriendlyMessage } from '@/services/supabase/error-handler';

// Option 1: Display error toast
const { error } = await supabase.from('profiles').insert(data);
if (error) {
  handleSupabaseError(error, 'Failed to create profile');
}

// Option 2: Get user-friendly message
const message = getUserFriendlyMessage(error);
console.log(message); // "This record already exists" (instead of code 23505)
```

### Error Handling in Services

Services should return errors, not throw them:

```typescript
export async function createProfile(data: ProfileInsert) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert(data)
    .select()
    .single();
  
  return { data: profile, error }; // ✅ Return error
  // Don't: throw error;              // ❌
}
```

### Error Handling in Hooks

Hooks manage error state automatically:

```typescript
const { profile, error } = useProfile(userId);

if (error) {
  // Error is already set in state, you can display it
  return <div>Error: {error.message}</div>;
}
```

## Security Best Practices

### 1. Environment Variables

- ✅ Store credentials in `.env` files
- ✅ Use `.env.example` as a template
- ✅ Never commit `.env` to git
- ✅ Validate environment variables at startup

```typescript
// ✅ Good
const url = import.meta.env.VITE_SUPABASE_URL;

// ❌ Bad
const url = 'https://hardcoded.supabase.co';
```

### 2. Row Level Security (RLS)

All security is enforced at the database level through RLS policies. The anon key is safe to use in client-side code because:

- Supabase enforces RLS policies on all queries
- Users can only access data permitted by RLS rules
- The anon key cannot bypass RLS policies

**Example RLS Policy:**
```sql
-- Employees can only see their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

### 3. Input Validation

Always validate user input before sending to the database:

```typescript
// ✅ Good
function updateProfile(data: Partial<Profile>) {
  if (!data.first_name || data.first_name.trim() === '') {
    throw new Error('First name is required');
  }
  return profileService.updateProfile(userId, data);
}
```

### 4. Least Privilege

Only request the columns you need:

```typescript
// ✅ Good
.select('id, first_name, last_name')

// ❌ Bad (overfetching)
.select('*')
```

## Performance Optimization

### 1. Pagination

Always paginate large result sets:

```typescript
const { data, error, count } = await profileService.getEmployeesByCompany(
  companyId,
  page,
  perPage
);
```

### 2. Selective Fetching

Only fetch the data you need:

```typescript
// ✅ Good - specific columns
.select('id, first_name, email')

// ❌ Bad - all columns
.select('*')
```

### 3. Query Batching

Use Promise.all for parallel queries:

```typescript
const [profilesResult, shiftsResult, rolesResult] = await Promise.all([
  supabase.from('profiles').select('*'),
  supabase.from('shifts').select('*'),
  supabase.from('roles').select('*'),
]);
```

### 4. Caching with React Query

For frequently accessed data, consider using TanStack Query (React Query):

```typescript
import { useQuery } from '@tanstack/react-query';

function useEmployees(companyId: string) {
  return useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => profileService.getEmployeesByCompany(companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Creating New Services

When adding new services:

1. Create a new file in `src/services/supabase/`
2. Define service functions with proper types
3. Return `{ data, error }` format
4. Add corresponding types to `src/types/database.ts`
5. Create a hook in `src/hooks/supabase/` if needed

**Example:**

```typescript
// src/services/supabase/shift.service.ts
import { supabase } from '@/integrations/supabase/client';
import type { Shift } from '@/types/database';

export async function getShiftsByDate(date: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, profiles(*), roles(*)')
    .eq('start_time', date)
    .order('start_time');
  
  return { data, error };
}
```

## Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
