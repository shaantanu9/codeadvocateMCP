#!/bin/bash

# Test script for analyzeAndSaveRepository tool
# This tests the complete flow: extraction, creation, and saving

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MCP_URL="http://localhost:3111/mcp"
API_URL="http://localhost:5656"
API_KEY="sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing analyzeAndSaveRepository Tool${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Verify git repository info
echo -e "${YELLOW}Step 1: Verifying Git Repository Info${NC}"
REPO_NAME=$(basename $(git rev-parse --show-toplevel 2>/dev/null) 2>/dev/null)
REMOTE_URL=$(git config --get remote.origin.url 2>/dev/null)
CURRENT_DIR=$(pwd)

if [ -z "$REPO_NAME" ]; then
    echo -e "${RED}✗ Not a git repository${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Repository detected${NC}"
echo -e "  Directory name: ${REPO_NAME}"
echo -e "  Remote URL: ${REMOTE_URL:-none}"
echo -e "  Current path: ${CURRENT_DIR}\n"

# Step 2: Extract expected repo name from URL
if [ -n "$REMOTE_URL" ]; then
    # Remove .git suffix
    CLEAN_URL=$(echo "$REMOTE_URL" | sed 's/\.git$//')
    # Handle SSH format
    if [[ "$CLEAN_URL" == *"@"* ]]; then
        CLEAN_URL=$(echo "$CLEAN_URL" | cut -d: -f2)
    fi
    # Extract repo name
    EXPECTED_REPO_NAME=$(echo "$CLEAN_URL" | awk -F'/' '{print $NF}')
    echo -e "${YELLOW}Expected repo name from URL: ${EXPECTED_REPO_NAME}${NC}\n"
else
    EXPECTED_REPO_NAME="$REPO_NAME"
    echo -e "${YELLOW}No remote URL, will use directory name: ${EXPECTED_REPO_NAME}${NC}\n"
fi

# Step 3: Check if MCP server is running
echo -e "${YELLOW}Step 2: Checking MCP Server${NC}"
if ! curl -s -f "${MCP_URL}" -H "Accept: text/event-stream" > /dev/null 2>&1; then
    echo -e "${RED}✗ MCP server not running at ${MCP_URL}${NC}"
    echo -e "${YELLOW}Please start the server with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MCP server is running${NC}\n"

# Step 4: Call the analyzeAndSaveRepository tool
echo -e "${YELLOW}Step 3: Calling analyzeAndSaveRepository Tool${NC}"
echo -e "This may take a while as it analyzes the codebase...\n"

RESPONSE=$(curl -s -X POST "${MCP_URL}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"analyzeAndSaveRepository\",
      \"arguments\": {
        \"projectPath\": \"${CURRENT_DIR}\",
        \"deepAnalysis\": true,
        \"useCache\": false,
        \"forceRefresh\": true
      }
    }
  }")

# Check if we got a response
if [ -z "$RESPONSE" ]; then
    echo -e "${RED}✗ No response from MCP server${NC}"
    exit 1
fi

# Extract result
RESULT=$(echo "$RESPONSE" | grep -o '"result":{[^}]*}' | head -1 || echo "")
ERROR=$(echo "$RESPONSE" | grep -o '"error":{[^}]*}' | head -1 || echo "")

if [ -n "$ERROR" ]; then
    echo -e "${RED}✗ Error from tool:${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

if [ -z "$RESULT" ]; then
    echo -e "${YELLOW}⚠ Partial response (may be streaming)${NC}"
    echo "$RESPONSE" | head -50
    echo -e "\n${YELLOW}Checking API for created resources...${NC}\n"
else
    echo -e "${GREEN}✓ Tool executed successfully${NC}"
    echo "$RESPONSE" | jq '.result' 2>/dev/null || echo "$RESPONSE" | head -20
    echo ""
fi

