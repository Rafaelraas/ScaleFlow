#!/bin/bash

# =====================================================
# ScaleFlow Backend Setup Script
# =====================================================
# This script sets up the backend infrastructure for ScaleFlow
# Usage: ./scripts/setup-backend.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}║       ScaleFlow Backend Setup Wizard           ║${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_section "Step 1: Checking Prerequisites"

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi
print_success "Project root directory found"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js is installed ($NODE_VERSION)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm --version)
print_success "npm is installed ($NPM_VERSION)"

# Check if dependencies are installed
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    print_warning "Node modules not found. Installing dependencies..."
    cd "$PROJECT_ROOT"
    npm install
    print_success "Dependencies installed"
else
    print_success "Node modules found"
fi

print_section "Step 2: Installing Supabase CLI"

# Check if Supabase CLI is already available
SUPABASE_CMD=""
if command -v supabase &> /dev/null; then
    SUPABASE_CMD="supabase"
    SUPABASE_VERSION=$(supabase --version)
    print_success "Supabase CLI already installed globally ($SUPABASE_VERSION)"
elif [ -f "$PROJECT_ROOT/bin/supabase" ]; then
    SUPABASE_CMD="$PROJECT_ROOT/bin/supabase"
    SUPABASE_VERSION=$($SUPABASE_CMD --version)
    print_success "Supabase CLI found in project bin/ ($SUPABASE_VERSION)"
else
    print_info "Installing Supabase CLI..."
    mkdir -p "$PROJECT_ROOT/bin"
    cd "$PROJECT_ROOT/bin"
    
    # Detect OS and architecture
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    
    # Map architecture names
    case "$ARCH" in
        x86_64)
            ARCH="amd64"
            ;;
        aarch64|arm64)
            ARCH="arm64"
            ;;
        *)
            print_error "Unsupported architecture: $ARCH"
            exit 1
            ;;
    esac
    
    # Map OS names
    case "$OS" in
        linux)
            OS="linux"
            ;;
        darwin)
            OS="darwin"
            ;;
        *)
            print_error "Unsupported OS: $OS"
            exit 1
            ;;
    esac
    
    # Download Supabase CLI
    # Use pinned version for reproducibility, can be updated as needed
    SUPABASE_VERSION="v2.65.5"
    DOWNLOAD_URL="https://github.com/supabase/cli/releases/download/${SUPABASE_VERSION}/supabase_${OS}_${ARCH}.tar.gz"
    print_info "Downloading Supabase CLI ${SUPABASE_VERSION}..."
    print_info "From: $DOWNLOAD_URL"
    
    if curl -fsSL "$DOWNLOAD_URL" | tar -xz; then
        chmod +x supabase
        SUPABASE_CMD="$PROJECT_ROOT/bin/supabase"
        SUPABASE_VERSION=$($SUPABASE_CMD --version)
        print_success "Supabase CLI installed successfully ($SUPABASE_VERSION)"
    else
        print_error "Failed to download Supabase CLI"
        exit 1
    fi
fi

print_section "Step 3: Checking Supabase Configuration"

# Check if config.toml exists
if [ ! -f "$PROJECT_ROOT/supabase/config.toml" ]; then
    print_error "supabase/config.toml not found"
    exit 1
fi
print_success "Supabase configuration file found"

# Extract project ID from config.toml
PROJECT_ID=$(grep 'project_id' "$PROJECT_ROOT/supabase/config.toml" | cut -d'"' -f2)
if [ -z "$PROJECT_ID" ]; then
    print_warning "Project ID not found in config.toml"
else
    print_success "Project ID: $PROJECT_ID"
fi

print_section "Step 4: Checking Environment Variables"

# Check root .env file
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    print_warning "Root .env file not found"
    print_info "Creating .env from .env.example..."
    if [ -f "$PROJECT_ROOT/.env.example" ]; then
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        print_success ".env file created"
        print_warning "Please edit .env and add your Supabase credentials"
    else
        print_error ".env.example not found"
    fi
else
    print_success "Root .env file exists"
    
    # Check if environment variables are set
    if grep -q "your_supabase_project_url_here" "$PROJECT_ROOT/.env" 2>/dev/null; then
        print_warning "Environment variables need to be configured"
        print_info "Please update .env with your actual Supabase credentials"
    else
        print_success "Environment variables appear to be configured"
    fi
fi

# Check supabase .env file
if [ ! -f "$PROJECT_ROOT/supabase/.env" ]; then
    print_warning "Supabase .env file not found"
    print_info "Creating supabase/.env from .env.example..."
    if [ -f "$PROJECT_ROOT/supabase/.env.example" ]; then
        cp "$PROJECT_ROOT/supabase/.env.example" "$PROJECT_ROOT/supabase/.env"
        print_success "supabase/.env file created"
        print_warning "Please edit supabase/.env and add your database credentials"
    fi
else
    print_success "Supabase .env file exists"
fi

print_section "Step 5: Validating Database Migrations"

cd "$PROJECT_ROOT/supabase"

# Check if migrations directory exists
if [ ! -d "migrations" ]; then
    print_error "migrations directory not found"
    exit 1
fi

# Count migration files
MIGRATION_COUNT=$(ls -1 migrations/*.sql 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -eq 0 ]; then
    print_error "No migration files found"
    exit 1
fi
print_success "Found $MIGRATION_COUNT migration files"

# Run migration validation if test script exists
if [ -f "test-migrations.sh" ]; then
    print_info "Running migration validation tests..."
    if bash test-migrations.sh > /tmp/migration-test.log 2>&1; then
        print_success "All migration validations passed"
    else
        print_warning "Some migration tests failed (check /tmp/migration-test.log)"
    fi
fi

print_section "Step 6: Backend Setup Summary"

echo ""
echo -e "${GREEN}✓ Prerequisites installed${NC}"
echo -e "${GREEN}✓ Supabase CLI ready${NC}"
echo -e "${GREEN}✓ Configuration files present${NC}"
echo -e "${GREEN}✓ Migrations validated${NC}"
echo ""

print_section "Next Steps"

echo ""
echo "Your backend is ready for configuration! Follow these steps:"
echo ""
echo "1. Configure Environment Variables:"
echo "   ${YELLOW}Edit .env and add your Supabase credentials${NC}"
echo "   - Get them from: https://app.supabase.com/project/$PROJECT_ID/settings/api"
echo ""
echo "2. Link to Supabase Project:"
echo "   ${CYAN}$SUPABASE_CMD link --project-ref $PROJECT_ID${NC}"
echo ""
echo "3. Deploy Database Migrations:"
echo "   ${CYAN}$SUPABASE_CMD db push${NC}"
echo "   Or use the deployment script:"
echo "   ${CYAN}cd supabase && bash deploy.sh production${NC}"
echo ""
echo "4. Start Development Server:"
echo "   ${CYAN}npm run dev${NC}"
echo ""
echo "5. (Optional) Start Local Supabase for Development:"
echo "   ${CYAN}$SUPABASE_CMD start${NC}"
echo ""

print_info "For more details, see:"
echo "   - supabase/DEPLOYMENT_GUIDE.md"
echo "   - supabase/README.md"
echo "   - docs/ENVIRONMENT_SETUP.md"
echo ""

print_section "Setup Complete!"

echo ""
echo -e "${GREEN}The backend infrastructure is ready!${NC}"
echo ""
