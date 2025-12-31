#!/bin/bash

# Verify Mermaid Tool Registration
# Checks if createRepositoryMermaid tool is properly registered

set -e

echo "🔍 Verifying Mermaid Tool Registration"
echo "======================================"
echo ""

# Check 1: Tool exists in registry
echo "1. Checking tool registration in tool-registry.ts..."
if grep -q "createRepositoryMermaidTool" src/tools/tool-registry.ts; then
  echo "   ✅ Tool found in registry"
else
  echo "   ❌ Tool NOT found in registry"
  exit 1
fi

# Check 2: Tool file exists
echo "2. Checking tool file exists..."
if [ -f "src/tools/repositories/mermaid/create-repository-mermaid.tool.ts" ]; then
  echo "   ✅ Tool file exists"
else
  echo "   ❌ Tool file NOT found"
  exit 1
fi

# Check 3: Tool name
echo "3. Checking tool name..."
TOOL_NAME=$(grep 'name = "createRepositoryMermaid"' src/tools/repositories/mermaid/create-repository-mermaid.tool.ts | head -1)
if [ -n "$TOOL_NAME" ]; then
  echo "   ✅ Tool name: createRepositoryMermaid"
else
  echo "   ❌ Tool name not found"
  exit 1
fi

# Check 4: Tool description
echo "4. Checking tool description..."
DESC=$(grep 'description = ' src/tools/repositories/mermaid/create-repository-mermaid.tool.ts | head -1)
if [ -n "$DESC" ]; then
  echo "   ✅ Tool description found"
  echo "   Description: ${DESC:0:100}..."
else
  echo "   ❌ Tool description not found"
  exit 1
fi

# Check 5: Tool export
echo "5. Checking tool export..."
if grep -q "createRepositoryMermaidTool" src/tools/repositories/mermaid/index.ts; then
  echo "   ✅ Tool exported in index.ts"
else
  echo "   ❌ Tool NOT exported in index.ts"
  exit 1
fi

# Check 6: Repository tools index
echo "6. Checking repository tools index..."
if grep -q "RepositoryMermaidTools" src/tools/repositories/index.ts; then
  echo "   ✅ RepositoryMermaidTools exported"
else
  echo "   ❌ RepositoryMermaidTools NOT exported"
  exit 1
fi

echo ""
echo "✅ All checks passed! Tool is properly registered."
echo ""
echo "📝 Tool Details:"
echo "   Name: createRepositoryMermaid"
echo "   File: src/tools/repositories/mermaid/create-repository-mermaid.tool.ts"
echo "   Registry: src/tools/tool-registry.ts (line 134)"
echo ""
echo "💡 To test the tool, restart your MCP server and try:"
echo '   "Create a Mermaid diagram for repository {id} with title \"Test\" and content \"flowchart TD\n    A[Start] --> B[End]\"'
