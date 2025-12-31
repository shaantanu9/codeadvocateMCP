#!/bin/bash
# Final organization script - move all files to proper locations

set -e

cd "$(dirname "$0")/.."

echo "📁 Organizing codebase structure..."
echo ""

# Create directories
mkdir -p docs/setup docs/api tests scripts

# Move setup docs from root
echo "Moving setup documentation..."
for file in ALL_MCP_TOOLS.md MCP_TOOLS_LIST.md MCP_CONFIG_GUIDE.md \
            MCP_CONFIGURATION_GUIDE.md TOKEN_VERIFICATION_SETUP.md \
            FINAL_ORGANIZATION.md ORGANIZE_FILES.md FILE_ORGANIZATION.md \
            MOVE_FILES_INSTRUCTIONS.md FIX_ENV.md SERVER_STATUS.md \
            REFACTORING_SUMMARY.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/setup/ && echo "  ✓ $file → docs/setup/"
    fi
done

# Move test files
echo "Moving test files..."
for file in test-mcp.js test-list-tools.js test-mcp-with-auth.js list-tools.js; do
    if [ -f "$file" ]; then
        mv "$file" tests/ && echo "  ✓ $file → tests/"
    fi
done

# Move scripts
echo "Moving scripts..."
[ -f create-env.sh ] && mv create-env.sh scripts/ && echo "  ✓ create-env.sh → scripts/"

# Move from docs/sh-files/
if [ -d docs/sh-files ]; then
    echo "Moving scripts from docs/sh-files/..."
    for file in docs/sh-files/*.sh; do
        if [ -f "$file" ]; then
            mv "$file" scripts/ && echo "  ✓ $(basename $file) → scripts/"
        fi
    done
    rmdir docs/sh-files && echo "  ✓ Removed docs/sh-files/"
fi

# Move from docs/docs/
if [ -d docs/docs ]; then
    echo "Moving docs from docs/docs/..."
    for file in docs/docs/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            # Skip ARCHITECTURE.md if duplicate
            if [ "$filename" = "ARCHITECTURE.md" ] && [ -f "ARCHITECTURE.md" ]; then
                rm "$file" && echo "  ✓ Removed duplicate $filename"
            else
                mv "$file" docs/setup/ && echo "  ✓ $filename → docs/setup/"
            fi
        fi
    done
    rmdir docs/docs && echo "  ✓ Removed docs/docs/"
fi

# Move API docs
echo "Moving API documentation..."
[ -f docs/MASTER_API_ENDPOINTS_GUIDE.md ] && \
    mv docs/MASTER_API_ENDPOINTS_GUIDE.md docs/api/ && \
    echo "  ✓ MASTER_API_ENDPOINTS_GUIDE.md → docs/api/"

echo ""
echo "✅ Organization complete!"
echo ""
echo "📊 Summary:"
echo "  Root .md files: $(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ') (should be 2: README, ARCHITECTURE)"
echo "  Root .js files: $(ls -1 *.js 2>/dev/null | wc -l | tr -d ' ') (should be 0)"
echo "  docs/setup/: $(ls -1 docs/setup/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  docs/api/: $(ls -1 docs/api/*.md 2>/dev/null | wc -l | tr -d ' ') files"
echo "  tests/: $(ls -1 tests/*.js 2>/dev/null | wc -l | tr -d ' ') files"
echo "  scripts/: $(ls -1 scripts/*.{sh,js,mjs} 2>/dev/null | wc -l | tr -d ' ') files"




