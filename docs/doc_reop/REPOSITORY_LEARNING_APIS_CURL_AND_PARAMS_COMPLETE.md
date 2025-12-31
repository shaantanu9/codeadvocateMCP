# Repository Learning APIs - Complete CURL Commands & Parameters Reference

**Version:** 1.0.0  
**Last Updated:** 2025-12-25  
**Base URL:** `http://localhost:5656/api`  
**Status:** ✅ All 15 Endpoints Tested and Working

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Errors & Solutions API](#errors--solutions-api)
4. [Learnings API](#learnings-api)
5. [Coding Patterns API](#coding-patterns-api)
6. [Complete CURL Examples](#complete-curl-examples)
7. [Error Responses](#error-responses)
8. [Field Reference](#field-reference)

---

## Quick Start

### Base Configuration
```bash
export BASE_URL="http://localhost:5656/api"
export REPO_ID="85c5d8c8-7679-41e2-a8a5-f9ab364b3326"
export API_KEY="sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

### Quick Test
```bash
# Test Errors API
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/errors" \
  -H "X-API-Key: ${API_KEY}"

# Test Learnings API
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/learnings" \
  -H "X-API-Key: ${API_KEY}"

# Test Patterns API
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/patterns" \
  -H "X-API-Key: ${API_KEY}"
```

---

## Authentication

All endpoints support two authentication methods:

### Method 1: API Key (Recommended)
```bash
-H "X-API-Key: your-api-key-here"
```

### Method 2: Bearer Token
```bash
-H "Authorization: Bearer your-token-here"
```

---

## Errors & Solutions API

### Base Path
```
/api/repositories/{repository_id}/errors
```

---

### 1. List All Errors

**Endpoint:** `GET /api/repositories/{repository_id}/errors`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Query Parameters:** None

**CURL Command:**
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

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Request Body Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `error_name` | string | ✅ | - | Name/title of the error |
| `error_message` | string | ✅ | - | The actual error message |
| `context` | string | ❌ | `null` | Where/when error occurred |
| `root_cause` | string | ❌ | `null` | Why the error happened |
| `solution` | string | ❌ | `null` | How it was fixed |
| `learning` | string | ❌ | `null` | What was learned |
| `prevention` | string | ❌ | `null` | How to prevent it |
| `severity` | enum | ❌ | `medium` | `low`, `medium`, `high`, `critical` |
| `status` | enum | ❌ | `resolved` | `new`, `investigating`, `resolved`, `recurring` |
| `tags` | string[] | ❌ | `[]` | Array of tags |

**CURL Command:**
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

---

### 3. Get Single Error

**Endpoint:** `GET /api/repositories/{repository_id}/errors/{error_id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `error_id` | UUID | ✅ | Error ID |

**CURL Command:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors/90c9d9cf-0eca-437e-9c31-bd5bd1092e00" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):** Same structure as create response

---

### 4. Update Error

**Endpoint:** `PATCH /api/repositories/{repository_id}/errors/{error_id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `error_id` | UUID | ✅ | Error ID |

**Request Body Parameters (All Optional):**
| Parameter | Type | Description |
|-----------|------|-------------|
| `error_name` | string | Name/title of the error |
| `error_message` | string | The actual error message |
| `context` | string | Where/when error occurred |
| `root_cause` | string | Why the error happened |
| `solution` | string | How it was fixed |
| `learning` | string | What was learned |
| `prevention` | string | How to prevent it |
| `severity` | enum | `low`, `medium`, `high`, `critical` |
| `status` | enum | `new`, `investigating`, `resolved`, `recurring` |
| `tags` | string[] | Array of tags |

**CURL Command:**
```bash
curl -X PATCH "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors/90c9d9cf-0eca-437e-9c31-bd5bd1092e00" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "status": "resolved",
    "solution": "Updated all relative imports to use centralized @/hooks export. Fixed in 27 files."
  }'
```

**Response (200 OK):** Updated error object

---

### 5. Delete Error

**Endpoint:** `DELETE /api/repositories/{repository_id}/errors/{error_id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `error_id` | UUID | ✅ | Error ID |

**CURL Command:**
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

---

### 1. List All Learnings

**Endpoint:** `GET /api/repositories/{repository_id}/learnings`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**CURL Command:**
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

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Request Body Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `title` | string | ✅ | - | Title of the learning |
| `content` | string | ✅ | - | Markdown content describing the learning |
| `category` | enum | ❌ | `general` | `general`, `architecture`, `patterns`, `performance`, `security`, `testing`, `deployment`, `troubleshooting` |
| `key_takeaways` | string[] | ❌ | `[]` | Array of key points |
| `related_files` | string[] | ❌ | `[]` | Array of file paths |
| `tags` | string[] | ❌ | `[]` | Array of tags |
| `importance` | enum | ❌ | `medium` | `low`, `medium`, `high`, `critical` |

**CURL Command:**
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

**Response (201 Created):** Same structure as list response (single learning object)

---

### 3. Get Single Learning

**Endpoint:** `GET /api/repositories/{repository_id}/learnings/{learning_id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `learning_id` | UUID | ✅ | Learning ID |

**CURL Command:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/learnings/cce0675f-0b75-4090-836c-fd8f088ce746" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):** Single learning object

---

### 4. Update Learning

**Endpoint:** `PATCH /api/repositories/{repository_id}/learnings/{learning_id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `learning_id` | UUID | ✅ | Learning ID |

**Request Body Parameters (All Optional):**
| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | string | Title of the learning |
| `content` | string | Markdown content |
| `category` | enum | Learning category |
| `key_takeaways` | string[] | Array of key points |
| `related_files` | string[] | Array of file paths |
| `tags` | string[] | Array of tags |
| `importance` | enum | `low`, `medium`, `high`, `critical` |

**CURL Command:**
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

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `learning_id` | UUID | ✅ | Learning ID |

**CURL Command:**
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

---

### 1. List All Patterns

**Endpoint:** `GET /api/repositories/{repository_id}/patterns`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**CURL Command:**
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

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |

**Request Body Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pattern_name` | string | ✅ | - | Name of the pattern |
| `description` | string | ✅ | - | Description of the pattern |
| `code_example` | string | ❌ | `null` | Code example showing the pattern |
| `usage_context` | string | ❌ | `null` | When/where to use this pattern |
| `benefits` | string | ❌ | `null` | Benefits of the pattern |
| `tradeoffs` | string | ❌ | `null` | Tradeoffs of the pattern |
| `related_patterns` | string[] | ❌ | `[]` | Array of related pattern names |
| `tags` | string[] | ❌ | `[]` | Array of tags |
| `category` | enum | ❌ | `general` | `general`, `design`, `architecture`, `data_access`, `state_management`, `error_handling`, `testing`, `performance` |

**CURL Command:**
```bash
curl -X POST "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/patterns" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "pattern_name": "Centralized Hooks Export",
    "description": "A pattern for organizing React hooks into subdirectories while maintaining a single export point.",
    "code_example": "// hooks/index.ts\nexport { useAuth } from \"./utils/use-auth\"\nexport { useSnippets } from \"./data/use-snippets\"",
    "usage_context": "When you have many hooks organized by category",
    "benefits": "Single source of truth for all hooks, Easy to refactor hook locations",
    "tradeoffs": "Requires maintaining index.ts file, Slight overhead in import resolution",
    "related_patterns": ["Barrel Export Pattern"],
    "tags": ["react", "hooks", "typescript", "architecture"],
    "category": "architecture"
  }'
```

**Response (201 Created):** Single pattern object

---

### 3. Get Single Pattern

**Endpoint:** `GET /api/repositories/{repository_id}/patterns/{pattern_id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `pattern_id` | UUID | ✅ | Pattern ID |

**CURL Command:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/patterns/c7b0fe3f-7aa8-43bb-84d0-f75cb4fa910c" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response (200 OK):** Single pattern object

---

### 4. Update Pattern

**Endpoint:** `PATCH /api/repositories/{repository_id}/patterns/{pattern_id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `pattern_id` | UUID | ✅ | Pattern ID |

**Request Body Parameters (All Optional):**
| Parameter | Type | Description |
|-----------|------|-------------|
| `pattern_name` | string | Name of the pattern |
| `description` | string | Description of the pattern |
| `code_example` | string | Code example |
| `usage_context` | string | When/where to use |
| `benefits` | string | Benefits of the pattern |
| `tradeoffs` | string | Tradeoffs of the pattern |
| `related_patterns` | string[] | Array of related pattern names |
| `tags` | string[] | Array of tags |
| `category` | enum | Pattern category |

**CURL Command:**
```bash
curl -X PATCH "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/patterns/c7b0fe3f-7aa8-43bb-84d0-f75cb4fa910c" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{
    "category": "architecture",
    "benefits": "Single source of truth, Easy to refactor, Better TypeScript support"
  }'
```

**Response (200 OK):** Updated pattern object

---

### 5. Delete Pattern

**Endpoint:** `DELETE /api/repositories/{repository_id}/patterns/{pattern_id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | UUID | ✅ | Repository ID |
| `pattern_id` | UUID | ✅ | Pattern ID |

**CURL Command:**
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

## Complete CURL Examples

### Complete Workflow: Errors API

```bash
# Set variables
BASE_URL="http://localhost:5656/api"
REPO_ID="85c5d8c8-7679-41e2-a8a5-f9ab364b3326"
API_KEY="sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"

# 1. List all errors
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/errors" \
  -H "X-API-Key: ${API_KEY}"

# 2. Create a new error
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/errors" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "error_name": "Test Error",
    "error_message": "This is a test error",
    "severity": "medium",
    "status": "resolved"
  }'

# 3. Get specific error (replace ERROR_ID with ID from step 2)
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

### Complete Workflow: Learnings API

```bash
# 1. List all learnings
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/learnings" \
  -H "X-API-Key: ${API_KEY}"

# 2. Create a new learning
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/learnings" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "title": "Test Learning",
    "content": "This is a test learning content",
    "category": "general",
    "importance": "medium"
  }'

# 3. Get specific learning (replace LEARNING_ID with ID from step 2)
LEARNING_ID="learning-id-from-step-2"
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/learnings/${LEARNING_ID}" \
  -H "X-API-Key: ${API_KEY}"

# 4. Update learning
curl -X PATCH "${BASE_URL}/repositories/${REPO_ID}/learnings/${LEARNING_ID}" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "importance": "high"
  }'

# 5. Delete learning
curl -X DELETE "${BASE_URL}/repositories/${REPO_ID}/learnings/${LEARNING_ID}" \
  -H "X-API-Key: ${API_KEY}"
```

### Complete Workflow: Patterns API

```bash
# 1. List all patterns
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/patterns" \
  -H "X-API-Key: ${API_KEY}"

# 2. Create a new pattern
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/patterns" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "pattern_name": "Test Pattern",
    "description": "This is a test pattern description",
    "category": "general"
  }'

# 3. Get specific pattern (replace PATTERN_ID with ID from step 2)
PATTERN_ID="pattern-id-from-step-2"
curl -X GET "${BASE_URL}/repositories/${REPO_ID}/patterns/${PATTERN_ID}" \
  -H "X-API-Key: ${API_KEY}"

# 4. Update pattern
curl -X PATCH "${BASE_URL}/repositories/${REPO_ID}/patterns/${PATTERN_ID}" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "category": "architecture"
  }'

# 5. Delete pattern
curl -X DELETE "${BASE_URL}/repositories/${REPO_ID}/patterns/${PATTERN_ID}" \
  -H "X-API-Key: ${API_KEY}"
```

---

## Error Responses

### 400 Bad Request (Validation Error)

**Example:**
```bash
curl -X POST "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps" \
  -d '{}'
```

**Response:**
```json
{
  "error": "error_name and error_message are required"
}
```

### 401 Unauthorized

**Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors"
```

**Response:**
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

**Example:**
```bash
curl -X GET "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/errors/00000000-0000-0000-0000-000000000000" \
  -H "X-API-Key: sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

**Response:**
```json
{
  "error": "Error log not found"
}
```

### 500 Internal Server Error

**Response:**
```json
{
  "error": "Failed to fetch errors"
}
```

---

## Field Reference

### Errors Table Fields

| Field | Type | Required | Enum Values | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| `error_name` | string | ✅ | - | - | Name/title of the error |
| `error_message` | string | ✅ | - | - | The actual error message |
| `context` | string | ❌ | - | `null` | Where/when error occurred |
| `root_cause` | string | ❌ | - | `null` | Why the error happened |
| `solution` | string | ❌ | - | `null` | How it was fixed |
| `learning` | string | ❌ | - | `null` | What was learned |
| `prevention` | string | ❌ | - | `null` | How to prevent it |
| `severity` | enum | ❌ | `low`, `medium`, `high`, `critical` | `medium` | Error severity |
| `status` | enum | ❌ | `new`, `investigating`, `resolved`, `recurring` | `resolved` | Current status |
| `tags` | string[] | ❌ | - | `[]` | Array of tags |

### Learnings Table Fields

| Field | Type | Required | Enum Values | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| `title` | string | ✅ | - | - | Title of the learning |
| `content` | string | ✅ | - | - | Markdown content describing the learning |
| `category` | enum | ❌ | `general`, `architecture`, `patterns`, `performance`, `security`, `testing`, `deployment`, `troubleshooting` | `general` | Learning category |
| `key_takeaways` | string[] | ❌ | - | `[]` | Array of key points |
| `related_files` | string[] | ❌ | - | `[]` | Array of file paths |
| `tags` | string[] | ❌ | - | `[]` | Array of tags |
| `importance` | enum | ❌ | `low`, `medium`, `high`, `critical` | `medium` | Importance level |

### Patterns Table Fields

| Field | Type | Required | Enum Values | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| `pattern_name` | string | ✅ | - | - | Name of the pattern |
| `description` | string | ✅ | - | - | Description of the pattern |
| `code_example` | string | ❌ | - | `null` | Code example showing the pattern |
| `usage_context` | string | ❌ | - | `null` | When/where to use this pattern |
| `benefits` | string | ❌ | - | `null` | Benefits of the pattern |
| `tradeoffs` | string | ❌ | - | `null` | Tradeoffs of the pattern |
| `related_patterns` | string[] | ❌ | - | `[]` | Array of related pattern names |
| `tags` | string[] | ❌ | - | `[]` | Array of tags |
| `category` | enum | ❌ | `general`, `design`, `architecture`, `data_access`, `state_management`, `error_handling`, `testing`, `performance` | `general` | Pattern category |

### Auto-Generated Fields

These fields are automatically set by the system:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `repository_id` | UUID | Repository this record belongs to |
| `created_by` | UUID | User who created the record |
| `created_at` | ISO 8601 | Creation timestamp |
| `updated_at` | ISO 8601 | Last update timestamp |
| `created_by_user` | Object | User object with `id`, `full_name`, `email` |

---

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful (GET, PATCH, DELETE) |
| `201` | Created | Resource created successfully (POST) |
| `400` | Bad Request | Validation error or invalid input |
| `401` | Unauthorized | Authentication failed or missing |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Server/database error |

---

## Quick Reference

### Common CURL Flags
- `-X` - HTTP method (GET, POST, PATCH, DELETE)
- `-H` - Header (Content-Type, Authorization, X-API-Key)
- `-d` - Request body data (for POST/PATCH)
- `-s` - Silent mode (no progress bar)
- `-w "\n%{http_code}"` - Print HTTP status code

### Environment Variables
```bash
export BASE_URL="http://localhost:5656/api"
export REPO_ID="85c5d8c8-7679-41e2-a8a5-f9ab364b3326"
export API_KEY="sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps"
```

---

**Last Updated:** 2025-12-25  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0  
**Status:** ✅ All 15 Endpoints Tested and Working

