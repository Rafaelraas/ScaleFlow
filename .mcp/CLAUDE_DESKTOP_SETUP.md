# Quick Setup Guide for Claude Desktop with ScaleFlow

This is a quick reference for setting up Claude Desktop with MCP servers for ScaleFlow development.

## Prerequisites

- ✅ Claude Desktop installed ([download here](https://claude.ai/download))
- ✅ Node.js 16+ installed
- ✅ ScaleFlow repository cloned locally

## Setup Steps

### macOS/Linux

```bash
# 1. Navigate to your ScaleFlow directory
cd /path/to/ScaleFlow

# 2. Create Claude config directory
mkdir -p ~/Library/Application\ Support/Claude

# 3. Copy the MCP configuration
cp .mcp/config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 4. Update the path in the config (replace with your actual path)
REPO_PATH=$(pwd)
sed -i '' "s|/home/runner/work/ScaleFlow/ScaleFlow|$REPO_PATH|g" ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 5. (Optional) Add your GitHub token
# Edit the config file and replace <your_github_token_here> with your actual token
code ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 6. Restart Claude Desktop
echo "✅ Configuration complete! Please restart Claude Desktop."
```

### Windows (PowerShell)

```powershell
# 1. Navigate to your ScaleFlow directory
cd C:\path\to\ScaleFlow

# 2. Create Claude config directory
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"

# 3. Copy the MCP configuration
Copy-Item .mcp\config.json "$env:APPDATA\Claude\claude_desktop_config.json"

# 4. Update the path in the config
$repoPath = (Get-Location).Path
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
(Get-Content $configPath) -replace '/home/runner/work/ScaleFlow/ScaleFlow', $repoPath -replace '/', '\' | Set-Content $configPath

# 5. (Optional) Add your GitHub token
notepad $configPath

# 6. Restart Claude Desktop
Write-Host "✅ Configuration complete! Please restart Claude Desktop."
```

## Verification

After restarting Claude Desktop:

1. Open a new chat
2. Look for the 🔌 icon indicating MCP tools are available
3. Try these test commands:
   - "List files in the src directory"
   - "Show me the git status"
   - "Read the README.md file"

## Available Tools

Once configured, Claude can use these tools:

### Filesystem Operations
- `read_file` - Read any file in the repository
- `write_file` - Create or modify files
- `list_directory` - List directory contents
- `search_files` - Search for files by name

### Git Operations
- `git_status` - Check repository status
- `git_diff` - View changes
- `git_commit` - Create commits
- `git_log` - View commit history
- `git_branch` - Manage branches

### Optional: GitHub Integration

To enable GitHub tools:

1. Create a Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `read:org`, `read:user`
   - Generate and copy the token

2. Edit the config file:
   ```bash
   # macOS/Linux
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Windows
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

3. Replace `<your_github_token_here>` with your actual token

4. Restart Claude Desktop

GitHub tools will then be available:
- `create_issue` - Create GitHub issues
- `create_pull_request` - Create PRs
- `list_issues` - List repository issues
- `search_code` - Search code across repos

## Troubleshooting

### Tools Not Showing Up

**Solution:**
```bash
# Verify config file exists and is valid JSON
# macOS/Linux
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Windows
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | ConvertFrom-Json
```

### "npx command not found"

**Solution:**
```bash
# Verify Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
```

### Permission Denied

**Solution:**
```bash
# macOS/Linux - Check file permissions
ls -la ~/Library/Application\ Support/Claude/

# Fix if needed
chmod 644 ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Wrong Repository Path

**Solution:** Edit the config file and update all path references to match your actual repository location.

## Example Use Cases

### Code Review
```
"Review the Dashboard.tsx component and suggest improvements"
```

### Feature Implementation
```
"Add a dark mode toggle to the navigation bar"
```

### Bug Investigation
```
"Why is the login redirect not working? Check the routing setup"
```

### Documentation
```
"Update the README to include information about the new feature flags system"
```

### Git Operations
```
"Create a new branch called feature/dark-mode and commit the navigation changes"
```

## Configuration File Location

Your Claude Desktop configuration is stored at:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## Need More Help?

- **Full Setup Guide**: See [docs/MCP_SETUP.md](../docs/MCP_SETUP.md)
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Claude Desktop Help**: https://claude.ai/help
- **ScaleFlow Issues**: https://github.com/Rafaelraas/ScaleFlow/issues

## Security Reminder

- ⚠️ Never commit files containing your GitHub token
- ⚠️ Rotate tokens regularly for security
- ⚠️ Review all AI-generated code before committing
- ⚠️ Keep your MCP configuration file secure

Happy coding with Claude! 🚀
