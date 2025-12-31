#!/bin/bash
# Complete file organization script
# Run this from the project root: bash scripts/organize-all.sh

set -e

cd "$(dirname "$0")/.."

echo "📁 Organizing all files..."
echo ""

# Create directories
mkdir -p docs/setup docs/api scripts

# Files to keep in root
KEEP_IN_ROOT=("README.md" "ARCHITECTURE.md" "REORGANIZATION_SUMMARY.md")

# Move from docs/docs/ to docs/setup/
if [ -d "docs/docs" ]; then
    echo "Moving files from docs/docs/..."
    for file in docs/docs/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            # Check if should keep in root
            keep=false
            for keep_file in "${KEEP_IN_ROOT[@]}"; do
                if [ "$filename" = "$keep_file" ]; then
                    mv "$file" . && echo "  ✓ Moved $filename to root"
                    keep=true
                    break
                fi
            done
            if [ "$keep" = false ]; then
                mv "$file" docs/setup/ && echo "  ✓ Moved $filename to docs/setup/"
            fi
        fi
    done
    rmdir docs/docs 2>/dev/null && echo "  ✓ Removed empty docs/docs directory" || true
fi

# Move from docs/sh-files/ to scripts/
if [ -d "docs/sh-files" ]; then
    echo "Moving files from docs/sh-files/..."
    for file in docs/sh-files/*; do
        if [ -f "$file" ]; then
            mv "$file" scripts/ && echo "  ✓ Moved $(basename $file) to scripts/"
        fi
    done
    rmdir docs/sh-files 2>/dev/null && echo "  ✓ Removed empty docs/sh-files directory" || true
fi

# Move remaining files from root
echo "Moving remaining files from root..."

# Setup docs
[ -f "SERVER_STATUS.md" ] && mv SERVER_STATUS.md docs/setup/ && echo "  ✓ Moved SERVER_STATUS.md"

# API docs
[ -f "docs/MASTER_API_ENDPOINTS_GUIDE.md" ] && mv docs/MASTER_API_ENDPOINTS_GUIDE.md docs/api/ && echo "  ✓ Moved MASTER_API_ENDPOINTS_GUIDE.md"

# Scripts
[ -f "test-mcp.js" ] && mv test-mcp.js scripts/ && echo "  ✓ Moved test-mcp.js"

# Check for any remaining .sh files in root
for file in *.sh; do
    if [ -f "$file" ] && [ "$file" != "organize-all.sh" ]; then
        mv "$file" scripts/ && echo "  ✓ Moved $file to scripts/"
    fi
done

echo ""
echo "✅ File organization complete!"
echo ""
echo "📊 Summary:"
echo "  Root .md files: $(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ') (should be 3)"
echo "  Root .sh files: $(ls -1 *.sh 2>/dev/null | wc -l | tr -d ' ') (should be 0)"
echo "  docs/setup/ files: $(ls -1 docs/setup/*.md 2>/dev/null | wc -l | tr -d ' ') (should be 12+)"
echo "  docs/api/ files: $(ls -1 docs/api/*.md 2>/dev/null | wc -l | tr -d ' ') (should be 1)"
echo "  scripts/ files: $(ls -1 scripts/*.{sh,js} 2>/dev/null | wc -l | tr -d ' ') (should be 7+)"




