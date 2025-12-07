# ScaleFlow MCP Setup Script for Windows
# Automates the installation of Model Context Protocol configuration for AI assistants

# Requires PowerShell 5.1 or higher

# Enable strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Print header
function Print-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║        ScaleFlow MCP Configuration Setup                  ║" -ForegroundColor Cyan
    Write-Host "║        Model Context Protocol for AI Assistants           ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# Check prerequisites
function Check-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        
        if ($versionNumber -lt 16) {
            Write-Error "Node.js version 16 or higher is required. Current version: $nodeVersion"
            Write-Info "Download from: https://nodejs.org/"
            exit 1
        }
        
        Write-Success "Node.js $nodeVersion found"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    }
    
    # Check if we're in the ScaleFlow repository
    if (-not (Test-Path "package.json")) {
        Write-Error "This script must be run from the ScaleFlow repository root"
        exit 1
    }
    
    $packageJson = Get-Content "package.json" -Raw
    if ($packageJson -notmatch "vite_react_shadcn_ts") {
        Write-Error "This doesn't appear to be the ScaleFlow repository"
        exit 1
    }
    
    Write-Success "ScaleFlow repository detected"
}

# Select AI assistant
function Select-Assistant {
    Write-Host ""
    Write-Info "Select your AI assistant:"
    Write-Host "  1) Claude Desktop"
    Write-Host "  2) Cursor"
    Write-Host "  3) Both"
    Write-Host "  4) Manual (just show me the config)"
    Write-Host ""
    
    $choice = Read-Host "Enter choice (1-4)"
    
    switch ($choice) {
        "1" { return "claude" }
        "2" { return "cursor" }
        "3" { return "both" }
        "4" { return "manual" }
        default {
            Write-Error "Invalid choice"
            exit 1
        }
    }
}

# Get repository path
function Get-RepoPath {
    $repoPath = (Get-Location).Path
    Write-Info "Repository path: $repoPath"
    return $repoPath
}

# Setup Claude Desktop
function Setup-Claude {
    param([string]$RepoPath)
    
    Write-Info "Setting up Claude Desktop..."
    
    # Create config directory
    $configDir = "$env:APPDATA\Claude"
    New-Item -ItemType Directory -Force -Path $configDir | Out-Null
    Write-Success "Created config directory: $configDir"
    
    # Config file path
    $configFile = "$configDir\claude_desktop_config.json"
    
    # Backup existing config
    if (Test-Path $configFile) {
        Write-Warning "Existing config found at $configFile"
        $backup = Read-Host "Do you want to backup and replace it? (y/n)"
        if ($backup -eq "y") {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            Copy-Item $configFile "$configFile.backup.$timestamp"
            Write-Success "Backup created"
        }
        else {
            Write-Info "Skipping Claude Desktop setup"
            return
        }
    }
    
    # Copy config and update path
    Copy-Item ".mcp\config.json" $configFile
    
    # Update repository path (convert to forward slashes for JSON)
    $jsonPath = $RepoPath -replace '\\', '/'
    $content = Get-Content $configFile -Raw
    $content = $content -replace '/home/runner/work/ScaleFlow/ScaleFlow', $jsonPath
    Set-Content $configFile $content -NoNewline
    
    Write-Success "Claude Desktop configuration installed"
    Write-Info "Config location: $configFile"
}

# Setup Cursor
function Setup-Cursor {
    param([string]$RepoPath)
    
    Write-Info "Setting up Cursor..."
    
    # Create config directory
    $configDir = "$env:USERPROFILE\.cursor"
    New-Item -ItemType Directory -Force -Path $configDir | Out-Null
    Write-Success "Created config directory: $configDir"
    
    # Config file path
    $configFile = "$configDir\mcp.json"
    
    # Backup existing config
    if (Test-Path $configFile) {
        Write-Warning "Existing config found at $configFile"
        $backup = Read-Host "Do you want to backup and replace it? (y/n)"
        if ($backup -eq "y") {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            Copy-Item $configFile "$configFile.backup.$timestamp"
            Write-Success "Backup created"
        }
        else {
            Write-Info "Skipping Cursor setup"
            return
        }
    }
    
    # Copy config and update path
    Copy-Item ".mcp\config.json" $configFile
    
    # Update repository path (convert to forward slashes for JSON)
    $jsonPath = $RepoPath -replace '\\', '/'
    $content = Get-Content $configFile -Raw
    $content = $content -replace '/home/runner/work/ScaleFlow/ScaleFlow', $jsonPath
    Set-Content $configFile $content -NoNewline
    
    Write-Success "Cursor configuration installed"
    Write-Info "Config location: $configFile"
}

# Show manual instructions
function Show-Manual {
    param([string]$RepoPath)
    
    Write-Host ""
    Write-Info "=== Manual Setup Instructions ==="
    Write-Host ""
    Write-Host "1. Copy the config file from: .mcp\config.json"
    Write-Host "2. Place it in your AI assistant's config location:"
    Write-Host "   - Claude Desktop: $env:APPDATA\Claude\claude_desktop_config.json"
    Write-Host "   - Cursor: $env:USERPROFILE\.cursor\mcp.json"
    Write-Host "3. Update all path references from '/home/runner/work/ScaleFlow/ScaleFlow'"
    Write-Host "   to: $($RepoPath -replace '\\', '/')"
    Write-Host ""
    Write-Info "For detailed instructions, see: docs\MCP_SETUP.md"
}

