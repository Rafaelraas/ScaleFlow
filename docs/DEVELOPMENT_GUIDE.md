# Development Guide

## Getting Started

This guide will help you set up your development environment and understand the development workflow for ScaleFlow.

## Prerequisites

### Required Software

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0.0 or higher (comes with Node.js)
- **Git** for version control ([Download](https://git-scm.com/))

### Recommended Tools

- **VS Code** - Recommended code editor
  - Install recommended extensions (see `.vscode/extensions.json`)
- **Chrome/Firefox DevTools** - For debugging
- **React DevTools** - Browser extension for React debugging
- **Postman/Insomnia** - For API testing

### Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key
4. Set up the database schema (see [DATABASE.md](./DATABASE.md))

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Rafaelraas/ScaleFlow.git
cd ScaleFlow
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies listed in `package.json`.

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Development settings
VITE_APP_BASE_PATH=/
```

**Never commit your `.env` file!** It's already in `.gitignore`.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure Overview

```
ScaleFlow/
├── .github/              # GitHub configuration
│   ├── workflows/        # CI/CD workflows
│   └── ISSUE_TEMPLATE/   # Issue templates
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # Architecture documentation
│   ├── DATABASE.md       # Database schema
│   └── DEVELOPMENT_GUIDE.md
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # shadcn/ui components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # External integrations
│   ├── lib/              # Utilities
│   ├── providers/        # Context providers
│   ├── utils/            # Helper functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── .cursorrules          # AI development rules
├── .gitignore            # Git ignore rules
├── CONTRIBUTING.md       # Contribution guidelines
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md             # Project overview
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions

### 2. Make Your Changes

Follow the coding standards outlined in [CONTRIBUTING.md](../CONTRIBUTING.md).

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run tests
npm run test

# Build the project
npm run build
```

### 4. Commit Your Changes

Use conventional commits:

```bash
git add .
git commit -m "feat(schedules): add calendar view for shift scheduling"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub using the PR template.

## Development Commands

### Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with Vitest UI |

### Advanced Commands

```bash
# Build for development (includes source maps)
npm run build:dev

# Run specific test file
npm run test src/components/Component.test.tsx

# Run tests in watch mode
npm run test -- --watch

# Type check without emitting
npx tsc --noEmit

# Format code with Prettier (if added)
npx prettier --write "src/**/*.{ts,tsx}"
```

## Common Development Tasks

### Adding a New Page

1. **Create the page component** in `src/pages/`:

```typescript
// src/pages/NewPage.tsx
import React from 'react';

const NewPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">New Page</h1>
      {/* Page content */}
    </div>
  );
};

export default NewPage;
```

2. **Add route** in `src/App.tsx`:

```typescript
import NewPage from './pages/NewPage';

// Inside Routes component
<Route element={<ProtectedRoute allowedRoles={['manager']} />}>
  <Route path="/new-page" element={<Layout><NewPage /></Layout>} />
</Route>
```

3. **Add navigation link** in `src/components/layout/Sidebar.tsx`:

```typescript
{
  title: "New Page",
  url: "/new-page",
  icon: Icon,
  roles: ['manager']
}
```

### Adding a New Component

1. **Create component file** in `src/components/`:

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <button onClick={onAction}>Click Me</button>
    </div>
  );
};
```

2. **Add tests** in `src/components/MyComponent.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render title', () => {
    render(<MyComponent title="Test" onAction={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Creating a Form

1. **Define Zod schema**:

```typescript
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  date: z.date(),
});

type FormData = z.infer<typeof formSchema>;
```

2. **Create form component**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MyForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Handle form submission
      await submitData(data);
      showSuccess('Form submitted successfully!');
      onSuccess();
    } catch (error) {
      showError('Failed to submit form');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
```

### Adding Supabase Queries

1. **Using TanStack Query for fetching**:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const useEmployees = (companyId: string) => {
  return useQuery({
    queryKey: ['employees', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('company_id', companyId)
        .order('last_name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId, // Only run query if companyId exists
  });
};
```

2. **Using mutations for updates**:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['employees']);
      showSuccess('Employee updated successfully');
    },
    onError: (error) => {
      showError('Failed to update employee');
      console.error('Update error:', error);
    },
  });
};
```

## Debugging

### React DevTools

1. Install React DevTools browser extension
2. Open browser DevTools (F12)
3. Go to "Components" tab to inspect React component tree
4. Go to "Profiler" tab to analyze performance

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 5174
```

#### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

#### TypeScript Errors

```bash
# Check all TypeScript errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/path/to/file.tsx
```

### Logging Best Practices

```typescript
// Development logging
console.log('[Component] Rendering with props:', props);

// Error logging
console.error('[Component] Failed to fetch data:', error);

// Performance logging
console.time('operation');
// ... operation
console.timeEnd('operation');

// Remove all console.logs before committing
// Use proper error handling instead
```

## Performance Optimization

### Analyzing Bundle Size

```bash
# Build and analyze
npm run build

# Use Bundle Analyzer (if added)
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts and rebuild
```

### React Performance

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  // Handler logic
}, [/* dependencies */]);
```

### Query Optimization

```typescript
// Select only needed columns
const { data } = await supabase
  .from('profiles')
  .select('id, first_name, last_name')  // Not .select('*')
  .eq('company_id', companyId);

// Use pagination for large datasets
const { data } = await supabase
  .from('shifts')
  .select('*')
  .range(0, 9);  // First 10 records

// Use count for total records
const { count } = await supabase
  .from('shifts')
  .select('*', { count: 'exact', head: true });
```

## Security Considerations

### Environment Variables

- Never commit `.env` files
- Use environment-specific variables
- Don't expose sensitive data in client code

### Input Validation

- Always validate on both client and server
- Use Zod schemas for type-safe validation
- Sanitize user inputs

### Authentication

- Check authentication before protected operations
- Verify user roles before role-specific actions
- Handle session expiration gracefully

## Testing

### Writing Good Tests

```typescript
// Test structure
describe('Component', () => {
  describe('when loading', () => {
    it('should show loading spinner', () => {
      // Arrange
      const { container } = render(<Component isLoading={true} />);
      
      // Assert
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });
  });
  
  describe('when loaded', () => {
    it('should display data', () => {
      // Arrange
      const data = { name: 'Test' };
      
      // Act
      render(<Component data={data} />);
      
      // Assert
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
```

### Test Coverage

```bash
# Run tests with coverage
npm run test -- --coverage

# Coverage report will be in coverage/index.html
```

## Deployment

### Building for Production

```bash
# Production build
npm run build

# Output in dist/ directory
ls -la dist/
```

### Environment Variables for Production

Configure in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- GitHub Pages: Repository Settings → Secrets

### Deployment Checklist

- [ ] All tests pass
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Error tracking configured (if applicable)

## Getting Help

### Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Support Channels

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and community support
- Project README - Quick reference

## Tips & Tricks

### VS Code Snippets

Create `.vscode/snippets.code-snippets`:

```json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export const ${1:Component}: React.FC<${1:Component}Props> = ({ $3 }) => {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "};"
    ]
  }
}
```

### Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
```

### Hot Tips

1. **Use TypeScript**: It catches bugs before runtime
2. **Test early**: Write tests as you code, not after
3. **Keep it simple**: Start simple, refactor later
4. **Read the docs**: Most questions are answered in documentation
5. **Ask for help**: Don't struggle alone, ask the community

---

Happy coding! 🚀
