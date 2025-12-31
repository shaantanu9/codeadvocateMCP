# Repository Files API - Complete Usage Guide

**Last Updated:** 2025-12-23  
**Status:** ✅ Tested and Working  
**Base URL:** `http://localhost:5656/api/repositories/{repositoryId}/files`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Create File (POST)](#create-file-post)
4. [List Files (GET)](#list-files-get)
5. [Get File (GET by ID)](#get-file-get-by-id)
6. [Update File (PUT)](#update-file-put)
7. [Delete File (DELETE)](#delete-file-delete)
8. [File Types](#file-types)
9. [Error Handling](#error-handling)
10. [Complete Examples](#complete-examples)

---

## Overview

The Repository Files API allows you to manage documentation files, markdown files, and other text-based files within a repository. Files are stored with metadata, content, and can be organized by project or collection.

### Key Features

- ✅ Create, read, update, and delete files
- ✅ Support for multiple file types (markdown, text, json, yaml, xml)
- ✅ Automatic size calculation
- ✅ MIME type detection
- ✅ Search and pagination
- ✅ Project and collection organization
- ✅ Metadata support

---

## Authentication

All endpoints require authentication. You can use:

1. **Bearer Token (JWT)** - Recommended for API calls
2. **API Key** - For programmatic access
3. **NextAuth Session** - For browser requests

### Get Bearer Token

```bash
# Login and get token
TOKEN=$(curl -s -X POST 'http://localhost:5656/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")

echo "Token: $TOKEN"
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "your-email@example.com",
    "name": "Your Name"
  }
}
```

---

## Create File (POST)

Create a new file in a repository.

### Endpoint

```
POST /api/repositories/{repositoryId}/files
```

### Request Body

**Required Fields:**
- `file_name` (string) - Name of the file (e.g., "README.md")
- `file_path` (string) - Full path to the file (e.g., "/docs/README.md")
- `content` (string) - File content

**Optional Fields:**
- `file_type` (string) - Type of file. Default: `"text"`. Options: `"markdown"`, `"text"`, `"json"`, `"yaml"`, `"xml"`
- `project_id` (string) - Associate file with a project
- `collection_id` (string) - Associate file with a collection
- `encoding` (string) - File encoding. Default: `"utf-8"`
- `metadata` (object) - Additional metadata as JSON object

### Example Request

```bash
curl -X POST 'http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/files' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "file_name": "REPOSITORY_ARCHITECTURE.md",
    "file_path": "/docs/REPOSITORY_ARCHITECTURE.md",
    "file_type": "markdown",
    "content": "# Repository Architecture\n\nThis document describes the architecture...",
    "metadata": {
      "description": "Repository architecture documentation",
      "version": "1.0.0"
    }
  }'
```

### Example Response (201 Created)

```json
{
  "file": {
    "id": "e7e20ae0-7797-4967-bd24-d9ca7a3970a1",
    "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
    "project_id": null,
    "collection_id": null,
    "file_name": "REPOSITORY_ARCHITECTURE.md",
    "file_path": "/docs/REPOSITORY_ARCHITECTURE.md",
    "file_type": "markdown",
    "content": "# Repository Architecture\n\nThis document describes the architecture...",
    "encoding": "utf-8",
    "size_bytes": 76,
    "mime_type": "text/markdown",
    "metadata": {
      "description": "Repository architecture documentation",
      "version": "1.0.0"
    },
    "created_by": "ba14c330-f8ea-4c08-a252-8ee14fd178bf",
    "updated_by": "ba14c330-f8ea-4c08-a252-8ee14fd178bf",
    "created_at": "2025-12-23T19:44:19.335189+00:00",
    "updated_at": "2025-12-23T19:44:19.335189+00:00"
  }
}
```

### Common Errors

**400 Bad Request** - Missing required fields:
```json
{
  "error": "file_name, file_path, and content are required"
}
```

**409 Conflict** - File path already exists:
```json
{
  "error": "A file with this path already exists in this repository"
}
```

**403 Forbidden** - Insufficient permissions:
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

---

## List Files (GET)

List all files in a repository with optional search and filters.

### Endpoint

```
GET /api/repositories/{repositoryId}/files
```

### Query Parameters

- `page` (integer) - Page number. Default: `1`
- `limit` (integer) - Items per page. Default: `50`, Max: `100`
- `search` (string) - Search in file_name, file_path, and content
- `file_type` (string) - Filter by file type
- `project_id` (string) - Filter by project
- `collection_id` (string) - Filter by collection

### Example Request

```bash
curl -X GET 'http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/files?page=1&limit=20&search=architecture&file_type=markdown' \
  -H "Authorization: Bearer $TOKEN"
```

### Example Response (200 OK)

```json
{
  "files": [
    {
      "id": "e7e20ae0-7797-4967-bd24-d9ca7a3970a1",
      "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
      "file_name": "REPOSITORY_ARCHITECTURE.md",
      "file_path": "/docs/REPOSITORY_ARCHITECTURE.md",
      "file_type": "markdown",
      "size_bytes": 76,
      "mime_type": "text/markdown",
      "created_at": "2025-12-23T19:44:19.335189+00:00",
      "updated_at": "2025-12-23T19:44:19.335189+00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## Get File (GET by ID)

Get a specific file by its ID.

### Endpoint

```
GET /api/repositories/{repositoryId}/files/{fileId}
```

### Example Request

```bash
curl -X GET 'http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/files/e7e20ae0-7797-4967-bd24-d9ca7a3970a1' \
  -H "Authorization: Bearer $TOKEN"
```

### Example Response (200 OK)

```json
{
  "file": {
    "id": "e7e20ae0-7797-4967-bd24-d9ca7a3970a1",
    "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
    "file_name": "REPOSITORY_ARCHITECTURE.md",
    "file_path": "/docs/REPOSITORY_ARCHITECTURE.md",
    "file_type": "markdown",
    "content": "# Repository Architecture\n\n...",
    "encoding": "utf-8",
    "size_bytes": 76,
    "mime_type": "text/markdown",
    "metadata": {},
    "created_by": "ba14c330-f8ea-4c08-a252-8ee14fd178bf",
    "updated_by": "ba14c330-f8ea-4c08-a252-8ee14fd178bf",
    "created_at": "2025-12-23T19:44:19.335189+00:00",
    "updated_at": "2025-12-23T19:44:19.335189+00:00"
  }
}
```

### Common Errors

**404 Not Found** - File doesn't exist:
```json
{
  "error": "File not found"
}
```

---

## Update File (PUT)

Update an existing file.

### Endpoint

```
PUT /api/repositories/{repositoryId}/files/{fileId}
```

### Request Body

All fields are optional. Only include fields you want to update:

- `file_name` (string)
- `file_path` (string)
- `file_type` (string)
- `content` (string)
- `project_id` (string | null)
- `collection_id` (string | null)
- `metadata` (object)

### Example Request

```bash
curl -X PUT 'http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/files/e7e20ae0-7797-4967-bd24-d9ca7a3970a1' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "# Updated Repository Architecture\n\nThis is the updated content...",
    "metadata": {
      "description": "Updated repository architecture documentation",
      "version": "1.1.0",
      "lastUpdated": "2025-12-23"
    }
  }'
```

### Example Response (200 OK)

```json
{
  "file": {
    "id": "e7e20ae0-7797-4967-bd24-d9ca7a3970a1",
    "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
    "file_name": "REPOSITORY_ARCHITECTURE.md",
    "file_path": "/docs/REPOSITORY_ARCHITECTURE.md",
    "file_type": "markdown",
    "content": "# Updated Repository Architecture\n\nThis is the updated content...",
    "size_bytes": 95,
    "mime_type": "text/markdown",
    "metadata": {
      "description": "Updated repository architecture documentation",
      "version": "1.1.0",
      "lastUpdated": "2025-12-23"
    },
    "updated_at": "2025-12-23T19:50:00.000000+00:00"
  }
}
```

---

## Delete File (DELETE)

Delete a file from the repository.

### Endpoint

```
DELETE /api/repositories/{repositoryId}/files/{fileId}
```

### Example Request

```bash
curl -X DELETE 'http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/files/e7e20ae0-7797-4967-bd24-d9ca7a3970a1' \
  -H "Authorization: Bearer $TOKEN"
```

### Example Response (200 OK)

```json
{
  "message": "File deleted successfully"
}
```

---

## File Types

The API supports the following file types:

| File Type | MIME Type | Description |
|-----------|-----------|-------------|
| `markdown` | `text/markdown` | Markdown files (.md) |
| `text` | `text/plain` | Plain text files |
| `json` | `application/json` | JSON files |
| `yaml` | `application/x-yaml` | YAML files |
| `xml` | `application/xml` | XML files |

The MIME type is automatically set based on the `file_type` field.

---

## Error Handling

### Common HTTP Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Database/table not available |

### Error Response Format

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Scenarios

**1. Missing Required Fields:**
```json
{
  "error": "file_name, file_path, and content are required"
}
```

**2. Duplicate File Path:**
```json
{
  "error": "A file with this path already exists in this repository"
}
```

**3. Table Not Found (Migration Required):**
```json
{
  "error": "Repository files table does not exist. Please run database migrations."
}
```

**4. Insufficient Permissions:**
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

---

## Complete Examples

### Example 1: Create a Markdown Documentation File

```bash
#!/bin/bash

# Get authentication token
TOKEN=$(curl -s -X POST 'http://localhost:5656/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")

# Repository ID
REPO_ID="85c5d8c8-7679-41e2-a8a5-f9ab364b3326"

# Create file
curl -X POST "http://localhost:5656/api/repositories/$REPO_ID/files" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "file_name": "API_GUIDE.md",
    "file_path": "/docs/API_GUIDE.md",
    "file_type": "markdown",
    "content": "# API Guide\n\nThis guide explains how to use the API...",
    "metadata": {
      "category": "documentation",
      "version": "1.0.0"
    }
  }'
```

### Example 2: List All Markdown Files with Pagination

```bash
#!/bin/bash

TOKEN=$(curl -s -X POST 'http://localhost:5656/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")

REPO_ID="85c5d8c8-7679-41e2-a8a5-f9ab364b3326"

curl -X GET "http://localhost:5656/api/repositories/$REPO_ID/files?file_type=markdown&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

### Example 3: Update File Content

```bash
#!/bin/bash

TOKEN=$(curl -s -X POST 'http://localhost:5656/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")

REPO_ID="85c5d8c8-7679-41e2-a8a5-f9ab364b3326"
FILE_ID="e7e20ae0-7797-4967-bd24-d9ca7a3970a1"

curl -X PUT "http://localhost:5656/api/repositories/$REPO_ID/files/$FILE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "# Updated Content\n\nThis is the new content...",
    "metadata": {
      "version": "2.0.0",
      "updatedBy": "user@example.com"
    }
  }'
```

### Example 4: Search Files

```bash
#!/bin/bash

TOKEN=$(curl -s -X POST 'http://localhost:5656/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")

REPO_ID="85c5d8c8-7679-41e2-a8a5-f9ab364b3326"

# Search for files containing "architecture"
curl -X GET "http://localhost:5656/api/repositories/$REPO_ID/files?search=architecture&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

### Example 5: Create JSON Configuration File

```bash
#!/bin/bash

TOKEN=$(curl -s -X POST 'http://localhost:5656/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")

REPO_ID="85c5d8c8-7679-41e2-a8a5-f9ab364b3326"

curl -X POST "http://localhost:5656/api/repositories/$REPO_ID/files" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "file_name": "config.json",
    "file_path": "/config/config.json",
    "file_type": "json",
    "content": "{\"version\": \"1.0.0\", \"settings\": {\"theme\": \"dark\"}}"
  }'
```

---

## Field Reference

### Request Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `file_name` | string | ✅ Yes | - | Name of the file |
| `file_path` | string | ✅ Yes | - | Full path to the file |
| `content` | string | ✅ Yes | - | File content |
| `file_type` | string | ❌ No | `"text"` | Type: `markdown`, `text`, `json`, `yaml`, `xml` |
| `project_id` | string | ❌ No | `null` | Associate with project |
| `collection_id` | string | ❌ No | `null` | Associate with collection |
| `encoding` | string | ❌ No | `"utf-8"` | File encoding |
| `metadata` | object | ❌ No | `{}` | Additional metadata |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique file ID |
| `repository_id` | string | Repository ID |
| `file_name` | string | File name |
| `file_path` | string | File path |
| `file_type` | string | File type |
| `content` | string | File content (only in GET by ID) |
| `encoding` | string | File encoding |
| `size_bytes` | number | File size in bytes |
| `mime_type` | string | MIME type |
| `metadata` | object | Metadata object |
| `created_by` | string | User ID who created |
| `updated_by` | string | User ID who last updated |
| `created_at` | string | Creation timestamp (ISO 8601) |
| `updated_at` | string | Last update timestamp (ISO 8601) |

---

## Best Practices

1. **Use Descriptive File Names**: Use clear, descriptive file names (e.g., `API_GUIDE.md` instead of `doc1.md`)

2. **Organize with Paths**: Use meaningful paths to organize files (e.g., `/docs/api/`, `/docs/guides/`, `/config/`)

3. **Set Appropriate File Types**: Always specify the correct `file_type` for proper MIME type detection

4. **Use Metadata**: Store additional information in the `metadata` field (version, description, tags, etc.)

5. **Handle Errors Gracefully**: Always check for error responses and handle them appropriately

6. **Use Pagination**: When listing files, use pagination to avoid loading too many files at once

7. **Search Efficiently**: Use the `search` parameter to find files instead of fetching all and filtering client-side

8. **Update Incrementally**: When updating files, only send the fields that changed

---

## Testing Checklist

- [x] ✅ Create file with all required fields
- [x] ✅ Create file with optional fields
- [x] ✅ List files with pagination
- [x] ✅ Search files
- [x] ✅ Filter by file type
- [x] ✅ Get file by ID
- [x] ✅ Update file content
- [x] ✅ Update file metadata
- [x] ✅ Delete file
- [x] ✅ Handle duplicate file path error
- [x] ✅ Handle missing fields error
- [x] ✅ Handle authentication errors

---

## Support

For issues or questions:
1. Check the error response for detailed error messages
2. Verify your authentication token is valid
3. Ensure you have proper repository permissions
4. Check that the repository ID is correct
5. Verify database migrations have been run

---

**Last Tested:** 2025-12-23  
**API Version:** 1.0  
**Status:** ✅ Production Ready

