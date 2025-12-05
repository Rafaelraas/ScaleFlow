#!/bin/bash

# =====================================================
# ScaleFlow Backend Commands Reference
# =====================================================
# Quick reference for common backend operations
# Usage: bash scripts/backend-commands.sh [command]

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Find Supabase CLI
SUPABASE_CMD=""
if command -v supabase &> /dev/null; then
    SUPABASE_CMD="supabase"
elif [ -f "$PROJECT_ROOT/bin/supabase" ]; then
    SUPABASE_CMD="$PROJECT_ROOT/bin/supabase"
else
    echo -e "${YELLOW}⚠ Supabase CLI not found. Run: bash scripts/setup-backend.sh${NC}"
    exit 1
fi

# Show help if no command provided
if [ -z "$1" ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     ScaleFlow Backend Commands Reference      ║${NC}"
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo ""
    echo "Usage: bash scripts/backend-commands.sh [command]"
    echo ""
    echo -e "${BLUE}Available Commands:${NC}"
    echo ""
    echo "  ${GREEN}link${NC}          - Link to Supabase project"
    echo "  ${GREEN}status${NC}        - Show Supabase status"
    echo "  ${GREEN}migrations${NC}    - List all migrations"
    echo "  ${GREEN}deploy${NC}        - Deploy migrations to production"
    echo "  ${GREEN}deploy-local${NC}  - Deploy migrations locally"
    echo "  ${GREEN}start${NC}         - Start local Supabase (Docker required)"
    echo "  ${GREEN}stop${NC}          - Stop local Supabase"
    echo "  ${GREEN}db-reset${NC}      - Reset local database"
    echo "  ${GREEN}db-dump${NC}       - Dump production database"
    echo "  ${GREEN}generate-types${NC} - Generate TypeScript types from database"
    echo "  ${GREEN}logs${NC}          - View Supabase logs"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  bash scripts/backend-commands.sh link"
    echo "  bash scripts/backend-commands.sh deploy"
    echo "  bash scripts/backend-commands.sh start"
    echo ""
    exit 0
fi

case "$1" in
    link)
        echo -e "${BLUE}Linking to Supabase project...${NC}"
        cd "$PROJECT_ROOT"
        PROJECT_ID=$(grep 'project_id' supabase/config.toml | cut -d'"' -f2)
        $SUPABASE_CMD link --project-ref "$PROJECT_ID"
        ;;
    
    status)
        echo -e "${BLUE}Checking Supabase status...${NC}"
        cd "$PROJECT_ROOT"
        $SUPABASE_CMD status
        ;;
    
    migrations)
        echo -e "${BLUE}Listing all migrations:${NC}"
        echo ""
        cd "$PROJECT_ROOT/supabase/migrations"
        ls -lh *.sql
        echo ""
        echo -e "${BLUE}To test migrations:${NC}"
        echo "  cd supabase && bash test-migrations.sh"
        ;;
    
    deploy)
        echo -e "${BLUE}Deploying to production...${NC}"
        cd "$PROJECT_ROOT/supabase"
        bash deploy.sh production
        ;;
    
    deploy-local)
        echo -e "${BLUE}Deploying to local Supabase...${NC}"
        cd "$PROJECT_ROOT/supabase"
        bash deploy.sh local
        ;;
    
    start)
        echo -e "${BLUE}Starting local Supabase...${NC}"
        echo -e "${YELLOW}Note: Requires Docker to be running${NC}"
        cd "$PROJECT_ROOT"
        $SUPABASE_CMD start
        ;;
    
    stop)
        echo -e "${BLUE}Stopping local Supabase...${NC}"
        cd "$PROJECT_ROOT"
        $SUPABASE_CMD stop
        ;;
    
    db-reset)
        echo -e "${YELLOW}⚠ WARNING: This will reset your local database!${NC}"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            cd "$PROJECT_ROOT"
            $SUPABASE_CMD db reset
        else
            echo "Cancelled."
        fi
        ;;
    
    db-dump)
        echo -e "${BLUE}Dumping production database schema...${NC}"
        cd "$PROJECT_ROOT"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        DUMP_FILE="database_dump_${TIMESTAMP}.sql"
        $SUPABASE_CMD db dump > "$DUMP_FILE"
        echo -e "${GREEN}✓ Database dumped to: $DUMP_FILE${NC}"
        ;;
    
    generate-types)
        echo -e "${BLUE}Generating TypeScript types from database...${NC}"
        cd "$PROJECT_ROOT"
        mkdir -p src/types
        $SUPABASE_CMD gen types typescript --local > src/types/supabase.ts
        echo -e "${GREEN}✓ Types generated at: src/types/supabase.ts${NC}"
        ;;
    
    logs)
        echo -e "${BLUE}Viewing Supabase logs...${NC}"
        cd "$PROJECT_ROOT"
        $SUPABASE_CMD logs
        ;;
    
    *)
        echo -e "${YELLOW}Unknown command: $1${NC}"
        echo "Run without arguments to see available commands."
        exit 1
        ;;
esac
