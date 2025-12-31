#!/bin/bash

echo "🧪 Testing MCP Server"
echo "===================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
curl -s http://localhost:3111/health | jq '.' 2>/dev/null || curl -s http://localhost:3111/health
echo ""
echo ""

# Test 2: Initialize
echo "2. Testing MCP Initialize..."
INIT_RESPONSE=$(curl -s -X POST http://localhost:3111/mcp \
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
  }')

echo "$INIT_RESPONSE" | jq '.' 2>/dev/null || echo "$INIT_RESPONSE"
echo ""
echo ""

# Test 3: List Tools
echo "3. Testing List Tools..."
curl -s -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' | jq '.' 2>/dev/null || curl -s -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
echo ""
echo ""

# Test 4: Call listAIModels
echo "4. Testing Call listAIModels Tool..."
curl -s -X POST http://localhost:3111/mcp \
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
  }' | jq '.' 2>/dev/null || curl -s -X POST http://localhost:3111/mcp \
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
  }'
echo ""
echo ""

# Test 5: Call getAIModelInfo
echo "5. Testing Call getAIModelInfo Tool..."
curl -s -X POST http://localhost:3111/mcp \
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
  }' | jq '.' 2>/dev/null || curl -s -X POST http://localhost:3111/mcp \
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
  }'
echo ""
echo ""

echo "✅ Testing Complete!"

