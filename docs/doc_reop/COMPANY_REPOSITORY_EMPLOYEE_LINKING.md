# Company, Repository, and Employee Linking API Documentation

Complete guide to linking repositories to companies, managing employees, and checking permissions for data operations.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Repository to Company Linking](#repository-to-company-linking)
3. [Employee/Company Member Management](#employeecompany-member-management)
4. [Permission Checking](#permission-checking)
5. [Data Saving Permissions](#data-saving-permissions)
6. [Complete Endpoint Reference](#complete-endpoint-reference)
7. [Examples](#examples)
8. [Error Handling](#error-handling)

---

## 🎯 Overview

The system supports three main types of linking:
- **Repository ↔ Company**: Link repositories to companies (direct or via collections)
- **User ↔ Company**: Add employees/members to companies with roles
- **Repository ↔ User**: Grant individual permissions to repositories

### Key Concepts

- **Company Repository**: `is_company_repo = true`, `company_id = <id>`, `user_id = null`
- **Personal Repository**: `is_company_repo = false`, `company_id = null`, `user_id = <user_id>`
- **Company Roles**: `owner`, `admin`, `member`, `viewer`
- **Repository Permissions**: `read`, `write`, `admin`

---

## 🔗 Repository to Company Linking

### 1. Create Company Repository

**Endpoint:** `POST /api/companies/{companyId}/repositories`

**Description:** Create a new repository directly linked to a company.

**Authentication:** Bearer token or API key (requires company admin/owner role)

**Request Body:**
```json
{
  "name": "My Company Repo",
  "slug": "my-company-repo",
  "description": "Repository for company projects",
  "is_private": false
}
```

**Response:**
```json
{
  "repository": {
    "id": "uuid",
    "name": "My Company Repo",
    "slug": "my-company-repo",
    "description": "Repository for company projects",
    "company_id": "company-uuid",
    "is_company_repo": true,
    "user_id": null,
    "is_private": false,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Permissions Required:**
- User must be `owner` or `admin` of the company
- Returns `403 Forbidden` if user doesn't have admin access

**Example:**
```bash
curl -X POST "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/repositories" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Company Backend",
    "slug": "company-backend",
    "description": "Backend services repository",
    "is_private": true
  }'
```

---

### 2. Link Existing Repository to Company

**Endpoint:** `PATCH /api/repositories/{repositoryId}`

**Description:** Link an existing personal repository to a company (converts it to company repo).

**Authentication:** Bearer token or API key

**Request Body:**
```json
{
  "company_id": "f9ae9d3b-15ab-4997-9f21-2e12356be2af",
  "is_company_repo": true
}
```

**Response:**
```json
{
  "repository": {
    "id": "uuid",
    "name": "My Repo",
    "company_id": "f9ae9d3b-15ab-4997-9f21-2e12356be2af",
    "is_company_repo": true,
    "user_id": null
  }
}
```

**Permissions Required:**
- User must own the repository OR
- User must be `owner` or `admin` of the target company
- Returns `403 Forbidden: Admin access required to link repository to company` if insufficient permissions

**Important Notes:**
- When linking to company: `user_id` is set to `null`, `company_id` is set, `is_company_repo = true`
- Repository owner loses direct ownership but retains access via company membership
- All company members get access based on their role

**Example:**
```bash
curl -X PATCH "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "f9ae9d3b-15ab-4997-9f21-2e12356be2af",
    "is_company_repo": true
  }'
```

---

### 3. Unlink Repository from Company

**Endpoint:** `DELETE /api/companies/{companyId}/repositories/{repositoryId}`

**Description:** Unlink a repository from a company (converts back to personal repo).

**Authentication:** Bearer token or API key (requires company admin/owner role)

**Response:**
```json
{
  "message": "Repository unlinked from company successfully"
}
```

**Permissions Required:**
- User must be `owner` or `admin` of the company
- Repository must be directly linked to the company (not via collections)

**Important Notes:**
- When unlinking: `company_id` set to `null`, `is_company_repo = false`, `user_id` set to the user who unlinked it
- Repository becomes a personal repository owned by the user who unlinked it
- For repos linked via collections, use collection endpoints instead

**Example:**
```bash
curl -X DELETE "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326" \
  -H "Authorization: Bearer sk_..."
```

---

### 4. Alternative: Unlink via Repository Update

**Endpoint:** `PATCH /api/repositories/{repositoryId}`

**Description:** Convert company repository back to personal repository.

**Request Body:**
```json
{
  "is_company_repo": false
}
```

**Response:**
```json
{
  "repository": {
    "id": "uuid",
    "company_id": null,
    "is_company_repo": false,
    "user_id": "user-uuid"
  }
}
```

**Permissions Required:**
- User must have `write` access to the repository
- If it's a company repo, user must be company admin/owner

**Example:**
```bash
curl -X PATCH "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "is_company_repo": false
  }'
```

---

### 5. List Company Repositories

**Endpoint:** `GET /api/companies/{companyId}/repositories`

**Description:** Get all repositories linked to a company (direct and via collections).

**Authentication:** Bearer token or API key

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term

**Response:**
```json
{
  "repositories": [
    {
      "id": "uuid",
      "name": "Company Repo",
      "slug": "company-repo",
      "description": "Description",
      "company_id": "company-uuid",
      "is_company_repo": true,
      "is_private": false,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

**Notes:**
- Returns both direct company repositories and repositories linked via company collections
- Handles missing `company_id` column gracefully (fallback to collection-based lookup)

**Example:**
```bash
curl "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/repositories?page=1&limit=20" \
  -H "Authorization: Bearer sk_..."
```

---

### 6. Get Repository Links

**Endpoint:** `GET /api/repositories/{repositoryId}/links`

**Description:** Get all links for a repository (collections, teams, companies).

**Authentication:** Bearer token or API key

**Response:**
```json
{
  "collections": [
    {
      "id": "uuid",
      "name": "Collection Name",
      "description": "Description",
      "linkedAt": "2025-01-01T00:00:00Z",
      "orderIndex": 0
    }
  ],
  "teams": [
    {
      "id": "uuid",
      "name": "Team Name",
      "access_level": "read",
      "linkedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "companies": [
    {
      "id": "uuid",
      "name": "Company Name",
      "description": "Description"
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/links" \
  -H "Authorization: Bearer sk_..."
```

---

## 👥 Employee/Company Member Management

### 1. List Company Members

**Endpoint:** `GET /api/companies/{companyId}/members`

**Description:** Get all active members of a company.

**Authentication:** Bearer token or API key (requires company membership)

**Response:**
```json
{
  "members": [
    {
      "id": "uuid",
      "company_id": "company-uuid",
      "user_id": "user-uuid",
      "role": "admin",
      "status": "active",
      "invited_by": "user-uuid",
      "joined_at": "2025-01-01T00:00:00Z",
      "employee_id": "EMP001",
      "department": "Engineering",
      "job_title": "Senior Developer",
      "notes": "Notes",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "full_name": "John Doe",
        "role": "user"
      }
    }
  ]
}
```

**Notes:**
- Only returns members with `status = 'active'`
- Includes user details for each member
- Ordered by role (ascending) then joined_at (descending)

**Example:**
```bash
curl "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/members" \
  -H "Authorization: Bearer sk_..."
```

---

### 2. Add Company Member

**Endpoint:** `POST /api/companies/{companyId}/members`

**Description:** Add a user as a member to the company.

**Authentication:** Bearer token or API key (requires company admin/owner role)

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "role": "member",
  "employee_id": "EMP001",
  "department": "Engineering",
  "job_title": "Developer",
  "notes": "Optional notes"
}
```

**Valid Roles:**
- `owner` - Cannot be assigned (only one owner exists)
- `admin` - Can manage company, members, repositories
- `member` - Can access company resources
- `viewer` - Read-only access

**Response:**
```json
{
  "member": {
    "id": "uuid",
    "company_id": "company-uuid",
    "user_id": "user-uuid",
    "role": "member",
    "status": "active",
    "invited_by": "admin-uuid",
    "joined_at": "2025-01-01T00:00:00Z",
    "employee_id": "EMP001",
    "department": "Engineering",
    "job_title": "Developer",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "full_name": "John Doe"
    }
  }
}
```

**Permissions Required:**
- User must be `owner` or `admin` of the company
- Returns `403 Forbidden: Admin access required to add members` if insufficient permissions

**Error Responses:**
- `409 Conflict`: User is already a member
- `400 Bad Request`: Invalid role or missing user_id

**Example:**
```bash
curl -X POST "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/members" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "ba14c330-f8ea-4c08-a252-8ee14fd178bf",
    "role": "member",
    "employee_id": "EMP001",
    "department": "Engineering",
    "job_title": "Senior Developer"
  }'
```

---

### 3. Update Company Member Role

**Endpoint:** `PATCH /api/companies/{companyId}/members/{userId}`

**Description:** Update a member's role in the company.

**Authentication:** Bearer token or API key (requires company admin/owner role)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Valid Roles:**
- `admin` - Can manage company, members, repositories
- `member` - Can access company resources
- `viewer` - Read-only access
- `owner` - Cannot be assigned via this endpoint

**Response:**
```json
{
  "member": {
    "id": "uuid",
    "role": "admin",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

**Permissions Required:**
- User must be `owner` or `admin` of the company
- Cannot change owner role
- Cannot assign owner role

**Example:**
```bash
curl -X PATCH "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/members/ba14c330-f8ea-4c08-a252-8ee14fd178bf" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

---

### 4. Remove Company Member

**Endpoint:** `DELETE /api/companies/{companyId}/members/{userId}`

**Description:** Remove a member from the company.

**Authentication:** Bearer token or API key (requires company admin/owner role)

**Response:**
```json
{
  "message": "Member removed successfully"
}
```

**Permissions Required:**
- User must be `owner` or `admin` of the company
- Cannot remove the company owner
- Returns `403 Forbidden: Cannot remove company owner` if attempting to remove owner

**Example:**
```bash
curl -X DELETE "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/members/ba14c330-f8ea-4c08-a252-8ee14fd178bf" \
  -H "Authorization: Bearer sk_..."
```

---

### 5. Invite Company Member

**Endpoint:** `POST /api/companies/{companyId}/invitations`

**Description:** Create an invitation link for a new company member.

**Authentication:** Bearer token or API key (requires company admin/owner role)

**Request Body:**
```json
{
  "email": "newmember@example.com"
}
```

**Response:**
```json
{
  "invitation": {
    "id": "uuid",
    "company_id": "company-uuid",
    "email": "newmember@example.com",
    "token": "invitation-token",
    "invite_url": "http://localhost:5656/invite/invitation-token",
    "invited_by": "admin-uuid",
    "created_at": "2025-01-01T00:00:00Z",
    "expires_at": "2025-01-08T00:00:00Z",
    "status": "pending"
  }
}
```

**Permissions Required:**
- User must be `owner` or `admin` of the company

**Notes:**
- Generates a shareable invitation link with pre-filled email
- Invitation expires in 7 days
- User can set password when accepting invitation
- User only sees repositories and collections they're added to

**Example:**
```bash
curl -X POST "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/invitations" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmember@example.com"
  }'
```

---

## 🔐 Permission Checking

### 1. Check Repository Access

**Endpoint:** `GET /api/repositories/{repositoryId}/permissions`

**Description:** Get repository permissions for the current user and check if they can perform actions.

**Authentication:** Bearer token or API key

**Response:**
```json
{
  "permissions": [
    {
      "id": "uuid",
      "repository_id": "repo-uuid",
      "user_id": "user-uuid",
      "company_id": null,
      "permission": "write",
      "granted_by": "admin-uuid",
      "granted_at": "2025-01-01T00:00:00Z",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "full_name": "John Doe"
      }
    }
  ]
}
```

**Permissions Required:**
- User must have `read` access to view repository
- User must have `admin` access to view permissions list

**Example:**
```bash
curl "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/permissions" \
  -H "Authorization: Bearer sk_..."
```

---

### 2. Grant Repository Permission

**Endpoint:** `POST /api/repositories/{repositoryId}/permissions`

**Description:** Grant permission to a user or company for a repository.

**Authentication:** Bearer token or API key (requires repository admin access)

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "company_id": null,
  "permission": "write"
}
```

**OR for company:**
```json
{
  "user_id": null,
  "company_id": "company-uuid",
  "permission": "read"
}
```

**Valid Permissions:**
- `read` - Can view repository and read data
- `write` - Can create, update, delete data
- `admin` - Full control including permissions management

**Response:**
```json
{
  "message": "Permission granted successfully"
}
```

**Permissions Required:**
- User must have `admin` access to the repository
- Returns `403 Forbidden: Admin access required to grant permissions` if insufficient permissions

**Example:**
```bash
curl -X POST "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/permissions" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "ba14c330-f8ea-4c08-a252-8ee14fd178bf",
    "permission": "write"
  }'
```

---

### 3. Revoke Repository Permission

**Endpoint:** `DELETE /api/repositories/{repositoryId}/permissions?user_id={userId}`

**OR**

**Endpoint:** `DELETE /api/repositories/{repositoryId}/permissions?company_id={companyId}`

**Description:** Revoke permission from a user or company.

**Authentication:** Bearer token or API key (requires repository admin access)

**Query Parameters:**
- `user_id` (required if company_id not provided): User ID to revoke permission from
- `company_id` (required if user_id not provided): Company ID to revoke permission from

**Response:**
```json
{
  "message": "Permission revoked successfully"
}
```

**Permissions Required:**
- User must have `admin` access to the repository

**Example:**
```bash
curl -X DELETE "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/permissions?user_id=ba14c330-f8ea-4c08-a252-8ee14fd178bf" \
  -H "Authorization: Bearer sk_..."
```

---

### 4. Check Company Access

**Endpoint:** `GET /api/companies/{companyId}`

**Description:** Get company details and access information for current user.

**Authentication:** Bearer token or API key

**Response:**
```json
{
  "company": {
    "id": "company-uuid",
    "name": "Company Name",
    "slug": "company-slug",
    "description": "Description",
    "website": "https://example.com",
    "logo_url": "https://example.com/logo.png",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "canView": true,
    "canManage": true,
    "canAdmin": true,
    "isOwner": true,
    "role": "owner"
  }
}
```

**Access Information:**
- `canView`: User can view company
- `canManage`: User can manage company resources
- `canAdmin`: User can administer company
- `isOwner`: User is company owner
- `role`: User's role in company

**Example:**
```bash
curl "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af" \
  -H "Authorization: Bearer sk_..."
```

---

## 💾 Data Saving Permissions

### How to Check if User Can Save Data to Repository

Before saving data (snippets, files, etc.) to a repository, check permissions:

#### 1. Check Repository Write Access

**Using PermissionService (Server-side):**
```typescript
import { PermissionService } from '@/services/permission-service'

const access = await PermissionService.checkRepositoryAccess(userId, repositoryId)

if (access.canWrite) {
  // User can save data
} else {
  // User cannot save data
}
```

**Access Levels:**
- `canRead`: User can view repository and read data
- `canWrite`: User can create, update, delete data
- `canAdmin`: User has full control including permissions

#### 2. Check via API

**Endpoint:** `GET /api/repositories/{repositoryId}`

**Response includes access information:**
```json
{
  "repository": {
    "id": "uuid",
    "name": "Repo Name",
    "canRead": true,
    "canWrite": true,
    "canAdmin": false,
    "isOwner": false,
    "isCompanyRepo": true,
    "companyId": "company-uuid"
  }
}
```

#### 3. Permission Rules

**User can save data if:**
1. ✅ User owns the repository (`repository.user_id = user.id`)
2. ✅ Repository is public (`repository.is_private = false`) - read only
3. ✅ Repository is company repo AND user is company member:
   - `owner` role: Full access (read, write, admin)
   - `admin` role: Full access (read, write, admin)
   - `member` role: Read and write access
   - `viewer` role: Read-only access
4. ✅ User has explicit `write` or `admin` permission in `repository_permissions` table
5. ✅ Repository is linked to a team AND user is team member (team access level)

**User cannot save data if:**
- ❌ Repository is private AND user is not owner/member
- ❌ User is company `viewer` role (read-only)
- ❌ User has only `read` permission (no write)
- ❌ User is not a member of the company (for company repos)

---

## 📚 Complete Endpoint Reference

### Repository Linking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/companies/{id}/repositories` | Create company repository | Company admin/owner |
| `GET` | `/api/companies/{id}/repositories` | List company repositories | Company member |
| `PATCH` | `/api/repositories/{id}` | Link/unlink repository to company | Repo owner or company admin |
| `DELETE` | `/api/companies/{id}/repositories/{repoId}` | Unlink repository from company | Company admin/owner |
| `GET` | `/api/repositories/{id}/links` | Get repository links | Repo access |

### Employee/Member Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/companies/{id}/members` | List company members | Company member |
| `POST` | `/api/companies/{id}/members` | Add company member | Company admin/owner |
| `PATCH` | `/api/companies/{id}/members/{userId}` | Update member role | Company admin/owner |
| `DELETE` | `/api/companies/{id}/members/{userId}` | Remove member | Company admin/owner |
| `POST` | `/api/companies/{id}/invitations` | Invite member | Company admin/owner |
| `GET` | `/api/companies/{id}/invitations` | List invitations | Company admin/owner |

### Permission Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/repositories/{id}/permissions` | Get repository permissions | Repo admin |
| `POST` | `/api/repositories/{id}/permissions` | Grant permission | Repo admin |
| `DELETE` | `/api/repositories/{id}/permissions` | Revoke permission | Repo admin |
| `GET` | `/api/companies/{id}` | Get company with access info | Company member |
| `GET` | `/api/repositories/{id}` | Get repository with access info | Repo access |

---

## 💡 Examples

### Example 1: Link Personal Repository to Company

```bash
# Step 1: Check if user is company admin
curl "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af" \
  -H "Authorization: Bearer sk_..."

# Step 2: Link repository to company
curl -X PATCH "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "f9ae9d3b-15ab-4997-9f21-2e12356be2af",
    "is_company_repo": true
  }'

# Step 3: Verify link
curl "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/links" \
  -H "Authorization: Bearer sk_..."
```

### Example 2: Add Employee and Grant Repository Access

```bash
# Step 1: Add employee to company
curl -X POST "http://localhost:5656/api/companies/f9ae9d3b-15ab-4997-9f21-2e12356be2af/members" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "ba14c330-f8ea-4c08-a252-8ee14fd178bf",
    "role": "member",
    "employee_id": "EMP001",
    "department": "Engineering"
  }'

# Step 2: Check if employee can access company repository
curl "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326" \
  -H "Authorization: Bearer sk_..."

# Employee automatically gets access based on company role
# member role = canRead + canWrite
```

### Example 3: Check if User Can Save Data

```bash
# Step 1: Get repository with access info
curl "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326" \
  -H "Authorization: Bearer sk_..."

# Response includes:
# {
#   "repository": {
#     "canWrite": true,  // User can save data
#     "canAdmin": false,
#     "isOwner": false,
#     "isCompanyRepo": true,
#     "companyId": "company-uuid"
#   }
# }

# Step 2: If canWrite is true, proceed with saving data
# If canWrite is false, show error to user
```

### Example 4: Grant Individual Repository Permission

```bash
# Grant write permission to a user for a specific repository
curl -X POST "http://localhost:5656/api/repositories/85c5d8c8-7679-41e2-a8a5-f9ab364b3326/permissions" \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "ba14c330-f8ea-4c08-a252-8ee14fd178bf",
    "permission": "write"
  }'
```

---

## ⚠️ Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Cause:** Missing or invalid authentication token
**Solution:** Provide valid Bearer token or API key

#### 403 Forbidden
```json
{
  "error": "Forbidden: Admin access required to link repository to company"
}
```
**Cause:** Insufficient permissions
**Solution:** User must be company owner/admin or repository owner

#### 404 Not Found
```json
{
  "error": "Company not found"
}
```
**Cause:** Resource doesn't exist
**Solution:** Verify the ID is correct

#### 409 Conflict
```json
{
  "error": "User is already a member"
}
```
**Cause:** Resource already exists
**Solution:** User is already linked/added

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
**Cause:** Server-side error
**Solution:** Check server logs, verify database connection

---

## 🔄 Data Flow

### Linking Repository to Company

```
1. User requests to link repository
   ↓
2. Check: Is user company admin/owner OR repository owner?
   ↓
3. If yes: Update repository
   - Set company_id = company.id
   - Set is_company_repo = true
   - Set user_id = null
   ↓
4. All company members now have access based on their role
   - owner/admin: Full access
   - member: Read + Write
   - viewer: Read only
```

### Adding Employee to Company

```
1. Admin requests to add employee
   ↓
2. Check: Is user company admin/owner?
   ↓
3. If yes: Create company_members record
   - company_id = company.id
   - user_id = employee.id
   - role = assigned role
   - status = 'active'
   ↓
4. Employee now has access to:
   - All company repositories (based on role)
   - Company collections
   - Company teams
```

### Checking Save Permissions

```
1. User attempts to save data
   ↓
2. Check repository access via PermissionService
   ↓
3. Evaluate access:
   - If repository.is_company_repo:
     - Check company membership
     - Check company role
     - owner/admin/member = canWrite
     - viewer = canRead only
   - If repository.user_id:
     - Check ownership
     - Owner = canWrite
   - Check explicit permissions
   ↓
4. If canWrite = true: Allow save
   If canWrite = false: Deny with 403
```

---

## 📝 Notes

1. **Company Repositories:**
   - `user_id` is always `null` for company repositories
   - `created_by` field tracks who created it (for audit)
   - All company members get access automatically

2. **Personal Repositories:**
   - `user_id` is set to the owner
   - `company_id` is `null`
   - `is_company_repo` is `false`

3. **Role Hierarchy:**
   - `owner` > `admin` > `member` > `viewer`
   - Only `owner` and `admin` can manage members and link repositories

4. **Permission Inheritance:**
   - Company members inherit repository access from company role
   - Individual permissions can override company role
   - Most permissive permission wins

5. **Data Saving:**
   - Always check `canWrite` before allowing data saves
   - Use `PermissionService.checkRepositoryAccess()` for server-side checks
   - Use API endpoint `/api/repositories/{id}` for client-side checks

---

## 🔗 Related Documentation

- [Permission Service Documentation](../services/permission-service.ts)
- [API Authentication Guide](./API_AUTHENTICATION.md)
- [Repository Permissions](./PERSONAL_VS_COMPANY_REPOSITORY_PERMISSIONS.md)
- [Complete Relationships Guide](./COMPLETE_RELATIONSHIPS_PERMISSIONS.md)

---

**Last Updated:** 2025-01-26  
**Version:** 1.0.0

