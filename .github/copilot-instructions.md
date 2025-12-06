# GitHub Copilot Instructions for ScaleFlow

These instructions are for AI coding agents working in this repo.

## Big picture
- This is a React 18 + Vite + TypeScript SPA for a SaaS shift scheduling platform.
- Routing and access control are centralized in `src/App.tsx` with `react-router-dom` and `ProtectedRoute`.
- Auth/session and role logic live in `src/providers/SessionContextProvider.tsx`, backed by Supabase (`src/integrations/supabase/client.ts`).
- Layout is shared via `src/components/layout/Layout.tsx` (wraps `Navbar` + `Sidebar` + page content).
- UI is built with Tailwind CSS and shadcn/ui in `src/components/ui/**`.

## Tech Stack
- **React 18.3** - UI library with functional components and hooks
- **TypeScript 5.5** - Type-safe JavaScript with strict mode enabled
- **Vite 6.3** - Build tool and development server
- **React Router DOM 6** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS (REQUIRED for all styling)
- **shadcn/ui** - Prebuilt accessible components (DO NOT edit files in `src/components/ui/`)
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, RLS)
- **TanStack Query** - Server state management and caching
- **React Hook Form + Zod** - Form handling and validation
- **Vitest + Testing Library** - Testing framework

## File Organization
```
src/
├── api/              # Typed API functions (use instead of direct Supabase queries)
├── components/       # Reusable components
│   ├── layout/      # Layout components (Navbar, Sidebar, Layout)
│   └── ui/          # shadcn/ui components (DO NOT EDIT)
├── config/          # Configuration (routes, constants)
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations (Supabase)
├── lib/             # Utility functions
├── pages/           # Page components (one per route)
├── providers/       # React context providers (SessionContextProvider)
├── services/        # Service layer (auth, API clients)
├── types/           # TypeScript type definitions
└── utils/           # Helper utilities (toast, formatters)
```

## Authentication & Routing
- **ALWAYS** use `useSession()` hook from `SessionContextProvider` to get `session`, `userProfile`, and `userRole`.
- **NEVER** call Supabase auth directly; use functions from `src/services/supabase/auth.service.ts`.
- Use `ProtectedRoute` wrapper for pages requiring authentication:
  - `allowedRoles`: Array like `['manager']`, `['employee']`, or `['system_admin']`
  - `requiresCompany`: `true` (default) for manager/employee pages, `false` for system admin or company creation
- Register new routes in `src/App.tsx` - DO NOT move routes elsewhere.
- Wrap authenticated pages with `<Layout>` component.

### Example Protected Route
```typescript
<Route path="/schedules" element={
  <ProtectedRoute allowedRoles={['manager', 'employee']} requiresCompany={true}>
    <Layout><SchedulesPage /></Layout>
  </ProtectedRoute>
} />
```

## Data Fetching & API
- **ALWAYS** use typed API functions from `src/api/**` instead of direct Supabase queries.
- Use TanStack Query for data fetching with proper query keys:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['employees', companyId],
  queryFn: () => getEmployeesByCompany(companyId),
});
```
- Supabase RLS policies automatically filter by user/company - trust the security model.
- Handle loading states with skeleton loaders, errors with toast notifications.

## TypeScript Rules
- **NO `any` types** - Use `unknown` for truly unknown types, then narrow with type guards.
- **Export interfaces** - Make types reusable across components.
- **Strict mode enabled** - Follow all TypeScript strict checks.
- In tests, use `unknown as TypeName` for type assertions instead of `any`.

## Styling with Tailwind
- **ALWAYS use Tailwind classes** - Never write custom CSS files.
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`.
- Dark mode: Use `dark:` prefix for dark mode styles.
- Common patterns:
  - Containers: `container mx-auto px-4 py-8`
  - Cards: `bg-card rounded-lg border p-6 shadow-sm`
  - Grids: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Use shadcn/ui components with variants: `<Button variant="default" size="lg">Click Me</Button>`

## Forms
- Use React Hook Form with Zod validation for all forms.
- Follow the pattern in existing `*Form.tsx` components.
- Example:
```typescript
const formSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: '', name: '' },
});
```

## User Feedback
- Use toast helpers from `src/utils/toast.ts`:
  - `showSuccess('Message')` - Success notifications
  - `showError('Error message')` - Error notifications
  - `showLoading('Loading...')` - Loading indicators
  - `dismissToast()` - Dismiss active toast
- **NEVER** call `sonner` directly.

## Testing
- Tests live next to the source file: `Component.tsx` → `Component.test.tsx`
- Use Vitest + Testing Library with `MemoryRouter` for component tests.
- Test structure:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<MemoryRouter><ComponentName /></MemoryRouter>);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```
- Commands:
  - `npm run test` - Run all tests
  - `npm run test:ui` - Run with UI for debugging
  - `npm run lint` - Run ESLint

## Error Handling
- Always wrap async operations in try-catch blocks.
- Check for null/undefined before using date functions: `date ? format(parseISO(date), 'MMM dd') : 'N/A'`
- Show loading states during data fetching.
- Display user-friendly error messages with toast notifications.

## Security
- **Never commit secrets** - Use environment variables.
- Validate all inputs with Zod schemas.
- Trust Supabase RLS policies - every table has policies for user/company access.
- Sanitize user input before database operations.
- Use typed roles from `src/types/roles.ts` (UserRole union type).

## Development Commands
```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ui      # Run tests with UI
```

## Common Patterns

### Role-based Rendering
```typescript
const { userRole } = useSession();
{userRole === 'manager' && <ManagerOnlyButton />}
```

### Modal Dialogs
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

### Responsive Layout
```typescript
const isMobile = useIsMobile();
return isMobile ? <MobileView /> : <DesktopView />;
```

## Don't Do This ❌
- Edit shadcn/ui components in `src/components/ui/`
- Use custom CSS files for styling
- Move routes out of `src/App.tsx`
- Use `any` type in TypeScript
- Commit `.env` files
- Skip error handling on async operations
- Call Supabase directly instead of using API functions from `src/api/`
- Call `sonner` directly instead of using toast helpers

## Do This ✅
- Use Tailwind classes for all styling
- Define proper TypeScript types/interfaces
- Use TanStack Query for data fetching
- Use API functions from `src/api/` for database operations
- Wrap forms with React Hook Form + Zod
- Show loading states and error messages with toast helpers
- Write tests for new functionality (next to source file)
- Use `useSession()` for auth state
- Use `useIsMobile()` for responsive logic
- Check for null/undefined before date operations

## Performance
- Use `React.lazy()` for code splitting on large components.
- Use `useMemo`/`useCallback` for expensive operations.
- Only fetch needed fields in queries: `.select('id, name, email')`.

## When Creating New Features
1. Check existing patterns in similar components
2. Reuse UI components from shadcn/ui
3. Add TypeScript types/interfaces
4. Include error handling and loading states
5. Update routes in `src/App.tsx` if adding a page
6. Update `src/components/layout/Sidebar.tsx` for navigation
7. Write tests following existing patterns
8. Use API functions from `src/api/` for data operations
