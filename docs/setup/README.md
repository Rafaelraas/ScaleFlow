# Setup & Configuration Guides

This directory contains quick start guides and configuration documentation to help you get ScaleFlow up and running.

## 📋 Contents

### Quick Start Guide
- **[QUICK_START.md](./QUICK_START.md)** (222 lines)
  - Get ScaleFlow running in 5 minutes
  - Minimal setup for development
  - Quick troubleshooting tips
  - Essential commands

### Backend Setup
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** (331 lines)
  - Complete backend configuration guide
  - Supabase setup and configuration
  - Database migrations
  - Environment variables
  - Authentication setup
  - Row-Level Security (RLS) policies

### AI Development Rules
- **[AI_RULES.md](./AI_RULES.md)** (19 lines)
  - Tech stack rules for AI agents
  - Development guidelines
  - Code standards
  - Best practices

## 🚀 Getting Started

### For First-Time Setup

1. **Start with QUICK_START.md**
   ```bash
   # Follow the 5-minute setup guide
   # Install dependencies, configure environment, and run the app
   ```

2. **Then configure the backend with BACKEND_SETUP.md**
   ```bash
   # Set up Supabase
   # Configure authentication
   # Run database migrations
   ```

3. **Review AI_RULES.md if using AI tools**
   ```bash
   # Understand the tech stack
   # Follow development guidelines
   ```

## 📖 Guide Overview

### QUICK_START.md
Perfect for developers who want to:
- Get the app running quickly
- See the UI and features
- Start development immediately
- Test basic functionality

**Covers:**
- Prerequisites
- Installation steps
- Environment setup
- Running the dev server
- Basic troubleshooting

### BACKEND_SETUP.md
Essential for developers who need to:
- Set up the complete backend
- Configure Supabase properly
- Understand authentication flow
- Set up database tables and policies
- Configure environment variables

**Covers:**
- Supabase project creation
- Database schema setup
- Authentication configuration
- Row-Level Security policies
- Environment variable reference
- Advanced configuration

### AI_RULES.md
Important for:
- AI-assisted development
- Understanding tech stack constraints
- Following project conventions
- Maintaining code consistency

**Covers:**
- Tech stack (React, TypeScript, Vite, etc.)
- Development rules
- Code standards
- Best practices

## 🔧 Configuration Files

After following these guides, you'll have configured:

### Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Configuration
- Database tables and relationships
- Row-Level Security policies
- Authentication providers
- Storage buckets (if needed)

### Development Environment
- Node.js and npm
- VS Code or other IDE
- Git for version control
- Browser for testing

## 🆘 Troubleshooting

### Common Issues

1. **Dependencies won't install**
   - Check Node.js version (18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, reinstall

2. **Can't connect to Supabase**
   - Verify environment variables in `.env`
   - Check Supabase project URL and keys
   - Ensure Supabase project is active

3. **Database errors**
   - Run migrations: Check `BACKEND_SETUP.md`
   - Verify RLS policies are set up
   - Check user permissions

4. **Build errors**
   - Check TypeScript version
   - Clear build cache: `rm -rf dist node_modules/.vite`
   - Reinstall dependencies

## 🔗 Related Documentation

### Essential Reading
- [README.md](../../README.md) - Main project documentation
- [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) - Comprehensive development guide
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture

### Technical Guides
- [DATABASE.md](../DATABASE.md) - Database schema and queries
- [API_GUIDELINES.md](../API_GUIDELINES.md) - API usage patterns
- [SECURITY.md](../SECURITY.md) - Security best practices

### Additional Setup
- [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) - Detailed environment setup
- [SUPABASE_MIGRATIONS_GUIDE.md](../SUPABASE_MIGRATIONS_GUIDE.md) - Database migration guide
- [MCP_SETUP.md](../MCP_SETUP.md) - Model Context Protocol setup

### Reference
- [Documentation Index](../INDEX.md) - Complete documentation overview
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](../../CHANGELOG.md) - Version history

## 💡 Tips for Success

1. **Follow the order**
   - QUICK_START.md → BACKEND_SETUP.md → AI_RULES.md

2. **Use the right tool**
   - VS Code with recommended extensions
   - Chrome DevTools for debugging
   - Supabase Dashboard for database inspection

3. **Ask for help**
   - Check [GitHub Issues](https://github.com/Rafaelraas/ScaleFlow/issues)
   - Review [GitHub Discussions](https://github.com/Rafaelraas/ScaleFlow/discussions)
   - Read troubleshooting sections in each guide

4. **Keep documentation updated**
   - Update guides when you find issues
   - Add troubleshooting tips
   - Improve clarity for future developers

## 🎯 Next Steps

After completing the setup:

1. ✅ Verify the app runs successfully
2. ✅ Test authentication (register/login)
3. ✅ Explore the UI and features
4. 📖 Read [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md)
5. 🏗️ Review [ARCHITECTURE.md](../ARCHITECTURE.md)
6. 💻 Start contributing!

---

**Directory Created:** December 10, 2024  
**Total Files:** 3 guides  
**Total Content:** ~570 lines of setup documentation  
**Average Setup Time:** 10-15 minutes with QUICK_START, 30-45 minutes with full backend setup
