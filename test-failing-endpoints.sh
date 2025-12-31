#!/bin/bash

# Test script for failing API endpoints
# Update these variables with your actual values

BASE_URL="${EXTERNAL_API_BASE_URL:-http://localhost:5656/api}"
REPO_ID="6c119199-0ac9-4055-a297-5bf044fdb64d"
TOKEN="${MCP_SERVER_TOKEN:-your-token-here}"

echo "Testing failing endpoints..."
echo "Base URL: $BASE_URL"
echo "Repository ID: $REPO_ID"
echo ""

# Test 1: Create Repository Rule (with invalid rule_type)
echo "=== Test 1: Create Repository Rule (FAILING) ==="
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "React Hook Dependencies - useCallback Pattern",
    "rule_content": "**CRITICAL**: Always use `useCallback` for functions used in `useEffect` dependencies.",
    "rule_type": "code-quality",
    "severity": "error"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "Response (raw):"
echo ""

# Test 2: Create Repository Rule (with valid rule_type)
echo "=== Test 2: Create Repository Rule (SHOULD WORK) ==="
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "React Hook Dependencies - useCallback Pattern",
    "rule_content": "**CRITICAL**: Always use `useCallback` for functions used in `useEffect` dependencies.",
    "rule_type": "coding_standard",
    "severity": "error"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "Response (raw):"
echo ""

# Test 3: Create PR Rule (with invalid rule_type)
echo "=== Test 3: Create PR Rule (FAILING) ==="
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "PR Checklist - Code Quality",
    "rule_content": "**REQUIRED**: All PRs must pass these checks before merge.",
    "rule_type": "code-quality",
    "severity": "error"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "Response (raw):"
echo ""

# Test 4: Create PR Rule (with valid rule_type)
echo "=== Test 4: Create PR Rule (SHOULD WORK) ==="
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "PR Checklist - Code Quality",
    "rule_content": "**REQUIRED**: All PRs must pass these checks before merge.",
    "rule_type": "review_checklist",
    "severity": "error"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "Response (raw):"
echo ""

# Test 5: Create Prompt (with prompt_content - FAILING)
echo "=== Test 5: Create Prompt (FAILING - wrong field name) ==="
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Create New API Route",
    "prompt_content": "Create a new API route following the project'\''s standard patterns.",
    "prompt_type": "development",
    "category": "api"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "Response (raw):"
echo ""

# Test 6: Create Prompt (with prompt_text - SHOULD WORK)
echo "=== Test 6: Create Prompt (SHOULD WORK - correct field name) ==="
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Create New API Route",
    "prompt_text": "Create a new API route following the project'\''s standard patterns.",
    "prompt_type": "development",
    "category": "api"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "Response (raw):"
echo ""

echo "=== Tests Complete ==="



