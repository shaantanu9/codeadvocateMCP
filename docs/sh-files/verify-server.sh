#!/bin/bash

echo "🔍 Verifying MCP Server Status..."
echo ""

# Check if server is running
echo "1. Checking if server process is running..."
if ps aux | grep -E "tsx src/index|node.*index.js" | grep -v grep > /dev/null; then
    echo "   ✅ Server process is running"
    ps aux | grep -E "tsx src/index|node.*index.js" | grep -v grep | awk '{print "   PID:", $2, "Status:", $8}'
else
    echo "   ❌ Server process not found"
    echo "   Run: npm run dev"
    exit 1
fi

echo ""

# Check health endpoint
echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3111/health 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo "   ✅ Health endpoint responding"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null | head -5
else
    echo "   ❌ Health endpoint not responding"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi

echo ""

# Test MCP initialize
echo "3. Testing MCP initialize..."
INIT_RESPONSE=$(curl -s -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' 2>&1)

if echo "$INIT_RESPONSE" | grep -q "demo-mcp-server"; then
    echo "   ✅ MCP initialize working"
else
    echo "   ❌ MCP initialize failed"
    echo "$INIT_RESPONSE" | head -3
    exit 1
fi

echo ""

# Test tools list
echo "4. Testing tools/list..."
TOOLS_RESPONSE=$(curl -s -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' 2>&1)

if echo "$TOOLS_RESPONSE" | grep -q "listAIModels"; then
    echo "   ✅ Tools list working"
    echo "$TOOLS_RESPONSE" | grep -o '"name":"[^"]*"' | head -2
else
    echo "   ❌ Tools list failed"
    exit 1
fi

echo ""

# Test tool call
echo "5. Testing tool call (listAIModels)..."
CALL_RESPONSE=$(curl -s -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"listAIModels","arguments":{}}}' 2>&1)

if echo "$CALL_RESPONSE" | grep -q "shantanuDemo-3432"; then
    echo "   ✅ Tool call working"
else
    echo "   ❌ Tool call failed"
    exit 1
fi

echo ""
echo "✅ All checks passed! Server is ready for Cursor MCP connections."
echo ""
echo "📋 Next steps:"
echo "   1. Restart Cursor IDE to connect to the MCP server"
echo "   2. The server is configured in ~/.cursor/mcp.json"
echo "   3. You should see 'demo_mcp' tools available in Cursor"

