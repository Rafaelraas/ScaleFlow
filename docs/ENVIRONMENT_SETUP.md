# Environment Setup Guide

This guide explains how to configure your environment variables for ScaleFlow.

## Overview

ScaleFlow uses environment variables to securely manage sensitive configuration data like API keys and database credentials. These values should **never** be committed to version control.

## Setup Instructions

### 1. Create Your Local Environment File

Copy the example environment file to create your own `.env`:

```bash
cp .env.example .env
```

### 2. Configure Supabase Credentials

Open the `.env` file and replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Obtain Supabase Credentials

To get your Supabase credentials:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

## Security Best Practices

### ✅ DO

- Keep your `.env` file local and **never commit it** to git
- Use the `.env.example` file as a template for other developers
- Rotate your keys if they are accidentally exposed
- Use different Supabase projects for development, staging, and production
- Store production secrets in your deployment platform's environment variables (e.g., Vercel, Netlify, Railway)

### ❌ DON'T

- Commit `.env` files to version control
- Share credentials through insecure channels (email, chat, etc.)
- Use production credentials in development
- Hardcode credentials directly in source code

## About the Anon Key

The Supabase **anon key** is safe to use in client-side code because:

1. It's designed for public access (client-side applications)
2. All security is enforced through Row Level Security (RLS) policies in your database
3. The anon key only grants the permissions defined by your RLS policies

However, you should still treat it carefully and avoid exposing it unnecessarily.

## Deployment

When deploying to production:

1. **Do not** commit your `.env` file
2. Set environment variables directly in your hosting platform:
   - **GitHub Pages**: Repository Settings → Secrets and variables → Actions → Repository secrets
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Build & Deploy → Environment
   - **Railway**: Project → Variables
   - **Docker**: Use `-e` flags or docker-compose environment sections

### GitHub Pages Setup

To enable authentication on GitHub Pages, you need to configure Supabase environment variables as GitHub secrets:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://your-project-id.supabase.co`)
4. Click **New repository secret** again and add:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon/public key
5. The GitHub Pages workflow will automatically use these secrets during the build

**Important**: After adding these secrets, trigger a new deployment by:
- Pushing to the `main` branch, or
- Going to **Actions** → **🚀 Deploy to GitHub Pages** → **Run workflow**

### Configuring Supabase for GitHub Pages

After setting up the secrets, you need to configure your Supabase project to allow redirects from your GitHub Pages URL:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add your GitHub Pages URL to **Site URL** and **Redirect URLs**:
   - Format: `https://<username>.github.io/ScaleFlow/`
   - Replace `<username>` with your GitHub username or organization name
5. Save the changes

This ensures that authentication redirects work correctly with your deployed application.

## Troubleshooting

### Error: Missing Supabase environment variables

If you see this error when starting the application:

```
Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.
```

**Solution**: Make sure you have:
1. Created a `.env` file in the root directory
2. Added the required `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables
3. Restarted your development server after creating/modifying `.env`

### Environment variables not loading

Vite requires environment variables to be prefixed with `VITE_` to be exposed to client-side code. Make sure your variables follow this naming convention.

If you change environment variables, you must restart the Vite dev server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Additional Resources

- [Supabase Environment Variables Documentation](https://supabase.com/docs/guides/getting-started/tutorials/with-react#get-the-api-keys)
- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [12-Factor App: Config](https://12factor.net/config)
