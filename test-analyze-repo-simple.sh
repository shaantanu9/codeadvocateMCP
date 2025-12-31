#!/bin/bash

# Simple test script - just test basic functionality
# Usage: ./test-analyze-repo-simple.sh

set -e

MCP_SERVER_URL="${MCP_SERVER_URL:-http://localhost:3111/mcp}"

echo "Testing analyzeAndSaveRepository tool..."
echo ""

# Simple test - basic analysis
curl -X POST "$MCP_SERVER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "analyzeAndSaveRepository",
      "arguments": {
        "projectPath": ".",
        "deepAnalysis": true,
        "useCache": false,
        "forceRefresh": true
      }
    }
  }' | jq '.'

echo ""
echo "Test completed!"



