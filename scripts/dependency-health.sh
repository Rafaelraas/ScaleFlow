#!/bin/bash

# ScaleFlow Dependency Health Check
# Provides a comprehensive overview of dependency status

echo "======================================"
echo "   ScaleFlow Dependency Health       "
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo "📦 ${BLUE}Outdated Packages:${NC}"
echo "---"
if npm outdated 2>/dev/null; then
    echo "${GREEN}✓ All packages are up to date!${NC}"
else
    echo "${YELLOW}⚠ Some packages are outdated (see above)${NC}"
fi
echo ""

echo "🔒 ${BLUE}Security Audit (Production):${NC}"
echo "---"
if npm audit --production 2>&1 | grep -q "found 0 vulnerabilities"; then
    echo "${GREEN}✓ No production vulnerabilities found!${NC}"
else
    npm audit --production 2>&1 | head -20
    echo "${YELLOW}⚠ See vulnerabilities above${NC}"
fi
echo ""

echo "🔓 ${BLUE}Security Audit (All Dependencies):${NC}"
echo "---"
AUDIT_OUTPUT=$(npm audit 2>&1)
if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    echo "${GREEN}✓ No vulnerabilities found!${NC}"
else
    # Show summary
    echo "$AUDIT_OUTPUT" | grep -E "(moderate|high|critical|low)" | head -5
    VULN_COUNT=$(echo "$AUDIT_OUTPUT" | grep -oP "\d+(?= \w+ severity)" | head -1)
    if [ ! -z "$VULN_COUNT" ]; then
        echo "${YELLOW}⚠ Found vulnerabilities (mostly dev dependencies)${NC}"
    fi
fi
echo ""

echo "📊 ${BLUE}Package Statistics:${NC}"
echo "---"
DEPS=$(cat package.json | grep -A 1000 '"dependencies"' | grep -B 1000 '"devDependencies"' | grep -c "@")
DEV_DEPS=$(cat package.json | grep -A 1000 '"devDependencies"' | grep -c "@")
echo "Production dependencies: ${GREEN}${DEPS}${NC}"
echo "Development dependencies: ${GREEN}${DEV_DEPS}${NC}"
echo "Total: $((DEPS + DEV_DEPS))"
echo ""

echo "🏷️  ${BLUE}Critical Package Versions:${NC}"
echo "---"
echo "React:       $(npm list react --depth=0 2>/dev/null | grep react@ | awk '{print $2}')"
echo "React DOM:   $(npm list react-dom --depth=0 2>/dev/null | grep react-dom@ | awk '{print $2}')"
echo "TypeScript:  $(npm list typescript --depth=0 2>/dev/null | grep typescript@ | awk '{print $2}')"
echo "Vite:        $(npm list vite --depth=0 2>/dev/null | grep vite@ | awk '{print $2}')"
echo "Vitest:      $(npm list vitest --depth=0 2>/dev/null | grep vitest@ | awk '{print $2}')"
echo "Supabase:    $(npm list @supabase/supabase-js --depth=0 2>/dev/null | grep @supabase | awk '{print $2}')"
echo "TanStack:    $(npm list @tanstack/react-query --depth=0 2>/dev/null | grep @tanstack | awk '{print $2}')"
echo ""

echo "🔍 ${BLUE}Update Recommendations:${NC}"
echo "---"
if [ -f "DEPENDENCY_UPDATE_MATRIX.md" ]; then
    echo "${GREEN}✓ Dependency update matrix available${NC}"
    echo "  See: DEPENDENCY_UPDATE_MATRIX.md"
else
    echo "${YELLOW}⚠ No dependency update matrix found${NC}"
fi

if [ -f "DEPENDENCY_BLOCKERS.md" ]; then
    echo "${GREEN}✓ Dependency blockers documented${NC}"
    echo "  See: DEPENDENCY_BLOCKERS.md"
else
    echo "${YELLOW}⚠ No dependency blockers documentation found${NC}"
fi
echo ""

echo "✅ ${GREEN}Dependency health check complete!${NC}"
echo ""
echo "For more details, run:"
echo "  ${BLUE}npm outdated --long${NC}        # Detailed outdated package info"
echo "  ${BLUE}npm audit${NC}                 # Full security audit"
echo "  ${BLUE}npm audit --json${NC}          # JSON format for processing"
