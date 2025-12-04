# Contributing to ScaleFlow

Thank you for your interest in contributing to ScaleFlow! We welcome contributions from the community to help make this shift scheduling platform even better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (browser, OS, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear use case** - Explain why this enhancement would be useful
- **Detailed description** - Provide a detailed description of the proposed feature
- **Mockups** - Include mockups or examples if possible

### Pull Requests

We actively welcome your pull requests! Here's how to contribute code:

1. Fork the repository and create your branch from `main`
2. Make your changes following our coding standards
3. Add or update tests as needed
4. Ensure all tests pass
5. Update documentation if needed
6. Submit your pull request

## Development Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **pnpm** package manager
- **Git** for version control
- **Supabase account** for backend services

### Initial Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ScaleFlow.git
   cd ScaleFlow
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Rafaelraas/ScaleFlow.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in focused, logical commits
2. Test your changes locally
3. Run linting and fix any issues
4. Ensure all tests pass

### Keeping Your Branch Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch
git rebase upstream/main
```

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Avoid `any` types** - Use proper type definitions
- **Export interfaces** for reusable types
- **Use strict mode** - All TypeScript strict checks are enabled

### React

- **Functional components** - Use functional components with hooks
- **TypeScript interfaces** - Define props interfaces for all components
- **Hooks best practices** - Follow React hooks rules and best practices
- **Component organization**:
  ```typescript
  // 1. Imports
  import React from 'react';
  
  // 2. Type definitions
  interface MyComponentProps {
    title: string;
  }
  
  // 3. Component definition
  export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
    // 4. Hooks
    const [state, setState] = useState();
    
    // 5. Event handlers
    const handleClick = () => {};
    
    // 6. Return JSX
    return <div>{title}</div>;
  };
  ```

### Styling

- **Tailwind CSS** - Use Tailwind utility classes for styling
- **Component variants** - Use `class-variance-authority` for component variants
- **Responsive design** - Always consider mobile, tablet, and desktop views
- **Dark mode support** - Ensure components work in both light and dark modes

### Forms

- **React Hook Form** - Use for all form handling
- **Zod validation** - Use Zod schemas for form validation
- **Error handling** - Display clear, user-friendly error messages

### API Calls

- **TanStack Query** - Use for data fetching and caching
- **Error handling** - Handle errors gracefully with toast notifications
- **Loading states** - Show skeleton loaders or spinners during loading
- **Supabase client** - Use the configured Supabase client from `@/integrations/supabase/client`

### File Organization

```
src/
├── components/        # Reusable components
│   ├── layout/       # Layout components (Navbar, Sidebar, Layout)
│   └── ui/           # shadcn/ui components (don't edit these)
├── pages/            # Page components (one per route)
├── hooks/            # Custom React hooks
├── integrations/     # External service integrations
├── lib/              # Utility functions
├── providers/        # React context providers
└── utils/            # Helper utilities
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files**: kebab-case for utilities (e.g., `format-date.ts`)
- **Functions**: camelCase (e.g., `formatDate()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Interfaces/Types**: PascalCase (e.g., `UserProfile`)

## Testing Guidelines

### Writing Tests

- **Test files** - Co-locate tests with components: `Component.test.tsx`
- **Test library** - Use `@testing-library/react` for component tests
- **Vitest** - Use Vitest as the test runner
- **Coverage** - Aim for meaningful test coverage of critical paths

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring (no functional changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **ci**: CI/CD configuration changes

### Examples

```bash
feat(schedules): add calendar view for shift scheduling
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
test(profile): add tests for profile update functionality
```

### Scope

The scope should be the name of the affected module or feature area:
- `auth` - Authentication
- `schedules` - Schedule management
- `employees` - Employee management
- `ui` - UI components
- `api` - API integration

## Pull Request Process

### Before Submitting

1. **Update documentation** - If you've changed functionality, update relevant docs
2. **Run linting** - `npm run lint` and fix any issues
3. **Run tests** - `npm run test` and ensure all tests pass
4. **Build successfully** - `npm run build` should complete without errors
5. **Test manually** - Test your changes in the browser

### PR Description

Use the provided PR template and include:

- **Description** - Clear description of what you've changed and why
- **Related issues** - Link to any related issues (e.g., "Fixes #123")
- **Testing** - How you tested your changes
- **Screenshots** - Include screenshots for UI changes
- **Breaking changes** - Note any breaking changes

### Review Process

1. At least one maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release!

### After Your PR is Merged

1. Delete your feature branch
2. Update your local repository:
   ```bash
   git checkout main
   git pull upstream main
   ```

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

## Questions?

If you have questions that aren't covered in this guide:

1. Check existing issues and discussions
2. Ask in GitHub Discussions
3. Join our community chat (if available)

Thank you for contributing to ScaleFlow! 🎉
