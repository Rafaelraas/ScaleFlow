# MCP Testing and Validation Guide

This guide helps you test and validate your Model Context Protocol (MCP) configuration for ScaleFlow.

## Quick Test Checklist

After setting up MCP, verify it works correctly:

- [ ] MCP tools appear in your AI assistant
- [ ] Filesystem operations work (read, write, list)
- [ ] Git operations work (status, diff, commit)
- [ ] GitHub integration works (if configured)
- [ ] Database queries work (if configured)

## Prerequisites Testing

### 1. Node.js Availability

```bash
# Check Node.js is installed
node --version

# Expected: v16.0.0 or higher
# If not installed: https://nodejs.org/
```

### 2. MCP Server Packages

Test that MCP server packages can be downloaded:

```bash
# Test filesystem server
npx -y @modelcontextprotocol/server-filesystem --help

# Test git server
npx -y @modelcontextprotocol/server-git --help

# Test GitHub server
npx -y @modelcontextprotocol/server-github --help
```

Expected: Each command should show help text without errors.

### 3. Configuration File Validation

```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('.mcp/config.json', 'utf8')).mcpServers ? '✓ Valid' : '✗ Invalid')"

# Or use jq if installed
jq . .mcp/config.json
```

Expected: `✓ Valid` or properly formatted JSON output.

## Testing in AI Assistants

### Claude Desktop Testing

#### 1. Verify Installation

1. **Open Claude Desktop**
2. **Look for the 🔌 icon** in the chat interface
   - If visible: MCP is loaded ✓
   - If not visible: Check troubleshooting section

#### 2. Test Filesystem Operations

**Test: List files**
```
List all files in the src directory
```

Expected response:
- Shows directory listing with files like `App.tsx`, `main.tsx`, etc.
- Uses the `list_directory` tool

**Test: Read a file**
```
Show me the contents of src/App.tsx
```

Expected response:
- Displays the complete file contents
- Uses the `read_file` tool

**Test: Search files**
```
Find all TypeScript files in the src/pages directory
```

Expected response:
- Lists all .tsx and .ts files in src/pages
- Uses `list_directory` or `search_files` tool

#### 3. Test Git Operations

**Test: Check status**
```
What's the git status of this repository?
```

Expected response:
- Shows current branch
- Lists modified/untracked files
- Uses the `git_status` tool

**Test: View diff**
```
Show me what files have changed
```

Expected response:
- Displays git diff output
- Uses the `git_diff` tool

**Test: View commit history**
```
Show me the last 5 commits
```

Expected response:
- Lists recent commits with messages and authors
- Uses the `git_log` tool

#### 4. Test GitHub Integration (if configured)

**Test: List issues**
```
Show me all open issues in the ScaleFlow repository
```

Expected response:
- Lists GitHub issues
- Uses the `list_issues` tool

**Test: Search code**
```
Search for 'useSession' in the codebase
```

Expected response:
- Shows files containing the search term
- Uses the `search_code` tool

### Cursor Testing

#### 1. Verify Installation

1. **Open Cursor**
2. **Check MCP panel** in the sidebar
   - Should show "Connected" or "Active" status
   - Lists enabled servers (filesystem, git, etc.)

#### 2. Run Test Commands

Use the same test commands as Claude Desktop (see above).

#### 3. Check Logs

If issues occur:
1. Open Developer Tools: `Cmd/Ctrl + Shift + I`
2. Go to Console tab
3. Look for MCP-related messages

### VS Code with Cline Testing

#### 1. Verify Installation

1. **Open Cline panel** in VS Code
2. **Check for MCP tools** in the available actions
3. **Look for server status** indicators

#### 2. Run Test Commands

Use the same test commands as other assistants.

## Common Test Scenarios

### Scenario 1: Code Review Task

**Command:**
```
Review the Dashboard.tsx component for potential improvements. Check for:
1. TypeScript type safety
2. Error handling
3. Loading states
4. Best practices
```

**Expected behavior:**
1. Reads `src/pages/Dashboard.tsx`
2. Analyzes code structure
3. Provides specific feedback
4. References line numbers

**Validates:**
- ✓ File reading works
- ✓ Path resolution is correct
- ✓ AI can analyze code content

### Scenario 2: Feature Implementation

**Command:**
```
Add a new export button to the schedules page that exports data to CSV. 
Update the necessary files and create a git commit.
```

**Expected behavior:**
1. Reads current schedules page
2. Creates/modifies necessary files
3. Shows what was changed
4. Creates a git commit with appropriate message

**Validates:**
- ✓ File reading works
- ✓ File writing works
- ✓ Git operations work
- ✓ Multiple tool usage in sequence

### Scenario 3: Bug Investigation

**Command:**
```
The login redirect is not working. Investigate the issue by:
1. Checking the Login component
2. Looking at the routing configuration
3. Reviewing recent git changes
```

**Expected behavior:**
1. Reads Login.tsx
2. Reads App.tsx (routing)
3. Checks git log for recent changes
4. Identifies the issue

**Validates:**
- ✓ Multiple file reads
- ✓ Git history access
- ✓ Cross-file analysis

### Scenario 4: Documentation Update

**Command:**
```
Update the README.md to include information about the new MCP setup.
Add a section after the installation instructions.
```

