# API Endpoints for Querying Repository Analysis Data

## 🎯 Overview

This document describes all the API endpoints you need to **query and fetch** the repository analysis data that gets saved by the `analyzeAndSaveRepository` tool.

---

## 📋 Required Endpoints (Create These)

### 1. **Get Comprehensive Analysis**
**`GET /api/repositories/{id}/analysis`**

Get the complete repository analysis including all structured data.

**Response:**
```json
{
  "id": "analysis-id",
  "repositoryId": "repo-id",
  "projectId": "project-id",
  "analyzedAt": "2025-01-01T00:00:00.000Z",
  "repository": { ... },
  "folderStructure": { ... },
  "utilityFunctions": [ ... ],
  "allFunctions": [ ... ],
  "codingStandards": { ... },
  "architecture": { ... },
  "linting": { ... },
  "dependencies": { ... },
  "entryPoints": [ ... ],
  "documentation": [ ... ],
  "llmInsights": { ... }
}
```

---

### 2. **Get Utility Functions**
**`GET /api/repositories/{id}/analysis/functions?category=utility`**

Query parameters:
- `category`: Filter by category (`utility`, `helper`, `service`, `component`, `handler`, `middleware`)
- `search`: Search by function name
- `filePath`: Filter by file path
- `exported`: Filter by export status (`true`/`false`)

**Response:**
```json
{
  "functions": [
    {
      "name": "formatDate",
      "filePath": "src/utils/date.ts",
      "lineNumber": 10,
      "signature": "formatDate(date: Date): string",
      "parameters": [...],
      "returnType": "string",
      "documentation": "...",
      "category": "utility"
    }
  ],
  "total": 42
}
```

---

### 3. **Get Coding Standards**
**`GET /api/repositories/{id}/analysis/coding-standards`**

**Response:**
```json
{
  "namingConventions": {
    "variables": "camelCase",
    "functions": "camelCase",
    "classes": "PascalCase",
    "constants": "UPPER_SNAKE_CASE",
    "files": "kebab-case"
  },
  "fileOrganization": {
    "structure": "layer-based",
    "patterns": [...]
  },
  "importPatterns": { ... },
  "errorHandling": { ... },
  "testing": { ... }
}
```

---

### 4. **Get Folder Structure**
**`GET /api/repositories/{id}/analysis/folder-structure`**

**Response:**
```json
{
  "folderStructure": {
    "name": "root",
    "path": "",
    "type": "directory",
    "children": [
      {
        "name": "src",
        "path": "src",
        "type": "directory",
        "children": [...]
      }
    ]
  }
}
```

---

### 5. **Get Architecture Patterns**
**`GET /api/repositories/{id}/analysis/architecture`**

Query parameters:
- `type`: Filter by type (`layers` or `patterns`)

**Response:**
```json
{
  "layers": [
    {
      "name": "core",
      "path": "/src/core",
      "description": "Layer containing core-related code",
      "files": [...]
    }
  ],
  "patterns": [
    {
      "name": "Dependency Injection",
      "description": "Code pattern: Dependency Injection",
      "files": [...]
    }
  ]
}
```

---

### 6. **Get LLM Insights**
**`GET /api/repositories/{id}/analysis/llm-insights`**

**Response:**
```json
{
  "strengths": [
    "Well-structured layer architecture",
    "Consistent naming conventions"
  ],
  "improvements": [
    "Add more unit tests",
    "Document complex functions"
  ],
  "recommendations": [
    "Consider using dependency injection container",
    "Add error boundary components"
  ],
  "patterns": [...],
  "decisions": [...],
  "provider": "Anthropic",
  "enhanced": true
}
```

---

### 7. **Get Documentation Files**
**`GET /api/repositories/{id}/analysis/documentation?type=readme`**

Query parameters:
- `type`: Filter by type (`readme`, `changelog`, `license`, `contributing`, `other`)

**Response:**
```json
{
  "documentation": [
    {
      "filename": "README.md",
      "content": "# Repository Name\n\n...",
      "type": "readme"
    }
  ]
}
```

---

## 🔍 Alternative: Query Using Existing Endpoints

If the dedicated endpoints don't exist yet, you can query using existing endpoints:

### Get Repository Analysis (from Files)
```bash
GET /api/repositories/{id}/files?search=repository-analysis
```

