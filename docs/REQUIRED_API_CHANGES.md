# Required API Changes

## 🎯 Primary Endpoint (Required)

### `POST /api/repositories/{id}/analysis`

**Purpose:** Save complete comprehensive repository analysis

**Request:**
```http
POST /api/repositories/{repositoryId}/analysis
Content-Type: application/json
X-API-Key: {token}

{
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
  "repositoryId": "uuid",
  "projectId": "uuid",
  "analyzedAt": "2025-01-01T00:00:00.000Z"
}
```

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

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Invalid data
- `404 Not Found` - Repository not found
- `401 Unauthorized` - Invalid token

---

## 📋 Complete Request Body Structure

See `docs/API_ENDPOINT_SPECIFICATION.md` for the complete TypeScript interface definition.

**Key Sections:**
1. `repository` - Git repository info
2. `folderStructure` - Complete folder tree
3. `utilityFunctions` - Categorized utility/helper functions
4. `allFunctions` - Complete function registry
5. `codingStandards` - Naming, organization, patterns
6. `architecture` - Layers and patterns
7. `linting` - ESLint, Prettier, etc.
8. `dependencies` - Production, dev, peer
9. `entryPoints` - Main entry files
10. `documentation` - README, CHANGELOG, etc.

---

## ✅ Optional Query Endpoints (Recommended)

### 1. Get Full Analysis
```
GET /api/repositories/{id}/analysis
```

### 2. Get Functions by Category
```
GET /api/repositories/{id}/analysis/functions?category=utility
```

### 3. Get Coding Standards
```
GET /api/repositories/{id}/analysis/coding-standards
```

### 4. Get Folder Structure
```
GET /api/repositories/{id}/analysis/folder-structure
```

---

## 🔄 Current Behavior

**If endpoint doesn't exist:**
- Tool will log a debug message
- Comprehensive analysis will be included in documentation metadata
- All other saves continue normally

**If endpoint exists:**
- Comprehensive analysis saved to dedicated endpoint
- All other saves continue normally
- Best of both worlds!

---

## 🧪 Testing

Use the provided test scripts:
```bash
# Full test
./test-comprehensive-analysis.sh

# Quick test
./test-analysis-curl.sh <REPO_ID> <PROJECT_ID> [API_KEY]
```

---

## 📝 Implementation Notes

1. **Database Schema:** Store the analysis as JSONB or similar flexible structure
2. **Indexing:** Index on `repositoryId`, `projectId`, `analyzedAt`
3. **Versioning:** Consider storing multiple analyses per repository (by commit/date)
4. **Size Limits:** The payload can be large, ensure your API can handle it
5. **Validation:** Validate required fields (repositoryId, projectId, analyzedAt)

---

## 🎯 Priority

**High Priority:**
- ✅ Create `POST /api/repositories/{id}/analysis` endpoint

**Medium Priority:**
- Query endpoints for filtering functions, standards, etc.

**Low Priority:**
- Versioning/history of analyses
- Comparison between analyses

---

**Status:** Tool is ready! Just needs the endpoint. All data is being saved properly to existing endpoints as fallback.



