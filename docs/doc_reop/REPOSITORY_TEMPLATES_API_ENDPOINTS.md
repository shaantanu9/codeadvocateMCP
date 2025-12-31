# Repository Templates API - Complete Endpoints Documentation

**Last Updated:** 2025-01-27  
**Status:** ✅ Complete  
**API Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Templates API Endpoints](#templates-api-endpoints)
   - [List Templates](#list-templates)
   - [Create Template](#create-template)
   - [Get Template](#get-template)
   - [Update Template](#update-template)
   - [Delete Template](#delete-template)
4. [Template Object Structure](#template-object-structure)
5. [Query Parameters & Filters](#query-parameters--filters)
6. [Error Handling](#error-handling)
7. [Examples](#examples)
8. [Notes & Best Practices](#notes--best-practices)

---

## Overview

Templates in repositories are **snippets with the `'template'` tag**. They provide reusable code templates that can be quickly accessed and used when creating new snippets.

### Base URLs

- **Templates Collection:** `/api/repositories/{repositoryId}/templates`
- **Individual Template (via Snippets API):** `/api/snippets/{templateId}`

### Key Concepts

- Templates are stored as snippets in the `snippets` table
- Templates are identified by having `'template'` in their `tags` array
- Templates belong to a specific repository via `repository_id`
- Templates can be created, read, updated, and deleted
- Templates support search, filtering, and pagination

---

## Authentication

All endpoints require authentication via one of the following methods:

### Method 1: Bearer Token (User Authentication)
```bash
Authorization: Bearer {accessToken}
```

Get your token by logging in:
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Method 2: API Key
```bash
Authorization: Bearer {apiKey}
```

API keys must have appropriate scopes:
- `snippets:read` - For GET operations
- `snippets:write` - For POST/PUT operations
- `snippets:delete` - For DELETE operations

---

## Templates API Endpoints

### List Templates

Retrieve a paginated list of templates for a repository.

#### Endpoint
```
GET /api/repositories/{repositoryId}/templates
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repositoryId` | string (UUID) | Yes | Repository ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | `1` | Page number (1-indexed) |
| `limit` | number | No | `20` | Items per page (max: 100) |
| `search` | string | No | - | Search in title, description, and code |
| `language` | string | No | - | Filter by programming language (e.g., `typescript`, `javascript`, `python`) |

#### Request Example
```bash
# Get first page with default limit
curl -X GET "http://localhost:5656/api/repositories/6d10718d-4333-4ae9-91bb-6d35cee124ea/templates" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Get page 2 with 50 items per page
curl -X GET "http://localhost:5656/api/repositories/6d10718d-4333-4ae9-91bb-6d35cee124ea/templates?page=2&limit=50" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Search for React templates
curl -X GET "http://localhost:5656/api/repositories/6d10718d-4333-4ae9-91bb-6d35cee124ea/templates?search=react&language=typescript" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "title": "React Component Template",
        "description": "A reusable React component template",
        "code": "import React from 'react';\n\nexport const Component = () => {\n  return <div>Hello</div>;\n};",
        "language": "typescript",
        "tags": ["template", "react", "component"],
        "repository_id": "uuid",
        "user_id": "uuid",
        "is_favorite": false,
        "is_public": false,
        "is_archived": false,
        "created_at": "2025-01-27T10:00:00Z",
        "updated_at": "2025-01-27T10:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `templates` | array | Array of template objects (snippets with 'template' tag) |
| `total` | number | Total number of templates matching the query |
| `page` | number | Current page number |
| `limit` | number | Items per page |

#### Notes
- Only returns snippets that have `'template'` in their `tags` array
- Excludes archived snippets (`is_archived = false`)
- Excludes deleted snippets (`deleted_at IS NULL`)
- Results are ordered by `updated_at` descending (newest first)
- Search is case-insensitive and matches in `title`, `description`, and `code` fields

---

### Create Template

Create a new template from scratch or convert an existing snippet to a template.

#### Endpoint
```
POST /api/repositories/{repositoryId}/templates
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repositoryId` | string (UUID) | Yes | Repository ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Template title |
| `description` | string | No | Template description |
| `code` | string | Yes | Template code content |
| `language` | string | Yes | Programming language (e.g., `typescript`, `javascript`, `python`) |
| `tags` | array[string] | No | Additional tags (besides 'template' which is auto-added) |
| `snippetId` | string (UUID) | No | ID of existing snippet to convert to template |

#### Request Example

**Create New Template:**
```bash
curl -X POST "http://localhost:5656/api/repositories/6d10718d-4333-4ae9-91bb-6d35cee124ea/templates" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Hook Template",
    "description": "A custom React hook template with TypeScript",
    "code": "import { useState, useEffect } from \"react\";\n\nexport const useCustomHook = () => {\n  const [state, setState] = useState(null);\n  useEffect(() => {\n    // Hook logic here\n  }, []);\n  return { state, setState };\n};",
    "language": "typescript",
    "tags": ["react", "hook", "custom"]
  }'
```

**Convert Existing Snippet to Template:**
```bash
curl -X POST "http://localhost:5656/api/repositories/6d10718d-4333-4ae9-91bb-6d35cee124ea/templates" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Template Title",
    "snippetId": "existing-snippet-uuid"
  }'
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid",
      "title": "React Hook Template",
      "description": "A custom React hook template with TypeScript",
      "code": "import { useState, useEffect } from \"react\";\n\nexport const useCustomHook = () => {\n  const [state, setState] = useState(null);\n  useEffect(() => {\n    // Hook logic here\n  }, []);\n  return { state, setState };\n};",
      "language": "typescript",
      "tags": ["template", "react", "hook", "custom"],
      "repository_id": "uuid",
      "user_id": "uuid",
      "is_favorite": false,
      "is_public": false,
      "is_archived": false,
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  }
}
```

#### Notes
- The `'template'` tag is **automatically added** to the tags array
- If `snippetId` is provided, the template is created by copying the snippet data
- If `snippetId` is not provided, a new snippet is created with the provided data
- Requires `write` permission on the repository
- Returns HTTP 201 (Created) on success

---

### Get Template

Retrieve a single template by ID. Uses the Snippets API since templates are snippets.

#### Endpoint
```
GET /api/snippets/{templateId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | string (UUID) | Yes | Template ID (snippet ID) |

#### Request Example
```bash
curl -X GET "http://localhost:5656/api/snippets/bd0d1a31-20f2-47a9-bd50-bef476c48445" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

#### Response Format
```json
{
  "id": "uuid",
  "title": "React Component Template",
  "description": "A reusable React component template",
  "language": "typescript",
  "code": "import React from 'react';\n\nexport const Component = () => {\n  return <div>Hello</div>;\n};",
  "tags": ["template", "react", "component"],
  "projectId": null,
  "projectName": null,
  "repositoryId": "uuid",
  "repositoryName": "My Repository",
  "collectionId": null,
  "collectionName": null,
  "isFavorite": false,
  "isPublic": false,
  "createdAt": "2025-01-27T10:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z",
  "author": {
    "id": "uuid",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg"
  },
  "repositoryContext": {
    "filePath": "/src/components/Component.tsx",
    "lineStart": 1,
    "lineEnd": 10,
    "branch": "main",
    "commit": "abc123",
    "metadata": {}
  }
}
```

#### Notes
- User can only access their own templates or public templates
- Returns 403 Forbidden if template is private and user is not the owner
- Returns 404 Not Found if template doesn't exist

---

### Update Template

Update an existing template. Uses the Snippets API since templates are snippets.

#### Endpoint
```
PUT /api/snippets/{templateId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | string (UUID) | Yes | Template ID (snippet ID) |

#### Request Body

All fields are optional. Only include fields you want to update.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Template title |
| `description` | string | No | Template description |
| `code` | string | No | Template code content |
| `language` | string | No | Programming language |
| `tags` | array[string] | No | Tags array (must include 'template' to remain a template) |
| `projectId` | string (UUID) | No | Project ID (optional) |
| `repositoryId` | string (UUID) | No | Repository ID (optional) |
| `collectionId` | string (UUID) | No | Collection ID (optional) |
| `isPublic` | boolean | No | Whether template is public |

#### Request Example
```bash
curl -X PUT "http://localhost:5656/api/snippets/bd0d1a31-20f2-47a9-bd50-bef476c48445" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated React Component Template",
    "code": "import React from 'react';\n\nexport const UpdatedComponent = () => {\n  return <div>Updated</div>;\n};",
    "tags": ["template", "react", "component", "updated"]
  }'
```

#### Response Format
```json
{
  "id": "uuid",
  "title": "Updated React Component Template",
  "description": "A reusable React component template",
  "language": "typescript",
  "code": "import React from 'react';\n\nexport const UpdatedComponent = () => {\n  return <div>Updated</div>;\n};",
  "tags": ["template", "react", "component", "updated"],
  "repositoryId": "uuid",
  "isFavorite": false,
  "isPublic": false,
  "createdAt": "2025-01-27T10:00:00Z",
  "updatedAt": "2025-01-27T11:00:00Z",
  "author": {
    "id": "uuid",
    "name": "John Doe"
  }
}
```

#### Notes
- User must own the template to update it
- Returns 403 Forbidden if user is not the owner
- Returns 404 Not Found if template doesn't exist
- **Important:** If updating `tags`, make sure to include `'template'` in the array, otherwise it will no longer be recognized as a template

---

### Delete Template

Delete a template permanently. Uses the Snippets API since templates are snippets.

#### Endpoint
```
DELETE /api/snippets/{templateId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | string (UUID) | Yes | Template ID (snippet ID) |

#### Request Example
```bash
curl -X DELETE "http://localhost:5656/api/snippets/bd0d1a31-20f2-47a9-bd50-bef476c48445" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

#### Response Format
```json
{
  "success": true
}
```

#### Notes
- User must own the template to delete it
- Returns 403 Forbidden if user is not the owner
- Returns 404 Not Found if template doesn't exist
- **Permanent deletion** - cannot be undone
- Template is immediately removed from the repository

---

## Template Object Structure

### Full Template Object

Templates are snippets with the `'template'` tag. Here's the complete structure:

```typescript
interface Template {
  // Core fields
  id: string                    // UUID
  title: string                 // Template title
  description?: string          // Template description
  code: string                  // Template code content
  language: string               // Programming language
  
  // Tags and metadata
  tags: string[]                // Must include 'template'
  
  // Relationships
  repository_id: string         // Repository UUID
  user_id: string              // Creator UUID
  project_id?: string           // Optional project UUID
  collection_id?: string        // Optional collection UUID
  
  // Flags
  is_favorite: boolean          // Whether marked as favorite
  is_public: boolean           // Whether template is public
  is_archived: boolean         // Whether template is archived
  
  // Repository context (optional)
  repo_file_path?: string       // File path in repository
  repo_line_start?: number     // Starting line number
  repo_line_end?: number       // Ending line number
  repo_branch?: string         // Branch name
  repo_commit?: string         // Commit hash
  repo_context?: object        // Additional metadata
  
  // Timestamps
  created_at: string           // ISO 8601 timestamp
  updated_at: string           // ISO 8601 timestamp
  deleted_at?: string          // Soft delete timestamp (null if not deleted)
}
```

### Required Fields for Template Creation

- `title` - Template title
- `code` - Template code content
- `language` - Programming language

### Auto-Added Fields

- `tags` - Automatically includes `'template'` tag
- `repository_id` - Set from URL parameter
- `user_id` - Set from authenticated user
- `is_favorite` - Defaults to `false`
- `is_public` - Defaults to `false`
- `is_archived` - Defaults to `false`
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

---

## Query Parameters & Filters

### Search

The `search` parameter performs case-insensitive full-text search across:
- `title`
- `description`
- `code`

**Example:**
```bash
GET /api/repositories/{id}/templates?search=react
```

### Language Filter

Filter templates by programming language.

**Example:**
```bash
GET /api/repositories/{id}/templates?language=typescript
```

**Supported Languages:**
- `typescript`
- `javascript`
- `python`
- `java`
- `csharp`
- `php`
- `go`
- `ruby`
- `rust`
- `swift`
- And many more...

### Pagination

Control the number of results and page navigation.

**Parameters:**
- `page` - Page number (1-indexed, default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Example:**
```bash
GET /api/repositories/{id}/templates?page=2&limit=50
```

### Combined Filters

You can combine multiple filters:

```bash
GET /api/repositories/{id}/templates?search=hook&language=typescript&page=1&limit=20
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Title, code, and language are required"
}
```

**Causes:**
- Missing required fields in POST request
- Invalid data format

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**Causes:**
- Missing or invalid Bearer token
- Expired token
- Invalid API key

#### 403 Forbidden
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

**Causes:**
- User doesn't have read/write access to repository
- User trying to update/delete template they don't own

#### 404 Not Found
```json
{
  "error": "Template not found"
}
```

or

```json
{
  "error": "Repository not found"
}
```

**Causes:**
- Template ID doesn't exist
- Repository ID doesn't exist
- Template was deleted

#### 500 Internal Server Error
```json
{
  "error": "Failed to create template"
}
```

**Causes:**
- Database connection error
- Unexpected server error

---

## Examples

### Complete Workflow Example

```bash
# 1. Authenticate
TOKEN=$(curl -s -X POST "http://localhost:5656/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

# 2. Get Repository ID
REPO_ID="6d10718d-4333-4ae9-91bb-6d35cee124ea"

# 3. List Templates
curl -s -X GET "http://localhost:5656/api/repositories/$REPO_ID/templates" \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Create a Template
TEMPLATE_RESPONSE=$(curl -s -X POST "http://localhost:5656/api/repositories/$REPO_ID/templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Client Template",
    "description": "Template for creating API clients",
    "code": "export class ApiClient {\n  constructor(private baseUrl: string) {}\n  async get(endpoint: string) {\n    const response = await fetch(`${this.baseUrl}${endpoint}`);\n    return response.json();\n  }\n}",
    "language": "typescript",
    "tags": ["api", "client", "http"]
  }')

TEMPLATE_ID=$(echo $TEMPLATE_RESPONSE | jq -r '.data.template.id')
echo "Created template: $TEMPLATE_ID"

# 5. Get Template
curl -s -X GET "http://localhost:5656/api/snippets/$TEMPLATE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq

# 6. Update Template
curl -s -X PUT "http://localhost:5656/api/snippets/$TEMPLATE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated API Client Template",
    "code": "export class ApiClient {\n  constructor(private baseUrl: string) {}\n  async get(endpoint: string) {\n    const response = await fetch(`${this.baseUrl}${endpoint}`);\n    if (!response.ok) throw new Error(`HTTP ${response.status}`);\n    return response.json();\n  }\n}"
  }' | jq

# 7. Search Templates
curl -s -X GET "http://localhost:5656/api/repositories/$REPO_ID/templates?search=api&language=typescript" \
  -H "Authorization: Bearer $TOKEN" | jq

# 8. Delete Template
curl -s -X DELETE "http://localhost:5656/api/snippets/$TEMPLATE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Create Template from Existing Snippet

```bash
# First, get a snippet ID
SNIPPET_ID="existing-snippet-uuid"

# Convert it to a template
curl -X POST "http://localhost:5656/api/repositories/$REPO_ID/templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Template from Snippet",
    "snippetId": "'$SNIPPET_ID'"
  }'
```

---

## Notes & Best Practices

### Template Identification

- Templates are identified by having `'template'` in their `tags` array
- The `'template'` tag is automatically added when creating via the templates endpoint
- If you remove the `'template'` tag, it will no longer appear in template listings

### Permissions

- **List Templates:** Requires `read` permission on repository
- **Create Template:** Requires `write` permission on repository
- **Get/Update/Delete Template:** Requires ownership of the template (or public template for GET)

### Best Practices

1. **Use Descriptive Titles:** Make template titles clear and searchable
   - ✅ Good: "React Functional Component with Hooks"
   - ❌ Bad: "Component"

2. **Add Comprehensive Descriptions:** Help users understand when to use the template
   - ✅ Good: "A React functional component template with TypeScript, hooks, and error handling"
   - ❌ Bad: "React component"

3. **Use Relevant Tags:** Add tags beyond 'template' for better searchability
   - ✅ Good: `["template", "react", "component", "hooks", "typescript"]`
   - ❌ Bad: `["template"]`

4. **Keep Templates Updated:** Regularly update templates to reflect best practices

5. **Organize by Language:** Use language filters to organize templates

### Template vs Regular Snippet

| Feature | Template | Regular Snippet |
|---------|----------|-----------------|
| **Tag** | Must include `'template'` | No `'template'` tag |
| **Purpose** | Reusable code patterns | Specific code examples |
| **Access** | Via `/templates` endpoint | Via `/snippets` endpoint |
| **Filtering** | Automatically filtered by tag | All snippets included |

### Converting Between Template and Snippet

**To convert a snippet to a template:**
- Use POST `/api/repositories/{id}/templates` with `snippetId` parameter
- Or update the snippet's tags to include `'template'`

**To convert a template to a regular snippet:**
- Use PUT `/api/snippets/{id}` and remove `'template'` from tags array

---

## Related Endpoints

### Snippets API

Since templates are snippets, you can also use the Snippets API:

- **GET** `/api/snippets` - List all snippets (includes templates if they match filters)
- **GET** `/api/snippets/{id}` - Get a snippet/template
- **PUT** `/api/snippets/{id}` - Update a snippet/template
- **DELETE** `/api/snippets/{id}` - Delete a snippet/template

### Repository API

- **GET** `/api/repositories/{id}` - Get repository details
- **GET** `/api/repositories/{id}/snippets` - List all snippets in repository (not just templates)

---

## Testing

### Quick Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:5656"
REPO_ID="your-repository-id"
TOKEN="your-auth-token"

# Test 1: List templates
echo "1. Listing templates..."
curl -X GET "$BASE_URL/api/repositories/$REPO_ID/templates" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 2: Create template
echo "2. Creating template..."
curl -X POST "$BASE_URL/api/repositories/$REPO_ID/templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Template",
    "code": "console.log(\"Hello\");",
    "language": "javascript",
    "tags": ["test"]
  }' | jq

# Test 3: Search templates
echo "3. Searching templates..."
curl -X GET "$BASE_URL/api/repositories/$REPO_ID/templates?search=test" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Changelog

### Version 1.0 (2025-01-27)
- Initial documentation
- Complete endpoint coverage
- Examples and best practices

---

**Related Documentation:**
- [Snippets API Documentation](./SNIPPETS_MERMAID_API_COMPLETE.md)
- [Repository API Documentation](./MASTER_API_ENDPOINTS_GUIDE.md)
- [Mermaid Diagrams API](./REPOSITORY_TEMPLATES_MERMAID_API_DOCUMENTATION.md)
