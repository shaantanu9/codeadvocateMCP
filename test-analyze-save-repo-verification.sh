#!/bin/bash

# Comprehensive Test Script for analyzeAndSaveRepository Tool
# Tests all functionality based on API verification documents

set -e

API_KEY="sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
BASE_URL="http://localhost:5656"
MCP_SERVER_URL="http://localhost:3111"

echo "========================================="
echo "Testing analyzeAndSaveRepository Tool"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local expected_status=$4
    local data=$5
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "PATCH" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PATCH \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo ""
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected HTTP $expected_status, got HTTP $http_code)"
        FAILED=$((FAILED + 1))
        echo "Response: $body"
        echo ""
        return 1
    fi
}

# Test MCP Tool Call
test_mcp_tool() {
    echo "========================================="
    echo "Testing MCP Tool: analyzeAndSaveRepository"
    echo "========================================="
    echo ""
    
    # Check if MCP server is running
    if ! curl -s "$MCP_SERVER_URL/health" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  MCP server not running at $MCP_SERVER_URL${NC}"
        echo "Please start the MCP server first: npm run dev"
        echo ""
        return 1
    fi
    
    echo "Calling analyzeAndSaveRepository tool via MCP..."
    
    # Create MCP request
    request='{
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
    }'
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_KEY" \
        -d "$request" \
        "$MCP_SERVER_URL/mcp")
    
    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    
    # Check if response contains success indicators
    if echo "$response" | grep -q "repositoryId\|projectId\|Analyzed repository"; then
        echo -e "${GREEN}✅ Tool execution appears successful${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ Tool execution may have failed${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Test API Response Formats
