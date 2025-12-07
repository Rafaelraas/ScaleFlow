# Model Context Protocol (MCP) Setup Guide for ScaleFlow

## Overview

This guide will help you set up Model Context Protocol (MCP) servers for enhanced AI assistant capabilities when working with ScaleFlow. MCP enables AI assistants like Claude Desktop, Cursor, and others to interact with your development environment more effectively.

## Table of Contents

- [What is MCP?](#what-is-mcp)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Platform-Specific Setup](#platform-specific-setup)
- [Available MCP Servers](#available-mcp-servers)
- [Configuration Examples](#configuration-examples)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that allows AI assistants to:
- Access your local file system
- Execute git commands
- Query databases
- Search the web
- Interact with external APIs

For ScaleFlow development, MCP provides:
- Direct code reading and editing
- Git operations without manual commands
- GitHub PR and issue management
- Database schema exploration
- Documentation research

## Prerequisites

Before setting up MCP, ensure you have:

- **Node.js 16+** installed (`node --version`)
- An MCP-compatible AI assistant:
  - [Claude Desktop](https://claude.ai/download)
  - [Cursor](https://cursor.sh/)
  - [VS Code with Cline extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)
- **Git** installed and configured
- ScaleFlow repository cloned locally

## Quick Start

### 1. Choose Your Platform

Select your AI assistant platform and follow the corresponding setup:

- [Claude Desktop](#claude-desktop)
- [Cursor](#cursor)
- [VS Code with Cline](#vs-code-with-cline)

### 2. Basic Setup Script

Run this script to set up MCP for Claude Desktop (macOS/Linux):

```bash
# Navigate to ScaleFlow repository
cd /path/to/ScaleFlow

# Create Claude config directory
mkdir -p ~/Library/Application\ Support/Claude

# Copy MCP configuration
cp .mcp/config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Update paths to your local repository
sed -i '' "s|/home/runner/work/ScaleFlow/ScaleFlow|$(pwd)|g" ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Restart Claude Desktop
echo "Configuration installed! Please restart Claude Desktop."
```

For Windows (PowerShell):

```powershell
# Navigate to ScaleFlow repository
cd C:\path\to\ScaleFlow

# Create Claude config directory
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"

# Copy MCP configuration
Copy-Item .mcp\config.json "$env:APPDATA\Claude\claude_desktop_config.json"

# Update paths (manually edit the file to replace paths)
notepad "$env:APPDATA\Claude\claude_desktop_config.json"

Write-Host "Configuration copied! Update paths and restart Claude Desktop."
```

## Platform-Specific Setup

### Claude Desktop

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Setup Steps:**

1. **Install Claude Desktop** from https://claude.ai/download

2. **Copy the configuration:**
   ```bash
   mkdir -p ~/Library/Application\ Support/Claude
   cp .mcp/config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **Edit the configuration** to update paths:
   ```bash
   # Open in your preferred editor
   vim ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Or use VS Code
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

4. **Update all path references** from `/home/runner/work/ScaleFlow/ScaleFlow` to your local path

5. **Restart Claude Desktop**

6. **Verify installation:**
   - Open a new Claude chat
   - Look for the 🔌 icon indicating available tools
   - Try: "List files in the src directory"

### Cursor

**Location:**
- All platforms: `~/.cursor/mcp.json`

**Setup Steps:**

1. **Install Cursor** from https://cursor.sh/

2. **Create Cursor MCP directory:**
   ```bash
   mkdir -p ~/.cursor
   ```

3. **Copy configuration:**
   ```bash
   cp .mcp/config.json ~/.cursor/mcp.json
   ```

4. **Update paths in the configuration**

5. **Alternative: Configure in Cursor UI:**
   - Open Cursor Settings (Cmd/Ctrl + ,)
   - Search for "MCP"
   - Click "Edit in settings.json"
   - Paste the `mcpServers` section from `.mcp/config.json`

6. **Restart Cursor**

7. **Verify:**
   - Open Cursor AI chat
   - Check MCP panel for active servers
   - Test: "Show me the App.tsx file"

### VS Code with Cline

**Location:** VS Code settings.json

**Setup Steps:**

1. **Install Cline extension:**
   ```bash
   code --install-extension saoudrizwan.claude-dev
   ```

2. **Open VS Code Settings:**
   - Press `Cmd/Ctrl + ,`
   - Click "Open Settings (JSON)" icon in top-right

3. **Add MCP configuration:**
   ```json
   {
     "cline.mcpServers": {
       "filesystem": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/ScaleFlow"]
       },
       "git": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/ScaleFlow"]
       }
     }
   }
   ```

4. **Reload VS Code window:**
   - Press `Cmd/Ctrl + Shift + P`
   - Type "Reload Window"
   - Press Enter

5. **Verify:**
   - Open Cline panel
   - Check for MCP server status
   - Test filesystem operations

## Available MCP Servers

### Core Servers (Enabled by Default)

#### 1. Filesystem Server

**Purpose:** Read and write files in the repository

**Tools provided:**
- `read_file` - Read file contents
- `write_file` - Create or update files
- `list_directory` - List directory contents
- `search_files` - Search for files by name/pattern

**Example usage:**
- "Show me the Dashboard component"
- "Update the README to include MCP setup"
- "List all TypeScript files in src/pages"

#### 2. Git Server

**Purpose:** Git operations without CLI

**Tools provided:**
- `git_status` - Check repository status
- `git_diff` - View changes
- `git_commit` - Create commits
- `git_log` - View commit history
- `git_branch` - Manage branches

**Example usage:**
- "What files have changed?"
- "Create a commit with message 'Add MCP setup'"
- "Show me the last 5 commits"
- "Create a new branch called feature/mcp-docs"

### Optional Servers (Disabled by Default)

#### 3. GitHub Server

**Purpose:** GitHub API integration

**Requires:** GitHub Personal Access Token

**Setup:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`, `read:user`
4. Copy the token
5. Add to config: `"GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"`
6. Remove `"disabled": true` from config

**Tools provided:**
- `create_issue` - Create GitHub issues
- `create_pull_request` - Create PRs
- `list_issues` - List repository issues
- `search_code` - Search code across repos
- `get_file_contents` - Read files from GitHub

**Example usage:**
- "Create an issue for MCP documentation"
- "List all open issues"
- "Create a PR for the current branch"

#### 4. PostgreSQL Server

**Purpose:** Database access for Supabase

**Requires:** Supabase running locally

**Setup:**
1. Start Supabase: `npm run backend:start`
2. Update connection string if needed
3. Remove `"disabled": true` from config

**Tools provided:**
- `execute_query` - Run SQL queries
- `list_tables` - View database schema
- `describe_table` - Get table structure

**Example usage:**
- "Show me the users table schema"
- "Query all companies with more than 10 employees"
- "Explain the RLS policies on the schedules table"

#### 5. Brave Search Server

**Purpose:** Web search for documentation

**Requires:** Brave Search API key

**Setup:**
1. Get API key from https://brave.com/search/api/
2. Add to config: `"BRAVE_API_KEY": "your_api_key_here"`
3. Remove `"disabled": true` from config

**Tools provided:**
- `brave_web_search` - Search the web

**Example usage:**
- "Search for React Hook Form best practices"
- "Find Supabase RLS policy examples"
- "Look up Vite optimization techniques"

## Configuration Examples

### Minimal Setup (Filesystem + Git only)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/ScaleFlow"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/ScaleFlow"]
    }
  }
}
```

### Full Development Setup

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/ScaleFlow"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/ScaleFlow"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://postgres:postgres@localhost:54322/postgres"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "BSA_xxxxxxxxxxxx"
      }
    }
  }
}
```

### Read-Only Setup (For Code Review)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/ScaleFlow"],
      "readOnly": true
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/ScaleFlow", "--read-only"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

## Common Use Cases

### 1. Code Review and Analysis

"Review the Dashboard.tsx component and suggest improvements"

AI will:
- Read the file using filesystem server
- Analyze code structure
- Check git history for context
- Provide recommendations

### 2. Feature Implementation

"Add a new export button to the schedules page with PDF export"

AI will:
- Read existing components
- Create/modify necessary files
- Update types and imports
- Test the changes
- Create a git commit

### 3. Bug Investigation

"Why is the login redirect not working?"

AI will:
- Read relevant files (Login.tsx, routing, auth)
- Check git history for recent changes
- Search codebase for related code
- Identify the issue
- Propose a fix

### 4. Documentation Updates

"Update the README to include the new MCP setup instructions"

AI will:
- Read existing README
- Generate documentation
- Update the file
- Create a commit

### 5. Database Schema Review

"Show me all tables related to scheduling"

AI will (with PostgreSQL server):
- Query database schema
- List related tables
- Show relationships
- Explain RLS policies

## Troubleshooting

### Issue: MCP Servers Not Showing Up

**Symptoms:** No 🔌 icon in Claude Desktop, or tools not available

**Solutions:**
1. Verify config file location is correct
2. Check JSON syntax: `jq . ~/.../config.json`
3. Restart the AI assistant completely
4. Check AI assistant logs:
   - Claude Desktop: Help → View Logs
   - Cursor: Developer Tools → Console

### Issue: "npx command not found"

**Symptoms:** MCP servers fail to start

**Solutions:**
1. Verify Node.js is installed: `node --version`
2. Verify npm is in PATH: `npm --version`
3. Install Node.js from https://nodejs.org/
4. Restart terminal/AI assistant

### Issue: Filesystem Access Denied

**Symptoms:** Cannot read/write files

**Solutions:**
1. Check file permissions: `ls -la /path/to/ScaleFlow`
2. Verify path is correct in config
3. Try with a test directory first
4. Check macOS/Windows file access permissions

### Issue: Git Commands Failing

**Symptoms:** Git operations timeout or fail

**Solutions:**
1. Verify git is installed: `git --version`
2. Check repository is valid: `cd /path/to/ScaleFlow && git status`
3. Ensure no ongoing git operations
4. Try git commands manually first

### Issue: GitHub Token Invalid

**Symptoms:** GitHub operations fail with 401/403 errors

**Solutions:**
1. Verify token hasn't expired
2. Check token has correct scopes:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```
3. Regenerate token if needed
4. Update config with new token

### Issue: Database Connection Failed

**Symptoms:** Cannot connect to PostgreSQL

**Solutions:**
1. Verify Supabase is running: `npm run backend:status`
2. Test connection manually:
   ```bash
   psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "SELECT 1"
   ```
3. Check connection string is correct
4. Verify firewall allows port 54322

### Issue: MCP Server Crashes

**Symptoms:** Server disconnects frequently

**Solutions:**
1. Check system resources (RAM, CPU)
2. Update to latest MCP server versions:
   ```bash
   npm update @modelcontextprotocol/server-*
   ```
3. Review AI assistant logs for errors
4. Try with fewer servers enabled

## Security Best Practices

### API Tokens

1. **Never commit tokens to version control**
   - Use `.gitignore` to exclude config files with tokens
   - Store in separate `.mcp/config.local.json` (gitignored)

2. **Use minimal scopes**
   - Only grant necessary permissions
   - Create separate tokens for different purposes

3. **Rotate tokens regularly**
   - Set expiration dates
   - Update tokens every 3-6 months

4. **Use environment variables**
   ```json
   {
     "env": {
       "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
     }
   }
   ```

### File System Access

1. **Limit directory access**
   - Only grant access to specific project directories
   - Avoid granting access to home directory or system folders

2. **Use read-only when possible**
   - For code review or analysis, use read-only mode
   - Enable write access only when needed

3. **Review AI actions**
   - Always review file changes before committing
   - Use git diff to verify modifications

### Database Access

1. **Use development databases only**
   - Never connect to production databases
   - Use local Supabase instance

2. **Read-only credentials when possible**
   - Create read-only database users
   - Limit query capabilities

3. **Monitor queries**
   - Review SQL queries executed by AI
   - Set query timeout limits

### General Security

1. **Keep software updated**
   - Update MCP servers regularly
   - Update AI assistant software

2. **Review logs periodically**
   - Check for unusual activity
   - Monitor API usage

3. **Use separate configs for different purposes**
   - Development config with full access
   - Review config with read-only access
   - Production config with minimal access

## Advanced Topics

### Creating Custom MCP Servers

You can create custom MCP servers for ScaleFlow-specific needs:

```javascript
// custom-scaleflow-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'scaleflow-custom',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Add custom tools
server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'check_shift_conflicts',
    description: 'Check for scheduling conflicts',
    inputSchema: {
      type: 'object',
      properties: {
        shift_id: { type: 'string' }
      }
    }
  }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Environment-Specific Configurations

Create multiple configuration files:

```bash
.mcp/
├── config.json              # Template
├── config.dev.json          # Development (local DB, full access)
├── config.review.json       # Code review (read-only)
├── config.local.json        # Personal (gitignored)
└── README.md
```

Use symlinks to switch:
```bash
ln -sf config.dev.json ~/.../claude_desktop_config.json
```

### Integration with CI/CD

MCP can be used in automated workflows:

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup MCP
        run: |
          cp .mcp/config.json ~/.config/mcp.json
          # Configure with appropriate tokens from secrets
      - name: Run AI review
        run: |
          # Use AI assistant with MCP to review changes
```

## Resources

- **MCP Official Site:** https://modelcontextprotocol.io/
- **MCP GitHub:** https://github.com/modelcontextprotocol/servers
- **Claude Desktop:** https://claude.ai/download
- **Cursor:** https://cursor.sh/
- **MCP Specification:** https://spec.modelcontextprotocol.io/

## Getting Help

If you encounter issues:

1. **Check documentation:** Review this guide and the [.mcp/README.md](.mcp/README.md)
2. **Search existing issues:** https://github.com/Rafaelraas/ScaleFlow/issues
3. **MCP Community:** https://discord.gg/modelcontextprotocol
4. **Create an issue:** Include config (without tokens), error logs, and steps to reproduce

## Next Steps

After setting up MCP:

1. **Test basic operations:**
   - "List files in src/pages"
   - "Show me the git status"
   - "Read the App.tsx file"

2. **Try common workflows:**
   - Code review: "Review Dashboard.tsx for improvements"
   - Bug fix: "Fix the type error in ScheduleForm.tsx"
   - Documentation: "Update CONTRIBUTING.md with MCP setup"

3. **Explore advanced features:**
   - GitHub integration for PR management
   - Database queries for schema understanding
   - Web search for documentation research

4. **Customize for your workflow:**
   - Add custom servers for specific needs
   - Create environment-specific configs
   - Set up read-only configs for code review

Happy coding with AI assistance! 🚀