### Get Utility Functions (from Snippets)
```bash
GET /api/snippets?tags=utility-function&tags=repo-{id}
```

### Get Coding Standards (from Documentations)
```bash
GET /api/documentations?search=coding+standards&repositoryId={id}
```

### Get Folder Structure (from Markdown)
```bash
GET /api/markdown-documents?tags=folder-structure&tags=repo-{id}
```

### Get README (from Markdown)
```bash
GET /api/markdown-documents?tags=readme&tags=repo-{id}
```

---

## 📊 Complete Query Examples

### Example 1: Get All Utility Functions
```bash
curl -X GET "http://localhost:5656/api/repositories/{id}/analysis/functions?category=utility" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Example 2: Get Coding Standards
```bash
curl -X GET "http://localhost:5656/api/repositories/{id}/analysis/coding-standards" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Example 3: Search Functions by Name
```bash
curl -X GET "http://localhost:5656/api/repositories/{id}/analysis/functions?search=format" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Example 4: Get LLM-Enhanced Insights
```bash
curl -X GET "http://localhost:5656/api/repositories/{id}/analysis/llm-insights" \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## 🗄️ Database Schema Recommendations

### Analysis Table
```sql
CREATE TABLE repository_analyses (
  id UUID PRIMARY KEY,
  repository_id UUID REFERENCES repositories(id),
  project_id UUID REFERENCES projects(id),
  analyzed_at TIMESTAMP,
  data JSONB, -- Store complete ComprehensiveAnalysis object
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_analysis_repository ON repository_analyses(repository_id);
CREATE INDEX idx_analysis_project ON repository_analyses(project_id);
CREATE INDEX idx_analysis_analyzed_at ON repository_analyses(analyzed_at DESC);

-- GIN index for JSONB queries
CREATE INDEX idx_analysis_data ON repository_analyses USING GIN (data);
```

### Query Examples (PostgreSQL)

```sql
-- Get utility functions
SELECT data->'utilityFunctions' 
FROM repository_analyses 
WHERE repository_id = 'repo-id';

-- Get coding standards
SELECT data->'codingStandards' 
FROM repository_analyses 
WHERE repository_id = 'repo-id';

-- Search functions by name
SELECT data->'allFunctions' 
FROM repository_analyses 
WHERE data->'allFunctions' @> '[{"name": "formatDate"}]';
```

---

## ✅ Implementation Priority

### High Priority (Required for Full Functionality)
1. ✅ `POST /api/repositories/{id}/analysis` - Save analysis (already implemented in tool)
2. ✅ `GET /api/repositories/{id}/analysis` - Get full analysis

### Medium Priority (Better Querying)
3. `GET /api/repositories/{id}/analysis/functions` - Query functions
4. `GET /api/repositories/{id}/analysis/coding-standards` - Get standards
5. `GET /api/repositories/{id}/analysis/folder-structure` - Get structure

### Low Priority (Nice to Have)
6. `GET /api/repositories/{id}/analysis/architecture` - Get architecture
7. `GET /api/repositories/{id}/analysis/llm-insights` - Get LLM insights
8. `GET /api/repositories/{id}/analysis/documentation` - Get docs

---

## 🚀 Quick Implementation Guide

### Step 1: Create Analysis Table
```sql
CREATE TABLE repository_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL,
  project_id UUID,
  analyzed_at TIMESTAMP NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Create Save Endpoint
```typescript
POST /api/repositories/:id/analysis
// Save the comprehensive analysis JSONB
```

### Step 3: Create Query Endpoints
```typescript
GET /api/repositories/:id/analysis
// Return the full analysis

GET /api/repositories/:id/analysis/functions?category=utility
// Query functions from JSONB: data->'utilityFunctions'
```

---

## 📝 Summary

**What Gets Saved:**
- ✅ Repository details
- ✅ Folder structure (tree)
- ✅ Utility functions (with full details)
- ✅ All functions (complete registry)
- ✅ Coding standards
- ✅ Architecture (layers & patterns)
- ✅ Linting configs
- ✅ Dependencies
- ✅ Entry points
- ✅ Documentation files
- ✅ LLM insights (if LLM used)

**How to Query:**
- Use dedicated endpoints (if created)
- Or use existing endpoints with tags/filters
- All data is saved and accessible!



