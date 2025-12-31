# Testing Comprehensive Analysis Endpoint

## Quick Test

### Option 1: Full Test Script (Recommended)
```bash
./test-comprehensive-analysis.sh
```

This script will:
1. Create a test repository
2. Create a test project
3. Test the comprehensive analysis endpoint with complete data structure
4. Show detailed results

### Option 2: Quick Curl Test
```bash
# With repository and project IDs
./test-analysis-curl.sh <REPO_ID> <PROJECT_ID> [API_KEY]

# Example:
./test-analysis-curl.sh abc123 def456
```

### Option 3: Manual Curl Command

```bash
curl -X POST "http://localhost:5656/api/repositories/YOUR_REPO_ID/analysis" \
  -H "X-API-Key: YOUR_API_KEY" \
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
    "repositoryId": "YOUR_REPO_ID",
    "projectId": "YOUR_PROJECT_ID",
    "analyzedAt": "2025-01-01T00:00:00.000Z"
  }'
```

## Environment Variables

Set these before running tests:

```bash
export EXTERNAL_API_URL="http://localhost:5656"
export MCP_SERVER_TOKEN="your-api-key-here"
# OR
export EXTERNAL_API_KEY="your-api-key-here"
```

## Expected Responses

### Success (201 Created)
```json
{
  "id": "analysis-id-here",
  "repositoryId": "repo-id",
  "projectId": "project-id",
  "analyzedAt": "2025-01-01T00:00:00.000Z",
  ...
}
```

### Endpoint Not Found (404)
If the endpoint doesn't exist yet, the tool will automatically fall back to including the comprehensive analysis in the documentation metadata.

### Authentication Error (401)
Make sure your API key is correct and set in environment variables.

## Test All Endpoints

Run the full test suite:
```bash
./test-api-endpoints.sh
```

This tests:
- Repository creation
- Project creation
- Documentation creation
- Markdown document creation
- Comprehensive analysis (NEW)
- Code snippet creation

## Data Structure

The comprehensive analysis includes:

- ✅ **Repository Info**: Name, branch, commit, git config
- ✅ **Folder Structure**: Complete tree with files and directories
- ✅ **Utility Functions**: Categorized utility and helper functions
- ✅ **All Functions**: Complete function registry with signatures
- ✅ **Coding Standards**: Naming conventions, file organization, import patterns
- ✅ **Architecture**: Layers and patterns with file associations
- ✅ **Linting**: ESLint, Prettier, Husky configurations
- ✅ **Dependencies**: Production, development, and peer dependencies
- ✅ **Entry Points**: Main entry files with types
- ✅ **Documentation**: README, CHANGELOG, LICENSE files

## Troubleshooting

### "API key not found"
Set `MCP_SERVER_TOKEN` or `EXTERNAL_API_KEY` environment variable.

### "Endpoint not found"
The endpoint `POST /api/repositories/{id}/analysis` may not exist yet. The tool will automatically fall back to including the data in documentation metadata.

### "Repository not found"
Create a repository first, or use the test script which creates one automatically.

### "Invalid JSON"
Make sure the JSON is properly formatted. Use `jq` to validate:
```bash
echo "$JSON_DATA" | jq .
```



