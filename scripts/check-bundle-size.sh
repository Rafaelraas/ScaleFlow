#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Get main bundle size in KB
MAIN_SIZE=$(ls -l dist/assets/index-*.js | awk '{print $5/1024}')
MAX_SIZE=350

echo ""
echo "======================================"
echo "Bundle Size Check Results"
echo "======================================"
echo "Main bundle size: ${MAIN_SIZE} KB"
echo "Maximum allowed: ${MAX_SIZE} KB"
echo "======================================"

# Use bc for floating point comparison
if command -v bc &> /dev/null; then
  if (( $(echo "$MAIN_SIZE > $MAX_SIZE" | bc -l) )); then
    echo "❌ Bundle size exceeded! Main bundle is ${MAIN_SIZE} KB (max: ${MAX_SIZE} KB)"
    exit 1
  else
    echo "✅ Bundle size check passed!"
  fi
else
  # Fallback to integer comparison if bc is not available
  MAIN_SIZE_INT=${MAIN_SIZE%.*}
  if [ "$MAIN_SIZE_INT" -gt "$MAX_SIZE" ]; then
    echo "❌ Bundle size exceeded! Main bundle is ~${MAIN_SIZE_INT} KB (max: ${MAX_SIZE} KB)"
    exit 1
  else
    echo "✅ Bundle size check passed!"
  fi
fi
