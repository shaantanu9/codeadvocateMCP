# API Endpoints Coverage Analysis

**Generated:** 2025-01-21  
**Status:** Comparing MASTER_API_ENDPOINTS_GUIDE.md with implemented MCP tools

## Summary

- **Total Endpoints in Guide:** 180+
- **Endpoints with MCP Tools:** ~50
- **Coverage:** ~28%
- **Priority Missing Endpoints:** High-value endpoints that should have tools

---

## ✅ Implemented Endpoints (Have MCP Tools)

### Snippets (11/15)

- ✅ `GET /api/snippets` - listSnippets
- ✅ `GET /api/snippets/{id}` - getSnippet
- ✅ `POST /api/snippets` - createSnippet
- ✅ `PUT /api/snippets/{id}` - updateSnippet
- ✅ `POST /api/snippets/{id}/favorite` - toggleFavoriteSnippet
- ✅ `POST /api/snippets/{id}/archive` - archiveSnippet
- ✅ `GET /api/snippets/recent` - getRecentSnippets
- ✅ `GET /api/snippets/recently-viewed` - getRecentlyViewedSnippets
- ✅ `GET /api/snippets/trending` - getTrendingSnippets
- ✅ `GET /api/snippets/public` - getPublicSnippets
- ✅ `GET /api/snippets/archived` - getArchivedSnippets
- ❌ `DELETE /api/snippets/{id}` - **MISSING**
- ❌ `POST /api/snippets/{id}/unarchive` - **MISSING**
- ❌ `POST /api/snippets/{id}/trash` - **MISSING**
- ❌ `POST /api/snippets/{id}/restore` - **MISSING**
- ❌ `POST /api/snippets/{id}/permanent` - **MISSING**

### Projects (4/12)

- ✅ `GET /api/projects` - listProjects
- ✅ `GET /api/projects/{id}` - getProject
- ✅ `POST /api/projects` - createProject
- ✅ `PUT /api/projects/{id}` - updateProject
- ❌ `DELETE /api/projects/{id}` - **MISSING**
- ❌ `GET /api/projects/{id}/snippets` - **MISSING**
- ❌ `GET /api/projects/configurations` - **MISSING**
- ❌ `POST /api/projects/configurations` - **MISSING**
- ❌ `GET /api/projects/configurations/{id}` - **MISSING**
- ❌ `PATCH /api/projects/configurations/{id}` - **MISSING**
- ❌ `DELETE /api/projects/configurations/{id}` - **MISSING**
- ❌ `GET /api/projects/repo/fetch` - **MISSING**

### Collections (5/12)

- ✅ `GET /api/collections` - listCollections
- ✅ `POST /api/collections` - createCollection
- ✅ `GET /api/collections/{id}` - getCollection
- ✅ `PUT /api/collections/{id}` - updateCollection
- ✅ `DELETE /api/collections/{id}` - deleteCollection
- ❌ `GET /api/collections/{id}/snippets` - **MISSING**
- ❌ `POST /api/collections/{id}/snippets` - **MISSING**
- ❌ `DELETE /api/collections/{id}/snippets/{snippetId}` - **MISSING**
- ❌ `GET /api/collections/{id}/hierarchy` - **MISSING**
- ❌ `GET /api/collections/{id}/permissions` - **MISSING**
- ❌ `POST /api/collections/{id}/permissions` - **MISSING**
- ❌ `DELETE /api/collections/{id}/permissions` - **MISSING**

### Repositories (3/25)

- ✅ `GET /api/repositories` - listRepositories
- ✅ `GET /api/repositories/{id}` - getRepository
- ✅ `POST /api/repositories` - createRepository
- ❌ `PATCH /api/repositories/{id}` - **MISSING**
- ❌ All rules endpoints (6) - **MISSING**
- ❌ All prompts endpoints (5) - **MISSING**
- ❌ All PR rules endpoints (5) - **MISSING**
- ❌ All files endpoints (5) - **MISSING**
- ❌ All permissions endpoints (3) - **MISSING**

### Documentations (3/14)

- ✅ `GET /api/documentations` - listDocumentations
- ✅ `GET /api/documentations/{id}` - getDocumentation
- ✅ `GET /api/documentations/mcp/context` - getMcpContext
- ❌ `POST /api/documentations` - **MISSING**
- ❌ `PUT /api/documentations/{id}` - **MISSING**
- ❌ `DELETE /api/documentations/{id}` - **MISSING**
- ❌ All functions endpoints (5) - **MISSING**
- ❌ All sections endpoints (5) - **MISSING**
- ❌ `GET /api/documentations/unified-context` - **MISSING**

### Markdown Documents (2/5)

- ✅ `GET /api/markdown-documents` - listMarkdownDocuments
- ✅ `GET /api/markdown-documents/{id}` - getMarkdownDocument
- ❌ `POST /api/markdown-documents` - **MISSING**
- ❌ `PUT /api/markdown-documents/{id}` - **MISSING**
- ❌ `DELETE /api/markdown-documents/{id}` - **MISSING**

### Code Snippets (2/4)

- ✅ `GET /api/code-snippets` - listCodeSnippets
- ✅ `GET /api/code-snippets/by-tags` - getCodeSnippetsByTags
- ❌ `POST /api/code-snippets` - **MISSING**
- ❌ `GET /api/code-snippets/{id}` - **MISSING**

### Personal Knowledge (4/20)

- ✅ `GET /api/personal/links` - listPersonalLinks
- ✅ `GET /api/personal/notes` - listPersonalNotes
- ✅ `GET /api/personal/files` - listPersonalFiles
- ✅ `GET /api/personal/knowledge` - searchPersonalKnowledge
- ❌ All CRUD operations for links (4) - **MISSING**
- ❌ All CRUD operations for files (4) - **MISSING**
- ❌ All CRUD operations for notes (4) - **MISSING**
- ❌ All tags endpoints (5) - **MISSING**

