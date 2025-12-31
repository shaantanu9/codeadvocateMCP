# Repository Learning APIs - Complete API Reference

**Version:** 1.0.0  
**Last Updated:** 2025-12-25  
**Base URL:** `http://localhost:5656/api`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Errors & Solutions API](#errors--solutions-api)
4. [Learnings API](#learnings-api)
5. [Coding Patterns API](#coding-patterns-api)
6. [Common Response Formats](#common-response-formats)
7. [Error Handling](#error-handling)
8. [Field Reference](#field-reference)

---

## Overview

The Repository Learning System provides three main APIs for tracking and documenting:

- **Errors & Solutions**: Track errors encountered and their solutions
- **Learnings**: Document insights and key takeaways
- **Coding Patterns**: Catalog discovered patterns and best practices

All APIs follow RESTful conventions and support full CRUD operations.

---

## Authentication

All endpoints support two authentication methods:

### Method 1: API Key (Recommended)
```http
X-API-Key: your-api-key-here
```

### Method 2: Bearer Token
```http
Authorization: Bearer your-token-here
```

**Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/{id}/errors" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

---

## Errors & Solutions API

### Base Path
```
/api/repositories/{repository_id}/errors
```

### 1. List All Errors

**Endpoint:** `GET /api/repositories/{repository_id}/errors`

**Description:** Retrieve all errors for a repository.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Query Parameters:** None

**Request Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):**
```json
{
  "errors": [
    {
      "id": "uuid",
      "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
      "error_name": "Module Resolution Error",
      "error_message": "Cannot find module @/hooks/use-toast",
      "context": "Building Next.js application",
      "root_cause": "Relative import path used",
      "solution": "Updated to centralized export",
      "learning": "Always use centralized exports",
      "prevention": "Use @/hooks instead of relative paths",
      "severity": "high",
      "status": "resolved",
      "tags": ["imports", "hooks"],
      "created_by": "uuid",
      "created_at": "2025-12-25T20:30:00Z",
      "updated_at": "2025-12-25T20:30:00Z",
      "created_by_user": {
        "id": "uuid",
        "full_name": "User Name",
        "email": "user@example.com"
      }
    }
  ]
}
```

---

### 2. Create Error

**Endpoint:** `POST /api/repositories/{repository_id}/errors`

**Description:** Create a new error record.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Request Body:**
```json
{
  "error_name": "string (required)",
  "error_message": "string (required)",
  "context": "string (optional)",
  "root_cause": "string (optional)",
  "solution": "string (optional)",
  "learning": "string (optional)",
  "prevention": "string (optional)",
  "severity": "low | medium | high | critical (optional, default: medium)",
  "status": "new | investigating | resolved | recurring (optional, default: resolved)",
  "tags": ["string"] (optional, default: [])
}
```

**Request Example:**
```bash
curl -X POST "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "error_name": "Module Resolution Error",
    "error_message": "Cannot find module @/hooks/use-toast",
    "context": "Building Next.js application",
    "root_cause": "Relative import path used",
    "solution": "Updated to centralized export",
    "learning": "Always use centralized exports",
    "prevention": "Use @/hooks instead of relative paths",
    "severity": "high",
    "status": "resolved",
    "tags": ["imports", "hooks", "typescript"]
  }'
```

**Response (201 Created):**
```json
{
  "error": {
    "id": "uuid",
    "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
    "error_name": "Module Resolution Error",
    "error_message": "Cannot find module @/hooks/use-toast",
    "context": "Building Next.js application",
    "root_cause": "Relative import path used",
    "solution": "Updated to centralized export",
    "learning": "Always use centralized exports",
    "prevention": "Use @/hooks instead of relative paths",
    "severity": "high",
    "status": "resolved",
    "tags": ["imports", "hooks", "typescript"],
    "created_by": "uuid",
    "created_at": "2025-12-25T20:30:00Z",
    "updated_at": "2025-12-25T20:30:00Z",
    "created_by_user": {
      "id": "uuid",
      "full_name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "error": "error_name and error_message are required"
}
```

---

### 3. Get Single Error

**Endpoint:** `GET /api/repositories/{repository_id}/errors/{error_id}`

**Description:** Retrieve a specific error by ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `error_id` | UUID | ✅ | Error ID |

**Request Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors/90c9d9cf-0eca-437e-9c31-bd5bd1092e00" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):**
```json
{
  "error": {
    "id": "90c9d9cf-0eca-437e-9c31-bd5bd1092e00",
    "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
    "error_name": "Module Resolution Error",
    "error_message": "Cannot find module @/hooks/use-toast",
    "context": "Building Next.js application",
    "root_cause": "Relative import path used",
    "solution": "Updated to centralized export",
    "learning": "Always use centralized exports",
    "prevention": "Use @/hooks instead of relative paths",
    "severity": "high",
    "status": "resolved",
    "tags": ["imports", "hooks"],
    "created_by": "uuid",
    "created_at": "2025-12-25T20:30:00Z",
    "updated_at": "2025-12-25T20:30:00Z",
    "created_by_user": {
      "id": "uuid",
      "full_name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

**Not Found (404):**
```json
{
  "error": "Error not found"
}
```

---

### 4. Update Error

**Endpoint:** `PATCH /api/repositories/{repository_id}/errors/{error_id}`

**Description:** Update an existing error (partial update supported).

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `error_id` | UUID | ✅ | Error ID |

**Request Body (all fields optional):**
```json
{
  "error_name": "string",
  "error_message": "string",
  "context": "string",
  "root_cause": "string",
  "solution": "string",
  "learning": "string",
  "prevention": "string",
  "severity": "low | medium | high | critical",
  "status": "new | investigating | resolved | recurring",
  "tags": ["string"]
}
```

**Request Example:**
```bash
curl -X PATCH "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors/90c9d9cf-0eca-437e-9c31-bd5bd1092e00" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "status": "resolved",
    "solution": "Updated all relative imports to use centralized @/hooks export. Fixed in 27 files."
  }'
```

**Response (200 OK):**
```json
{
  "error": {
    "id": "90c9d9cf-0eca-437e-9c31-bd5bd1092e00",
    "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
    "error_name": "Module Resolution Error",
    "error_message": "Cannot find module @/hooks/use-toast",
    "status": "resolved",
    "solution": "Updated all relative imports to use centralized @/hooks export. Fixed in 27 files.",
    "updated_at": "2025-12-25T20:35:00Z",
    ...
  }
}
```

---

### 5. Delete Error

**Endpoint:** `DELETE /api/repositories/{repository_id}/errors/{error_id}`

**Description:** Delete an error record.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `error_id` | UUID | ✅ | Error ID |

**Request Example:**
```bash
curl -X DELETE "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors/90c9d9cf-0eca-437e-9c31-bd5bd1092e00" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Learnings API

### Base Path
```
/api/repositories/{repository_id}/learnings
```

### 1. List All Learnings

**Endpoint:** `GET /api/repositories/{repository_id}/learnings`

**Description:** Retrieve all learnings for a repository.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Request Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/learnings" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):**
```json
{
  "learnings": [
    {
      "id": "uuid",
      "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
      "title": "Centralized Hooks Export Pattern",
      "content": "## Overview\n\nWhen organizing hooks...",
      "category": "architecture",
      "key_takeaways": ["Use centralized exports", "Avoid relative imports"],
      "related_files": ["hooks/index.ts", "hooks/utils/use-auth.tsx"],
      "tags": ["hooks", "architecture", "patterns"],
      "importance": "high",
      "created_by": "uuid",
      "created_at": "2025-12-25T20:30:00Z",
      "updated_at": "2025-12-25T20:30:00Z",
      "created_by_user": {
        "id": "uuid",
        "full_name": "User Name",
        "email": "user@example.com"
      }
    }
  ]
}
```

---

### 2. Create Learning

**Endpoint:** `POST /api/repositories/{repository_id}/learnings`

**Description:** Create a new learning record.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Request Body:**
```json
{
  "title": "string (required)",
  "content": "string (required, markdown supported)",
  "category": "general | architecture | patterns | performance | security | testing | deployment | troubleshooting (optional, default: general)",
  "key_takeaways": ["string"] (optional, default: []),
  "related_files": ["string"] (optional, default: []),
  "tags": ["string"] (optional, default: []),
  "importance": "low | medium | high | critical (optional, default: medium)"
}
```

**Request Example:**
```bash
curl -X POST "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/learnings" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "title": "Centralized Hooks Export Pattern",
    "content": "## Overview\n\nWhen organizing hooks into subdirectories, always use centralized exports.",
    "category": "architecture",
    "key_takeaways": [
      "Use centralized exports for organized hooks",
      "Avoid relative imports across subdirectories"
    ],
    "related_files": ["hooks/index.ts", "hooks/utils/use-auth.tsx"],
    "tags": ["hooks", "architecture", "patterns"],
    "importance": "high"
  }'
```

**Response (201 Created):**
```json
{
  "learning": {
    "id": "uuid",
    "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
    "title": "Centralized Hooks Export Pattern",
    "content": "## Overview\n\nWhen organizing hooks...",
    "category": "architecture",
    "key_takeaways": ["Use centralized exports", "Avoid relative imports"],
    "related_files": ["hooks/index.ts", "hooks/utils/use-auth.tsx"],
    "tags": ["hooks", "architecture", "patterns"],
    "importance": "high",
    "created_by": "uuid",
    "created_at": "2025-12-25T20:30:00Z",
    "updated_at": "2025-12-25T20:30:00Z",
    "created_by_user": {
      "id": "uuid",
      "full_name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "error": "title and content are required"
}
```

---

### 3. Get Single Learning

**Endpoint:** `GET /api/repositories/{repository_id}/learnings/{learning_id}`

**Description:** Retrieve a specific learning by ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `learning_id` | UUID | ✅ | Learning ID |

**Request Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/learnings/cce0675f-0b75-4090-836c-fd8f088ce746" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):** Same structure as create response

**Not Found (404):**
```json
{
  "error": "Learning not found"
}
```

---

### 4. Update Learning

**Endpoint:** `PATCH /api/repositories/{repository_id}/learnings/{learning_id}`

**Description:** Update an existing learning (partial update supported).

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `learning_id` | UUID | ✅ | Learning ID |

**Request Body (all fields optional):**
```json
{
  "title": "string",
  "content": "string",
  "category": "general | architecture | patterns | performance | security | testing | deployment | troubleshooting",
  "key_takeaways": ["string"],
  "related_files": ["string"],
  "tags": ["string"],
  "importance": "low | medium | high | critical"
}
```

**Request Example:**
```bash
curl -X PATCH "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/learnings/cce0675f-0b75-4090-836c-fd8f088ce746" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "importance": "critical",
    "key_takeaways": [
      "Use centralized exports for organized hooks",
      "Avoid relative imports across subdirectories",
      "Test all imports after refactoring"
    ]
  }'
```

**Response (200 OK):** Updated learning object

---

### 5. Delete Learning

**Endpoint:** `DELETE /api/repositories/{repository_id}/learnings/{learning_id}`

**Description:** Delete a learning record.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `learning_id` | UUID | ✅ | Learning ID |

**Request Example:**
```bash
curl -X DELETE "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/learnings/cce0675f-0b75-4090-836c-fd8f088ce746" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Coding Patterns API

### Base Path
```
/api/repositories/{repository_id}/patterns
```

### 1. List All Patterns

**Endpoint:** `GET /api/repositories/{repository_id}/patterns`

**Description:** Retrieve all patterns for a repository.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Request Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/patterns" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):**
```json
{
  "patterns": [
    {
      "id": "uuid",
      "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
      "pattern_name": "Centralized Hooks Export",
      "description": "A pattern for organizing React hooks...",
      "code_example": "// hooks/index.ts\nexport { useAuth } from \"./utils/use-auth\"",
      "usage_context": "When you have many hooks organized by category",
      "benefits": ["Single source of truth", "Easy to refactor"],
      "tradeoffs": ["Requires maintaining index.ts", "Slight overhead"],
      "related_patterns": ["Barrel Export Pattern"],
      "tags": ["react", "hooks", "typescript"],
      "category": "architecture",
      "created_by": "uuid",
      "created_at": "2025-12-25T20:30:00Z",
      "updated_at": "2025-12-25T20:30:00Z",
      "created_by_user": {
        "id": "uuid",
        "full_name": "User Name",
        "email": "user@example.com"
      }
    }
  ]
}
```

---

### 2. Create Pattern

**Endpoint:** `POST /api/repositories/{repository_id}/patterns`

**Description:** Create a new pattern record.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Request Body:**
```json
{
  "pattern_name": "string (required)",
  "description": "string (required)",
  "code_example": "string (optional)",
  "usage_context": "string (optional)",
  "benefits": ["string"] (optional, default: []),
  "tradeoffs": ["string"] (optional, default: []),
  "related_patterns": ["string"] (optional, default: []),
  "tags": ["string"] (optional, default: []),
  "category": "general | design | architecture | data_access | state_management | error_handling | testing | performance (optional, default: general)"
}
```

**Request Example:**
```bash
curl -X POST "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/patterns" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "pattern_name": "Centralized Hooks Export",
    "description": "A pattern for organizing React hooks into subdirectories while maintaining a single export point.",
    "code_example": "// hooks/index.ts\nexport { useAuth } from \"./utils/use-auth\"\nexport { useSnippets } from \"./data/use-snippets\"",
    "usage_context": "When you have many hooks organized by category",
    "benefits": [
      "Single source of truth for all hooks",
      "Easy to refactor hook locations"
    ],
    "tradeoffs": [
      "Requires maintaining index.ts file",
      "Slight overhead in import resolution"
    ],
    "related_patterns": ["Barrel Export Pattern"],
    "tags": ["react", "hooks", "typescript", "architecture"],
    "category": "architecture"
  }'
```

**Response (201 Created):**
```json
{
  "pattern": {
    "id": "uuid",
    "repository_id": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
    "pattern_name": "Centralized Hooks Export",
    "description": "A pattern for organizing React hooks...",
    "code_example": "// hooks/index.ts\nexport { useAuth } from \"./utils/use-auth\"",
    "usage_context": "When you have many hooks organized by category",
    "benefits": ["Single source of truth", "Easy to refactor"],
    "tradeoffs": ["Requires maintaining index.ts"],
    "related_patterns": ["Barrel Export Pattern"],
    "tags": ["react", "hooks", "typescript", "architecture"],
    "category": "architecture",
    "created_by": "uuid",
    "created_at": "2025-12-25T20:30:00Z",
    "updated_at": "2025-12-25T20:30:00Z",
    "created_by_user": {
      "id": "uuid",
      "full_name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "error": "pattern_name and description are required"
}
```

---

### 3. Get Single Pattern

**Endpoint:** `GET /api/repositories/{repository_id}/patterns/{pattern_id}`

**Description:** Retrieve a specific pattern by ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `pattern_id` | UUID | ✅ | Pattern ID |

**Request Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/patterns/c7b0fe3f-7aa8-43bb-84d0-f75cb4fa910c" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):** Same structure as create response

**Not Found (404):**
```json
{
  "error": "Pattern not found"
}
```

---

### 4. Update Pattern

**Endpoint:** `PATCH /api/repositories/{repository_id}/patterns/{pattern_id}`

**Description:** Update an existing pattern (partial update supported).

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `pattern_id` | UUID | ✅ | Pattern ID |

**Request Body (all fields optional):**
```json
{
  "pattern_name": "string",
  "description": "string",
  "code_example": "string",
  "usage_context": "string",
  "benefits": ["string"],
  "tradeoffs": ["string"],
  "related_patterns": ["string"],
  "tags": ["string"],
  "category": "general | design | architecture | data_access | state_management | error_handling | testing | performance"
}
```

**Request Example:**
```bash
curl -X PATCH "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/patterns/c7b0fe3f-7aa8-43bb-84d0-f75cb4fa910c" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "benefits": [
      "Single source of truth for all hooks",
      "Easy to refactor hook locations",
      "Better TypeScript support",
      "Prevents circular dependencies"
    ]
  }'
```

**Response (200 OK):** Updated pattern object

---

### 5. Delete Pattern

**Endpoint:** `DELETE /api/repositories/{repository_id}/patterns/{pattern_id}`

**Description:** Delete a pattern record.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `pattern_id` | UUID | ✅ | Pattern ID |

**Request Example:**
```bash
curl -X DELETE "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/patterns/c7b0fe3f-7aa8-43bb-84d0-f75cb4fa910c" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Common Response Formats

### Success Responses

**List Response (GET):**
```json
{
  "errors": [...],     // or "learnings" or "patterns"
  "total": 10,         // optional
  "page": 1,           // optional
  "limit": 20          // optional
}
```

**Single Item Response (GET, POST, PATCH):**
```json
{
  "error": {...}       // or "learning" or "pattern"
}
```

**Delete Response:**
```json
{
  "success": true
}
```

### Error Responses

**Error Response Format:**
```json
{
  "error": "Error message here"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful (GET, PATCH, DELETE) |
| `201` | Created | Resource created successfully (POST) |
| `400` | Bad Request | Validation error or invalid input |
| `401` | Unauthorized | Authentication failed or missing |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Server/database error |

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions to access this resource"
}
```

**404 Not Found:**
```json
{
  "error": "Error not found"
}
```

**400 Bad Request (Validation):**
```json
{
  "error": "error_name and error_message are required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch errors"
}
```

---

## Field Reference

### Errors Table Fields

| Field | Type | Required | Enum Values | Description |
|-------|------|----------|-------------|-------------|
| `error_name` | string | ✅ | - | Name/title of the error |
| `error_message` | string | ✅ | - | The actual error message |
| `context` | string | ❌ | - | Where/when error occurred |
| `root_cause` | string | ❌ | - | Why the error happened |
| `solution` | string | ❌ | - | How it was fixed |
| `learning` | string | ❌ | - | What was learned |
| `prevention` | string | ❌ | - | How to prevent it |
| `severity` | enum | ❌ | `low`, `medium`, `high`, `critical` | Error severity (default: `medium`) |
| `status` | enum | ❌ | `new`, `investigating`, `resolved`, `recurring` | Current status (default: `resolved`) |
| `tags` | string[] | ❌ | - | Array of tags (default: `[]`) |

### Learnings Table Fields

| Field | Type | Required | Enum Values | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | ✅ | - | Title of the learning |
| `content` | string | ✅ | - | Markdown content describing the learning |
| `category` | enum | ❌ | `general`, `architecture`, `patterns`, `performance`, `security`, `testing`, `deployment`, `troubleshooting` | Learning category (default: `general`) |
| `key_takeaways` | string[] | ❌ | - | Array of key points (default: `[]`) |
| `related_files` | string[] | ❌ | - | Array of file paths (default: `[]`) |
| `tags` | string[] | ❌ | - | Array of tags (default: `[]`) |
| `importance` | enum | ❌ | `low`, `medium`, `high`, `critical` | Importance level (default: `medium`) |

### Patterns Table Fields

| Field | Type | Required | Enum Values | Description |
|-------|------|----------|-------------|-------------|
| `pattern_name` | string | ✅ | - | Name of the pattern |
| `description` | string | ✅ | - | Description of the pattern |
| `code_example` | string | ❌ | - | Code example showing the pattern |
| `usage_context` | string | ❌ | - | When/where to use this pattern |
| `benefits` | string[] | ❌ | - | Array of benefits (default: `[]`) |
| `tradeoffs` | string[] | ❌ | - | Array of tradeoffs (default: `[]`) |
| `related_patterns` | string[] | ❌ | - | Array of related pattern names (default: `[]`) |
| `tags` | string[] | ❌ | - | Array of tags (default: `[]`) |
| `category` | enum | ❌ | `general`, `design`, `architecture`, `data_access`, `state_management`, `error_handling`, `testing`, `performance` | Pattern category (default: `general`) |

### Auto-Generated Fields

These fields are automatically set by the system and cannot be modified:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `repository_id` | UUID | Repository this record belongs to |
| `created_by` | UUID | User who created the record |
| `created_at` | ISO 8601 | Creation timestamp |
| `updated_at` | ISO 8601 | Last update timestamp |
| `created_by_user` | Object | User object with `id`, `full_name`, `email` |

---

## Quick Reference

### Base Configuration
```bash
BASE_URL="http://localhost:5656/api"
REPO_ID="your-repository-id-here"
API_KEY="your-api-key-here"
```

### Common CURL Flags
- `-X` - HTTP method (GET, POST, PATCH, DELETE)
- `-H` - Header (Content-Type, Authorization, X-API-Key)
- `-d` - Request body data (for POST/PATCH)
- `-s` - Silent mode (no progress bar)
- `-w "\n%{http_code}"` - Print HTTP status code

### Example: Complete Workflow

```bash
# 1. List all errors
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/errors" \
  -H "X-API-Key: ${API_KEY}"

# 2. Create a new error
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/errors" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "error_name": "Test Error",
    "error_message": "This is a test error"
  }'

# 3. Get specific error (use ID from step 2)
ERROR_ID="error-id-from-step-2"
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/errors/${ERROR_ID}" \
  -H "X-API-Key: ${API_KEY}"

# 4. Update error
curl -X PATCH "${BASE_URL}/repositories/${REPO_ID}/errors/${ERROR_ID}" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "status": "resolved",
    "solution": "Fixed the issue"
  }'

# 5. Delete error
curl -X DELETE "${BASE_URL}/repositories/${REPO_ID}/errors/${ERROR_ID}" \
  -H "X-API-Key: ${API_KEY}"
```

---

**Last Updated:** 2025-12-25  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0

