# Repository Files Tools - Updated to Match API Guide

## Summary

Updated all repository files tools to match the exact API specification from `docs/API_REPOSITORY_FILES_GUIDE.md`.

## Changes Made

### 1. Create Repository File Tool ✅

**File:** `src/tools/repositories/files/create-repository-file.tool.ts`

**Changes:**
- ✅ Changed `title` → `file_name` (required)
- ✅ Changed `filePath` → `file_path` (required)
- ✅ Added `file_type` enum: `"markdown" | "text" | "json" | "yaml" | "xml"`
- ✅ Added `project_id` (optional)
- ✅ Added `collection_id` (optional)
- ✅ Added `encoding` (optional, default: "utf-8")
- ✅ Changed `description` → `metadata` (optional object)
- ✅ Updated descriptions to match API guide

**API Fields:**
```typescript
{
  file_name: string;        // Required
  file_path: string;        // Required
  content: string;          // Required
  file_type?: "markdown" | "text" | "json" | "yaml" | "xml";
  project_id?: string;
  collection_id?: string;
  encoding?: string;
  metadata?: Record<string, unknown>;
}
```

### 2. List Repository Files Tool ✅

**File:** `src/tools/repositories/files/list-repository-files.tool.ts`

**Changes:**
- ✅ Added `project_id` query parameter
- ✅ Added `collection_id` query parameter
- ✅ Updated `fileType` → `file_type` (snake_case for API)
- ✅ Updated default `limit` from 20 to 50 (matches API)
- ✅ Added max limit validation (100)
- ✅ Updated descriptions

**Query Parameters:**
- `search` - Search in file_name, file_path, and content
- `file_type` - Filter by file type
- `project_id` - Filter by project
- `collection_id` - Filter by collection
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)

### 3. Update Repository File Tool ✅

**File:** `src/tools/repositories/files/update-repository-file.tool.ts`

**Changes:**
- ✅ Changed `title` → `file_name` (optional)
- ✅ Changed `filePath` → `file_path` (optional)
- ✅ Changed `fileType` → `file_type` (optional enum)
- ✅ Removed `description` field
- ✅ Added `project_id` (optional, nullable)
- ✅ Added `collection_id` (optional, nullable)
- ✅ Added `metadata` (optional object)
- ✅ Added validation to ensure at least one field is provided
- ✅ Updated descriptions

**API Fields (all optional):**
```typescript
{
  file_name?: string;
  file_path?: string;
  file_type?: "markdown" | "text" | "json" | "yaml" | "xml";
  content?: string;
  project_id?: string | null;
  collection_id?: string | null;
  metadata?: Record<string, unknown>;
}
```

### 4. Get Repository File Tool ✅

**File:** `src/tools/repositories/files/get-repository-file.tool.ts`

**Status:** Already correct - no changes needed

### 5. Delete Repository File Tool ✅ (NEW)

**File:** `src/tools/repositories/files/delete-repository-file.tool.ts`

**Created:** New tool to match API DELETE endpoint

**API:** `DELETE /api/repositories/{repositoryId}/files/{fileId}`

**Parameters:**
- `repositoryId` (required)
- `fileId` (required)

### 6. Repository Analysis Tool Fix ✅

**File:** `src/tools/repository-analysis/analyze-and-save-repo.tool.ts`

**Changes:**
- ✅ Fixed file creation to use correct API format:
  - Changed `name` → `file_name`
  - Added `file_path` (required)
  - Changed `description` → `metadata.description`
  - Added proper `metadata` object structure

**Before:**
```typescript
{
  name: "repository-analysis.json",
  file_type: "json",
  content: "...",
  description: "..."
}
```

**After:**
```typescript
{
  file_name: "repository-analysis.json",
  file_path: "/repositories/{name}/repository-analysis.json",
  file_type: "json",
  content: "...",
  metadata: {
    description: "...",
    repositoryName: "...",
    analyzedAt: "..."
  }
}
```

## Tool Registry Update ✅

**File:** `src/tools/tool-registry.ts`

**Changes:**
- ✅ Added `deleteRepositoryFileTool` to registry
- ✅ Updated comment: "Repository Files (5 tools)" (was 4)

## Files Index Update ✅

**File:** `src/tools/repositories/files/index.ts`

**Changes:**
- ✅ Added export for `delete-repository-file.tool.js`
- ✅ Added documentation comment

## API Compliance

All tools now match the API specification:

| Tool | Endpoint | Status |
|------|----------|--------|
| `listRepositoryFiles` | `GET /api/repositories/{id}/files` | ✅ |
| `createRepositoryFile` | `POST /api/repositories/{id}/files` | ✅ |
| `getRepositoryFile` | `GET /api/repositories/{id}/files/{fileId}` | ✅ |
| `updateRepositoryFile` | `PUT /api/repositories/{id}/files/{fileId}` | ✅ |
| `deleteRepositoryFile` | `DELETE /api/repositories/{id}/files/{fileId}` | ✅ |

## Field Mapping

### Request Fields (API → Tool)

| API Field | Tool Parameter | Required | Notes |
|-----------|---------------|----------|-------|
| `file_name` | `file_name` | ✅ (create) | File name |
| `file_path` | `file_path` | ✅ (create) | Full path |
| `content` | `content` | ✅ (create) | File content |
| `file_type` | `file_type` | ❌ | Enum: markdown, text, json, yaml, xml |
| `project_id` | `project_id` | ❌ | Project association |
| `collection_id` | `collection_id` | ❌ | Collection association |
| `encoding` | `encoding` | ❌ | Default: utf-8 |
| `metadata` | `metadata` | ❌ | JSON object |

### Query Parameters (List)

| API Parameter | Tool Parameter | Type | Default |
|---------------|----------------|------|---------|
| `search` | `search` | string | - |
| `file_type` | `file_type` | string | - |
| `project_id` | `project_id` | string | - |
| `collection_id` | `collection_id` | string | - |
| `page` | `page` | number | 1 |
| `limit` | `limit` | number | 50 (max: 100) |

## Testing

All tools have been:
- ✅ Updated to match API specification
- ✅ Type-checked (TypeScript)
- ✅ Registered in tool registry
- ✅ Exported from index file

## Next Steps

1. Test each tool with the actual API
2. Verify field mappings work correctly
3. Test error handling
4. Test optional fields

## References

- API Guide: `docs/API_REPOSITORY_FILES_GUIDE.md`
- Base Tool Handler: `src/tools/base/tool-handler.base.ts`
- Tool Registry: `src/tools/tool-registry.ts`



