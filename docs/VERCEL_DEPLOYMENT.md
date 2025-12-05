# Vercel Deployment Guide

This guide explains how to deploy ScaleFlow to Vercel and configure the preview deployment workflow.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Access to your Supabase project credentials
- Repository admin access to configure GitHub secrets

## Required GitHub Secrets

The following secrets must be configured in your GitHub repository settings (Settings → Secrets and variables → Actions):

### Vercel Credentials

1. **VERCEL_TOKEN**
   - Your Vercel API token
   - Get it from: [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
   - Click "Create Token" and save the generated token

2. **VERCEL_ORG_ID**
   - Your Vercel organization/team ID
   - Find it in: Vercel Project Settings → General → "Project ID" section
   - Listed as "Team ID" or in the project settings URL

3. **VERCEL_PROJECT_ID**
   - Your Vercel project ID
   - Find it in: Vercel Project Settings → General → "Project ID" section
   - Listed directly as "Project ID"

### Supabase Credentials

4. **VITE_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://your-project-id.supabase.co`
   - Find it in: Supabase Dashboard → Project Settings → API

5. **VITE_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Find it in: Supabase Dashboard → Project Settings → API
   - This is the "anon" public key (safe to use in client-side code)

## Vercel Project Setup

### Initial Setup

1. **Import Project to Vercel**
   ```bash
   # Option 1: Using Vercel Dashboard
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "ScaleFlow" repository
   
   # Option 2: Using Vercel CLI
   npm install -g vercel
   vercel link
   ```

2. **Configure Environment Variables in Vercel**
   - Go to: Project Settings → Environment Variables
   - Add the following variables for all environments (Production, Preview, Development):
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Get Vercel Credentials**
   ```bash
   # After linking the project, get the project details
   vercel project ls
   
   # Or check .vercel/project.json (created after vercel link)
   cat .vercel/project.json
   ```

## Configuration Files

### vercel.json

The project includes a `vercel.json` configuration that:
- Configures SPA routing (all routes redirect to index.html)
- Sets cache headers for static assets (1-year cache)
- Specifies build command and output directory

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### .vercelignore

Excludes unnecessary files from deployment:
- Dependencies (node_modules)
- Test files
- Documentation
- Git and GitHub files
- Local environment files

## Deployment Workflows

### Automatic Preview Deployments

The `.github/workflows/preview.yml` workflow automatically:
1. Runs on every pull request to main
2. Lints and tests the code
3. Builds the project with environment variables
4. Deploys to Vercel
5. Comments on the PR with the preview URL

**Workflow triggers:**
- Pull requests to the `main` branch

**What it does:**
1. ✅ Lint code
2. ✅ Run tests
3. ✅ Build project with Supabase env vars
4. ✅ Deploy to Vercel
5. ✅ Post preview URL as PR comment

### Manual Deployment

To deploy manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### "Failed to extract deployment URL"

**Cause:** Vercel CLI output format changed or deployment failed

**Solution:**
1. Check Vercel token is valid
2. Verify project is linked correctly
3. Check VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct
4. Review Vercel dashboard for deployment logs

### "Missing environment variables"

**Cause:** Supabase credentials not configured

**Solution:**
1. Add `VITE_SUPABASE_URL` secret to GitHub
2. Add `VITE_SUPABASE_ANON_KEY` secret to GitHub
3. Add same variables to Vercel project settings

### "Build failed"

**Cause:** Build errors or missing dependencies

**Solution:**
1. Run `npm ci && npm run build` locally
2. Check for TypeScript errors
3. Ensure all dependencies are in package.json
4. Review build logs in GitHub Actions

### "404 on page refresh"

**Cause:** SPA routing not configured

**Solution:**
- The `vercel.json` file should handle this automatically
- Verify the rewrite rule is present in `vercel.json`
- Check Vercel deployment settings for custom routing

## Environment Variables Reference

| Variable | Required | Where to Find | Used In |
|----------|----------|---------------|---------|
| `VERCEL_TOKEN` | Yes | Vercel Account Settings | GitHub Actions |
| `VERCEL_ORG_ID` | Yes | Vercel Project Settings | GitHub Actions |
| `VERCEL_PROJECT_ID` | Yes | Vercel Project Settings | GitHub Actions |
| `VITE_SUPABASE_URL` | Yes | Supabase Dashboard | Build & Runtime |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard | Build & Runtime |

## Security Notes

- ✅ `VITE_SUPABASE_ANON_KEY` is safe to expose in client code
- ✅ Never commit `.env` files to version control
- ✅ Use `.env.example` as a template for local development
- ⚠️ Keep `VERCEL_TOKEN` secret and never expose it
- ⚠️ Rotate tokens if they are accidentally exposed

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Getting Help

If you encounter issues:

1. Check the [GitHub Actions workflow logs](.github/workflows/preview.yml)
2. Review [Vercel deployment logs](https://vercel.com/dashboard)
3. Verify all secrets are configured correctly
4. Ensure Supabase project is active and accessible

---

**Last Updated:** December 2024
**Version:** 1.0
