# Repository Feedback API Documentation

Complete API reference for the Repository Feedback System with curl examples, validations, and response formats.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [List Feedback](#1-list-feedback)
  - [Get Feedback Stats](#2-get-feedback-stats)
  - [Create Feedback](#3-create-feedback)
  - [Get Single Feedback](#4-get-single-feedback)
  - [Get Feedback Notifications](#5-get-feedback-notifications)
  - [Get Saved Filters](#6-get-saved-filters)
  - [Create Saved Filter](#7-create-saved-filter)
- [Data Models](#data-models)
- [Error Responses](#error-responses)

---

## Authentication

All endpoints support two authentication methods:

### 1. Bearer Token (JWT)
```bash
Authorization: Bearer <your_jwt_token>
```

**Get Token:**
```bash
curl -X POST 'http://localhost:5656/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "your_email@example.com",
    "name": "Your Name",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "..."
}
```

### 2. API Key
```bash
X-API-Key: sk_<your_api_key>
# OR
Authorization: Bearer sk_<your_api_key>
```

---

## Base URL

```
http://localhost:5656
```

For production, replace with your production URL.

---

## Endpoints

### 1. List Feedback

Get a paginated list of feedback items for a repository with filtering, sorting, and search.

**Endpoint:** `GET /api/repositories/{repositoryId}/feedback`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number (1-based) |
| `limit` | integer | No | `20` | Items per page (max: 100) |
| `search` | string | No | - | Search in title and description |
| `status` | string | No | - | Filter by status: `open`, `in_progress`, `under_review`, `resolved`, `closed`, `rejected` |
| `category` | string | No | - | Filter by category: `bug_report`, `feature_request`, `improvement`, `documentation`, `performance`, `security`, `ux_ui`, `other`, `custom` |
| `priority` | string | No | - | Filter by priority: `low`, `medium`, `high`, `critical` |
| `assignee` | string (UUID) | No | - | Filter by assignee user ID |
| `creator` | string (UUID) | No | - | Filter by creator user ID |
| `tags` | string (comma-separated) | No | - | Filter by tags (e.g., `bug,urgent`) |
| `labels` | string (comma-separated) | No | - | Filter by labels (e.g., `needs-review,blocked`) |
| `date_from` | string (ISO 8601) | No | - | Filter by creation date from (e.g., `2024-01-01T00:00:00Z`) |
| `date_to` | string (ISO 8601) | No | - | Filter by creation date to |
| `view` | string | No | `all` | View filter: `all`, `my_feedback`, `assigned_to_me`, `trending` |
| `sort` | string | No | `created_at` | Sort field: `created_at`, `updated_at`, `upvotes_count`, `priority` |
| `order` | string | No | `desc` | Sort order: `asc`, `desc` |

#### Example Request

```bash
curl -X GET 'http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/feedback?page=1&limit=20&status=open&priority=high&sort=created_at&order=desc' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

#### Success Response (200 OK)

```json
{
  "feedback": [
    {
      "id": "feedback-uuid",
      "repository_id": "6c119199-0ac9-4055-a297-5bf044fdb64d",
      "created_by": "user-uuid",
      "assigned_to": "user-uuid",
      "title": "Add dark mode support",
      "description": "Please add dark mode to improve user experience",
      "category": "feature_request",
      "custom_category": null,
      "status": "open",
      "priority": "high",
      "tags": ["ui", "feature"],
      "labels": ["enhancement"],
      "upvotes_count": 5,
      "upvoters": ["user1-uuid", "user2-uuid"],
      "is_locked": false,
      "is_pinned": false,
      "is_archived": false,
      "locked_by": null,
      "locked_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "resolved_at": null,
      "closed_at": null,
      "creator": {
        "id": "user-uuid",
        "email": "user@example.com",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "assignee": {
        "id": "user-uuid",
        "email": "assignee@example.com",
        "full_name": "Jane Smith",
        "avatar_url": "https://example.com/avatar2.jpg"
      },
      "has_upvoted": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

#### Empty Response (Table Not Exists - 200 OK)

```json
{
  "feedback": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

#### Error Responses

**403 Forbidden:**
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

---

### 2. Get Feedback Stats

Get statistics about feedback in a repository.

**Endpoint:** `GET /api/repositories/{repositoryId}/feedback/stats`

#### Query Parameters

None

#### Example Request

```bash
curl -X GET 'http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/feedback/stats' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

#### Success Response (200 OK)

```json
{
  "total": 25,
  "by_status": {
    "open": 10,
    "in_progress": 5,
    "under_review": 3,
    "resolved": 4,
    "closed": 2,
    "rejected": 1
  },
  "by_category": {
    "bug_report": 8,
    "feature_request": 12,
    "improvement": 3,
    "documentation": 2
  },
  "by_priority": {
    "low": 5,
    "medium": 12,
    "high": 6,
    "critical": 2
  },
  "trending": 3
}
```

#### Empty Response (Table Not Exists - 200 OK)

```json
{
  "total": 0,
  "by_status": {
    "open": 0,
    "in_progress": 0,
    "under_review": 0,
    "resolved": 0,
    "closed": 0,
    "rejected": 0
  },
  "by_category": {},
  "by_priority": {
    "low": 0,
    "medium": 0,
    "high": 0,
    "critical": 0
  },
  "trending": 0
}
```

#### Error Responses

**403 Forbidden:**
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

---

### 3. Create Feedback

Create a new feedback item in a repository.

**Endpoint:** `POST /api/repositories/{repositoryId}/feedback`

#### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | **Yes** | - | Feedback title (max length: 255) |
| `description` | string | **Yes** | - | Feedback description |
| `category` | string | No | `other` | Category: `bug_report`, `feature_request`, `improvement`, `documentation`, `performance`, `security`, `ux_ui`, `other`, `custom` |
| `custom_category` | string | Conditional | - | Required if `category` is `custom` |
| `priority` | string | No | `medium` | Priority: `low`, `medium`, `high`, `critical` |
| `tags` | array of strings | No | `[]` | Tags for categorization |
| `labels` | array of strings | No | `[]` | Labels for organization |

#### Example Request

```bash
curl -X POST 'http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/feedback' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -d '{
    "title": "Add dark mode support",
    "description": "Please add dark mode to improve user experience during night time usage.",
    "category": "feature_request",
    "priority": "high",
    "tags": ["ui", "feature", "accessibility"],
    "labels": ["enhancement"]
  }'
```

#### Success Response (201 Created)

```json
{
  "feedback": {
    "id": "feedback-uuid",
    "repository_id": "6c119199-0ac9-4055-a297-5bf044fdb64d",
    "created_by": "user-uuid",
    "assigned_to": null,
    "title": "Add dark mode support",
    "description": "Please add dark mode to improve user experience during night time usage.",
    "category": "feature_request",
    "custom_category": null,
    "status": "open",
    "priority": "high",
    "tags": ["ui", "feature", "accessibility"],
    "labels": ["enhancement"],
    "upvotes_count": 0,
    "upvoters": [],
    "is_locked": false,
    "is_pinned": false,
    "is_archived": false,
    "locked_by": null,
    "locked_at": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "resolved_at": null,
    "closed_at": null
  }
}
```

#### Error Responses

**400 Bad Request - Missing Required Fields:**
```json
{
  "error": "title and description are required"
}
```

**400 Bad Request - Invalid Category:**
```json
{
  "error": "Invalid category. Allowed values: bug_report, feature_request, improvement, documentation, performance, security, ux_ui, other, custom",
  "received": "invalid_category"
}
```

**400 Bad Request - Invalid Priority:**
```json
{
  "error": "Invalid priority. Allowed values: low, medium, high, critical",
  "received": "invalid_priority"
}
```

**400 Bad Request - Missing Custom Category:**
```json
{
  "error": "custom_category is required when category is \"custom\""
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

**503 Service Unavailable - Table Not Exists:**
```json
{
  "error": "Repository feedback table does not exist. Please run database migrations."
}
```

---

### 4. Get Single Feedback

Get details of a single feedback item.

**Endpoint:** `GET /api/repositories/{repositoryId}/feedback/{feedbackId}`

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repositoryId` | string (UUID) | **Yes** | Repository ID |
| `feedbackId` | string (UUID) | **Yes** | Feedback ID |

#### Example Request

```bash
curl -X GET 'http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/feedback/feedback-uuid-here' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

#### Success Response (200 OK)

```json
{
  "id": "feedback-uuid",
  "repository_id": "6c119199-0ac9-4055-a297-5bf044fdb64d",
  "created_by": "user-uuid",
  "assigned_to": "user-uuid",
  "title": "Add dark mode support",
  "description": "Please add dark mode to improve user experience",
  "category": "feature_request",
  "custom_category": null,
  "status": "open",
  "priority": "high",
  "tags": ["ui", "feature"],
  "labels": ["enhancement"],
  "upvotes_count": 5,
  "upvoters": ["user1-uuid", "user2-uuid"],
  "is_locked": false,
  "is_pinned": false,
  "is_archived": false,
  "locked_by": null,
  "locked_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "resolved_at": null,
  "closed_at": null,
  "creator": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  },
  "assignee": {
    "id": "user-uuid",
    "email": "assignee@example.com",
    "full_name": "Jane Smith",
    "avatar_url": "https://example.com/avatar2.jpg"
  },
  "has_upvoted": true
}
```

#### Error Responses

**404 Not Found:**
```json
{
  "error": "Feedback not found"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

---

### 5. Get Feedback Notifications

Get notifications for the current user related to repository feedback.

**Endpoint:** `GET /api/repositories/{repositoryId}/feedback/notifications`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number (1-based) |
| `limit` | integer | No | `20` | Items per page (max: 100) |
| `is_read` | boolean | No | - | Filter by read status: `true` or `false` |

#### Example Request

```bash
curl -X GET 'http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/feedback/notifications?page=1&limit=20&is_read=false' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

#### Success Response (200 OK)

```json
{
  "notifications": [
    {
      "id": "notification-uuid",
      "user_id": "user-uuid",
      "feedback_id": "feedback-uuid",
      "comment_id": null,
      "notification_type": "feedback_created",
      "is_read": false,
      "read_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "feedback": {
        "id": "feedback-uuid",
        "title": "Add dark mode support",
        "status": "open",
        "repository_id": "6c119199-0ac9-4055-a297-5bf044fdb64d"
      },
      "comment": null
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

#### Empty Response (Table Not Exists - 200 OK)

```json
{
  "notifications": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Error Responses

**403 Forbidden:**
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

---

### 6. Get Saved Filters

Get all saved filters for the current user in a repository.

**Endpoint:** `GET /api/repositories/{repositoryId}/feedback/saved-filters`

#### Query Parameters

None

#### Example Request

```bash
curl -X GET 'http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/feedback/saved-filters' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

#### Success Response (200 OK)

```json
{
  "filters": [
    {
      "id": "filter-uuid",
      "repository_id": "6c119199-0ac9-4055-a297-5bf044fdb64d",
      "user_id": "user-uuid",
      "name": "High Priority Bugs",
      "filter_data": {
        "status": "open",
        "priority": "high",
        "category": "bug_report"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Empty Response (Table Not Exists - 200 OK)

```json
{
  "filters": []
}
```

#### Error Responses

**403 Forbidden:**
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

---

### 7. Create Saved Filter

Create a new saved filter for the current user.

**Endpoint:** `POST /api/repositories/{repositoryId}/feedback/saved-filters`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Filter name (must be unique per user per repository) |
| `filter_data` | object | **Yes** | Filter configuration object |

**Filter Data Object:**
```json
{
  "status": "open",
  "category": "bug_report",
  "priority": "high",
  "assignee": "user-uuid",
  "creator": "user-uuid",
  "tags": ["bug", "urgent"],
  "labels": ["needs-review"],
  "dateRange": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-31T23:59:59Z"
  }
}
```

#### Example Request

```bash
curl -X POST 'http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/feedback/saved-filters' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -d '{
    "name": "High Priority Bugs",
    "filter_data": {
      "status": "open",
      "priority": "high",
      "category": "bug_report",
      "tags": ["bug", "urgent"]
    }
  }'
```

#### Success Response (201 Created)

```json
{
  "filter": {
    "id": "filter-uuid",
    "repository_id": "6c119199-0ac9-4055-a297-5bf044fdb64d",
    "user_id": "user-uuid",
    "name": "High Priority Bugs",
    "filter_data": {
      "status": "open",
      "priority": "high",
      "category": "bug_report",
      "tags": ["bug", "urgent"]
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Responses

**400 Bad Request - Missing Required Fields:**
```json
{
  "error": "name is required"
}
```

**400 Bad Request - Invalid Filter Data:**
```json
{
  "error": "filter_data is required and must be an object"
}
```

**400 Bad Request - Duplicate Name:**
```json
{
  "error": "A filter with this name already exists"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden: Insufficient repository permissions"
}
```

---

## Data Models

### Feedback Object

```typescript
{
  id: string (UUID)
  repository_id: string (UUID)
  created_by: string (UUID)
  assigned_to: string (UUID) | null
  title: string
  description: string
  category: 'bug_report' | 'feature_request' | 'improvement' | 'documentation' | 'performance' | 'security' | 'ux_ui' | 'other' | 'custom'
  custom_category: string | null
  status: 'open' | 'in_progress' | 'under_review' | 'resolved' | 'closed' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  labels: string[]
  upvotes_count: number
  upvoters: string[] (UUID array)
  is_locked: boolean
  is_pinned: boolean
  is_archived: boolean
  locked_by: string (UUID) | null
  locked_at: string (ISO 8601) | null
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
  resolved_at: string (ISO 8601) | null
  closed_at: string (ISO 8601) | null
}
```

### User Object (Enriched)

```typescript
{
  id: string (UUID)
  email: string
  full_name: string
  avatar_url: string | null
}
```

### Notification Object

```typescript
{
  id: string (UUID)
  user_id: string (UUID)
  feedback_id: string (UUID)
  comment_id: string (UUID) | null
  notification_type: 'feedback_created' | 'feedback_assigned' | 'feedback_mentioned' | 'comment_added' | 'comment_mentioned' | 'status_changed' | 'feedback_upvoted' | 'feedback_resolved' | 'feedback_closed'
  is_read: boolean
  read_at: string (ISO 8601) | null
  created_at: string (ISO 8601)
  feedback?: FeedbackObject (enriched)
  comment?: CommentObject (enriched)
}
```

### Saved Filter Object

```typescript
{
  id: string (UUID)
  repository_id: string (UUID)
  user_id: string (UUID)
  name: string
  filter_data: object (JSON)
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing or invalid authentication |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error |
| `503` | Service Unavailable - Database table doesn't exist |

### Common Error Messages

**Authentication Errors:**
- `"Unauthorized"` - Missing or invalid token
- `"Forbidden: Insufficient repository permissions"` - User doesn't have access to repository

**Validation Errors:**
- `"title and description are required"` - Missing required fields
- `"Invalid category. Allowed values: ..."` - Invalid category value
- `"Invalid priority. Allowed values: ..."` - Invalid priority value
- `"custom_category is required when category is \"custom\""` - Missing custom category

**Resource Errors:**
- `"Feedback not found"` - Feedback ID doesn't exist
- `"A filter with this name already exists"` - Duplicate filter name
- `"Repository feedback table does not exist. Please run database migrations."` - Database migration not applied

---

## Rate Limiting

API requests are subject to rate limiting:
- **Default:** 1000 requests per hour per API key
- **Bearer Token:** No explicit limit (subject to server capacity)

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (1-based, default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

## Notes

1. **Graceful Degradation:** All endpoints return empty arrays/objects if the database tables don't exist, rather than errors. This allows the application to work before migrations are applied.

2. **Authentication:** Both Bearer tokens (JWT) and API keys are supported. Use the method that best fits your use case.

3. **UUID Format:** All IDs are UUIDs in the format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

4. **Date Format:** All dates are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

5. **Array Parameters:** Tags and labels can be passed as comma-separated strings in query parameters or as arrays in request bodies.

6. **Search:** The search parameter performs case-insensitive partial matching on title and description fields.

7. **Sorting:** Priority sorting uses a custom order: `critical > high > medium > low`

---

## Testing

Use the provided test script to verify all endpoints:

```bash
npm run test:feedback-api
```

Or manually test with curl:

```bash
# Get auth token
TOKEN=$(curl -s -X POST 'http://localhost:5656/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"your_email@example.com","password":"your_password"}' \
  | jq -r '.accessToken')

# Test endpoints
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5656/api/repositories/REPO_ID/feedback"
```

---

## Support

For issues or questions:
1. Check the [Migration Guide](./FEEDBACK_MIGRATION_GUIDE.md)
2. Review error messages in responses
3. Verify authentication tokens are valid
4. Ensure database migrations are applied

---

**Last Updated:** 2024-01-15  
**API Version:** 1.0.0