**Expected behavior:**
1. Reads README.md
2. Generates new content
3. Writes updated file
4. Shows the changes made

**Validates:**
- ✓ File reading
- ✓ File writing
- ✓ Content preservation

## Troubleshooting Tests

### Test 1: Config File Location

**macOS/Linux:**
```bash
# Claude Desktop
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Cursor
ls -la ~/.cursor/mcp.json
```

**Windows:**
```powershell
# Claude Desktop
Test-Path "$env:APPDATA\Claude\claude_desktop_config.json"

# Cursor
Test-Path "$env:USERPROFILE\.cursor\mcp.json"
```

Expected: File exists (returns path or `True`)

### Test 2: Path Correctness

**Check repository paths in config:**

```bash
# Extract paths from config (macOS/Linux)
grep "ScaleFlow" ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Should show YOUR actual repository path, not:
# /home/runner/work/ScaleFlow/ScaleFlow
```

If paths are wrong, update them manually or re-run setup script.

### Test 3: GitHub Token

**Test GitHub API with your token:**

```bash
# Replace YOUR_TOKEN with actual token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Expected: Your GitHub user information
# If error: Token is invalid or expired
```

### Test 4: Node Package Execution

**Test npx can execute MCP servers:**

```bash
# This should show help text
npx -y @modelcontextprotocol/server-filesystem --help

# If error "command not found":
# - Check Node.js is in PATH
# - Try: npm install -g npx
```

## Performance Testing

### Test Server Startup Time

```bash
# Time filesystem server startup
time npx -y @modelcontextprotocol/server-filesystem /path/to/ScaleFlow --help

# Expected: < 5 seconds
# If slower: Network issues or npm cache problems
```

### Test Large File Operations

**In AI assistant:**
```
Read the package-lock.json file
```

Expected:
- Should complete within a few seconds
- File content displayed correctly
- No timeout errors

### Test Multiple Operations

**Run a complex task:**
```
1. List all TypeScript files in src/components
2. Check git status
3. Show me the last commit
4. Read the Layout.tsx file
```

Expected:
- All operations complete successfully
- No server crashes or timeouts
- Results are accurate

## Security Testing

### Test 1: File Access Restrictions

**Try to access files outside repository:**
```
Read the file /etc/passwd
```

Expected:
- Should be denied or error
- MCP servers should restrict access to configured directories

### Test 2: Git Operations Safety

**Test dangerous operations:**
```
Run git reset --hard HEAD~10
```

Expected:
- AI should refuse or ask for confirmation
- Critical operations should require explicit user approval

### Test 3: Token Security

**Verify tokens are not exposed:**

```bash
# Check if token appears in logs or responses
# Token should never be displayed in plain text
```

## Automated Testing Script

Create a simple test script:

```bash
#!/bin/bash
# mcp-test.sh

echo "Testing MCP Configuration..."

# Test 1: Config exists
if [ -f "$HOME/Library/Application Support/Claude/claude_desktop_config.json" ]; then
    echo "✓ Config file exists"
else
    echo "✗ Config file not found"
fi

# Test 2: Valid JSON
if node -e "JSON.parse(require('fs').readFileSync('$HOME/Library/Application Support/Claude/claude_desktop_config.json', 'utf8'))" 2>/dev/null; then
    echo "✓ Config is valid JSON"
else
    echo "✗ Config has JSON errors"
fi

# Test 3: Node.js available
if command -v node &> /dev/null; then
    echo "✓ Node.js available ($(node --version))"
else
    echo "✗ Node.js not found"
fi

# Test 4: npx works
if command -v npx &> /dev/null; then
    echo "✓ npx available"
else
    echo "✗ npx not found"
fi

echo ""
echo "Testing complete. Check for any ✗ marks above."
```

Run with: `bash mcp-test.sh`

## Success Criteria

Your MCP setup is working correctly if:

- [x] All test commands execute without errors
- [x] File operations (read/write/list) work as expected
- [x] Git operations return accurate information
- [x] Path references are correct (your local paths, not CI paths)
- [x] Large files can be read without timeout
- [x] Multiple operations can run in sequence
- [x] Server startup time is reasonable (< 5 seconds)
- [x] Config file is valid JSON with no syntax errors

## Reporting Issues

If tests fail, gather this information:

1. **Operating System:** (macOS, Linux, Windows)
2. **AI Assistant:** (Claude Desktop, Cursor, VS Code)
3. **Node.js Version:** `node --version`
4. **Config File Location:** Full path
5. **Error Messages:** Exact error text
6. **Test Command:** What you tried
7. **Expected vs Actual:** What should happen vs what happened

Post issues to: https://github.com/Rafaelraas/ScaleFlow/issues

## Additional Resources

- **Full Setup Guide:** [docs/MCP_SETUP.md](../docs/MCP_SETUP.md)
- **Quick Setup:** [CLAUDE_DESKTOP_SETUP.md](./CLAUDE_DESKTOP_SETUP.md)
- **MCP Documentation:** https://modelcontextprotocol.io/
- **Troubleshooting:** [docs/MCP_SETUP.md#troubleshooting](../docs/MCP_SETUP.md#troubleshooting)

---

**Pro Tip:** Test with simple commands first before complex tasks. If basic file reading works, more complex operations will likely work too.