# Add GitHub token (optional)
function Add-GitHubToken {
    param(
        [string]$Assistant,
        [string]$RepoPath
    )
    
    Write-Host ""
    $addToken = Read-Host "Do you want to add a GitHub Personal Access Token? (y/n)"
    
    if ($addToken -ne "y") {
        Write-Info "Skipping GitHub token setup"
        return
    }
    
    Write-Host ""
    Write-Info "GitHub Personal Access Token Setup"
    Write-Warning "Your token will be stored in the config file in plain text"
    Write-Host ""
    Write-Host "To create a token:"
    Write-Host "1. Go to: https://github.com/settings/tokens"
    Write-Host "2. Click 'Generate new token (classic)'"
    Write-Host "3. Select scopes: repo, read:org, read:user"
    Write-Host "4. Generate and copy the token"
    Write-Host ""
    
    $githubToken = Read-Host "Enter your GitHub token (or press Enter to skip)"
    
    if ([string]::IsNullOrWhiteSpace($githubToken)) {
        Write-Info "Skipping GitHub token"
        return
    }
    
    # Update token in config files
    if ($Assistant -eq "claude" -or $Assistant -eq "both") {
        $configFile = "$env:APPDATA\Claude\claude_desktop_config.json"
        if (Test-Path $configFile) {
            $content = Get-Content $configFile -Raw
            $content = $content -replace '<your_github_token_here>', $githubToken
            Set-Content $configFile $content -NoNewline
            Write-Success "GitHub token added to Claude config"
        }
    }
    
    if ($Assistant -eq "cursor" -or $Assistant -eq "both") {
        $configFile = "$env:USERPROFILE\.cursor\mcp.json"
        if (Test-Path $configFile) {
            $content = Get-Content $configFile -Raw
            $content = $content -replace '<your_github_token_here>', $githubToken
            Set-Content $configFile $content -NoNewline
            Write-Success "GitHub token added to Cursor config"
        }
    }
}

# Test MCP installation
function Test-MCP {
    Write-Host ""
    $testInstall = Read-Host "Would you like to test the MCP server installation? (y/n)"
    
    if ($testInstall -ne "y") {
        return
    }
    
    Write-Info "Testing MCP server installation..."
    
    # Test filesystem server
    try {
        npx -y "@modelcontextprotocol/server-filesystem" --help 2>&1 | Out-Null
        Write-Success "Filesystem server accessible"
    }
    catch {
        Write-Warning "Filesystem server test failed (may still work in AI assistant)"
    }
    
    # Test git server
    try {
        npx -y "@modelcontextprotocol/server-git" --help 2>&1 | Out-Null
        Write-Success "Git server accessible"
    }
    catch {
        Write-Warning "Git server test failed (may still work in AI assistant)"
    }
}

# Show next steps
function Show-NextSteps {
    param([string]$Assistant)
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    Setup Complete! ✓                       ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    if ($Assistant -eq "claude" -or $Assistant -eq "both") {
        Write-Info "Next steps for Claude Desktop:"
        Write-Host "  1. Restart Claude Desktop completely"
        Write-Host "  2. Open a new chat"
        Write-Host "  3. Look for the 🔌 icon (indicates MCP tools available)"
        Write-Host "  4. Try: 'List files in the src directory'"
        Write-Host ""
    }
    
    if ($Assistant -eq "cursor" -or $Assistant -eq "both") {
        Write-Info "Next steps for Cursor:"
        Write-Host "  1. Restart Cursor"
        Write-Host "  2. Check the MCP panel in the sidebar"
        Write-Host "  3. Verify servers show as 'Active'"
        Write-Host "  4. Try: 'Show me the App.tsx file'"
        Write-Host ""
    }
    
    Write-Info "Documentation:"
    Write-Host "  - Full setup guide: docs\MCP_SETUP.md"
    Write-Host "  - Quick reference: .mcp\CLAUDE_DESKTOP_SETUP.md"
    Write-Host "  - MCP README: .mcp\README.md"
    Write-Host ""
    
    Write-Info "Troubleshooting:"
    Write-Host "  - If tools don't appear, check the AI assistant logs"
    Write-Host "  - Verify paths are correct in the config file"
    Write-Host "  - See docs\MCP_SETUP.md for detailed troubleshooting"
    Write-Host ""
    
    Write-Success "Happy coding with AI assistance! 🚀"
}

# Main function
function Main {
    try {
        Print-Header
        Check-Prerequisites
        $assistant = Select-Assistant
        $repoPath = Get-RepoPath
        
        Write-Host ""
        
        switch ($assistant) {
            "claude" {
                Setup-Claude -RepoPath $repoPath
            }
            "cursor" {
                Setup-Cursor -RepoPath $repoPath
            }
            "both" {
                Setup-Claude -RepoPath $repoPath
                Write-Host ""
                Setup-Cursor -RepoPath $repoPath
            }
            "manual" {
                Show-Manual -RepoPath $repoPath
                return
            }
        }
        
        if ($assistant -ne "manual") {
            Add-GitHubToken -Assistant $assistant -RepoPath $repoPath
            Test-MCP
            Show-NextSteps -Assistant $assistant
        }
    }
    catch {
        Write-Host ""
        Write-Error "An error occurred: $_"
        Write-Host $_.ScriptStackTrace
        exit 1
    }
}

# Run main function
Main
