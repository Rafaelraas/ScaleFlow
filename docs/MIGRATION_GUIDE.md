# Migration Guide: New Supabase Architecture

This guide helps developers migrate existing code to use the new service-oriented Supabase architecture.

## Overview of Changes

The Supabase integration has been refactored into a cleaner, more maintainable architecture:

- **Before:** Direct Supabase calls scattered throughout components
- **After:** Organized services, custom hooks, and centralized error handling

## Benefits

✅ **Type Safety** - Full TypeScript support with database types  
✅ **Reusability** - Services can be used across components  
✅ **Testability** - Each layer can be tested independently  
✅ **Maintainability** - Clear separation of concerns  
✅ **Better DX** - Consistent patterns and error handling  

## Migration Patterns

### Pattern 1: Direct Supabase Calls → Services

**Before:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('profiles')
  .select('*, roles(name)')
  .eq('id', userId)
  .single();

if (error) {
  showError('Failed to fetch profile');
  return;
}
```

**After:**
```typescript
import * as profileService from '@/services/supabase/profile.service';
import { handleSupabaseError } from '@/services/supabase/error-handler';

const { data, error } = await profileService.getProfileById(userId);

if (error) {
  handleSupabaseError(error, 'Failed to fetch profile');
  return;
}
```

### Pattern 2: useState + useEffect → Custom Hooks

**Before:**
```typescript
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      setError(error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };
  
  if (userId) {
    fetchProfile();
  }
}, [userId]);
```

**After:**
```typescript
import { useProfile } from '@/hooks/supabase/useProfile';

const { profile, isLoading, error } = useProfile(userId);
```

### Pattern 3: Auth Operations

**Before:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const handleSignIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    showError(error.message);
    return;
  }
  
  // Success logic
};
```

**After:**
```typescript
import { useAuth } from '@/hooks/supabase/useAuth';

function LoginForm() {
  const { signIn, isLoading, error } = useAuth();
  
  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn({ email, password });
    
    if (result.error) {
      // Error is already handled in the hook
      return;
    }
    
    // Success logic
  };
  
  return (
    <form>
      {/* ... */}
      {error && <div>Error: {error.message}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### Pattern 4: Error Handling

**Before:**
```typescript
const { error } = await supabase.from('profiles').insert(data);

if (error) {
  if (error.code === '23505') {
    showError('This record already exists');
  } else if (error.code === '42501') {
    showError('You do not have permission');
  } else {
    showError(error.message);
  }
}
```

**After:**
```typescript
import { handleSupabaseError } from '@/services/supabase/error-handler';

const { error } = await supabase.from('profiles').insert(data);

if (error) {
  handleSupabaseError(error, 'Failed to create profile');
}
```

## Step-by-Step Migration

### Step 1: Add Type Imports

Replace inline types with imports from `src/types/database.ts`:

```typescript
// Before
interface Profile {
  id: string;
  first_name: string | null;
  // ...
}

// After
import type { Profile } from '@/types/database';
```

### Step 2: Replace Direct Supabase Calls

Identify direct Supabase calls in your component:

```typescript
// Find patterns like:
supabase.from('profiles').select(...)
supabase.auth.signIn(...)
```

Replace with service calls:

```typescript
import * as profileService from '@/services/supabase/profile.service';
import * as authService from '@/services/supabase/auth.service';

// Use services instead
profileService.getProfileById(...)
authService.signIn(...)
```

### Step 3: Simplify State Management with Hooks

Replace complex state management with custom hooks:

```typescript
// Before: Multiple useState + useEffect
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  // Fetch logic
}, []);

// After: Single hook
const { profile, isLoading, error } = useProfile(userId);
```

### Step 4: Update Error Handling

Replace custom error handling with centralized utilities:

```typescript
import { handleSupabaseError, getUserFriendlyMessage } from '@/services/supabase/error-handler';

// Display error toast
handleSupabaseError(error);

