# ScaleFlow Architecture Documentation

## Overview

ScaleFlow is built as a modern Single Page Application (SPA) using React with a serverless backend powered by Supabase. This document provides an in-depth look at the application's architecture, design patterns, and technical decisions.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Application (SPA)                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │   │
│  │  │  Pages   │  │Components│  │   State Management   │  │   │
│  │  │          │  │          │  │ - Session Context    │  │   │
│  │  │ - Index  │  │ - Forms  │  │ - TanStack Query     │  │   │
│  │  │ - Login  │  │ - UI Lib │  │ - Local State        │  │   │
│  │  │ - Dash   │  │ - Layout │  │                      │  │   │
│  │  └──────────┘  └──────────┘  └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Supabase Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth       │  │  PostgreSQL  │  │  Storage     │         │
│  │              │  │              │  │              │         │
│  │ - JWT Auth   │  │ - RLS        │  │ - Files      │         │
│  │ - Sessions   │  │ - Relations  │  │ - Avatars    │         │
│  │ - Providers  │  │ - Functions  │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Real-time Subscriptions                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

- **React 18.3** - Core UI library with concurrent features
- **TypeScript 5.5** - Type safety and enhanced developer experience
- **Vite 6.3** - Fast build tool and development server
- **React Router DOM 6** - Client-side routing

### Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── layout/             # App layout components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── Navbar.tsx      # Top navigation bar
│   │   └── Sidebar.tsx     # Side navigation menu
│   ├── ui/                 # shadcn/ui component library
│   │   ├── button.tsx      # Button component
│   │   ├── dialog.tsx      # Dialog/modal component
│   │   └── ...             # Other UI primitives
│   ├── ErrorBoundary.tsx   # Error boundary component
│   ├── ProtectedRoute.tsx  # Route protection wrapper
│   └── *Form.tsx           # Form components
│
├── pages/                  # Route-level page components
│   ├── Index.tsx           # Landing page
│   ├── Login.tsx           # Authentication
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Schedules.tsx       # Schedule management
│   ├── Employees.tsx       # Employee management
│   └── ...                 # Other pages
│
├── hooks/                  # Custom React hooks
│   ├── use-mobile.tsx      # Mobile detection hook
│   └── use-toast.ts        # Toast notification hook
│
├── providers/              # React context providers
│   └── SessionContextProvider.tsx  # Auth session management
│
├── integrations/           # External service integrations
│   └── supabase/
│       └── client.ts       # Supabase client configuration
│
├── lib/                    # Utility libraries
│   └── utils.ts            # Common utility functions
│
├── utils/                  # Helper utilities
│   └── toast.ts            # Toast notification helpers
│
├── App.tsx                 # Main app component with routes
├── main.tsx                # Application entry point
└── globals.css             # Global styles and Tailwind config
```

### State Management Strategy

ScaleFlow uses a hybrid state management approach:

#### 1. Session Context (Global State)
```typescript
// Located in: src/providers/SessionContextProvider.tsx
interface SessionContextType {
  session: Session | null;        // Supabase session
  isLoading: boolean;             // Loading state
  userProfile: UserProfile | null; // User profile data
  userRole: string | null;         // User role name
}
```

**Purpose:**
- Manages authentication state across the app
- Provides user profile and role information
- Handles session lifecycle (login, logout, refresh)

**Usage:**
```typescript
const { session, userProfile, userRole } = useSession();
```

#### 2. TanStack Query (Server State)
```typescript
// Example usage
const { data, isLoading, error } = useQuery({
  queryKey: ['employees', companyId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) throw error;
    return data;
  },
});
```

**Purpose:**
- Caching server data
- Automatic refetching and background updates
- Optimistic updates
- Request deduplication

**Key Patterns:**
- Query keys use hierarchical structure: `['entity', 'id', 'sub-entity']`
- Mutations invalidate related queries for automatic UI updates
- Stale time configured per query type

#### 3. Local Component State
```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
```

**Purpose:**
- UI state (modals, dropdowns, selected items)
- Form state (managed by React Hook Form)
- Temporary/ephemeral state

### Routing Architecture

All routes are defined in `src/App.tsx`:

```typescript
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected Routes (any authenticated user) */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
  </Route>
  
  {/* Role-specific Routes */}
  <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
    <Route path="/schedules" element={<Layout><Schedules /></Layout>} />
  </Route>
