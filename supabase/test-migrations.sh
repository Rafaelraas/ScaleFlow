#!/bin/bash

# =====================================================
# ScaleFlow Migration Test Script
# =====================================================
# This script performs basic validation on migration files
# Usage: ./test-migrations.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ScaleFlow Migration Validation Test  ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}✗ Error: Migrations directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Migrations directory found${NC}"

# Count migration files
MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Found ${MIGRATION_COUNT} migration files${NC}"
echo ""

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo -e "${RED}✗ No migration files found${NC}"
    exit 1
fi

# Test each migration file
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

for file in "$MIGRATIONS_DIR"/*.sql; do
    filename=$(basename "$file")
    echo -e "${BLUE}Testing: ${filename}${NC}"
    
    # Test 1: File is readable
    ((TOTAL_TESTS++))
    if [ -r "$file" ]; then
        echo -e "  ${GREEN}✓${NC} File is readable"
        ((PASSED_TESTS++))
    else
        echo -e "  ${RED}✗${NC} File is not readable"
        ((FAILED_TESTS++))
    fi
    
    # Test 2: File is not empty
    ((TOTAL_TESTS++))
    if [ -s "$file" ]; then
        echo -e "  ${GREEN}✓${NC} File is not empty"
        ((PASSED_TESTS++))
    else
        echo -e "  ${RED}✗${NC} File is empty"
        ((FAILED_TESTS++))
    fi
    
    # Test 3: Check for common SQL keywords
    ((TOTAL_TESTS++))
    if grep -q -E "(CREATE|ALTER|INSERT|DROP)" "$file"; then
        echo -e "  ${GREEN}✓${NC} Contains SQL statements"
        ((PASSED_TESTS++))
    else
        echo -e "  ${RED}✗${NC} No SQL statements found"
        ((FAILED_TESTS++))
    fi
    
    # Test 4: Check for balanced parentheses
    ((TOTAL_TESTS++))
    open_parens=$(grep -o "(" "$file" | wc -l)
    close_parens=$(grep -o ")" "$file" | wc -l)
    if [ "$open_parens" -eq "$close_parens" ]; then
        echo -e "  ${GREEN}✓${NC} Parentheses are balanced ($open_parens pairs)"
        ((PASSED_TESTS++))
    else
        echo -e "  ${RED}✗${NC} Unbalanced parentheses (open: $open_parens, close: $close_parens)"
        ((FAILED_TESTS++))
    fi
    
    # Test 5: Check for proper statement terminators
    ((TOTAL_TESTS++))
    if grep -q ";" "$file"; then
        echo -e "  ${GREEN}✓${NC} Contains statement terminators"
        ((PASSED_TESTS++))
    else
        echo -e "  ${YELLOW}⚠${NC} No semicolons found (may be intentional)"
        ((PASSED_TESTS++))
    fi
    
    # Test 6: Count SQL statements
    statement_count=$(grep -c ";" "$file" || echo "0")
    echo -e "  ${GREEN}ℹ${NC} Estimated SQL statements: $statement_count"
    
    # Test 7: Check file size
    file_size=$(wc -c < "$file")
    file_size_kb=$((file_size / 1024))
    if [ "$file_size" -gt 0 ]; then
        echo -e "  ${GREEN}ℹ${NC} File size: ${file_size_kb} KB"
    fi
    
    echo ""
done

# Summary
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "Total Tests:  ${TOTAL_TESTS}"
echo -e "${GREEN}Passed:       ${PASSED_TESTS}${NC}"
if [ "$FAILED_TESTS" -gt 0 ]; then
    echo -e "${RED}Failed:       ${FAILED_TESTS}${NC}"
else
    echo -e "Failed:       ${FAILED_TESTS}"
fi
echo ""

# Overall result
if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Migrations look good.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review migration files manually"
    echo "2. Test in development environment first"
    echo "3. Deploy to production using deploy.sh"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the migration files.${NC}"
    exit 1
fi
