#!/bin/bash

# Quick curl test for comprehensive analysis endpoint
# Usage: ./test-analysis-curl.sh [REPO_ID] [PROJECT_ID] [API_KEY]

REPO_ID="${1:-test-repo-id}"
PROJECT_ID="${2:-test-project-id}"
API_KEY="${3:-${MCP_SERVER_TOKEN:-${EXTERNAL_API_KEY}}}"
API_URL="${EXTERNAL_API_URL:-http://localhost:5656}"

if [ -z "$API_KEY" ]; then
    echo "Error: API key required. Set MCP_SERVER_TOKEN or pass as 3rd argument"
    exit 1
fi

echo "Testing: POST ${API_URL}/api/repositories/${REPO_ID}/analysis"
echo "Repository ID: ${REPO_ID}"
echo "Project ID: ${PROJECT_ID}"
echo ""

curl -X POST "${API_URL}/api/repositories/${REPO_ID}/analysis" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "repository": {
      "name": "test-repo",
      "branch": "main",
      "commit": "abc123"
    },
    "folderStructure": {
      "name": "root",
      "type": "directory",
      "children": []
    },
    "utilityFunctions": [],
    "allFunctions": [],
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
        "patterns": []
      },
      "importPatterns": {
        "style": "named",
        "ordering": "alphabetical",
        "groups": []
      },
      "errorHandling": {
        "pattern": "try-catch",
        "errorClasses": []
      },
      "testing": {
        "patterns": [],
        "utilities": []
      }
    },
    "architecture": {
      "layers": [],
      "patterns": []
    },
    "linting": {},
    "dependencies": {
      "production": [],
      "development": [],
      "peer": []
    },
    "entryPoints": [],
    "documentation": [],
    "repositoryId": "'${REPO_ID}'",
    "projectId": "'${PROJECT_ID}'",
    "analyzedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }' | jq '.' 2>/dev/null || cat

echo ""



