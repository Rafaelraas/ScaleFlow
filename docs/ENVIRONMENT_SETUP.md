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
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Build & Deploy → Environment
   - **Railway**: Project → Variables
   - **Docker**: Use `-e` flags or docker-compose environment sections

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
