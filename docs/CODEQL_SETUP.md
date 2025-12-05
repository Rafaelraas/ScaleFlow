# CodeQL Setup Guide

## Issue
The CodeQL Security Analysis workflow is failing with the following error:

```
Code scanning is not enabled for this repository. 
Please enable code scanning in the repository settings.
```

## Root Cause
This is a **configuration issue**, not a code problem. The CodeQL workflow file (`.github/workflows/codeql.yml`) is correctly configured, but GitHub Advanced Security features need to be enabled at the repository level.

## Solution

### Prerequisites
- Repository administrator access
- GitHub Advanced Security license (included with GitHub Team/Enterprise, or available for public repositories)

### Steps to Enable Code Scanning

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click on "Settings" tab

2. **Enable Advanced Security**
   - In the left sidebar, click on "Security" or "Code security and analysis"
   - Find the "GitHub Advanced Security" section
   - Click "Enable" if not already enabled (for private repositories)

3. **Enable Code Scanning**
   - In the same section, find "Code scanning"
   - Click "Set up" or "Enable"
   - Select "GitHub Actions" as the analysis tool
   - The existing CodeQL workflow (`.github/workflows/codeql.yml`) will be automatically recognized

4. **Verify Configuration**
   - After enabling, the CodeQL workflow should run automatically on the next push or pull request
   - You can manually trigger it from the Actions tab if needed

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

### "Advanced Security not available"
- For private repositories: Requires GitHub Team or Enterprise plan
- For public repositories: Available for free

### "Workflow still failing after enabling"
- Check workflow permissions in Settings > Actions > General
- Ensure `security-events: write` permission is granted
- Verify the workflow file syntax is correct

### "No alerts appearing"
- CodeQL may not find any security issues (which is good!)
- Check the workflow logs to confirm successful analysis
- Visit Security > Code scanning > Tool status for overview

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