</Routes>
```

**Route Protection:**
- `<ProtectedRoute>` - Requires authentication
- `allowedRoles` prop - Restricts by user role
- `requiresCompany` prop - Requires company association
- Automatic redirects for unauthorized access

### Component Patterns

#### 1. Page Components
```typescript
// Location: src/pages/PageName.tsx
// Pattern: One component per route, handles page-level logic

const PageName = () => {
  const { userProfile } = useSession();
  const { data, isLoading } = useQuery(...);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="container mx-auto p-6">
      {/* Page content */}
    </div>
  );
};

export default PageName;
```

#### 2. Form Components
```typescript
// Location: src/components/FormName.tsx
// Pattern: React Hook Form + Zod validation

const formSchema = z.object({
  field: z.string().min(1, 'Required'),
});

const FormComponent = ({ onSuccess }: Props) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  
  const mutation = useMutation({
    mutationFn: async (data) => {
      // Supabase operation
    },
  });
  
  return <Form {...form}>{/* fields */}</Form>;
};
```

#### 3. Layout Components
```typescript
// Location: src/components/layout/
// Pattern: Composition pattern for layouts

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  </div>
);
```

## Backend Architecture

### Supabase Integration

#### Database Schema

**Key Tables:**
- `profiles` - User profiles with role and company associations
- `roles` - User role definitions (system_admin, manager, employee)
- `companies` - Company/organization information
- `shifts` - Scheduled work shifts
- `shift_templates` - Reusable shift templates
- `preferences` - Employee availability preferences
- `swap_requests` - Shift swap requests between employees

**Relationships:**
```
profiles >─── company_id ──< companies
profiles >─── role_id ────< roles
shifts >───── company_id ──< companies
shifts >───── assigned_to ─< profiles
preferences >─ profile_id ──< profiles
swap_requests ─ requester_id ──< profiles
               │
               └─ target_id ────< profiles
```

#### Row-Level Security (RLS)

All tables use RLS policies to enforce access control:

```sql
-- Example: Employees can only view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Example: Managers can view all company employees
CREATE POLICY "Managers can view company profiles"
ON profiles FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles 
    WHERE id = auth.uid() AND role_name = 'manager'
  )
);
```

#### Authentication Flow

```
1. User enters credentials
   ↓
2. Supabase Auth validates credentials
   ↓
3. JWT token issued and stored in localStorage
   ↓
4. Session context fetches user profile
   ↓
5. User role determines available routes
   ↓
6. Application renders role-specific UI
```

### Real-time Features

Supabase provides real-time subscriptions for live updates:

```typescript
// Example: Listen for shift changes
const subscription = supabase
  .channel('shifts-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'shifts',
      filter: `company_id=eq.${companyId}`
    },
    (payload) => {
      // Handle real-time update
      queryClient.invalidateQueries(['shifts']);
    }
  )
  .subscribe();
```

## Data Flow

### Read Operations

```
User Action → React Query → Supabase Client → PostgreSQL → RLS Check
                ↓                                             ↓
           Cache Hit?                                    Allowed?
                ↓                                             ↓
          Return Cached                                 Return Data
                                                             ↓
                                                        Update Cache
                                                             ↓
                                                        Render UI
```

### Write Operations

```
User Submits Form → Validation (Zod) → Mutation → Supabase Client
                                          ↓
                                    PostgreSQL Write
                                          ↓
                                     RLS Check
                                          ↓
                                Success/Error Response
                                          ↓
                                  Invalidate Queries
                                          ↓
                                   Refetch & Update UI
                                          ↓
                                Show Toast Notification
