#!/bin/bash

# Test script to verify all API endpoints used by analyzeAndSaveRepoTool
# This script tests the endpoints with proper curl commands

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${EXTERNAL_API_URL:-http://localhost:5656}"
API_KEY="${MCP_SERVER_TOKEN:-${EXTERNAL_API_KEY:-sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps}}"

if [ -z "$API_KEY" ]; then
    echo -e "${RED}Error: API key not found. Set MCP_SERVER_TOKEN or EXTERNAL_API_KEY${NC}"
    exit 1
fi

echo -e "${YELLOW}Testing API endpoints for analyzeAndSaveRepoTool${NC}"
echo -e "API URL: ${API_URL}"
echo -e "API Key: ${API_KEY:0:10}...${NC}\n"

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=${5:-200}
    
    echo -e "\n${YELLOW}Testing: ${name}${NC}"
    echo "Endpoint: ${method} ${endpoint}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}${endpoint}" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${API_URL}${endpoint}" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP ${http_code})"
        echo "Response: $(echo "$body" | head -c 200)..."
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP ${http_code}, expected ${expected_status})"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# 1. Test GET /api/repositories (search)
test_endpoint \
    "GET repositories (search)" \
    "GET" \
    "/api/repositories?search=test-repo" \
    "" \
    "200"

# 2. Test POST /api/repositories (create)
REPO_DATA='{
  "name": "test-repo-'$(date +%s)'",
  "description": "Test repository for API validation",
  "type": "individual"
}'
test_endpoint \
    "POST create repository" \
    "POST" \
    "/api/repositories" \
    "$REPO_DATA" \
    "201"

# Extract repo ID if created
REPO_RESPONSE=$(curl -s -X POST "${API_URL}/api/repositories" \
    -H "X-API-Key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"name":"temp-repo-'$(date +%s)'","type":"individual"}')
REPO_ID=$(echo "$REPO_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$REPO_ID" ]; then
    echo -e "${RED}Warning: Could not extract repository ID for further tests${NC}"
    REPO_ID="test-repo-id"
fi

# 3. Test GET /api/projects (search)
test_endpoint \
    "GET projects (search)" \
    "GET" \
    "/api/projects?search=test-project" \
    "" \
    "200"

# 4. Test POST /api/projects (create)
PROJECT_DATA='{
  "name": "test-project-'$(date +%s)'",
  "description": "Test project for API validation",
  "repositoryId": "'${REPO_ID}'"
}'
test_endpoint \
    "POST create project" \
    "POST" \
    "/api/projects" \
    "$PROJECT_DATA" \
    "201"

# Extract project ID if created
PROJECT_RESPONSE=$(curl -s -X POST "${API_URL}/api/projects" \
    -H "X-API-Key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"name":"temp-project-'$(date +%s)'","repositoryId":"'${REPO_ID}'"}')
PROJECT_ID=$(echo "$PROJECT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Warning: Could not extract project ID for further tests${NC}"
    PROJECT_ID="test-project-id"
fi

# 5. Test POST /api/documentations
DOC_DATA='{
  "title": "Test Repository - Codebase Analysis",
  "type": "overview",
  "category": "repository",
  "content": "# Test Documentation\n\nThis is a test documentation for API validation.",
  "metadata": {
    "repositoryName": "test-repo",
    "branch": "main",
    "commit": "abc123",
    "fileCount": 10,
    "repositoryId": "'${REPO_ID}'",
    "projectId": "'${PROJECT_ID}'"
  }
}'
test_endpoint \
    "POST create documentation" \
    "POST" \
    "/api/documentations" \
    "$DOC_DATA" \
    "201"

# 6. Test POST /api/markdown-documents
MARKDOWN_DATA='{
  "title": "Test Repository - Codebase Analysis",
  "document_type": "codebase-analysis",
  "category": "repository",
  "content": "# Test Markdown\n\nThis is a test markdown document.",
  "file_path": "/repositories/test-repo",
  "tags": ["codebase-analysis", "repository", "test-repo", "repo-'${REPO_ID}'", "project-'${PROJECT_ID}'"]
}'
test_endpoint \
    "POST create markdown document" \
    "POST" \
    "/api/markdown-documents" \
    "$MARKDOWN_DATA" \
    "201"

