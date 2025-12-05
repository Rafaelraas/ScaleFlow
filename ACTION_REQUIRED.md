# ⚠️ ACTION REQUIRED: CodeQL Configuration

## Repository Administrator Action Needed

The CodeQL security scanning workflow is failing due to a **repository configuration issue** that requires manual intervention by a repository administrator.

---

## 🚨 The Issue

**Error Message:**
```
Code Scanning could not process the submitted SARIF file:
CodeQL analyses from advanced configurations cannot be processed 
when the default setup is enabled
```

**What's happening:**
- Your repository has an advanced CodeQL workflow (`.github/workflows/codeql.yml`) ✅
- GitHub's "Default" CodeQL setup is enabled in repository settings ❌
- These two cannot coexist - GitHub rejects SARIF uploads when both are active ❌

---

## 🔧 How to Fix (Takes 1 Minute)

### Option 1: Quick Fix (Recommended)
Follow the step-by-step guide:
👉 **[CODEQL_TROUBLESHOOTING.md](./CODEQL_TROUBLESHOOTING.md)**

### Option 2: Manual Steps
1. Go to your repository on GitHub
2. Click **Settings** → **Code security and analysis**
3. Find the "Code scanning" section
4. Click the dropdown/configure button showing "Default"
5. Select **"Advanced"** instead
6. Confirm the change

That's it! The workflow will now use the custom configuration file.

---

## ✅ After Making the Change

1. Go to the **Actions** tab
2. Re-run the failed CodeQL workflow
3. It should now complete successfully ✅
4. Security alerts will appear in **Security** → **Code scanning**

---

## 📚 Additional Resources

- **Quick Fix Guide:** [CODEQL_TROUBLESHOOTING.md](./CODEQL_TROUBLESHOOTING.md)
- **Comprehensive Guide:** [docs/CODEQL_SETUP.md](./docs/CODEQL_SETUP.md)
- **GitHub Documentation:** [Configuring Code Scanning](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning-for-a-repository#switching-to-advanced-setup)

---

## ℹ️ Why This Happened

GitHub offers two ways to set up CodeQL:
1. **Default Setup** - Automatic, managed by GitHub
2. **Advanced Setup** - Custom workflow file with fine-grained control

This repository uses **Advanced Setup** for better customization (custom queries, scheduled scans, etc.), but GitHub's **Default Setup** was previously enabled, creating a conflict.

---

## ❓ Questions?

If you need help or have questions:
- Open an issue using the 🚨 CodeQL Setup Issue template
- Check the troubleshooting guides linked above
- Contact the development team

---

**This document can be deleted after the configuration is fixed.**

*Created: December 5, 2024*
