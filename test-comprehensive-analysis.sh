#!/bin/bash

# Test script for Comprehensive Analysis Endpoint
# Tests POST /api/repositories/{id}/analysis

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${EXTERNAL_API_URL:-http://localhost:5656}"
API_KEY="${MCP_SERVER_TOKEN:-${EXTERNAL_API_KEY}}"

if [ -z "$API_KEY" ]; then
    echo -e "${RED}Error: API key not found. Set MCP_SERVER_TOKEN or EXTERNAL_API_KEY${NC}"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Comprehensive Analysis Endpoint${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "API URL: ${API_URL}"
echo -e "API Key: ${API_KEY:0:10}...${NC}\n"

# Step 1: Create a test repository
echo -e "${YELLOW}Step 1: Creating test repository...${NC}"
REPO_RESPONSE=$(curl -s -X POST "${API_URL}/api/repositories" \
    -H "X-API-Key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "test-repo-analysis-'$(date +%s)'",
      "description": "Test repository for comprehensive analysis",
      "type": "individual"
    }')

REPO_ID=$(echo "$REPO_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$REPO_ID" ]; then
    echo -e "${RED}✗ Failed to create repository${NC}"
    echo "Response: $REPO_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Repository created: ${REPO_ID}${NC}\n"

# Step 2: Create a test project
echo -e "${YELLOW}Step 2: Creating test project...${NC}"
PROJECT_RESPONSE=$(curl -s -X POST "${API_URL}/api/projects" \
    -H "X-API-Key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "test-project-analysis-'$(date +%s)'",
      "description": "Test project for comprehensive analysis",
      "repositoryId": "'${REPO_ID}'"
    }')

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}✗ Failed to create project${NC}"
    echo "Response: $PROJECT_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Project created: ${PROJECT_ID}${NC}\n"

# Step 3: Test comprehensive analysis endpoint
echo -e "${YELLOW}Step 3: Testing POST /api/repositories/${REPO_ID}/analysis${NC}"

ANALYSIS_DATA=$(cat <<EOF
{
  "repository": {
    "name": "test-repo",
    "remoteUrl": "https://github.com/user/test-repo",
    "branch": "main",
    "branches": ["main", "develop", "feature/test"],
    "defaultBranch": "main",
    "branchPattern": "main",
    "commit": "abc123def456789",
    "rootPath": "/path/to/repo",
    "gitConfig": {
      "user": {
        "name": "Test User",
        "email": "test@example.com"
      },
      "init": {
        "defaultBranch": "main"
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
            "name": "utils",
            "path": "src/utils",
            "type": "directory",
            "children": [
              {
                "name": "date.ts",
                "path": "src/utils/date.ts",
                "type": "file",
                "language": "typescript",
                "size": 1024
              }
            ]
          },
          {
            "name": "index.ts",
            "path": "src/index.ts",
            "type": "file",
            "language": "typescript",
            "size": 2048
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
      "documentation": "Formats a date to ISO string format",
      "category": "utility"
    },
    {
      "name": "parseDate",
      "filePath": "src/utils/date.ts",
      "lineNumber": 25,
      "signature": "parseDate(dateString: string): Date",
      "parameters": [
        {
          "name": "dateString",
          "type": "string",
          "optional": false
        }
      ],
      "returnType": "Date",
      "isAsync": false,
      "isExported": true,
      "visibility": "public",
      "documentation": "Parses a date string to Date object",
      "category": "helper"
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
      "documentation": "Formats a date to ISO string format",
      "category": "utility"
    },
    {
      "name": "parseDate",
      "filePath": "src/utils/date.ts",
      "lineNumber": 25,
      "signature": "parseDate(dateString: string): Date",
      "parameters": [
        {
          "name": "dateString",
          "type": "string",
          "optional": false
        }
      ],
      "returnType": "Date",
      "isAsync": false,
      "isExported": true,
      "visibility": "public",
      "documentation": "Parses a date string to Date object",
      "category": "helper"
    },
    {
      "name": "execute",
      "filePath": "src/handlers/main.ts",
      "lineNumber": 5,
      "signature": "async execute(params: Params): Promise<Result>",
      "parameters": [
        {
          "name": "params",
          "type": "Params",
          "optional": false
        }
      ],
      "returnType": "Promise<Result>",
      "isAsync": true,
      "isExported": true,
      "visibility": "public",
      "category": "handler"
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
      "patterns": ["src/", "tests/", "docs/"]
    },
    "importPatterns": {
      "style": "named",
      "ordering": "alphabetical",
      "groups": ["external", "internal", "types"]
    },
    "errorHandling": {
      "pattern": "try-catch",
      "errorClasses": ["AppError", "ValidationError", "NotFoundError"]
    },
    "testing": {
      "framework": "jest",
      "patterns": ["describe", "it", "expect", "beforeEach"],
      "utilities": ["testUtils", "mockData"]
    }
  },
  "architecture": {
    "layers": [
      {
        "name": "core",
        "path": "/src/core",
        "description": "Layer containing core-related code",
        "files": ["src/core/types.ts", "src/core/errors.ts", "src/core/logger.ts"]
      },
      {
        "name": "utils",
        "path": "/src/utils",
        "description": "Layer containing utility functions",
        "files": ["src/utils/date.ts", "src/utils/format.ts"]
      }
    ],
    "patterns": [
      {
        "name": "Dependency Injection",
        "description": "Code pattern: Dependency Injection",
        "files": ["src/services/service.ts", "src/handlers/handler.ts"]
      },
      {
        "name": "Factory Pattern",
        "description": "Code pattern: Factory Pattern",
        "files": ["src/factories/factory.ts"]
      }
    ]
  },
  "linting": {
    "eslint": {
      "configFile": ".eslintrc.json",
      "config": {
        "extends": ["eslint:recommended"],
        "rules": {
          "no-console": "warn"
        }
      },
      "version": "^8.0.0"
    },
    "prettier": {
      "configFile": ".prettierrc",
      "config": {
        "semi": true,
        "singleQuote": false
      },
      "version": "^2.0.0"
    },
    "husky": {
      "hooks": ["pre-commit", "pre-push"],
      "version": "^8.0.0"
    }
  },
  "dependencies": {
    "production": [
      {
        "name": "express",
        "version": "^4.18.0"
      },
      {
        "name": "zod",
        "version": "^3.22.0"
      }
    ],
    "development": [
      {
        "name": "typescript",
        "version": "^5.0.0"
      },
      {
        "name": "@types/node",
        "version": "^20.0.0"
      },
      {
        "name": "jest",
        "version": "^29.0.0"
      }
    ],
    "peer": []
  },
  "entryPoints": [
    {
      "path": "src/index.ts",
      "type": "main",
      "description": "Entry point: src/index.ts"
    },
    {
      "path": "src/server.ts",
      "type": "main",
      "description": "Entry point: src/server.ts"
    }
  ],
  "documentation": [
    {
      "filename": "README.md",
      "content": "# Test Repository\n\nThis is a test repository for comprehensive analysis.",
      "type": "readme"
    },
    {
      "filename": "CHANGELOG.md",
      "content": "# Changelog\n\n## 1.0.0\n- Initial release",
      "type": "changelog"
    }
  ],
  "repositoryId": "${REPO_ID}",
  "projectId": "${PROJECT_ID}",
  "analyzedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/repositories/${REPO_ID}/analysis" \
    -H "X-API-Key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$ANALYSIS_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "HTTP Status: ${HTTP_CODE}"
echo -e "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "\n${GREEN}✓ Comprehensive analysis saved successfully!${NC}"
    
    # Extract analysis ID if available
    ANALYSIS_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$ANALYSIS_ID" ]; then
        echo -e "${GREEN}Analysis ID: ${ANALYSIS_ID}${NC}"
    fi
    
    echo -e "\n${BLUE}Summary:${NC}"
    echo -e "  Repository ID: ${REPO_ID}"
    echo -e "  Project ID: ${PROJECT_ID}"
    echo -e "  Utility Functions: 2"
    echo -e "  Total Functions: 3"
    echo -e "  Coding Standards: ✅"
    echo -e "  Folder Structure: ✅"
    echo -e "  Architecture Layers: 2"
    echo -e "  Architecture Patterns: 2"
    exit 0
else
    echo -e "\n${RED}✗ Failed to save comprehensive analysis${NC}"
    echo -e "${YELLOW}Note: If endpoint doesn't exist, the tool will fall back to including analysis in documentation metadata.${NC}"
    exit 1
fi