# 7. Test POST /api/repositories/{id}/analysis (Comprehensive Analysis)
ANALYSIS_DATA='{
  "repository": {
    "name": "test-repo",
    "remoteUrl": "https://github.com/user/test-repo",
    "branch": "main",
    "branches": ["main", "develop"],
    "defaultBranch": "main",
    "branchPattern": "main",
    "commit": "abc123def456",
    "rootPath": "/path/to/repo",
    "gitConfig": {
      "user": {
        "name": "Test User",
        "email": "test@example.com"
      }
    }
  },
  "folderStructure": {
    "name": "root",
    "path": "",
    "type": "directory",
    "children": [
      {
        "name": "src",
        "path": "src",
        "type": "directory",
        "children": [
          {
            "name": "index.ts",
            "path": "src/index.ts",
            "type": "file",
            "language": "typescript",
            "size": 1024
          }
        ]
      }
    ]
  },
  "utilityFunctions": [
    {
      "name": "formatDate",
      "filePath": "src/utils/date.ts",
      "lineNumber": 10,
      "signature": "formatDate(date: Date): string",
      "parameters": [
        {
          "name": "date",
          "type": "Date",
          "optional": false
        }
      ],
      "returnType": "string",
      "isAsync": false,
      "isExported": true,
      "visibility": "public",
      "documentation": "Formats a date to ISO string",
      "category": "utility"
    }
  ],
  "allFunctions": [
    {
      "name": "formatDate",
      "filePath": "src/utils/date.ts",
      "lineNumber": 10,
      "signature": "formatDate(date: Date): string",
      "parameters": [
        {
          "name": "date",
          "type": "Date",
          "optional": false
        }
      ],
      "returnType": "string",
      "isAsync": false,
      "isExported": true,
      "visibility": "public",
      "documentation": "Formats a date to ISO string",
      "category": "utility"
    }
  ],
  "codingStandards": {
    "namingConventions": {
      "variables": "camelCase",
      "functions": "camelCase",
      "classes": "PascalCase",
      "constants": "UPPER_SNAKE_CASE",
      "files": "kebab-case"
    },
    "fileOrganization": {
      "structure": "layer-based",
      "patterns": ["src/", "tests/"]
    },
    "importPatterns": {
      "style": "named",
      "ordering": "alphabetical",
      "groups": []
    },
    "errorHandling": {
      "pattern": "try-catch",
      "errorClasses": ["AppError", "ValidationError"]
    },
    "testing": {
      "framework": "jest",
      "patterns": ["describe", "it", "expect"],
      "utilities": []
    }
  },
  "architecture": {
    "layers": [
      {
        "name": "core",
        "path": "/src/core",
        "description": "Layer containing core-related code",
        "files": ["src/core/types.ts", "src/core/errors.ts"]
      }
    ],
    "patterns": [
      {
        "name": "Dependency Injection",
        "description": "Code pattern: Dependency Injection",
        "files": ["src/services/service.ts"]
      }
    ]
  },
  "linting": {
    "eslint": {
      "configFile": ".eslintrc.json",
      "config": {},
      "version": "^8.0.0"
    },
    "prettier": {
      "configFile": ".prettierrc",
      "config": {},
      "version": "^2.0.0"
    }
  },
  "dependencies": {
    "production": [
      {
        "name": "express",
        "version": "^4.18.0"
      }
    ],
    "development": [
      {
        "name": "typescript",
        "version": "^5.0.0"
      }
    ],
    "peer": []
  },
  "entryPoints": [
    {
      "path": "src/index.ts",
      "type": "main",
      "description": "Entry point: src/index.ts"
    }
  ],
  "documentation": [
    {
      "filename": "README.md",
      "content": "# Test Repository\n\nThis is a test repository.",
      "type": "readme"
    }
  ],
  "repositoryId": "'${REPO_ID}'",
  "projectId": "'${PROJECT_ID}'",
  "analyzedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
}'
test_endpoint \
    "POST comprehensive analysis" \
    "POST" \
    "/api/repositories/${REPO_ID}/analysis" \
    "$ANALYSIS_DATA" \
    "201"

# 8. Test POST /api/snippets (code snippets)
SNIPPET_DATA='{
  "title": "Test Repo - test-file.ts",
  "code": "export function test() { return true; }",
  "language": "typescript",
  "description": "Test code snippet",
  "tags": ["test-repo", "test-file.ts", "project-'${PROJECT_ID}'", "repo-'${REPO_ID}'"],
  "projectId": "'${PROJECT_ID}'",
  "repositoryId": "'${REPO_ID}'"
}'
test_endpoint \
    "POST create code snippet" \
    "POST" \
    "/api/snippets" \
    "$SNIPPET_DATA" \
    "201"

# Summary
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo -e "${YELLOW}========================================${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All API endpoints are working correctly!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some API endpoints failed. Please check the errors above.${NC}"
    exit 1
fi