```

## Security Architecture

### Authentication & Authorization

1. **JWT-based Authentication**
   - Tokens stored securely in localStorage
   - Automatic token refresh on expiration
   - Token included in all API requests

2. **Role-based Access Control (RBAC)**
   - Three roles: `system_admin`, `manager`, `employee`
   - Route-level protection via `ProtectedRoute`
   - Database-level enforcement via RLS

3. **Data Isolation**
   - Companies cannot access other companies' data
   - Employees can only view their own data (unless manager)
   - System admins have platform-wide access

### Security Best Practices

- ✅ Environment variables for sensitive config
- ✅ Input validation on client and server
- ✅ SQL injection prevention via parameterized queries
- ✅ XSS prevention via React's built-in escaping
- ✅ CSRF protection via SameSite cookies
- ✅ HTTPS enforcement in production

## Performance Optimizations

### Implemented

1. **Code Splitting**
   - Pages loaded on-demand (potential improvement)
   - Lazy loading for heavy components

2. **Query Caching**
   - TanStack Query caches all server data
   - Stale-while-revalidate strategy
   - Background refetching

3. **Bundle Optimization**
   - Tree shaking unused code
   - Minification in production
   - Gzip compression

### Future Optimizations

1. **Manual Chunk Splitting**
   - Vendor chunks separate from application code
   - Route-based code splitting

2. **Image Optimization**
   - WebP format support
   - Lazy loading images
   - CDN for static assets

3. **Database Optimization**
   - Query result caching
   - Database indexes on frequent queries
   - Pagination for large datasets (already implemented)

## Testing Strategy

### Current Coverage

- Unit tests for utility functions
- Component tests for critical components
- Integration tests for forms
- Test files: 8 (targeting critical paths)

### Testing Tools

- **Vitest** - Fast unit test runner
- **@testing-library/react** - Component testing
- **@testing-library/jest-dom** - DOM matchers

### Test Patterns

```typescript
describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
  
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## Deployment Architecture

### Build Process

```
1. npm run build
   ↓
2. Vite bundles application
   ↓
3. TypeScript compilation
   ↓
4. Tailwind CSS purging
   ↓
5. Asset optimization
   ↓
6. Output to /dist directory
```

### Deployment Targets

**Vercel (Primary)**
- Automatic deployments on push to main
- Environment variables configured in dashboard
- Edge network for fast global delivery

**GitHub Pages (Alternative)**
- GitHub Actions workflow for deployment
- Static hosting from gh-pages branch

### Environment Configuration

```env
# Production
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

## Scalability Considerations

### Current Architecture Supports

- ✅ Horizontal scaling (stateless frontend)
- ✅ Database connection pooling via Supabase
- ✅ CDN caching for static assets
- ✅ Serverless backend (auto-scales)

### Future Scaling Needs

- Database query optimization for large datasets
- Implement caching layer (Redis) for frequent queries
- Background jobs for heavy operations
- Rate limiting on API endpoints

## Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Run in development mode with hot reloading
# Available at http://localhost:5173
```

### Build for Production

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Quality Checks

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Tests
npm run test
```

## Monitoring & Observability

### Current Implementation

- Browser console logging for development
- Toast notifications for user-facing errors
- Error boundaries for graceful error handling

### Recommended Additions

- Application performance monitoring (APM)
- Error tracking (e.g., Sentry)
- Analytics (user behavior tracking)
- Performance metrics (Core Web Vitals)

## Conclusion

ScaleFlow's architecture prioritizes:
- **Developer Experience** - Modern tooling and patterns
- **Type Safety** - TypeScript throughout
- **Performance** - Optimized bundle and caching
- **Security** - Role-based access and RLS
- **Maintainability** - Clear structure and patterns

This architecture provides a solid foundation for future growth and feature additions while maintaining code quality and developer productivity.
