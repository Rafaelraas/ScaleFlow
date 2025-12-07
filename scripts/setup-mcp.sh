#!/bin/bash

# ScaleFlow MCP Setup Script
# Automates the installation of Model Context Protocol configuration for AI assistants

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

log_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

log_error() {
    echo -e "${RED}✗ ${NC}$1"
}

# Print header
print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║        ScaleFlow MCP Configuration Setup                  ║"
    echo "║        Model Context Protocol for AI Assistants           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js $(node --version) found"
    
    # Check if we're in the ScaleFlow repository
    if [ ! -f "package.json" ] || ! grep -q "vite_react_shadcn_ts" package.json; then
        log_error "This script must be run from the ScaleFlow repository root"
        exit 1
    fi
    
    log_success "ScaleFlow repository detected"
}

# Detect OS and set paths
detect_os() {
    log_info "Detecting operating system..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
        CURSOR_CONFIG_DIR="$HOME/.cursor"
        log_success "macOS detected"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        CLAUDE_CONFIG_DIR="$HOME/.config/Claude"
        CURSOR_CONFIG_DIR="$HOME/.cursor"
        log_success "Linux detected"
    else
        log_error "Unsupported operating system: $OSTYPE"
        log_info "Please use the Windows PowerShell script or configure manually"
        exit 1
    fi
}

# Select AI assistant
select_assistant() {
    echo ""
    log_info "Select your AI assistant:"
    echo "  1) Claude Desktop"
    echo "  2) Cursor"
    echo "  3) Both"
    echo "  4) Manual (just show me the config)"
    echo ""
    read -p "Enter choice (1-4): " choice
    
    case $choice in
        1) ASSISTANT="claude" ;;
        2) ASSISTANT="cursor" ;;
        3) ASSISTANT="both" ;;
        4) ASSISTANT="manual" ;;
        *) 
            log_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Get repository path
get_repo_path() {
    REPO_PATH=$(pwd)
    log_info "Repository path: $REPO_PATH"
}

# Setup Claude Desktop
setup_claude() {
    log_info "Setting up Claude Desktop..."
    
    # Create config directory
    mkdir -p "$CLAUDE_CONFIG_DIR"
    log_success "Created config directory: $CLAUDE_CONFIG_DIR"
    
    # Copy and update config
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    if [ -f "$CONFIG_FILE" ]; then
        log_warning "Existing config found at $CONFIG_FILE"
        read -p "Do you want to backup and replace it? (y/n): " backup
        if [ "$backup" = "y" ]; then
            cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
            log_success "Backup created"
        else
            log_info "Skipping Claude Desktop setup"
            return
        fi
    fi
    
    # Copy config and update path
    cp .mcp/config.json "$CONFIG_FILE"
    
    # Update repository path (macOS-compatible sed)
    if [[ "$OS" == "macos" ]]; then
        sed -i '' "s|/home/runner/work/ScaleFlow/ScaleFlow|$REPO_PATH|g" "$CONFIG_FILE"
    else
        sed -i "s|/home/runner/work/ScaleFlow/ScaleFlow|$REPO_PATH|g" "$CONFIG_FILE"
    fi
    
    log_success "Claude Desktop configuration installed"
    log_info "Config location: $CONFIG_FILE"
}

# Setup Cursor
setup_cursor() {
    log_info "Setting up Cursor..."
    
    # Create config directory
    mkdir -p "$CURSOR_CONFIG_DIR"
    log_success "Created config directory: $CURSOR_CONFIG_DIR"
    
    # Copy and update config
    CONFIG_FILE="$CURSOR_CONFIG_DIR/mcp.json"
    
    if [ -f "$CONFIG_FILE" ]; then
        log_warning "Existing config found at $CONFIG_FILE"
        read -p "Do you want to backup and replace it? (y/n): " backup
        if [ "$backup" = "y" ]; then
            cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
            log_success "Backup created"
        else
            log_info "Skipping Cursor setup"
            return
        fi
    fi
    
    # Copy config and update path
    cp .mcp/config.json "$CONFIG_FILE"
    
    # Update repository path
    if [[ "$OS" == "macos" ]]; then
        sed -i '' "s|/home/runner/work/ScaleFlow/ScaleFlow|$REPO_PATH|g" "$CONFIG_FILE"
    else
        sed -i "s|/home/runner/work/ScaleFlow/ScaleFlow|$REPO_PATH|g" "$CONFIG_FILE"
    fi
    
    log_success "Cursor configuration installed"
    log_info "Config location: $CONFIG_FILE"
}