test_response_formats() {
    echo "========================================="
    echo "Testing API Response Formats"
    echo "========================================="
    echo ""
    
    # Test 1: Create Repository (should return { repository: {...} })
    echo "Test 1: Create Repository"
    repo_data='{
        "name": "test-repo-format-'$(date +%s)'",
        "description": "Test repository for format verification",
        "type": "individual"
    }'
    test_endpoint "POST /api/repositories" "POST" "/api/repositories" "201" "$repo_data"
    REPO_ID=$(echo "$body" | jq -r '.repository.id // .id // empty' 2>/dev/null)
    
    if [ -z "$REPO_ID" ]; then
        echo -e "${RED}❌ Could not extract repository ID${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Repository ID extracted: $REPO_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 2: Create Project (should return { project: {...} } or { id: ... })
    echo "Test 2: Create Project"
    project_data='{
        "name": "test-project-format-'$(date +%s)'",
        "description": "Test project for format verification",
        "repositoryId": "'$REPO_ID'"
    }'
    test_endpoint "POST /api/projects" "POST" "/api/projects" "201" "$project_data"
    PROJECT_ID=$(echo "$body" | jq -r '.project.id // .id // empty' 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ Could not extract project ID${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Project ID extracted: $PROJECT_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 3: Create Snippet (should return { id: ... })
    echo "Test 3: Create Snippet"
    snippet_data='{
        "title": "Test Snippet",
        "code": "function test() { return true; }",
        "language": "javascript",
        "description": "Test snippet",
        "tags": ["test"],
        "projectId": "'$PROJECT_ID'",
        "repositoryId": "'$REPO_ID'"
    }'
    test_endpoint "POST /api/snippets" "POST" "/api/snippets" "201" "$snippet_data"
    SNIPPET_ID=$(echo "$body" | jq -r '.id // empty' 2>/dev/null)
    
    if [ -z "$SNIPPET_ID" ]; then
        echo -e "${RED}❌ Could not extract snippet ID${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Snippet ID extracted: $SNIPPET_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 4: Create Documentation (should return { id: ... })
    echo "Test 4: Create Documentation"
    doc_data='{
        "title": "Test Documentation",
        "type": "overview",
        "category": "test",
        "content": "# Test Documentation\n\nThis is a test."
    }'
    test_endpoint "POST /api/documentations" "POST" "/api/documentations" "201" "$doc_data"
    DOC_ID=$(echo "$body" | jq -r '.id // empty' 2>/dev/null)
    
    if [ -z "$DOC_ID" ]; then
        echo -e "${RED}❌ Could not extract documentation ID${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Documentation ID extracted: $DOC_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 5: Create File (should return { file: {...} })
    echo "Test 5: Create Repository File"
    file_data='{
        "name": "test-file.json",
        "file_type": "json",
        "content": "{\"test\": true}",
        "description": "Test file"
    }'
    test_endpoint "POST /api/repositories/$REPO_ID/files" "POST" "/api/repositories/$REPO_ID/files" "201" "$file_data"
    FILE_ID=$(echo "$body" | jq -r '.file.id // .id // empty' 2>/dev/null)
    
    if [ -z "$FILE_ID" ]; then
        echo -e "${RED}❌ Could not extract file ID${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ File ID extracted: $FILE_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 6: Create Rule (should return { rule: {...} })
    echo "Test 6: Create Rule"
    rule_data='{
        "title": "Test Rule",
        "rule_content": "Test rule content",
        "rule_type": "coding_standard",
        "severity": "info"
    }'
    test_endpoint "POST /api/repositories/$REPO_ID/rules" "POST" "/api/repositories/$REPO_ID/rules" "201" "$rule_data"
    RULE_ID=$(echo "$body" | jq -r '.rule.id // .id // empty' 2>/dev/null)
    
    if [ -z "$RULE_ID" ]; then
        echo -e "${RED}❌ Could not extract rule ID${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Rule ID extracted: $RULE_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 7: Create Prompt (should return { prompt: {...} })
    echo "Test 7: Create Prompt"
    prompt_data='{
        "title": "Test Prompt",
        "prompt_content": "Test prompt content",
        "prompt_type": "code_generation"
    }'
    test_endpoint "POST /api/repositories/$REPO_ID/prompts" "POST" "/api/repositories/$REPO_ID/prompts" "201" "$prompt_data"
    PROMPT_ID=$(echo "$body" | jq -r '.prompt.id // .id // empty' 2>/dev/null)
    
    if [ -z "$PROMPT_ID" ]; then
        echo -e "${RED}❌ Could not extract prompt ID${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Prompt ID extracted: $PROMPT_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 8: Create PR Rule (should return { pr_rule: {...} })
    echo "Test 8: Create PR Rule"
    pr_rule_data='{
        "title": "Test PR Rule",
        "rule_content": "Test PR rule content",
        "rule_type": "review_checklist",
        "priority": "medium"
    }'
    test_endpoint "POST /api/repositories/$REPO_ID/pr-rules" "POST" "/api/repositories/$REPO_ID/pr-rules" "201" "$pr_rule_data"
    PR_RULE_ID=$(echo "$body" | jq -r '.pr_rule.id // .id // empty' 2>/dev/null)
    
    if [ -z "$PR_RULE_ID" ]; then
        echo -e "${RED}❌ Could not extract PR rule ID${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ PR Rule ID extracted: $PR_RULE_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 9: Create Analysis (should return { id: ... })
    echo "Test 9: Create Analysis"
    analysis_data='{
        "analysis_data": {
            "summary": "Test analysis",
            "files_analyzed": 10,
            "functions_found": 5
        }
    }'
    test_endpoint "POST /api/repositories/$REPO_ID/analysis" "POST" "/api/repositories/$REPO_ID/analysis" "201" "$analysis_data"
    ANALYSIS_ID=$(echo "$body" | jq -r '.id // empty' 2>/dev/null)
    
    if [ -z "$ANALYSIS_ID" ]; then
        echo -e "${YELLOW}⚠️  Could not extract analysis ID (may not be required)${NC}"
    else
        echo -e "${GREEN}✅ Analysis ID extracted: $ANALYSIS_ID${NC}"
        PASSED=$((PASSED + 1))
    fi
    echo ""
    
    # Test 10: List Repositories (should return { repositories: [...] })
    echo "Test 10: List Repositories"
    test_endpoint "GET /api/repositories" "GET" "/api/repositories?search=test" "200" ""
    REPOS_COUNT=$(echo "$body" | jq -r '.repositories | length // .data | length // 0' 2>/dev/null)
    
    if [ "$REPOS_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Found $REPOS_COUNT repositories${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  No repositories found (may be expected)${NC}"
    fi
    echo ""
}

# Main execution
echo "Starting comprehensive tests..."
echo ""

# Test API response formats first
test_response_formats

# Test MCP tool if server is available
test_mcp_tool

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi



