# Company, Employee, and Repository Linking Tools

## Overview
Complete set of MCP tools for managing companies, employees, and repository linking as documented in `COMPANY_REPOSITORY_EMPLOYEE_LINKING.md`.

## ✅ Implemented Tools

### Company Management (4 tools)

1. **`listCompanies`** - List all companies with pagination
   - Parameters: `page`, `limit`
   - Endpoint: `GET /api/companies`

2. **`getCompany`** - Get a specific company by ID
   - Parameters: `companyId`
   - Endpoint: `GET /api/companies/{companyId}`
   - Returns: Company details with access information (`canView`, `canManage`, `canAdmin`, `isOwner`, `role`)

3. **`createCompany`** - Create a new company
   - Parameters: `name`, `slug?`, `description?`, `website?`, `logoUrl?`
   - Endpoint: `POST /api/companies`

4. **`updateCompany`** - Update an existing company
   - Parameters: `companyId`, `name?`, `slug?`, `description?`, `website?`, `logoUrl?`
   - Endpoint: `PATCH /api/companies/{companyId}`

### Company Member Management (5 tools)

1. **`listCompanyMembers`** - Get all active members of a company
   - Parameters: `companyId`
   - Endpoint: `GET /api/companies/{companyId}/members`
   - Returns: List of members with user details and roles

2. **`addCompanyMember`** - Add a user as a member to the company
   - Parameters: `companyId`, `userId`, `role` (admin/member/viewer), `employeeId?`, `department?`, `jobTitle?`, `notes?`
   - Endpoint: `POST /api/companies/{companyId}/members`
   - Requires: Company admin/owner role

3. **`updateCompanyMember`** - Update a member's role in the company
   - Parameters: `companyId`, `userId`, `role` (admin/member/viewer)
   - Endpoint: `PATCH /api/companies/{companyId}/members/{userId}`
   - Requires: Company admin/owner role

4. **`removeCompanyMember`** - Remove a member from the company
   - Parameters: `companyId`, `userId`
   - Endpoint: `DELETE /api/companies/{companyId}/members/{userId}`
   - Requires: Company admin/owner role
   - Note: Cannot remove company owner

5. **`inviteCompanyMember`** - Create an invitation link for a new company member
   - Parameters: `companyId`, `email`
   - Endpoint: `POST /api/companies/{companyId}/invitations`
   - Requires: Company admin/owner role
   - Returns: Invitation link with token

### Company Repository Linking (3 tools)

1. **`listCompanyRepositories`** - Get all repositories linked to a company
   - Parameters: `companyId`, `page?`, `limit?`, `search?`
   - Endpoint: `GET /api/companies/{companyId}/repositories`
   - Returns: Both direct company repositories and repositories linked via collections

2. **`createCompanyRepository`** - Create a new repository directly linked to a company
   - Parameters: `companyId`, `name`, `slug?`, `description?`, `isPrivate?`
   - Endpoint: `POST /api/companies/{companyId}/repositories`
   - Requires: Company admin/owner role
   - Creates: Repository with `is_company_repo = true`, `company_id = companyId`, `user_id = null`

3. **`unlinkCompanyRepository`** - Unlink a repository from a company
   - Parameters: `companyId`, `repositoryId`
   - Endpoint: `DELETE /api/companies/{companyId}/repositories/{repositoryId}`
   - Requires: Company admin/owner role
   - Converts: Company repository back to personal repository

### Repository Management Updates

1. **`updateRepository`** - Enhanced to support company linking
   - New Parameters: `companyId?`, `isCompanyRepo?`
   - Can link repository to company: Set `companyId` and `isCompanyRepo = true`
   - Can unlink from company: Set `isCompanyRepo = false`
   - Endpoint: `PATCH /api/repositories/{repositoryId}`

### Repository Permissions (3 tools)

1. **`getRepositoryPermissions`** - Get repository permissions for the current user
   - Parameters: `repositoryId`
   - Endpoint: `GET /api/repositories/{repositoryId}/permissions`
   - Returns: List of permissions with user/company details

2. **`grantRepositoryPermission`** - Grant permission to a user or company
   - Parameters: `repositoryId`, `userId?`, `companyId?`, `permission` (read/write/admin)
   - Endpoint: `POST /api/repositories/{repositoryId}/permissions`
   - Requires: Repository admin access
   - Note: Either `userId` or `companyId` must be provided

3. **`revokeRepositoryPermission`** - Revoke permission from a user or company
   - Parameters: `repositoryId`, `userId?`, `companyId?`
   - Endpoint: `DELETE /api/repositories/{repositoryId}/permissions`
   - Requires: Repository admin access
   - Note: Either `userId` or `companyId` must be provided

### Repository Links (1 tool)

1. **`getRepositoryLinks`** - Get all links for a repository
   - Parameters: `repositoryId`
   - Endpoint: `GET /api/repositories/{repositoryId}/links`
   - Returns: Collections, teams, and companies linked to the repository

## Usage Examples

### Example 1: Link Personal Repository to Company

```typescript
// Step 1: Update repository to link to company
updateRepository({
  repositoryId: "repo-uuid",
  companyId: "company-uuid",
  isCompanyRepo: true
});

// Step 2: Verify link
getRepositoryLinks({
  repositoryId: "repo-uuid"
});
```

### Example 2: Add Employee and Grant Repository Access

```typescript
// Step 1: Add employee to company
addCompanyMember({
  companyId: "company-uuid",
  userId: "user-uuid",
  role: "member",
  employeeId: "EMP001",
  department: "Engineering"
});

// Step 2: Employee automatically gets access to company repositories
// based on their role (member = read + write)
```

### Example 3: Create Company Repository

```typescript
// Create repository directly linked to company
createCompanyRepository({
  companyId: "company-uuid",
  name: "Company Backend",
  slug: "company-backend",
  description: "Backend services repository",
  isPrivate: true
});
```

### Example 4: Grant Individual Repository Permission

```typescript
// Grant write permission to a user for a specific repository
grantRepositoryPermission({
  repositoryId: "repo-uuid",
  userId: "user-uuid",
  permission: "write"
});
```

## Permission Rules

### Company Repository Access
- **Owner/Admin**: Full access (read, write, admin)
- **Member**: Read and write access
- **Viewer**: Read-only access

### Data Saving Permissions
Before saving data to a repository, check:
1. Repository ownership (`repository.user_id = user.id`)
2. Company membership (for company repos)
3. Company role (owner/admin/member = canWrite, viewer = read-only)
4. Explicit permissions (`repository_permissions` table)

## Error Handling

All tools include:
- Comprehensive logging with `toolCallLogger`
- Standardized error handling via `BaseToolHandler.handleError`
- Detailed error messages with validation hints

## Testing

To test the tools:

```bash
# Test company creation
createCompany({
  name: "Test Company",
  slug: "test-company",
  description: "Test description"
});

# Test member addition
addCompanyMember({
  companyId: "company-uuid",
  userId: "user-uuid",
  role: "member"
});

# Test repository linking
updateRepository({
  repositoryId: "repo-uuid",
  companyId: "company-uuid",
  isCompanyRepo: true
});
```

## Summary

✅ **16 new tools created** covering:
- Company management (4 tools)
- Employee/member management (5 tools)
- Company repository linking (3 tools)
- Repository permissions (2 new tools, 1 existing)
- Repository links (1 tool)

✅ **Enhanced existing tools**:
- `updateRepository` now supports `companyId` and `isCompanyRepo`
- `listCompanies` uses standardized pagination
- All tools use consistent logging and error handling

All tools follow the same patterns:
- Use `buildQueryParams` and `buildPaginationParams` utilities
- Comprehensive logging with `toolCallLogger`
- Standardized error handling
- Type-safe parameter validation with Zod

