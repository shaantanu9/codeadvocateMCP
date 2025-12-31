# Complete Data Saving Guide

## 📦 What Gets Saved and Where

### 1. **Repository Details** ✅
**Saved to:** `PATCH /api/repositories/{id}` (if repository exists) or `POST /api/repositories` (if new)

**Data:**
- Repository name
- Remote URL (normalized)
- Description (includes remote URL)
- Type (individual/company)

---

### 2. **Project Details** ✅
**Saved to:** `POST /api/projects` (if new) or uses existing

**Data:**
- Project name (same as repo name)
- Description (includes repository URL)
- Linked to repository via `repositoryId`

---

### 3. **README & Documentation Files** ✅ NEW
**Saved to:** `POST /api/markdown-documents` (one per file)

**Files Saved:**
- README.md → `document_type: "readme"`
- CHANGELOG.md → `document_type: "changelog"`
- LICENSE → `document_type: "license"`
- CONTRIBUTING.md → `document_type: "contributing"`
- Other docs → `document_type: "documentation"`

**Each file includes:**
- Full content
- Proper file path: `/repositories/{repoName}/{filename}`
- Tags: `[repoName, docType, repo-{id}, project-{id}, "repository-documentation"]`

---

### 4. **Folder Structure** ✅ NEW
**Saved to:** `POST /api/markdown-documents` (as separate document)

**Content:**
- Complete folder tree in markdown format
- File sizes and languages
- Hierarchical structure with icons (📁 for directories, 📄 for files)

**File:** `/repositories/{repoName}/folder-structure.md`

**Tags:** `[repoName, "folder-structure", "repository-structure", repo-{id}, project-{id}]`

---

### 5. **Utility Functions** ✅ NEW
**Saved to:** `POST /api/snippets` (one per function, up to 50)

**Each function snippet includes:**
- Function signature
- Parameters with types
- Return type
- Documentation (JSDoc/TSDoc)
- File path and line number
- Category (utility, helper, etc.)

**Tags:** `[repoName, "utility-function", category, functionName, repo-{id}, project-{id}, file-{filename}]`

**Description includes:**
- Full signature
- Parameter details
- Return type
- Documentation if available

---

### 6. **Coding Standards** ✅ NEW
**Saved to:** `POST /api/documentations` (as separate document)

**Content:**
- Naming conventions (variables, functions, classes, constants, files)
- File organization structure
- Import patterns
- Error handling patterns
- Testing framework and patterns

**Metadata includes:**
- Complete `codingStandards` object for programmatic access

---

### 7. **Comprehensive Analysis** ✅ PRIMARY
**Saved to:** `POST /api/repositories/{id}/analysis` (if endpoint exists)

**Contains ALL data:**
- Complete repository info
- Full folder structure tree
- All utility functions (with full details)
- All functions (complete registry)
- Coding standards
- Architecture layers and patterns
- Linting configurations
- Dependencies (production, dev, peer)
- Entry points
- Documentation files
- Analyzed timestamp

**Fallback:** If endpoint doesn't exist, included in documentation metadata

---

### 8. **Main Documentation** ✅
**Saved to:** `POST /api/documentations`

**Content:**
- Generated markdown documentation
- Type: `overview`
- Category: `repository`

