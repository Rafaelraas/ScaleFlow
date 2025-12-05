# 🔧 GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD, security scanning, and deployment automation.

## 📋 Overview

| Workflow | Trigger | Purpose | Status |
|----------|---------|---------|--------|
| [🔍 CI Pipeline](#-ci-pipeline) | PR to main, Push to main | Lint, test, build validation | Required |
| [🚀 Deploy to GitHub Pages](#-deploy-to-github-pages) | Push to main, Manual | Production deployment | Production |
| [🔍 Preview Deployment](#-preview-deployment) | PR to main | Preview deployments to Vercel | Optional |
| [🔒 Dependency Review](#-dependency-review) | PR to main | Security scan for dependencies | Required |
| [🛡️ CodeQL Security Analysis](#️-codeql-security-analysis) | PR to main, Push to main, Weekly | Code security scanning | Required |

---

## 🔍 CI Pipeline

**File:** [`ci.yml`](./ci.yml)

**Triggers:**
- Pull requests to `main`
- Pushes to `main`

**What it does:**
1. ✅ Type checking (if available)
2. 🧹 Lints code with ESLint
3. 🧪 Runs test suite with coverage
4. 📊 Uploads coverage reports as artifacts
5. 🏗️ Builds the project
6. 📦 Uploads build artifacts for debugging

**Timeout:** 30 minutes

**Required Secrets:** None (tests run in demo mode without Supabase)

**Artifacts:**
- `coverage-report`: Test coverage data (7 days retention)
- `build-artifacts`: Production build output (7 days retention)

---

## 🚀 Deploy to GitHub Pages

**File:** [`pages.yml`](./pages.yml)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**What it does:**
1. 🧹 Lints the codebase
2. 🧪 Runs all tests
3. 🏗️ Builds production bundle with `VITE_APP_BASE_PATH=/ScaleFlow/`
4. 📦 Uploads to GitHub Pages
5. 🚀 Deploys to GitHub Pages environment

**Timeouts:**
- Build job: 30 minutes
- Deploy job: 10 minutes

**Required Secrets:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

**Note**: Without these secrets, the app will build but authentication will not work (fails with "Failed to fetch" errors).

**Environment:** `github-pages`

**Live URL:** Available in workflow output after deployment

---

## 🔍 Preview Deployment

**File:** [`preview.yml`](./preview.yml)

**Triggers:**
- Pull requests to `main` branch

**What it does:**
1. 🧹 Lints the codebase
2. 🧪 Runs tests
3. 🏗️ Builds project
4. 🚀 Deploys preview to Vercel using Vercel CLI
5. 💬 Comments on PR with preview URL and build status (if deployment successful)

**Timeout:** 30 minutes

**Required Secrets:**
- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

**Environment:** `preview`

**Preview URL:** Posted as a comment on the PR

---

## 🔒 Dependency Review

**File:** [`dependency-review.yml`](./dependency-review.yml)

**Triggers:**
- Pull requests to `main` branch

**What it does:**
1. 🔍 Analyzes dependency changes in the PR
2. 🚨 Checks for known security vulnerabilities
3. ⚖️ Verifies license compatibility
4. 💬 Posts summary in PR comments

**Timeout:** 10 minutes

**Configuration:**
- Fails on: `moderate` severity or higher
- Denied licenses: `GPL-3.0`, `AGPL-3.0`
- Always comments summary in PR

**Required Secrets:** None

---

## 🛡️ CodeQL Security Analysis

**File:** [`codeql.yml`](./codeql.yml)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Mondays at 10:00 UTC)

**What it does:**
1. 🔍 Initializes CodeQL for JavaScript/TypeScript
2. 🏗️ Builds the project automatically
3. 🔎 Performs security and quality analysis
4. 📊 Uploads findings to GitHub Security tab

**Timeout:** 30 minutes

**Query Suite:** `security-and-quality`

**Languages:** `javascript-typescript`

**Required Secrets:** None

**Results:** Available in GitHub Security → Code scanning alerts

**⚠️ Important Setup Note:**
This is an **advanced** CodeQL configuration. You must:
- Use "Advanced" setup in GitHub settings (not "Default" setup)
- Default and Advanced setups cannot run simultaneously
- 🚨 **Having issues?** See [Quick Fix Guide](../../CODEQL_TROUBLESHOOTING.md) for the most common setup error
- Full details in [`docs/CODEQL_SETUP.md`](../../docs/CODEQL_SETUP.md)

---

## 🔧 Setup Instructions

### For Vercel Preview Deployments

To enable preview deployments, add the following secrets to your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `VERCEL_TOKEN`: Get from [Vercel Account Settings](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID`: Find in Vercel project settings → General
   - `VERCEL_PROJECT_ID`: Find in Vercel project settings → General
   - `VITE_SUPABASE_URL`: Your Supabase project URL (from Supabase Dashboard)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (from Supabase Dashboard)

📚 **Detailed Guide:** See [docs/VERCEL_DEPLOYMENT.md](../../docs/VERCEL_DEPLOYMENT.md) for comprehensive setup instructions

### For GitHub Pages

To enable GitHub Pages deployment with working authentication:

1. **Enable GitHub Pages**
   - Go to **Settings** → **Pages**
   - Set **Source** to "GitHub Actions"

2. **Configure Supabase Secrets**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add the following repository secrets:
     - `VITE_SUPABASE_URL`: Your Supabase project URL (from Supabase Dashboard → Settings → API)
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key (from Supabase Dashboard → Settings → API)

3. **Configure Supabase Redirect URLs**
   - Go to your [Supabase Dashboard](https://app.supabase.com/)
   - Navigate to **Authentication** → **URL Configuration**
   - Add your GitHub Pages URL to both **Site URL** and **Redirect URLs**:
     - Format: `https://<username>.github.io/ScaleFlow/`
   - Save changes

4. **Deploy**
   - Push to `main` branch or manually trigger the workflow
   - The app will be available at `https://<username>.github.io/ScaleFlow/`

For detailed instructions, see [docs/ENVIRONMENT_SETUP.md](../../docs/ENVIRONMENT_SETUP.md#github-pages-setup).

### For CodeQL Security Analysis

**⚠️ Important:** This repository uses **Advanced** CodeQL configuration. Follow these steps:

1. Go to **Settings** → **Code security and analysis**
2. Find the "Code scanning" section
3. **If default setup is enabled:** Click the dropdown and select "Advanced" (or "Disable" then set up advanced)
4. **If code scanning is not enabled:** Click "Set up" and select "Advanced" (not "Default")
5. The existing workflow (`.github/workflows/codeql.yml`) will be automatically recognized

**🚨 Common Error:** If you see "analyses from advanced configurations cannot be processed when the default setup is enabled":
- **Quick Fix:** See [CODEQL_TROUBLESHOOTING.md](../../CODEQL_TROUBLESHOOTING.md) (5 steps, takes 1 minute)
- **Full Guide:** See [docs/CODEQL_SETUP.md](../../docs/CODEQL_SETUP.md) for comprehensive instructions

---

## 🛡️ Security Features

### Automated Security Scanning
- **CodeQL:** Deep semantic code analysis for vulnerabilities
- **Dependency Review:** Blocks PRs with vulnerable dependencies
- **License Compliance:** Ensures no GPL/AGPL licenses are introduced

### Best Practices Implemented
- ✅ Minimal permissions (principle of least privilege)
- ✅ Timeout limits on all jobs
- ✅ Concurrency controls to prevent resource waste
- ✅ Fail-fast on security issues
- ✅ Artifact retention policies

---

## 📊 Monitoring Workflow Runs

### View Workflow Status
1. Go to **Actions** tab in the repository
2. Select a workflow from the left sidebar
3. Click on a specific run to see details

### Debugging Failed Runs
1. Click on the failed job
2. Expand failed steps to see error logs
3. Download artifacts (coverage, build) if available
4. Check the "Annotations" section for specific errors

### Re-running Failed Workflows
1. Navigate to the failed workflow run
2. Click **Re-run jobs** → **Re-run failed jobs**
3. Or **Re-run all jobs** to start fresh

---

## 🔄 Updating Workflows

When modifying workflows:

1. **Test locally** if possible using [act](https://github.com/nektos/act)
2. **Validate YAML** syntax before committing
3. **Check required secrets** are documented
4. **Update this README** with any changes
5. **Test in a PR** before merging to main

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

## 🤝 Contributing

If you need to add or modify workflows:

1. Ensure workflows follow the established naming convention (emoji + descriptive name)
2. Add appropriate timeout limits
3. Use minimal required permissions
4. Document any required secrets
5. Update this README with the new workflow details

---

**Last Updated:** December 5, 2024
