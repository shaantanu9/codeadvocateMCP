#!/bin/bash
# Complete codebase organization

set -e

cd "$(dirname "$0")/.."

echo "📁 Complete Codebase Organization"
echo "=================================="
echo ""

# Create all necessary directories
mkdir -p docs/setup docs/api tests scripts

# Step 1: Move all MD files from docs/ root to docs/setup/
echo "1. Organizing docs/ directory..."
if [ -d docs ]; then
    # Move setup docs from docs/ root
    for file in docs/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            if [ "$filename" != "ARCHITECTURE.md" ] && [ "$filename" != "CODEBASE_STRUCTURE.md" ]; then
                if [ "$filename" = "MASTER_API_ENDPOINTS_GUIDE.md" ]; then
                    mv "$file" docs/api/ && echo "  ✓ $filename → docs/api/"
                else
                    mv "$file" docs/setup/ && echo "  ✓ $filename → docs/setup/"
                fi
            fi
        fi
    done
    
    # Move from docs/docs/ to docs/setup/
    if [ -d docs/docs ]; then
        for file in docs/docs/*.md; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                if [ "$filename" != "ARCHITECTURE.md" ]; then
                    mv "$file" docs/setup/ && echo "  ✓ $filename → docs/setup/"
                else
                    rm "$file" && echo "  ✓ Removed duplicate $filename"
                fi
            fi
        done
        rmdir docs/docs 2>/dev/null && echo "  ✓ Removed docs/docs/"
    fi
    
    # Move scripts from docs/sh-files/
    if [ -d docs/sh-files ]; then
        for file in docs/sh-files/*.sh; do
            if [ -f "$file" ]; then
                mv "$file" scripts/ && echo "  ✓ $(basename $file) → scripts/"
            fi
        done
        rmdir docs/sh-files && echo "  ✓ Removed docs/sh-files/"
    fi
fi

# Step 2: Move test files from root
echo ""
echo "2. Moving test files..."
for file in test-*.js list-tools.js; do
    if [ -f "$file" ]; then
        mv "$file" tests/ && echo "  ✓ $file → tests/"
    fi
done

# Step 3: Move scripts from root
echo ""
echo "3. Moving scripts..."
[ -f create-env.sh ] && mv create-env.sh scripts/ && echo "  ✓ create-env.sh → scripts/"

# Step 4: Move CODEBASE_STRUCTURE.md to docs/
echo ""
echo "4. Organizing structure docs..."
[ -f docs/CODEBASE_STRUCTURE.md ] && mv docs/CODEBASE_STRUCTURE.md docs/ && echo "  ✓ CODEBASE_STRUCTURE.md → docs/"

echo ""
echo "✅ Organization complete!"
echo ""
echo "📊 Final Structure:"
echo "  Root .md files: $(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ') (should be 2: README, ARCHITECTURE)"
echo "  Root .js files: $(ls -1 *.js 2>/dev/null | wc -l | tr -d ' ') (should be 0)"
echo "  Root .sh files: $(ls -1 *.sh 2>/dev/null | wc -l | tr -d ' ') (should be 0)"
echo "  docs/setup/: $(ls -1 docs/setup/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  docs/api/: $(ls -1 docs/api/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  tests/: $(ls -1 tests/*.js 2>/dev/null | wc -l | tr -d ' ') files"
echo "  scripts/: $(ls -1 scripts/*.{sh,js,mjs} 2>/dev/null | wc -l | tr -d ' ') files"




