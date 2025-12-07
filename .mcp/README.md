# Model Context Protocol (MCP) Configuration

This directory contains configuration for Model Context Protocol (MCP) servers, which provide AI assistants with enhanced capabilities for working with the ScaleFlow codebase.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that enables AI assistants to securely connect to external tools and data sources. MCP servers provide capabilities like:

- **File system access** - Read and write files in the repository
- **Git operations** - Commit, branch, diff, and other git commands
- **GitHub integration** - Access issues, PRs, and repository management
- **Database queries** - Connect to PostgreSQL/Supabase
- **Web search** - Research documentation and solutions

## Configuration Files

### `config.json`

The main MCP configuration file that defines available servers. This file is used by MCP-compatible AI clients (like Claude Desktop, Cursor, or other tools).

**Location for different tools:**

- **Claude Desktop (macOS)**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop (Windows)**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Cursor**: `.cursor/mcp.json` (in your home directory or project root)
- **VS Code with Cline**: Settings → Cline → MCP Settings

## Configured MCP Servers

### 1. Filesystem Server (Active)

Provides read/write access to the ScaleFlow repository.

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/ScaleFlow"]
}
```

**Capabilities:**
- Read file contents
- Write/edit files
- List directory contents
- Search files

### 2. Git Server (Active)

Enables git operations on the repository.

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/path/to/ScaleFlow"]
}
```

**Capabilities:**
- View git status
- Create commits
- Manage branches
- View diffs and history
- Resolve merge conflicts

### 3. GitHub Server (Active - Requires Token)

Provides GitHub API access for repository management.

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "<your_token>"
  }
}
```

**Setup:**
1. Create a GitHub Personal Access Token at: https://github.com/settings/tokens
2. Required scopes: `repo`, `read:org`, `read:user`
3. Replace `<your_github_token_here>` in `config.json` with your token

**Capabilities:**
- Create and manage issues
- Review and create PRs
- Search code across repositories
- Manage repository settings

### 4. PostgreSQL Server (Disabled by default)

Connect to the Supabase local database for development.

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://..."]
}
```

**Setup:**
1. Start local Supabase: `npm run backend:start`
2. Update connection string if needed (default: `postgresql://postgres:postgres@localhost:54322/postgres`)
3. Remove `"disabled": true` to enable

**Capabilities:**
- Execute SQL queries
- View schema information
- Analyze database structure

### 5. Brave Search Server (Disabled by default)

Enables web search for research and documentation.

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "<your_api_key>"
  }
}
```

**Setup:**
1. Get API key from: https://brave.com/search/api/
2. Replace `<your_brave_api_key_here>` in `config.json`
3. Remove `"disabled": true` to enable

**Capabilities:**
- Search the web
- Research technical solutions
- Find documentation

## Installation Guide

### For Claude Desktop

1. **Copy the MCP configuration:**

   **macOS:**
   ```bash
   mkdir -p ~/Library/Application\ Support/Claude
   cp .mcp/config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"
   Copy-Item .mcp\config.json "$env:APPDATA\Claude\claude_desktop_config.json"
   ```

2. **Update paths in the configuration:**
   - Replace all instances of `/home/runner/work/ScaleFlow/ScaleFlow` with your actual repository path
   - Example: `/Users/yourname/projects/ScaleFlow` (macOS) or `C:\Users\yourname\projects\ScaleFlow` (Windows)

3. **Add API tokens** (optional but recommended):
   - Add your GitHub Personal Access Token
   - Add Brave API key if using search

4. **Restart Claude Desktop** to load the new configuration

### For Cursor

1. **Create MCP config in Cursor settings:**
   ```bash
   mkdir -p ~/.cursor
   cp .mcp/config.json ~/.cursor/mcp.json
   ```

2. **Or configure in Cursor settings:**
   - Open Cursor Settings
   - Search for "MCP"
   - Add servers manually or point to the config file

### For VS Code with Cline Extension

1. Open VS Code Settings
2. Search for "Cline MCP"
3. Click "Edit in settings.json"
4. Copy the `mcpServers` section from `.mcp/config.json`

## Verifying Installation

After installation, you should see available MCP tools in your AI assistant:

**Claude Desktop:**
- Look for the 🔌 icon in the chat interface
- Tools like "read_file", "write_file", "git_status" should be available

**Cursor:**
- Check the MCP panel in the sidebar
- Verify connected servers show as "Active"

## Security Considerations

### API Tokens

- **Never commit API tokens** to the repository
- The `.gitignore` already excludes token files
- Use environment variables or secure secret managers for tokens
- Rotate tokens periodically

### File System Access

- MCP servers have full access to the specified directories
- Only grant filesystem access to trusted directories
- Review file operations performed by AI assistants

### Database Access

- Only enable database MCP servers in development
- Use read-only credentials when possible
- Never use production database credentials

## Troubleshooting

### MCP Server Not Starting

1. **Check Node.js is installed:** `node --version` (requires Node.js 16+)
2. **Test npx commands manually:**
   ```bash
   npx -y @modelcontextprotocol/server-filesystem --help
   ```
3. **Verify paths are correct** in config.json
4. **Check AI assistant logs** for error messages

### GitHub Server Not Working

1. Verify GitHub token has correct permissions
2. Test token with curl:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```
3. Check token hasn't expired

### Database Server Connection Issues

1. Verify Supabase is running: `npm run backend:status`
2. Test connection string:
   ```bash
   psql "postgresql://postgres:postgres@localhost:54322/postgres"
   ```
3. Check firewall isn't blocking port 54322

## Advanced Configuration

### Custom Servers

You can add custom MCP servers to `config.json`:

```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "CUSTOM_VAR": "value"
      },
      "description": "My custom MCP server"
    }
  }
}
```

### Multiple Environments

Create separate configs for different environments:

- `.mcp/config.dev.json` - Development with local database
- `.mcp/config.prod.json` - Production (read-only)
- `.mcp/config.local.json` - Personal overrides (gitignored)

## Resources

- **MCP Documentation:** https://modelcontextprotocol.io/
- **Official MCP Servers:** https://github.com/modelcontextprotocol/servers
- **Claude Desktop Docs:** https://docs.anthropic.com/claude/docs/
- **MCP Specification:** https://spec.modelcontextprotocol.io/

## Support

For issues or questions:
1. Check the [MCP Documentation](https://modelcontextprotocol.io/)
2. Review the [troubleshooting section](#troubleshooting)
3. Open an issue in the ScaleFlow repository
4. Check AI assistant-specific documentation

## Contributing

When adding new MCP servers:
1. Add server configuration to `config.json`
2. Document the server in this README
3. Include setup instructions
4. Note any required API keys or permissions
5. Test the server before committing
