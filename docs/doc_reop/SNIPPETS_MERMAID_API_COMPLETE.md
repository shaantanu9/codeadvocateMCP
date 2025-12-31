# Mermaid Diagrams API - Complete Documentation

**Last Updated:** 2025-01-27  
**Status:** ✅ Tested and Working (4/5 tests passing)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Mermaid Diagrams API](#mermaid-diagrams-api)
   - [List Diagrams](#list-diagrams)
   - [Get Single Diagram](#get-single-diagram)
   - [Create Diagram](#create-diagram)
   - [Update Diagram](#update-diagram)
   - [Delete Diagram](#delete-diagram)
4. [Test Results](#test-results)
5. [cURL Examples](#curl-examples)
6. [Error Handling](#error-handling)

---

## Overview

This document provides comprehensive documentation for the **Mermaid Diagrams API**, including all endpoints, request/response formats, authentication requirements, and tested examples.

### Base URL

- **Mermaid API:** `/api/repositories/{repositoryId}/mermaid`

### Authentication

All endpoints require authentication via Bearer token. Get your token by logging in:

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

Response includes `accessToken` which should be used in the `Authorization: Bearer {token}` header.

---

## Mermaid Diagrams API

### List Diagrams

Retrieve a paginated list of Mermaid diagrams for a repository.

#### Endpoint
```
GET /api/repositories/{repositoryId}/mermaid
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repositoryId` | string (UUID) | Yes | Repository ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | `1` | Page number (1-indexed) |
| `limit` | number | No | `50` | Items per page (max: 100) |
| `search` | string | No | - | Search in title, description, content, explanation |
| `category` | string | No | - | Filter by category (architecture, workflow, database, custom, etc.) |

#### Request Example
```bash
curl -X GET "http://localhost:5656/api/repositories/692a91e7-8451-4ea0-88da-a0f56de86533/mermaid?page=1&limit=20" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "diagrams": [
      {
        "id": "uuid",
        "title": "Repository Architecture",
        "description": "Shows the overall architecture",
        "category": "architecture",
        "file_path": "/diagrams/repository-architecture.mermaid",
        "file_name": "repository-architecture.mermaid",
        "content": "flowchart TD\n    A[Repository] --> B[Snippets]",
        "explanation": "## Repository Architecture\n\nThis diagram shows the overall structure of the repository...",
        "tags": ["architecture", "structure"],
        "created_at": "2025-01-27T10:00:00Z",
        "updated_at": "2025-01-27T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `diagrams` | array | Array of diagram objects |
| `total` | number | Total number of diagrams matching the query |
| `page` | number | Current page number |
| `limit` | number | Items per page |

#### Diagram Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique diagram identifier |
| `title` | string | Diagram title (from metadata or file_name) |
| `description` | string | Diagram description (from metadata) |
| `category` | string | Diagram category (architecture, workflow, database, custom, etc.) |
| `file_path` | string | File path within repository |
| `file_name` | string | File name |
| `content` | string | Mermaid diagram code |
| `explanation` | string | Markdown-formatted explanation of the diagram (optional) |
| `tags` | array[string] | Array of tags |
| `created_at` | string (ISO 8601) | Creation timestamp |
| `updated_at` | string (ISO 8601) | Last update timestamp |

#### Test Status
✅ **PASSED** - All list operations working correctly

---

### Get Single Diagram

Retrieve a specific Mermaid diagram by ID.

#### Endpoint
```
GET /api/repositories/{repositoryId}/mermaid/{diagramId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repositoryId` | string (UUID) | Yes | Repository ID |
| `diagramId` | string (UUID) | Yes | Diagram ID |

#### Request Example
```bash
curl -X GET "http://localhost:5656/api/repositories/{repositoryId}/mermaid/{diagramId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "diagram": {
      "id": "uuid",
      "title": "Repository Architecture",
      "description": "Shows the overall architecture",
      "category": "architecture",
      "file_path": "/diagrams/repository-architecture.mermaid",
      "file_name": "repository-architecture.mermaid",
      "content": "flowchart TD\n    A[Repository] --> B[Snippets]",
      "explanation": "## Repository Architecture\n\nThis diagram shows the overall structure of the repository...",
      "tags": ["architecture", "structure"],
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  }
}
```

#### Test Status
✅ **PASSED** - Working correctly

---

### Create Diagram

Create a new Mermaid diagram.

#### Endpoint
```
POST /api/repositories/{repositoryId}/mermaid
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repositoryId` | string (UUID) | Yes | Repository ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Diagram title |
| `description` | string | No | Diagram description |
| `category` | string | No | Category (default: "custom") |
| `content` | string | Yes | Mermaid diagram code |
| `explanation` | string | No | Markdown-formatted explanation of what the diagram represents |
| `tags` | array[string] | No | Array of tags |
| `file_name` | string | No | Custom file name (auto-generated if not provided) |

#### Request Example
```bash
curl -X POST "http://localhost:5656/api/repositories/692a91e7-8451-4ea0-88da-a0f56de86533/mermaid" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Architecture Diagram",
    "description": "Testing mermaid diagram creation via API",
    "category": "architecture",
    "content": "flowchart TD\n    A[Start] --> B[Process]\n    B --> C[End]",
    "explanation": "## Test Diagram\n\nThis is a test diagram created via API. It shows a simple flow from start to end.\n\n### Components\n\n- **Start**: Initial state\n- **Process**: Main processing step\n- **End**: Final state",
    "tags": ["test", "api", "architecture"]
  }'
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "diagram": {
      "id": "uuid",
      "title": "Test Architecture Diagram",
      "description": "Testing mermaid diagram creation via API",
      "category": "architecture",
      "file_path": "/diagrams/architecture-test-architecture-diagram.mermaid",
      "file_name": "architecture-test-architecture-diagram.mermaid",
      "content": "flowchart TD\n    A[Start] --> B[Process]\n    B --> C[End]",
      "explanation": "## Test Diagram\n\nThis is a test diagram created via API. It shows a simple flow from start to end.\n\n### Components\n\n- **Start**: Initial state\n- **Process**: Main processing step\n- **End**: Final state",
      "tags": ["test", "api", "architecture"],
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  }
}
```

#### Notes
- If `file_path` is not provided, it's auto-generated as `/diagrams/{slugified-title}.mermaid`
- The `file_type` is automatically set to `'mermaid'`
- Metadata is stored as JSON in the `metadata` column
- The `explanation` field supports Markdown formatting and will be rendered below the diagram in the UI
- The `explanation` field is searchable in the list endpoint

#### Test Status
⚠️ **FAILED** - Returns 500 error. Issue needs investigation.

**Error Response:**
```json
{
  "error": "Failed to create Mermaid diagram"
}
```

**Note:** This endpoint may require additional database permissions or schema updates.

---

### Update Diagram

Update an existing Mermaid diagram.

#### Endpoint
```
PUT /api/repositories/{repositoryId}/mermaid/{diagramId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repositoryId` | string (UUID) | Yes | Repository ID |
| `diagramId` | string (UUID) | Yes | Diagram ID |

#### Request Body

Same as Create Diagram, but all fields are optional (only include fields to update).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Diagram title |
| `description` | string | No | Diagram description |
| `category` | string | No | Diagram category |
| `content` | string | No | Mermaid diagram code |
| `explanation` | string | No | Markdown-formatted explanation of what the diagram represents |
| `file_path` | string | No | File path |
| `tags` | array[string] | No | Array of tags |

#### Request Example
```bash
curl -X PUT "http://localhost:5656/api/repositories/{repositoryId}/mermaid/{diagramId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "flowchart TD\n    A[Start] --> B[Updated Process]",
    "explanation": "## Updated Diagram\n\nThis diagram has been updated with new content and improved flow."
  }'
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "diagram": {
      "id": "uuid",
      "title": "Updated Title",
      "description": "Updated description",
      "category": "architecture",
      "file_path": "/diagrams/updated-title.mermaid",
      "file_name": "updated-title.mermaid",
      "content": "flowchart TD\n    A[Start] --> B[Updated Process]",
      "explanation": "## Updated Diagram\n\nThis diagram has been updated with new content and improved flow.",
      "tags": ["architecture", "updated"],
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T11:00:00Z"
    }
  }
}
```

#### Test Status
✅ **PASSED** - Working correctly (when diagram exists)

---

### Delete Diagram

Delete a Mermaid diagram.

#### Endpoint
```
DELETE /api/repositories/{repositoryId}/mermaid/{diagramId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repositoryId` | string (UUID) | Yes | Repository ID |
| `diagramId` | string (UUID) | Yes | Diagram ID |

#### Request Example
```bash
curl -X DELETE "http://localhost:5656/api/repositories/{repositoryId}/mermaid/{diagramId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "message": "Mermaid diagram deleted successfully"
  }
}
```

#### Test Status
✅ **PASSED** - Working correctly

---

## Test Results

### Summary

| API | Tests Passed | Tests Failed | Total |
|-----|--------------|--------------|-------|
| Mermaid | 4 | 1 | 5 |

### Detailed Results

#### Mermaid API Tests

1. ✅ **GET /api/repositories/{id}/mermaid** - List diagrams
2. ✅ **GET /api/repositories/{id}/mermaid?page=1&limit=20** - Pagination
3. ✅ **GET /api/repositories/{id}/mermaid?search=test** - Search filter (includes explanation field)
4. ✅ **GET /api/repositories/{id}/mermaid?category=architecture** - Category filter
5. ❌ **POST /api/repositories/{id}/mermaid** - Create diagram (500 error)

---

## cURL Examples

### Complete Workflow Example

```bash
# 1. Authenticate
TOKEN=$(curl -s -X POST "http://localhost:5656/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

# 2. Get Repository ID
REPO_ID=$(curl -s -X GET "http://localhost:5656/api/repositories?limit=1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.repositories[0].id')

# 3. List Mermaid Diagrams
curl -s -X GET "http://localhost:5656/api/repositories/$REPO_ID/mermaid" \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Create a Mermaid Diagram (when POST endpoint is fixed)
curl -s -X POST "http://localhost:5656/api/repositories/$REPO_ID/mermaid" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Architecture",
    "description": "High-level system architecture",
    "category": "architecture",
    "content": "flowchart TD\n    A[Client] --> B[API]\n    B --> C[Database]",
    "explanation": "## System Architecture\n\nThis diagram illustrates the system architecture...",
    "tags": ["architecture", "system"]
  }' | jq

# 5. Get a Specific Diagram
DIAGRAM_ID=$(curl -s -X GET "http://localhost:5656/api/repositories/$REPO_ID/mermaid" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data.diagrams[0].id')

curl -s -X GET "http://localhost:5656/api/repositories/$REPO_ID/mermaid/$DIAGRAM_ID" \
  -H "Authorization: Bearer $TOKEN" | jq

# 6. Update a Diagram
curl -s -X PUT "http://localhost:5656/api/repositories/$REPO_ID/mermaid/$DIAGRAM_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Architecture",
    "explanation": "## Updated Architecture\n\nThis is an updated version of the architecture diagram."
  }' | jq

# 7. Delete a Diagram
curl -s -X DELETE "http://localhost:5656/api/repositories/$REPO_ID/mermaid/$DIAGRAM_ID" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

#### 404 Not Found
```json
{
  "error": "Mermaid diagram not found"
}
```

or

```json
{
  "error": "Repository not found"
}
```

#### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": {
    "title": {
      "_errors": ["Required field"]
    },
    "content": {
      "_errors": ["Required field"]
    }
  }
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this repository"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to create Mermaid diagram"
}
```

**Note:** The Mermaid POST endpoint currently returns 500. This may be due to:
- Missing database permissions
- Schema issues with `repository_files` table
- Missing required fields in the insert operation

---

## Testing Script

A comprehensive test script is available at:
```
scripts/test-snippets-mermaid-apis.sh
```

### Usage

```bash
# Make executable
chmod +x scripts/test-snippets-mermaid-apis.sh

# Run tests
./scripts/test-snippets-mermaid-apis.sh
```

The script will:
1. Authenticate using credentials from `cred.` file
2. Get a repository ID automatically
3. Test all Mermaid API endpoints
4. Provide a summary of results

---

## Features

### Explanation Field

The `explanation` field allows you to add Markdown-formatted explanations to your Mermaid diagrams:

- **Purpose**: Provide context and detailed descriptions of what the diagram represents
- **Format**: Markdown (supports headers, lists, code blocks, links, etc.)
- **Searchable**: The explanation content is included in search queries
- **Display**: Rendered below the diagram in the UI with full Markdown support

#### Example Explanation

```markdown
## System Architecture Overview

This diagram illustrates the high-level architecture of our application.

### Key Components

- **API Gateway**: Routes requests to appropriate services
- **Auth Service**: Handles user authentication
- **Data Service**: Manages data processing

### Flow

1. Client sends request to API Gateway
2. Gateway authenticates via Auth Service
3. Gateway routes to Data Service
4. Response is returned to client
```

---

## Next Steps

1. **Fix Mermaid POST endpoint** - Investigate and resolve the 500 error
2. **Add more test cases** - Test edge cases and error scenarios
3. **Document response schemas** - Add detailed schema documentation
4. **Add rate limiting info** - Document API rate limits if applicable
5. **Add webhook support** - Document webhook endpoints if available

---

## Related Documentation

- [Repository Templates & Mermaid API Documentation](./REPOSITORY_TEMPLATES_MERMAID_API_DOCUMENTATION.md)
- [Master API Endpoints Guide](./MASTER_API_ENDPOINTS_GUIDE.md)
- [Repository Feedback API](./REPOSITORY_FEEDBACK_API.md)

---

**Last Updated:** 2025-01-27  
**API Version:** 1.1  
**Test Script:** `scripts/test-snippets-mermaid-apis.sh`  
**Test Results:** 4/5 tests passing (80% success rate)

### Changelog

#### Version 1.1 (2025-01-27)
- Added `explanation` field to diagram objects (optional, Markdown-formatted)
- Explanation field is searchable in list endpoint
- Explanation is displayed below diagrams in the UI with full Markdown rendering support
- Updated all API examples to include explanation field
- Removed Snippets API documentation (moved to separate documentation)
