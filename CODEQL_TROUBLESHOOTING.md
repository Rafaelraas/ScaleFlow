# 🚨 CodeQL Setup Issue - Quick Fix Guide

## Error Message You're Seeing

```
Code Scanning could not process the submitted SARIF file:
CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled
```

## What This Means

✅ **Your workflow file is correct** - The `.github/workflows/codeql.yml` file is properly configured.

❌ **Repository settings need adjustment** - GitHub's default CodeQL setup is enabled, which conflicts with the advanced workflow.

## The Problem

This repository uses an **Advanced CodeQL configuration** (custom workflow file) for better control and customization. However, GitHub has **Default CodeQL setup** enabled in the repository settings. These two setups **cannot coexist**.

## 🔧 Solution (5 Steps)

**You need repository administrator access to fix this.**

### Step 1: Go to Repository Settings
Navigate to your repository on GitHub and click **Settings** tab.

### Step 2: Open Code Security Settings
In the left sidebar, click **Code security and analysis**.

### Step 3: Find Code Scanning Section
Scroll down to the **Code scanning** section.

### Step 4: Switch to Advanced Setup
Look for the CodeQL analysis configuration:
- If you see a **dropdown** or **Configure** button showing "Default"
- Click it and select **"Advanced"**
- OR click **"Disable"** to turn off default setup

### Step 5: Confirm and Verify
- After switching to Advanced, the existing workflow file (`.github/workflows/codeql.yml`) will be automatically used
- Re-run the failed workflow from the Actions tab
- The workflow should now complete successfully

## ✅ How to Verify Success

After making the change:
1. Go to the **Actions** tab
2. Find the CodeQL workflow run
3. It should complete with ✅ (no more SARIF upload errors)
4. Results will appear in **Security** → **Code scanning alerts**

## 📖 Need More Details?

For comprehensive troubleshooting and additional scenarios, see:
- [`docs/CODEQL_SETUP.md`](./docs/CODEQL_SETUP.md) - Full setup guide
- [GitHub Documentation](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning-for-a-repository#switching-to-advanced-setup)

## 🤝 Need Help?

If you don't have repository administrator access:
1. Share this guide with the repository owner
2. Ask them to follow the steps above
3. This is a **one-time configuration** that takes about 1 minute

## Why Advanced Setup?

The advanced workflow provides:
- ✅ Custom query suites (security-and-quality)
- ✅ Scheduled weekly security scans
- ✅ Fine-grained control over analysis
- ✅ Consistent CI/CD integration
- ✅ Custom build configurations

---

**Last Updated:** December 5, 2024
