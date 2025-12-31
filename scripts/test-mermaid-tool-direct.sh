#!/bin/bash

# Direct Test of createRepositoryMermaid Tool
# Tests the tool via MCP protocol directly

set -e

API_URL="${EXTERNAL_API_URL:-http://localhost:5656}"
MCP_URL="${MCP_SERVER_URL:-http://localhost:3111}"
API_KEY="${EXTERNAL_API_KEY:-sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🧪 Testing createRepositoryMermaid Tool via MCP"
echo "================================================"
echo ""

# Test repository ID
REPO_ID="${1:-692a91e7-8451-4ea0-88da-a0f56de86533}"

echo "Repository ID: $REPO_ID"
echo "MCP URL: $MCP_URL"
echo ""

# Step 1: List available tools
echo -e "${BLUE}Step 1: Listing available Mermaid tools...${NC}"
TOOLS_RESPONSE=$(curl -s -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }')

MERMAID_TOOLS=$(echo "$TOOLS_RESPONSE" | jq -r '.result.tools[] | select(.name | contains("Mermaid")) | .name' 2>/dev/null || echo "")

if [ -z "$MERMAID_TOOLS" ]; then
  echo -e "${RED}❌ No Mermaid tools found!${NC}"
  echo "Response: $TOOLS_RESPONSE" | jq '.' 2>/dev/null || echo "$TOOLS_RESPONSE"
  exit 1
else
  echo -e "${GREEN}✅ Found Mermaid tools:${NC}"
  echo "$MERMAID_TOOLS" | while read tool; do
    echo "   - $tool"
  done
fi

echo ""

# Step 2: Check if createRepositoryMermaid exists
echo -e "${BLUE}Step 2: Checking createRepositoryMermaid tool...${NC}"
HAS_CREATE=$(echo "$TOOLS_RESPONSE" | jq -r '.result.tools[] | select(.name == "createRepositoryMermaid") | .name' 2>/dev/null || echo "")

if [ -z "$HAS_CREATE" ]; then
  echo -e "${RED}❌ createRepositoryMermaid tool not found!${NC}"
  echo ""
  echo "Available tools with 'create' in name:"
  echo "$TOOLS_RESPONSE" | jq -r '.result.tools[] | select(.name | contains("create")) | .name' 2>/dev/null || echo "None"
  exit 1
else
  echo -e "${GREEN}✅ createRepositoryMermaid tool found!${NC}"
  
  # Get tool details
  TOOL_DETAILS=$(echo "$TOOLS_RESPONSE" | jq '.result.tools[] | select(.name == "createRepositoryMermaid")' 2>/dev/null)
  echo "Tool Description:"
  echo "$TOOL_DETAILS" | jq -r '.description' 2>/dev/null
  echo ""
  echo "Tool Parameters:"
  echo "$TOOL_DETAILS" | jq -r '.inputSchema.properties | to_entries[] | "  - \(.key): \(.value.description // "N/A")"' 2>/dev/null
fi

echo ""

# Step 3: Test calling the tool
echo -e "${BLUE}Step 3: Testing createRepositoryMermaid tool call...${NC}"

MERMAID_CONTENT="flowchart TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Action 1]
    C -->|No| E[Action 2]
    D --> F[End]
    E --> F"

CALL_RESPONSE=$(curl -s -X POST "$MCP_URL/mcp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 2,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"createRepositoryMermaid\",
      \"arguments\": {
        \"repositoryId\": \"$REPO_ID\",
        \"title\": \"Test Mermaid Diagram\",
        \"content\": \"$MERMAID_CONTENT\",
        \"category\": \"architecture\",
        \"description\": \"Test diagram created via MCP tool\",
        \"tags\": [\"test\", \"mcp\", \"mermaid\"]
      }
    }
  }")

echo "Response:"
echo "$CALL_RESPONSE" | jq '.' 2>/dev/null || echo "$CALL_RESPONSE"

# Check for errors
ERROR=$(echo "$CALL_RESPONSE" | jq -r '.error.message // empty' 2>/dev/null)
if [ -n "$ERROR" ]; then
  echo ""
  echo -e "${RED}❌ Error calling tool: $ERROR${NC}"
  exit 1
fi

# Check for result
RESULT=$(echo "$CALL_RESPONSE" | jq -r '.result.content[0].text // empty' 2>/dev/null)
if [ -n "$RESULT" ]; then
  echo ""
  echo -e "${GREEN}✅ Tool call successful!${NC}"
  echo "Result preview:"
  echo "$RESULT" | head -5
else
  echo ""
  echo -e "${YELLOW}⚠️  No result content found${NC}"
fi

echo ""
echo "✅ Test completed!"
