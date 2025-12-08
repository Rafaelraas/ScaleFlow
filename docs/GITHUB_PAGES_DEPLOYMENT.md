# GitHub Pages Deployment Guide

This guide provides step-by-step instructions for deploying ScaleFlow to GitHub Pages with working authentication.

> **📝 Note**: ScaleFlow automatically handles Vercel Analytics based on the deployment platform. When deploying to GitHub Pages, Vercel Analytics is automatically disabled to prevent script loading errors. See [VERCEL_ANALYTICS_FIX.md](./VERCEL_ANALYTICS_FIX.md) for details.

## Overview

GitHub Pages is a static site hosting service that allows you to deploy your React application for free. However, to enable authentication with Supabase, you need to properly configure environment variables and redirect URLs.

## Prerequisites

Before deploying to GitHub Pages, ensure you have:

1. A GitHub repository with the ScaleFlow code
2. A Supabase project with the database migrations applied
3. Admin access to the GitHub repository settings

## Step-by-Step Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select "GitHub Actions"
4. Click **Save**

### 2. Configure GitHub Secrets

The GitHub Pages workflow requires Supabase credentials to build the application with authentication support.

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the first secret:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL
     - Example: `https://ttgntuaffrondfxybxmi.supabase.co`
     - Find it in Supabase Dashboard → Settings → API → Project URL
5. Click **Add secret**
6. Click **New repository secret** again
7. Add the second secret:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon/public key
     - Find it in Supabase Dashboard → Settings → API → anon/public key
8. Click **Add secret**

### 3. Configure Supabase Redirect URLs

For authentication to work correctly, Supabase needs to know which URLs are allowed to receive authentication callbacks.

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Configure the following fields:

   **Site URL**:

   ```
   https://<username>.github.io/ScaleFlow/
   ```

   Replace `<username>` with your GitHub username or organization name.

   **Redirect URLs**:
   Add the following URLs (one per line):

   ```
   https://<username>.github.io/ScaleFlow/
   https://<username>.github.io/ScaleFlow/#/login
   https://<username>.github.io/ScaleFlow/#/register
   https://<username>.github.io/ScaleFlow/#/verify
   ```

5. Click **Save**

### 4. Deploy to GitHub Pages

Once the secrets and Supabase configuration are set up, you can deploy:

**Option A: Automatic deployment (on push)**

- Push any changes to the `main` branch
- The workflow will automatically build and deploy

**Option B: Manual deployment**

1. Go to **Actions** tab in your repository
2. Select **🚀 Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Select the `main` branch
5. Click **Run workflow**

### 5. Verify Deployment

After the workflow completes:

1. Go to **Actions** → **🚀 Deploy to GitHub Pages** → Select the latest run
2. Click on the **Deploy** job
3. Find the deployment URL in the logs (e.g., `https://<username>.github.io/ScaleFlow/`)
4. Open the URL in your browser
5. Try registering a new account or logging in

## Troubleshooting

### "Failed to fetch" Error

**Symptoms**: When trying to log in or register, you see "Failed to fetch" error in the browser console.

**Causes**:

1. GitHub secrets not configured
2. Supabase URL or anon key is incorrect
3. Supabase redirect URLs not configured

**Solutions**:

1. Verify GitHub secrets are set correctly (see Step 2)
2. Check that the secret values match your Supabase dashboard
3. Ensure Supabase redirect URLs include your GitHub Pages URL (see Step 3)
4. Trigger a new deployment after adding secrets

### Authentication Redirects to Wrong URL

**Symptoms**: After logging in, you're redirected to an incorrect URL or get a 404 error.

**Causes**:

1. Supabase redirect URLs not configured for HashRouter
2. Base path mismatch in Vite configuration

**Solutions**:

1. Ensure all redirect URLs in Supabase include the hash (`#`) for HashRouter routes
2. Verify the `VITE_APP_BASE_PATH` is set to `/ScaleFlow/` in the workflow
3. Check that `base` in `vite.config.ts` matches the deployment path

### Build Fails in GitHub Actions

**Symptoms**: The GitHub Pages workflow fails during the build step.

**Causes**:

1. Missing dependencies
2. TypeScript errors
3. Linting errors

**Solutions**:

1. Check the workflow logs for specific errors
2. Run `npm run lint` and `npm run build` locally to reproduce
3. Fix any errors and push the changes

### Authentication Works Locally but Not on GitHub Pages

**Symptoms**: Authentication works in local development but fails on GitHub Pages.

**Causes**:

1. Environment variables not set in GitHub secrets
2. Local `.env` file has values but GitHub Pages doesn't

**Solutions**:

1. Confirm GitHub secrets are set (Step 2)
2. Trigger a new deployment
3. Check browser console for specific error messages
4. Verify Supabase logs for any authentication attempts

### Email Confirmation Links Don't Work

**Symptoms**: After registering, the email confirmation link redirects to the wrong page.

**Causes**:

1. Supabase redirect URLs not including HashRouter paths
2. Email template using incorrect redirect URL

**Solutions**:

1. Update Supabase redirect URLs to include hash routes (Step 3)
2. Check Supabase Dashboard → Authentication → Email Templates
3. Ensure email templates use the correct redirect URLs

## Security Considerations

### Anon Key Security

The Supabase anon key is safe to expose in client-side code because:

- It's designed for public access (browser applications)
- All data access is controlled by Row Level Security (RLS) policies
- The anon key only grants permissions defined by your RLS policies

However, ensure your Supabase project has:

- ✅ RLS policies enabled on all tables
- ✅ Proper role-based access control
- ✅ Input validation in database functions

### HTTPS Only

GitHub Pages serves all content over HTTPS, which is required for Supabase authentication. Never use:

- ❌ Custom domains without HTTPS
- ❌ HTTP-only redirect URLs
- ❌ Mixed content (HTTP and HTTPS)

## Advanced Configuration

### Custom Domain

If you want to use a custom domain with GitHub Pages:

1. Configure your custom domain in GitHub Pages settings
2. Update Supabase redirect URLs to use your custom domain
3. Ensure your domain has a valid SSL certificate
4. Update `VITE_APP_BASE_PATH` in the workflow to `/` (root path)

### Multiple Environments

To set up staging and production environments:

1. Create separate Supabase projects for each environment
2. Use GitHub Environments to store environment-specific secrets
3. Create separate workflows for each environment
4. Use branch-specific deployments (e.g., `staging` → staging environment)

## Monitoring and Maintenance

### Check Deployment Status

1. Go to **Actions** tab
2. Review recent workflow runs
3. Check for any failures or warnings
4. Review deployment logs for errors

### Update Dependencies

Regularly update dependencies to get security patches:

```bash
npm update
npm audit fix
```

### Monitor Supabase Usage

1. Check Supabase Dashboard → Usage
2. Monitor authentication metrics
3. Review database query performance
4. Check for any rate limiting or quota issues

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Router HashRouter](https://reactrouter.com/en/main/router-components/hash-router)

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/Rafaelraas/ScaleFlow/issues) for similar problems
2. Review [Supabase Community](https://github.com/supabase/supabase/discussions)
3. Check browser console for error messages
4. Review GitHub Actions workflow logs
5. Open a new issue with detailed error information

---

**Last Updated**: December 5, 2024