### Archive & Trash (2/6)

- ✅ `GET /api/archive` - listArchive
- ✅ `GET /api/trash` - listTrash
- ❌ `POST /api/archive/snippets/{id}` - **MISSING**
- ❌ `POST /api/archive/projects/{id}` - **MISSING**
- ❌ `POST /api/trash/snippets/{id}` - **MISSING**
- ❌ `POST /api/trash/projects/{id}` - **MISSING**

### Analytics (3/5)

- ✅ `GET /api/activity` - getActivity
- ✅ `GET /api/analytics` - getAnalytics
- ✅ `GET /api/analytics/popular` - getPopularItems
- ❌ `GET /api/analytics/activity` - **MISSING**
- ❌ `GET /api/analytics/usage` - **MISSING**

### Explore (1/1)

- ✅ `GET /api/explore` - explorePublicContent

### Accounts & Permissions (2/10)

- ✅ `GET /api/accounts/context` - getAccountContext
- ✅ `GET /api/permissions/repositories` - getAccessibleRepositories
- ❌ All other accounts endpoints (8) - **MISSING**

### Companies (2/12)

- ✅ `GET /api/companies` - listCompanies
- ✅ `GET /api/companies/{id}` - getCompany
- ❌ All other company endpoints (10) - **MISSING**

### Teams (3/7)

- ✅ `GET /api/teams` - listTeams
- ✅ `GET /api/teams/{id}/members` - getTeamMembers
- ✅ `GET /api/teams/{id}/projects` - getTeamProjects
- ❌ `GET /api/teams/{id}` - **MISSING**
- ❌ `PUT /api/teams/{id}` - **MISSING**
- ❌ `DELETE /api/teams/{id}` - **MISSING**
- ❌ `POST /api/teams/{id}/members` - **MISSING**
- ❌ `DELETE /api/teams/{id}/members/{userId}` - **MISSING**

### Repository Analysis (2/2) - **NEW**

- ✅ `analyzeAndSaveRepository` - Analyze git repo and save knowledge
- ✅ `getRepositoryContext` - Get saved repository context

---

## 🔴 High-Priority Missing Endpoints

### Critical for Core Functionality

1. **Snippet Management**

   - `DELETE /api/snippets/{id}` - Delete snippet
   - `POST /api/snippets/{id}/unarchive` - Unarchive snippet
   - `POST /api/snippets/{id}/trash` - Trash snippet
   - `POST /api/snippets/{id}/restore` - Restore snippet

2. **Project Management**

   - `DELETE /api/projects/{id}` - Delete project
   - `GET /api/projects/{id}/snippets` - Get project snippets

3. **Collection Management**

   - `GET /api/collections/{id}/snippets` - List snippets in collection
   - `POST /api/collections/{id}/snippets` - Add snippet to collection
   - `DELETE /api/collections/{id}/snippets/{snippetId}` - Remove snippet

4. **Repository Management**

   - `PATCH /api/repositories/{id}` - Update repository
   - Repository rules, prompts, PR rules, files management

5. **Documentation Management**

   - `POST /api/documentations` - Create documentation
   - `PUT /api/documentations/{id}` - Update documentation
   - `DELETE /api/documentations/{id}` - Delete documentation

6. **Markdown Documents**
   - `POST /api/markdown-documents` - Create markdown document
   - `PUT /api/markdown-documents/{id}` - Update markdown document
   - `DELETE /api/markdown-documents/{id}` - Delete markdown document

---

## 📊 Coverage by Category

| Category                | Total | Implemented | Coverage |
| ----------------------- | ----- | ----------- | -------- |
| Snippets                | 15    | 11          | 73%      |
| Projects                | 12    | 4           | 33%      |
| Collections             | 12    | 5           | 42%      |
| Repositories            | 25    | 3           | 12%      |
| Documentations          | 14    | 3           | 21%      |
| Markdown                | 5     | 2           | 40%      |
| Code Snippets           | 4     | 2           | 50%      |
| Personal                | 20    | 4           | 20%      |
| Archive/Trash           | 6     | 2           | 33%      |
| Analytics               | 5     | 3           | 60%      |
| Explore                 | 1     | 1           | 100%     |
| Accounts                | 10    | 2           | 20%      |
| Companies               | 12    | 2           | 17%      |
| Teams                   | 7     | 3           | 43%      |
| **Repository Analysis** | **2** | **2**       | **100%** |

---

## 🎯 Recommendations

### Phase 1: Critical CRUD Operations

1. Add DELETE operations for snippets, projects, collections
2. Add UPDATE operations for repositories, documentations, markdown
3. Add CREATE operations for documentations, markdown, code snippets

### Phase 2: Relationship Management

1. Collection snippets management
2. Project snippets management
3. Repository rules, prompts, PR rules, files

### Phase 3: Advanced Features

1. Personal knowledge CRUD operations
2. Documentation functions and sections
3. Company and team management
4. Account linking and permissions

### Phase 4: Nice-to-Have

1. Authentication endpoints (if needed for MCP)
2. API key management (if needed for MCP)
3. Integrations (GitHub, etc.)
4. Learning endpoints

---

## ✅ Current Status

**Total Tools:** ~50  
**Total Endpoints:** 180+  
**Coverage:** ~28%  
**Priority:** Focus on CRUD operations and relationship management

The `callExternalAPI` tool can be used as a fallback for any missing endpoints, but dedicated tools provide better UX and type safety.



