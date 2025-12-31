#!/bin/bash
# Final script to properly organize all files

set -e

cd "$(dirname "$0")/.."

echo "🔧 Fixing file organization..."
echo ""

# Create proper directories
mkdir -p docs/setup docs/api scripts

# Move files from docs/docs/ to docs/setup/ (fixing the wrong location)
if [ -d "docs/docs" ]; then
    echo "Moving files from docs/docs/ to docs/setup/..."
    for file in docs/docs/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            # Keep ARCHITECTURE and REORGANIZATION in root
            if [ "$filename" = "ARCHITECTURE.md" ] || [ "$filename" = "REORGANIZATION_SUMMARY.md" ]; then
                mv "$file" . && echo "  ✓ Moved $filename to root"
            else
                mv "$file" docs/setup/ && echo "  ✓ Moved $filename to docs/setup/"
            fi
        fi
    done
    rmdir docs/docs 2>/dev/null || true
fi

# Move files from docs/sh-files/ to scripts/
if [ -d "docs/sh-files" ]; then
    echo "Moving files from docs/sh-files/ to scripts/..."
    for file in docs/sh-files/*; do
        if [ -f "$file" ]; then
            mv "$file" scripts/ && echo "  ✓ Moved $(basename $file) to scripts/"
        fi
    done
    rmdir docs/sh-files 2>/dev/null || true
fi

# Move remaining setup docs from root
echo "Moving remaining setup docs..."
for file in SERVER_STATUS.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/setup/ && echo "  ✓ Moved $file to docs/setup/"
    fi
done

# Move API docs
echo "Moving API docs..."
if [ -f "docs/MASTER_API_ENDPOINTS_GUIDE.md" ]; then
    mv docs/MASTER_API_ENDPOINTS_GUIDE.md docs/api/ && echo "  ✓ Moved MASTER_API_ENDPOINTS_GUIDE.md to docs/api/"
fi

# Move remaining scripts from root
echo "Moving remaining scripts..."
for file in test-mcp.js; do
    if [ -f "$file" ]; then
        mv "$file" scripts/ && echo "  ✓ Moved $file to scripts/"
    fi
done

echo ""
echo "✅ File organization complete!"
echo ""
echo "Verification:"
echo "  Root .md files: $(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ') (should be 3)"
echo "  Root .sh files: $(ls -1 *.sh 2>/dev/null | wc -l | tr -d ' ') (should be 0)"
echo "  docs/setup/ files: $(ls -1 docs/setup/*.md 2>/dev/null | wc -l | tr -d ' ') (should be 12+)"
echo "  scripts/ files: $(ls -1 scripts/*.{sh,js} 2>/dev/null | wc -l | tr -d ' ') (should be 7+)"