**Metadata includes:**
- Repository details
- Branch info
- File counts
- Dependencies
- Entry points
- Linting configs
- Architecture info
- **Comprehensive analysis** (if analysis endpoint doesn't exist)
- **Folder structure** (for easy access)
- Function counts

---

### 9. **Markdown Document** ✅
**Saved to:** `POST /api/markdown-documents`

**Content:**
- Same as main documentation
- Document type: `codebase-analysis`
- Better for searchability

---

### 10. **Key Code Files** ✅
**Saved to:** `POST /api/snippets` (top 20 files)

**Files selected:**
- Files with classes, functions, or interfaces
- Limited to 50KB per file

**Each snippet includes:**
- Full file content (up to 50KB)
- Language
- Description with classes/functions listed
- Tags linking to repository and project

---

## 📊 Complete Data Flow

```
Repository Analysis
    │
    ├─→ 1. Repository (create/update)
    │      └─→ PATCH/POST /api/repositories
    │
    ├─→ 2. Project (create/update)
    │      └─→ POST /api/projects
    │
    ├─→ 3. README & Docs (separate files)
    │      └─→ POST /api/markdown-documents (one per file)
    │
    ├─→ 4. Folder Structure
    │      └─→ POST /api/markdown-documents (folder-structure.md)
    │
    ├─→ 5. Utility Functions
    │      └─→ POST /api/snippets (one per function, up to 50)
    │
    ├─→ 6. Coding Standards
    │      └─→ POST /api/documentations (separate doc)
    │
    ├─→ 7. Comprehensive Analysis (PRIMARY)
    │      └─→ POST /api/repositories/{id}/analysis
    │          └─→ (fallback: included in main doc metadata)
    │
    ├─→ 8. Main Documentation
    │      └─→ POST /api/documentations (overview)
    │
    ├─→ 9. Markdown Document
    │      └─→ POST /api/markdown-documents (codebase-analysis)
    │
    └─→ 10. Key Code Files
           └─→ POST /api/snippets (top 20 files)
```

---

## 🔍 How to Query Saved Data

### Get Repository Details
```bash
GET /api/repositories/{id}
```

### Get All Documentation Files
```bash
GET /api/markdown-documents?tags=repository-documentation&tags=repo-{id}
```

### Get Folder Structure
```bash
GET /api/markdown-documents?tags=folder-structure&tags=repo-{id}
```

### Get Utility Functions
```bash
GET /api/snippets?tags=utility-function&tags=repo-{id}
# Or filter by category
GET /api/snippets?tags=utility&tags=repo-{id}
```

### Get Coding Standards
```bash
GET /api/documentations?search=coding+standards&repositoryId={id}
```

### Get Comprehensive Analysis (if endpoint exists)
```bash
GET /api/repositories/{id}/analysis
```

### Get All Functions
```bash
# From comprehensive analysis
GET /api/repositories/{id}/analysis
# Then filter: response.allFunctions
```

---

## 🎯 API Endpoint Requirements

### Required Endpoint (Primary)

**`POST /api/repositories/{id}/analysis`**

This is the **main endpoint** that should accept the complete comprehensive analysis object.

**Request Body:** See `docs/API_ENDPOINT_SPECIFICATION.md` for complete structure.

**Response:**
```json
{
  "id": "analysis-id",
  "repositoryId": "repo-id",
  "projectId": "project-id",
  "analyzedAt": "2025-01-01T00:00:00.000Z",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Existing Endpoints (Already Working)

These endpoints are already being used and work correctly:
- ✅ `POST /api/repositories` - Create repository
- ✅ `PATCH /api/repositories/{id}` - Update repository
- ✅ `POST /api/projects` - Create project
- ✅ `POST /api/documentations` - Save documentation
- ✅ `POST /api/markdown-documents` - Save markdown files
- ✅ `POST /api/snippets` - Save code snippets

---

## ✅ What's Now Properly Saved

1. ✅ **Repository Details** - Name, URL, branch, commit, git config
2. ✅ **README & Docs** - Each file saved separately as markdown
3. ✅ **Folder Structure** - Complete tree saved as markdown document
4. ✅ **Utility Functions** - Each saved as code snippet with full details
5. ✅ **Coding Standards** - Saved as separate documentation
6. ✅ **Comprehensive Analysis** - All data in one structured object
7. ✅ **Main Documentation** - Overview with all metadata
8. ✅ **Markdown Document** - Searchable version
9. ✅ **Key Code Files** - Top files as snippets

---

## 🚀 Next Steps

1. **Create the endpoint** `POST /api/repositories/{id}/analysis` in your API
2. **Test the endpoint** using the provided test scripts
3. **Query the data** using the query patterns above

The tool will automatically:
- ✅ Save everything properly
- ✅ Fall back gracefully if endpoint doesn't exist
- ✅ Organize data for easy querying
- ✅ Tag everything for easy filtering

---

## 📝 Summary

**All data is now properly saved:**
- Repository details → Repository endpoint
- README/docs → Markdown documents (one per file)
- Folder structure → Markdown document
- Utility functions → Code snippets (with full details)
- Coding standards → Documentation
- Comprehensive analysis → Dedicated endpoint (or metadata fallback)
- Main docs → Documentation endpoint
- Code files → Snippets endpoint

**Everything is tagged and linked** to repository and project for easy querying!



