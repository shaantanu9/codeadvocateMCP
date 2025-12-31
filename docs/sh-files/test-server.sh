#!/bin/bash

echo "Testing MCP Server..."
echo ""

# Test 1: Initialize
echo "Test 1: Initialize request"
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }' 2>&1 | head -20

echo ""
echo "---"
echo ""

# Test 2: List tools
echo "Test 2: List tools"
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' 2>&1 | head -20

echo ""
echo "---"
echo ""

# Test 3: Call listAIModels tool
echo "Test 3: Call listAIModels tool"
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "listAIModels",
      "arguments": {}
    }
  }' 2>&1 | head -30

echo ""
echo "---"
echo ""

# Test 4: Call getAIModelInfo tool
echo "Test 4: Call getAIModelInfo tool"
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "getAIModelInfo",
      "arguments": {
        "modelName": "shantanuDemo-3432"
      }
    }
  }' 2>&1 | head -40

echo ""
echo "All tests completed!"

