#!/bin/bash

# Test Script for New Repository Tools
# Tests all the newly added repository tools

set -e

API_KEY="sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
BASE_URL="http://localhost:5656"
MCP_SERVER_URL="http://localhost:3111"

echo "========================================="
echo "Testing New Repository Tools"
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
            "$BASE_URL$endpoint" 2>&1)
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>&1)
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $http_code)"
        echo "Response: $body" | head -c 200
        echo ""
        ((FAILED++))
        return 1
    fi
}

# Get a test repository ID (use first repository from list)
echo "Getting test repository ID..."
REPO_RESPONSE=$(curl -s -X GET \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/repositories?limit=1")

REPO_ID=$(echo "$REPO_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$REPO_ID" ]; then
    echo -e "${RED}✗ FAIL${NC}: Could not get repository ID. Creating one..."
    CREATE_RESPONSE=$(curl -s -X POST \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"name":"test-repo-'$(date +%s)'","type":"individual"}' \
        "$BASE_URL/api/repositories")
    REPO_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ -z "$REPO_ID" ]; then
        echo -e "${RED}✗ FAIL${NC}: Could not create repository. Exiting."
        exit 1
    fi
fi

echo "Using repository ID: $REPO_ID"
echo ""

# Test Repository PR Rules
echo "=== Repository PR Rules ==="
test_endpoint "List PR Rules" "GET" "/api/repositories/$REPO_ID/pr-rules" "200"

PR_RULE_DATA='{"title":"Test PR Rule","rule_content":"This is a test PR rule","rule_type":"coding_standard","severity":"warning"}'
test_endpoint "Create PR Rule" "POST" "/api/repositories/$REPO_ID/pr-rules" "201" "$PR_RULE_DATA"

# Get PR rule ID
PR_RULES_RESPONSE=$(curl -s -X GET \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/repositories/$REPO_ID/pr-rules?limit=1")

PR_RULE_ID=$(echo "$PR_RULES_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PR_RULE_ID" ]; then
    test_endpoint "Get PR Rule" "GET" "/api/repositories/$REPO_ID/pr-rules/$PR_RULE_ID" "200"
    
    UPDATE_PR_RULE_DATA='{"title":"Updated PR Rule","rule_content":"Updated content"}'
    test_endpoint "Update PR Rule" "PUT" "/api/repositories/$REPO_ID/pr-rules/$PR_RULE_ID" "200" "$UPDATE_PR_RULE_DATA"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Could not get PR rule ID for update test"
fi

echo ""

# Test Repository Files
echo "=== Repository Files ==="
test_endpoint "List Files" "GET" "/api/repositories/$REPO_ID/files" "200"

FILE_DATA='{"title":"Test File","content":"This is test file content","file_type":"documentation","file_path":"/test/file.md"}'
test_endpoint "Create File" "POST" "/api/repositories/$REPO_ID/files" "201" "$FILE_DATA"

# Get file ID
FILES_RESPONSE=$(curl -s -X GET \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/repositories/$REPO_ID/files?limit=1")

FILE_ID=$(echo "$FILES_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$FILE_ID" ]; then
    test_endpoint "Get File" "GET" "/api/repositories/$REPO_ID/files/$FILE_ID" "200"
    
    UPDATE_FILE_DATA='{"title":"Updated File","content":"Updated file content"}'
    test_endpoint "Update File" "PUT" "/api/repositories/$REPO_ID/files/$FILE_ID" "200" "$UPDATE_FILE_DATA"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Could not get file ID for update test"
fi

echo ""

# Test Repository Rules GET/UPDATE
echo "=== Repository Rules GET/UPDATE ==="
RULES_RESPONSE=$(curl -s -X GET \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/repositories/$REPO_ID/rules?limit=1")

RULE_ID=$(echo "$RULES_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$RULE_ID" ]; then
    test_endpoint "Get Rule" "GET" "/api/repositories/$REPO_ID/rules/$RULE_ID" "200"
    
    UPDATE_RULE_DATA='{"title":"Updated Rule","rule_content":"Updated rule content"}'
    test_endpoint "Update Rule" "PUT" "/api/repositories/$REPO_ID/rules/$RULE_ID" "200" "$UPDATE_RULE_DATA"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Could not get rule ID. Creating one..."
    CREATE_RULE_DATA='{"title":"Test Rule","rule_content":"This is a test rule","rule_type":"coding_standard","severity":"info"}'
    CREATE_RULE_RESPONSE=$(curl -s -X POST \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "$CREATE_RULE_DATA" \
        "$BASE_URL/api/repositories/$REPO_ID/rules")
    RULE_ID=$(echo "$CREATE_RULE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ -n "$RULE_ID" ]; then
        test_endpoint "Get Rule" "GET" "/api/repositories/$REPO_ID/rules/$RULE_ID" "200"
        UPDATE_RULE_DATA='{"title":"Updated Rule","rule_content":"Updated rule content"}'
        test_endpoint "Update Rule" "PUT" "/api/repositories/$REPO_ID/rules/$RULE_ID" "200" "$UPDATE_RULE_DATA"
    fi
fi

echo ""

# Test Repository Prompts GET/UPDATE
echo "=== Repository Prompts GET/UPDATE ==="
PROMPTS_RESPONSE=$(curl -s -X GET \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/repositories/$REPO_ID/prompts?limit=1")

PROMPT_ID=$(echo "$PROMPTS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PROMPT_ID" ]; then
    test_endpoint "Get Prompt" "GET" "/api/repositories/$REPO_ID/prompts/$PROMPT_ID" "200"
    
    UPDATE_PROMPT_DATA='{"title":"Updated Prompt","prompt_content":"Updated prompt content"}'
    test_endpoint "Update Prompt" "PUT" "/api/repositories/$REPO_ID/prompts/$PROMPT_ID" "200" "$UPDATE_PROMPT_DATA"
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Could not get prompt ID. Creating one..."
    CREATE_PROMPT_DATA='{"title":"Test Prompt","prompt_content":"This is a test prompt","prompt_type":"code_generation","category":"backend"}'
    CREATE_PROMPT_RESPONSE=$(curl -s -X POST \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "$CREATE_PROMPT_DATA" \
        "$BASE_URL/api/repositories/$REPO_ID/prompts")
    PROMPT_ID=$(echo "$CREATE_PROMPT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ -n "$PROMPT_ID" ]; then
        test_endpoint "Get Prompt" "GET" "/api/repositories/$REPO_ID/prompts/$PROMPT_ID" "200"
        UPDATE_PROMPT_DATA='{"title":"Updated Prompt","prompt_content":"Updated prompt content"}'
        test_endpoint "Update Prompt" "PUT" "/api/repositories/$REPO_ID/prompts/$PROMPT_ID" "200" "$UPDATE_PROMPT_DATA"
    fi
fi

echo ""

# Test Repository Permissions
echo "=== Repository Permissions ==="
test_endpoint "Get Permissions" "GET" "/api/repositories/$REPO_ID/permissions" "200"

echo ""

# Test Repository Analysis GET
echo "=== Repository Analysis GET ==="
test_endpoint "Get Analysis" "GET" "/api/repositories/$REPO_ID/analysis" "200"

echo ""

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi



