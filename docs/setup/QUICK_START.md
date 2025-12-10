# ScaleFlow Quick Start Guide

Get ScaleFlow running in 5 minutes! ⚡

## Prerequisites

- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ npm or pnpm
- ✅ Git ([Download](https://git-scm.com/))
- ✅ Supabase account ([Sign up](https://supabase.com))

## 🚀 Quick Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Rafaelraas/ScaleFlow.git
cd ScaleFlow

# Install dependencies
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env  # If available, or create manually
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

## 📋 Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |
| `npm run test` | Run tests |

## 🎯 First Steps

### 1. Create an Account
- Go to `/register`
- Sign up with email
- Verify your email

### 2. Create a Company
- After login, you'll be prompted to create a company
- Fill in company details
- Your role will be set to "manager"

### 3. Explore Features
- **Dashboard** - Overview of schedules and activities
- **Schedules** - View and manage shifts
- **Employees** - Invite and manage team members
- **Shift Templates** - Create reusable shift patterns

## 🏗️ Project Structure

```
ScaleFlow/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components (routes)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   └── integrations/  # External services (Supabase)
├── docs/              # Documentation
└── public/            # Static assets
```

## 🛠️ Common Tasks

### Add a New Page

1. Create page in `src/pages/MyPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation in `src/components/layout/Sidebar.tsx`

### Fetch Data

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const { data, isLoading } = useQuery({
  queryKey: ['shifts'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*');
    if (error) throw error;
    return data;
  },
});
```

### Create a Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## 🎨 Styling

Use Tailwind CSS classes:

```tsx
<div className="container mx-auto p-6">
  <h1 className="text-3xl font-bold mb-4">Title</h1>
  <Button variant="default" size="lg">Click Me</Button>
</div>
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run specific test
npm run test src/components/Component.test.tsx
```

## 📚 Learn More

- 📖 [Full Documentation](./docs/INDEX.md)
- 🏗️ [Architecture Guide](./docs/ARCHITECTURE.md)
- 💻 [Development Guide](./docs/DEVELOPMENT_GUIDE.md)
- 🤝 [Contributing Guidelines](./CONTRIBUTING.md)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 5174
```

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear cache
rm -rf node_modules/.vite
npm run build
```

### Supabase Connection Issues

- Check `.env` file exists
- Verify Supabase URL and key
- Check Supabase project is running
- Verify network connection

## 💬 Get Help

- 📝 [GitHub Issues](https://github.com/Rafaelraas/ScaleFlow/issues)
- 💬 [Discussions](https://github.com/Rafaelraas/ScaleFlow/discussions)
- 📖 [Documentation](./docs/INDEX.md)

## ⚡ Tips

- **VS Code**: Install recommended extensions
- **React DevTools**: Browser extension for debugging
- **Hot Reload**: Save files to see instant updates
- **TypeScript**: Hover over code for type information
- **Console**: Check browser console for errors

## 🎉 You're Ready!

Start building awesome scheduling features! 

Check out [FEATURE_IDEAS.md](./docs/FEATURE_IDEAS.md) for inspiration.

---

**Need more details?** See the [Development Guide](./docs/DEVELOPMENT_GUIDE.md)

**Want to contribute?** Read the [Contributing Guidelines](./CONTRIBUTING.md)
