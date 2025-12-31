#!/bin/bash

# Script to organize .md and .sh files into proper folders

cd "$(dirname "$0")/.."

# Create directories
mkdir -p docs/setup docs/api scripts

# Move setup documentation files
echo "Moving setup documentation files..."
for file in AI_INTEGRATION_PLAN.md AI_TOOLS_SETUP.md API_KEY_SETUP_GUIDE.md \
            COMPLETE_API_KEY_SETUP.md COMPLETE_SETUP.md FIX_ENV.md \
            IMPLEMENTATION_SUMMARY.md MCP_AUTHENTICATION_SETUP.md QUICK_START.md \
            SECURE_MCP_SETUP.md SERVER_STATUS.md TOKEN_TESTING_GUIDE.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/setup/ && echo "  ✓ Moved $file"
    fi
done

# Move API documentation
echo "Moving API documentation..."
if [ -f "docs/MASTER_API_ENDPOINTS_GUIDE.md" ]; then
    mv docs/MASTER_API_ENDPOINTS_GUIDE.md docs/api/ && echo "  ✓ Moved MASTER_API_ENDPOINTS_GUIDE.md"
fi

# Move shell scripts
echo "Moving shell scripts..."
for file in create-env.sh generate-token.sh start-server.sh verify-server.sh \
            test-simple.sh test-server.sh; do
    if [ -f "$file" ]; then
        mv "$file" scripts/ && echo "  ✓ Moved $file"
    fi
done

# Move JS test scripts
echo "Moving test scripts..."
if [ -f "test-mcp.js" ]; then
    mv test-mcp.js scripts/ && echo "  ✓ Moved test-mcp.js"
fi

echo ""
echo "✅ File organization complete!"
echo ""
echo "Root directory should only contain:"
echo "  - README.md"
echo "  - ARCHITECTURE.md"
echo "  - REORGANIZATION_SUMMARY.md"
echo ""
echo "All other .md files → docs/setup/ or docs/api/"
echo "All .sh and test-*.js files → scripts/"




