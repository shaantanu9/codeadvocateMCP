#!/bin/bash

# Test script for analyzeAndSaveRepository tool
# This script tests the repository analysis tool with various configurations

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
MCP_SERVER_URL="${MCP_SERVER_URL:-http://localhost:3111/mcp}"
API_KEY="${API_KEY:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing analyzeAndSaveRepository Tool${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to make MCP requests
make_mcp_request() {
  local method=$1
  local params=$2
  local description=$3
  
  echo -e "${YELLOW}Testing: ${description}${NC}"
  
  local request_body=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "analyzeAndSaveRepository",
    "arguments": ${params}
  }
}
EOF
)
  
  local response
  if [ -z "$API_KEY" ]; then
    response=$(curl -s -X POST "$MCP_SERVER_URL" \
      -H "Content-Type: application/json" \
      -d "$request_body")
  else
    response=$(curl -s -X POST "$MCP_SERVER_URL" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d "$request_body")
  fi
  
  echo "$response" | jq '.' || echo "$response"
  echo ""
  
  # Check for errors
  if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
    echo -e "${RED}❌ Error in response${NC}"
    echo "$response" | jq '.error'
    return 1
  else
    echo -e "${GREEN}✅ Request successful${NC}"
    return 0
  fi
}

# Test 1: Basic analysis (no LLM, no API save)
echo -e "${BLUE}Test 1: Basic Analysis (No LLM, No API)${NC}"
make_mcp_request "tools/call" '{
  "projectPath": ".",
  "deepAnalysis": true,
  "useCache": false,
  "forceRefresh": true
}' "Basic repository analysis"

# Test 2: Analysis with cache
echo -e "${BLUE}Test 2: Analysis with Cache${NC}"
make_mcp_request "tools/call" '{
  "projectPath": ".",
  "deepAnalysis": true,
  "useCache": true,
  "forceRefresh": false
}' "Analysis using cache"

# Test 3: Analysis with LLM (if available)
echo -e "${BLUE}Test 3: Analysis with LLM Enhancement${NC}"
make_mcp_request "tools/call" '{
  "projectPath": ".",
  "deepAnalysis": true,
  "useLLM": true,
  "llmProvider": "auto",
  "useCache": false,
  "forceRefresh": true
}' "Analysis with LLM enhancement"

# Test 4: Analysis with custom LLM prompt
echo -e "${BLUE}Test 4: Analysis with Custom LLM Prompt${NC}"
make_mcp_request "tools/call" '{
  "projectPath": ".",
  "deepAnalysis": true,
  "useLLM": true,
  "llmPrompt": "Extract all utility functions, identify coding patterns, and provide architectural insights",
  "llmProvider": "auto",
  "useCache": false,
  "forceRefresh": false
}' "Analysis with custom LLM prompt"

# Test 5: Analysis with API save (if repositoryId/projectId provided)
if [ -n "$REPOSITORY_ID" ] || [ -n "$PROJECT_ID" ]; then
  echo -e "${BLUE}Test 5: Analysis with API Save${NC}"
  local api_params="{
    \"projectPath\": \".\",
    \"deepAnalysis\": true,
    \"useCache\": false,
    \"forceRefresh\": false"
  
  if [ -n "$REPOSITORY_ID" ]; then
    api_params="${api_params},
    \"repositoryId\": \"$REPOSITORY_ID\""
  fi
  
  if [ -n "$PROJECT_ID" ]; then
    api_params="${api_params},
    \"projectId\": \"$PROJECT_ID\""
  fi
  
  api_params="${api_params}
  }"
  
  make_mcp_request "tools/call" "$api_params" "Analysis with API save"
fi

# Test 6: Complete analysis (LLM + API save)
if [ -n "$REPOSITORY_ID" ] && [ -n "$PROJECT_ID" ]; then
  echo -e "${BLUE}Test 6: Complete Analysis (LLM + API)${NC}"
  make_mcp_request "tools/call" "{
    \"projectPath\": \".\",
    \"repositoryId\": \"$REPOSITORY_ID\",
    \"projectId\": \"$PROJECT_ID\",
    \"deepAnalysis\": true,
    \"useLLM\": true,
    \"llmPrompt\": \"Comprehensive analysis: extract utility functions, coding standards, architecture patterns, and provide recommendations\",
    \"llmProvider\": \"auto\",
    \"useCache\": false,
    \"forceRefresh\": true
  }" "Complete analysis with LLM and API save"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"