# Step 5: Verify repository was created/found in API
echo -e "${YELLOW}Step 4: Verifying Repository in API${NC}"
REPO_SEARCH=$(curl -s -X GET "${API_URL}/api/repositories?search=${EXPECTED_REPO_NAME}" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json")

REPO_FOUND=$(echo "$REPO_SEARCH" | jq -r '.repositories[]? | select(.name == "'"${EXPECTED_REPO_NAME}"'") | .id' 2>/dev/null | head -1)

if [ -n "$REPO_FOUND" ] && [ "$REPO_FOUND" != "null" ]; then
    echo -e "${GREEN}✓ Repository found in API: ${REPO_FOUND}${NC}"
    
    # Get repository details
    REPO_DETAILS=$(curl -s -X GET "${API_URL}/api/repositories/${REPO_FOUND}" \
      -H "X-API-Key: ${API_KEY}" \
      -H "Content-Type: application/json")
    
    REPO_NAME_API=$(echo "$REPO_DETAILS" | jq -r '.repository.name // .name' 2>/dev/null)
    REPO_DESC=$(echo "$REPO_DETAILS" | jq -r '.repository.description // .description' 2>/dev/null)
    
    echo -e "  Name: ${REPO_NAME_API}"
    echo -e "  Description: ${REPO_DESC:0:100}..."
    
    # Check if remote URL is in description
    if [ -n "$REMOTE_URL" ] && echo "$REPO_DESC" | grep -q "$REMOTE_URL"; then
        echo -e "${GREEN}  ✓ Remote URL found in description${NC}"
    elif [ -n "$REMOTE_URL" ]; then
        echo -e "${YELLOW}  ⚠ Remote URL not found in description${NC}"
    fi
else
    echo -e "${RED}✗ Repository not found in API${NC}"
    echo "Search response: $REPO_SEARCH" | head -20
fi
echo ""

# Step 6: Verify project was created
echo -e "${YELLOW}Step 5: Verifying Project in API${NC}"
PROJECT_SEARCH=$(curl -s -X GET "${API_URL}/api/projects?search=${EXPECTED_REPO_NAME}" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json")

PROJECT_FOUND=$(echo "$PROJECT_SEARCH" | jq -r '.projects[]? | select(.name == "'"${EXPECTED_REPO_NAME}"'") | .id' 2>/dev/null | head -1)

if [ -n "$PROJECT_FOUND" ] && [ "$PROJECT_FOUND" != "null" ]; then
    echo -e "${GREEN}✓ Project found in API: ${PROJECT_FOUND}${NC}"
    
    # Get project details
    PROJECT_DETAILS=$(curl -s -X GET "${API_URL}/api/projects/${PROJECT_FOUND}" \
      -H "X-API-Key: ${API_KEY}" \
      -H "Content-Type: application/json")
    
    PROJECT_NAME_API=$(echo "$PROJECT_DETAILS" | jq -r '.name' 2>/dev/null)
    PROJECT_DESC=$(echo "$PROJECT_DETAILS" | jq -r '.description' 2>/dev/null)
    
    echo -e "  Name: ${PROJECT_NAME_API}"
    echo -e "  Description: ${PROJECT_DESC:0:100}..."
    
    # Check if remote URL is in description
    if [ -n "$REMOTE_URL" ] && echo "$PROJECT_DESC" | grep -q "$REMOTE_URL"; then
        echo -e "${GREEN}  ✓ Remote URL found in description${NC}"
    elif [ -n "$REMOTE_URL" ]; then
        echo -e "${YELLOW}  ⚠ Remote URL not found in description${NC}"
    fi
else
    echo -e "${RED}✗ Project not found in API${NC}"
fi
echo ""

# Step 7: Verify documentation was created
echo -e "${YELLOW}Step 6: Verifying Documentation in API${NC}"
DOC_SEARCH=$(curl -s -X GET "${API_URL}/api/documentations?search=${EXPECTED_REPO_NAME}" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json")

DOC_FOUND=$(echo "$DOC_SEARCH" | jq -r '.documentations[]? | select(.title | contains("'"${EXPECTED_REPO_NAME}"'")) | .id' 2>/dev/null | head -1)

if [ -n "$DOC_FOUND" ] && [ "$DOC_FOUND" != "null" ]; then
    echo -e "${GREEN}✓ Documentation found in API: ${DOC_FOUND}${NC}"
    
    # Get documentation details
    DOC_DETAILS=$(curl -s -X GET "${API_URL}/api/documentations/${DOC_FOUND}" \
      -H "X-API-Key: ${API_KEY}" \
      -H "Content-Type: application/json")
    
    DOC_TITLE=$(echo "$DOC_DETAILS" | jq -r '.title' 2>/dev/null)
    DOC_META=$(echo "$DOC_DETAILS" | jq -r '.metadata' 2>/dev/null)
    
    echo -e "  Title: ${DOC_TITLE}"
    
    # Check metadata
    if [ -n "$DOC_META" ] && [ "$DOC_META" != "null" ]; then
        REPO_NAME_META=$(echo "$DOC_META" | jq -r '.repositoryName' 2>/dev/null)
        REMOTE_URL_META=$(echo "$DOC_META" | jq -r '.remoteUrl' 2>/dev/null)
        REPO_ID_META=$(echo "$DOC_META" | jq -r '.repositoryId' 2>/dev/null)
        PROJECT_ID_META=$(echo "$DOC_META" | jq -r '.projectId' 2>/dev/null)
        
        echo -e "  Repository Name in metadata: ${REPO_NAME_META}"
        echo -e "  Remote URL in metadata: ${REMOTE_URL_META:-none}"
        echo -e "  Repository ID in metadata: ${REPO_ID_META:-none}"
        echo -e "  Project ID in metadata: ${PROJECT_ID_META:-none}"
        
        if [ "$REPO_NAME_META" = "$EXPECTED_REPO_NAME" ]; then
            echo -e "${GREEN}  ✓ Repository name matches${NC}"
        else
            echo -e "${YELLOW}  ⚠ Repository name mismatch (expected: ${EXPECTED_REPO_NAME}, got: ${REPO_NAME_META})${NC}"
        fi
        
        if [ -n "$REMOTE_URL_META" ] && [ "$REMOTE_URL_META" != "null" ]; then
            echo -e "${GREEN}  ✓ Remote URL saved in metadata${NC}"
        else
            echo -e "${YELLOW}  ⚠ Remote URL not in metadata${NC}"
        fi
    fi
else
    echo -e "${RED}✗ Documentation not found in API${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"

if [ -n "$REPO_FOUND" ] && [ -n "$PROJECT_FOUND" ] && [ -n "$DOC_FOUND" ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "  Repository: ${REPO_FOUND}"
    echo -e "  Project: ${PROJECT_FOUND}"
    echo -e "  Documentation: ${DOC_FOUND}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    exit 1
fi