# Show manual instructions
show_manual() {
    echo ""
    log_info "=== Manual Setup Instructions ==="
    echo ""
    echo "1. Copy the config file from: .mcp/config.json"
    echo "2. Place it in your AI assistant's config location:"
    echo "   - Claude Desktop: $CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    echo "   - Cursor: $CURSOR_CONFIG_DIR/mcp.json"
    echo "3. Update all path references from '/home/runner/work/ScaleFlow/ScaleFlow'"
    echo "   to: $REPO_PATH"
    echo ""
    log_info "For detailed instructions, see: docs/MCP_SETUP.md"
}

# Add GitHub token (optional)
add_github_token() {
    echo ""
    read -p "Do you want to add a GitHub Personal Access Token? (y/n): " add_token
    
    if [ "$add_token" != "y" ]; then
        log_info "Skipping GitHub token setup"
        return
    fi
    
    echo ""
    log_info "GitHub Personal Access Token Setup"
    log_warning "Your token will be stored in the config file in plain text"
    echo ""
    echo "To create a token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select scopes: repo, read:org, read:user"
    echo "4. Generate and copy the token"
    echo ""
    read -p "Enter your GitHub token (or press Enter to skip): " github_token
    
    if [ -z "$github_token" ]; then
        log_info "Skipping GitHub token"
        return
    fi
    
    # Update token in config files
    if [ "$ASSISTANT" = "claude" ] || [ "$ASSISTANT" = "both" ]; then
        if [[ "$OS" == "macos" ]]; then
            sed -i '' "s|<your_github_token_here>|$github_token|g" "$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
        else
            sed -i "s|<your_github_token_here>|$github_token|g" "$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
        fi
        log_success "GitHub token added to Claude config"
    fi
    
    if [ "$ASSISTANT" = "cursor" ] || [ "$ASSISTANT" = "both" ]; then
        if [[ "$OS" == "macos" ]]; then
            sed -i '' "s|<your_github_token_here>|$github_token|g" "$CURSOR_CONFIG_DIR/mcp.json"
        else
            sed -i "s|<your_github_token_here>|$github_token|g" "$CURSOR_CONFIG_DIR/mcp.json"
        fi
        log_success "GitHub token added to Cursor config"
    fi
}

# Test MCP installation
test_mcp() {
    echo ""
    read -p "Would you like to test the MCP server installation? (y/n): " test_install
    
    if [ "$test_install" != "y" ]; then
        return
    fi
    
    log_info "Testing MCP server installation..."
    
    # Test filesystem server
    if npx -y @modelcontextprotocol/server-filesystem --help &> /dev/null; then
        log_success "Filesystem server accessible"
    else
        log_warning "Filesystem server test failed (may still work in AI assistant)"
    fi
    
    # Test git server
    if npx -y @modelcontextprotocol/server-git --help &> /dev/null; then
        log_success "Git server accessible"
    else
        log_warning "Git server test failed (may still work in AI assistant)"
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    Setup Complete! ✓                       ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ "$ASSISTANT" = "claude" ] || [ "$ASSISTANT" = "both" ]; then
        log_info "Next steps for Claude Desktop:"
        echo "  1. Restart Claude Desktop completely"
        echo "  2. Open a new chat"
        echo "  3. Look for the 🔌 icon (indicates MCP tools available)"
        echo "  4. Try: 'List files in the src directory'"
        echo ""
    fi
    
    if [ "$ASSISTANT" = "cursor" ] || [ "$ASSISTANT" = "both" ]; then
        log_info "Next steps for Cursor:"
        echo "  1. Restart Cursor"
        echo "  2. Check the MCP panel in the sidebar"
        echo "  3. Verify servers show as 'Active'"
        echo "  4. Try: 'Show me the App.tsx file'"
        echo ""
    fi
    
    log_info "Documentation:"
    echo "  - Full setup guide: docs/MCP_SETUP.md"
    echo "  - Quick reference: .mcp/CLAUDE_DESKTOP_SETUP.md"
    echo "  - MCP README: .mcp/README.md"
    echo ""
    
    log_info "Troubleshooting:"
    echo "  - If tools don't appear, check the AI assistant logs"
    echo "  - Verify config file syntax with: jq . <config_file>"
    echo "  - See docs/MCP_SETUP.md for detailed troubleshooting"
    echo ""
    
    log_success "Happy coding with AI assistance! 🚀"
}

# Main function
main() {
    print_header
    check_prerequisites
    detect_os
    select_assistant
    get_repo_path
    
    echo ""
    
    case $ASSISTANT in
        claude)
            setup_claude
            ;;
        cursor)
            setup_cursor
            ;;
        both)
            setup_claude
            echo ""
            setup_cursor
            ;;
        manual)
            show_manual
            exit 0
            ;;
    esac
    
    if [ "$ASSISTANT" != "manual" ]; then
        add_github_token
        test_mcp
        show_next_steps
    fi
}

# Run main function
main