// Or get message for custom display
const message = getUserFriendlyMessage(error);
```

## Migration Checklist

For each file you migrate:

- [ ] Import types from `src/types/database.ts`
- [ ] Replace direct Supabase calls with service functions
- [ ] Use custom hooks for component state management
- [ ] Use centralized error handling utilities
- [ ] Test the migrated component
- [ ] Remove unused Supabase imports
- [ ] Update any related tests

## Common Migration Scenarios

### Scenario 1: Simple Data Fetching

**Component:** Employee list page

**Before:**
```typescript
const [employees, setEmployees] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) {
      showError(error.message);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };
  
  fetchEmployees();
}, [companyId]);
```

**After:**
```typescript
// Option 1: Use service directly
import * as profileService from '@/services/supabase/profile.service';
import { handleSupabaseError } from '@/services/supabase/error-handler';

const [employees, setEmployees] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchEmployees = async () => {
    const { data, error } = await profileService.getEmployeesByCompany(companyId);
    
    if (error) {
      handleSupabaseError(error, 'Failed to load employees');
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };
  
  fetchEmployees();
}, [companyId]);

// Option 2: Create a custom hook (recommended for reusable logic)
function useEmployees(companyId: string) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    profileService.getEmployeesByCompany(companyId).then(({ data, error }) => {
      if (error) {
        setError(error);
      } else {
        setEmployees(data || []);
      }
      setLoading(false);
    });
  }, [companyId]);
  
  return { employees, loading, error };
}
```

### Scenario 2: Form Submission

**Component:** Profile update form

**Before:**
```typescript
const handleSubmit = async (formData) => {
  setLoading(true);
  
  const { error } = await supabase
    .from('profiles')
    .update(formData)
    .eq('id', userId);
  
  if (error) {
    showError('Failed to update profile');
  } else {
    showSuccess('Profile updated!');
  }
  
  setLoading(false);
};
```

**After:**
```typescript
import { useProfile } from '@/hooks/supabase/useProfile';

function ProfileForm() {
  const { profile, updateProfile, isLoading } = useProfile(userId);
  
  const handleSubmit = async (formData) => {
    const success = await updateProfile(formData);
    
    if (success) {
      showSuccess('Profile updated!');
    }
    // Errors are handled automatically by the hook
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Scenario 3: Authentication

**Component:** Login page

**Before:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleLogin = async (email, password) => {
  setLoading(true);
  setError(null);
  
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (authError) {
    setError(authError.message);
  } else {
    navigate('/dashboard');
  }
  
  setLoading(false);
};
```

**After:**
```typescript
import { useAuth } from '@/hooks/supabase/useAuth';

function LoginPage() {
  const { signIn, isLoading, error } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (email, password) => {
    const result = await signIn({ email, password });
    
    if (!result.error) {
      navigate('/dashboard');
    }
  };
  
  return (
    <form>
      {error && <div className="error">{error.message}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

## Testing Migrated Code

### Unit Testing Services

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as profileService from '@/services/supabase/profile.service';

describe('profileService', () => {
  it('should fetch profile by ID', async () => {
    const { data, error } = await profileService.getProfileById('123');
    
    expect(error).toBeNull();
    expect(data).toHaveProperty('id', '123');
  });
});
```

### Testing Components with Hooks

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { useProfile } from '@/hooks/supabase/useProfile';
import ProfileComponent from './ProfileComponent';

vi.mock('@/hooks/supabase/useProfile');

describe('ProfileComponent', () => {
  it('displays profile data', async () => {
    (useProfile as vi.Mock).mockReturnValue({
      profile: { first_name: 'John', last_name: 'Doe' },
      isLoading: false,
      error: null,
    });
    
    render(<ProfileComponent userId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Issue: "Cannot find module '@/services/supabase/...'"

**Solution:** Ensure TypeScript path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Type errors with database types

**Solution:** Import types from `@/types/database`:

```typescript
import type { Profile, ProfileWithRole } from '@/types/database';
```

### Issue: Hook not updating when data changes

**Solution:** Use the `refetch` method:

```typescript
const { profile, refetch } = useProfile(userId);

// After updating data
await updateProfile(data);
refetch(); // Manually trigger refetch
```

## Need Help?

- Check [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md) for architecture details
- Review [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for configuration
- Look at existing migrated components for examples
- Ask in team chat or create an issue

## Next Steps

After migrating:

1. Test thoroughly in development
2. Review the [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md) guide
3. Consider adding React Query for advanced caching
4. Share feedback on the new architecture
