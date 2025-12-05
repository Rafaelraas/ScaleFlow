# CodeQL Setup Guide

> 🚨 **Quick Fix Needed?** See [CODEQL_TROUBLESHOOTING.md](../CODEQL_TROUBLESHOOTING.md) for a fast 5-step solution to the most common setup issue.

## Common Issues

### Issue 1: Default Setup Conflict (Current Issue)

**Error Message:**
```
Code scanning could not process the submitted SARIF file:
CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled
```

**Root Cause:**
GitHub's default CodeQL setup is enabled in the repository settings, which conflicts with the advanced/custom CodeQL workflow configuration in `.github/workflows/codeql.yml`. When default setup is enabled, GitHub automatically manages CodeQL analysis and rejects SARIF uploads from advanced workflow configurations.

**Solution:**
Disable the default setup and use the advanced workflow configuration instead.

#### Steps to Disable Default Setup

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click on "Settings" tab

2. **Access Code Security Settings**
   - In the left sidebar, click on "Code security and analysis"

3. **Disable Default CodeQL Setup**
   - Find the "Code scanning" section
   - If you see "CodeQL analysis" with a "Configure" dropdown showing "Default"
   - Click on the dropdown and select "Advanced"
   - OR if there's a "Disable" option, click it to disable default setup

4. **Enable Advanced Setup**
   - GitHub should recognize the existing workflow file (`.github/workflows/codeql.yml`)
   - Select "Advanced" setup when prompted
   - This will use the workflow file for CodeQL analysis instead of default setup

5. **Verify Configuration**
   - After switching to advanced setup, the workflow should run successfully
   - Check the Actions tab to see the CodeQL workflow run
   - Future pushes and PRs will use the advanced workflow configuration

**Why Use Advanced Setup?**
The advanced workflow configuration provides:
- Custom query suites (security-and-quality)
- Scheduled weekly scans
- Fine-grained control over analysis
- Custom build steps if needed
- Consistent CI/CD integration

---

### Issue 2: Code Scanning Not Enabled

**Error Message:**
```
Code scanning is not enabled for this repository. 
Please enable code scanning in the repository settings.
```

**Root Cause:**
This is a **configuration issue**, not a code problem. The CodeQL workflow file (`.github/workflows/codeql.yml`) is correctly configured, but GitHub Advanced Security features need to be enabled at the repository level.

### Solution

#### Prerequisites
- Repository administrator access
- GitHub Advanced Security license (included with GitHub Team/Enterprise, or available for public repositories)

#### Steps to Enable Code Scanning

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click on "Settings" tab

2. **Enable Advanced Security**
   - In the left sidebar, click on "Security" or "Code security and analysis"
   - Find the "GitHub Advanced Security" section
   - Click "Enable" if not already enabled (for private repositories)

3. **Enable Code Scanning (Advanced Setup)**
   - In the same section, find "Code scanning"
   - Click "Set up" or "Enable"
   - **Important:** Select "Advanced" setup (not "Default")
   - Select "GitHub Actions" as the analysis tool
   - If the CodeQL workflow file (`.github/workflows/codeql.yml`) exists in your repository, GitHub will automatically recognize and use it
   - If you don't have a workflow file yet, you can use the workflow template or commit the codeql.yml file from this repository

4. **Verify Configuration**
   - After enabling, the CodeQL workflow should run automatically on the next push or pull request
   - You can manually trigger it from the Actions tab if needed

---

## Workflow Details

The CodeQL workflow (`codeql.yml`) is configured to:
- Run on pushes to `main` branch
- Run on pull requests to `main` branch  
- Run weekly on Mondays at 10:00 UTC (scheduled scan)
- Analyze JavaScript/TypeScript code
- Use security-and-quality query suite
- Upload results to GitHub Security tab

## Verifying Success

Once enabled, you should see:
1. ✅ CodeQL workflow runs successfully in the Actions tab
2. 📊 Security alerts appear in the Security tab > Code scanning
3. 🔍 Scan results visible on pull requests

## Troubleshooting

### "CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled"
**Solution:** Disable default setup and switch to advanced setup (see Issue 1 above)
- This error occurs when GitHub default setup is active
- You must switch to "Advanced" setup to use the custom workflow
- Default and Advanced setups cannot run simultaneously

### "Advanced Security not available"
- For private repositories: Requires GitHub Team or Enterprise plan
- For public repositories: Available for free

### "Workflow still failing after enabling"
- Check workflow permissions in Settings > Actions > General
- Ensure `security-events: write` permission is granted
- Verify the workflow file syntax is correct
- Confirm you're using "Advanced" setup, not "Default" setup

### "No alerts appearing"
- CodeQL may not find any security issues (which is good!)
- Check the workflow logs to confirm successful analysis
- Visit Security > Code scanning > Tool status for overview

### Switching from Default to Advanced Setup
If you previously enabled default setup:
1. Go to Settings > Code security and analysis
2. Find "Code scanning" section
3. Look for a configure/manage button or dropdown
4. Select "Advanced" or "Switch to advanced"
5. Confirm the change
6. Re-run the workflow from Actions tab

## Additional Resources

- [GitHub Code Scanning Documentation](https://docs.github.com/en/code-security/code-scanning)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Configuring Code Scanning](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning)

## Note for Non-Admins

If you don't have repository administrator access:
1. Create an issue or contact the repository owner
2. Share this documentation with them
3. Request that they enable GitHub Advanced Security and Code Scanning

This is a one-time configuration that requires administrator privileges.
