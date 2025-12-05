#!/bin/bash

# =====================================================
# ScaleFlow Database Deployment Script
# =====================================================
# This script deploys database migrations to Supabase
# Usage: ./deploy.sh [production|local]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}ScaleFlow Database Deployment${NC}"
echo "================================"

# Check environment argument
ENV=${1:-production}
echo -e "Environment: ${YELLOW}${ENV}${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Project root: $PROJECT_ROOT"
echo "Migrations directory: $SCRIPT_DIR/migrations"

# Check if migrations directory exists
if [ ! -d "$SCRIPT_DIR/migrations" ]; then
    echo -e "${RED}Error: Migrations directory not found${NC}"
    exit 1
fi

# Count migration files
MIGRATION_COUNT=$(ls -1 "$SCRIPT_DIR/migrations"/*.sql 2>/dev/null | wc -l)
echo -e "Found ${GREEN}${MIGRATION_COUNT}${NC} migration files"

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo -e "${RED}Error: No migration files found${NC}"
    exit 1
fi

# Confirm before deploying to production
if [ "$ENV" = "production" ]; then
    echo ""
    echo -e "${YELLOW}WARNING: You are about to deploy to PRODUCTION${NC}"
    echo "This will modify the database at: ttgntuaffrondfxybxmi.supabase.co"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

echo ""
echo "Starting deployment..."
echo ""

# Link to project (if not already linked)
if [ "$ENV" = "production" ]; then
    echo "Linking to Supabase project..."
    supabase link --project-ref ttgntuaffrondfxybxmi || true
fi

# Deploy migrations
echo -e "${GREEN}Deploying migrations...${NC}"

if [ "$ENV" = "local" ]; then
    # For local development
    echo "Starting local Supabase..."
    supabase start
    
    echo "Running migrations locally..."
    supabase db push
else
    # For production
    echo "Running migrations on production..."
    supabase db push
fi

# Verify deployment
echo ""
echo -e "${GREEN}Verifying deployment...${NC}"

# Check if we can query the database
if supabase db query "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
    
    # List all tables
    echo ""
    echo "Tables in database:"
    supabase db query "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
    
    # Check RLS status
    echo ""
    echo "RLS Status:"
    supabase db query "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
else
    echo -e "${RED}✗ Could not verify database connection${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}================================${NC}"

if [ "$ENV" = "production" ]; then
    echo ""
    echo "Next steps:"
    echo "1. Verify the deployment in the Supabase Dashboard"
    echo "2. Test the application to ensure everything works"
    echo "3. Monitor for any errors in the logs"
fi
