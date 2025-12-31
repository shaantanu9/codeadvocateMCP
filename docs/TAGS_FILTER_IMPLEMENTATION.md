# Tags Filter Implementation

**Date:** 2025-12-26  
**Status:** ✅ **Implemented**

## Problem

Some create tools were saving repository IDs and project IDs as tags (e.g., `repo-{uuid}`, `project-{uuid}`). These IDs should not be tags - they should only be passed as `repositoryId` and `projectId` fields in the API request body.

## Solution

Created a centralized tag filtering utility that:
1. **Filters out ID-based tags** - Removes UUIDs, repo-{id}, project-{id} patterns
2. **Normalizes tags** - Lowercase, sanitize, remove duplicates
3. **Validates tags** - Ensures only meaningful, searchable tags are saved

## Implementation

### New Utility: `src/utils/tag-filter.ts`

**Functions:**
- `filterTags()` - Filters out IDs and invalid tags
- `normalizeTags()` - Normalizes tag format
- `processTags()` - Combines filtering and normalization

**Features:**
- Detects UUID patterns (standard UUID format)
- Detects `repo-{uuid}` and `project-{uuid}` patterns
- Detects `repositoryId` and `projectId` variations
- Removes empty/whitespace tags
- Normalizes to lowercase with dashes
- Removes duplicates

### Updated Tools

All create tools now use `processTags()` to filter tags:

1. ✅ **`createRepositoryError`** - Filters tags, excludes repositoryId
2. ✅ **`createRepositoryLearning`** - Filters tags, excludes repositoryId
3. ✅ **`createRepositoryPattern`** - Filters tags, excludes repositoryId
4. ✅ **`createRepositoryMermaid`** - Filters tags, excludes repositoryId
5. ✅ **`createRepositoryFeedback`** - Filters tags, excludes repositoryId
6. ✅ **`createSnippet`** - Filters tags, excludes repositoryId and projectId
7. ✅ **`createMarkdownDocument`** - Filters tags
8. ✅ **`createCodeSnippet`** - Filters tags

## What Gets Filtered

### ❌ Removed (Invalid Tags)
- `repo-{uuid}` - e.g., `repo-6c119199-0ac9-4055-a297-5bf044fdb64d`
- `project-{uuid}` - e.g., `project-85c5d8c8-7679-41e2-a8a5-f9ab364b3326`
- `repository-{uuid}` - e.g., `repository-6c119199-0ac9-4055-a297-5bf044fdb64d`
- Standalone UUIDs - e.g., `6c119199-0ac9-4055-a297-5bf044fdb64d`
- `repositoryid-{uuid}` or `projectid-{uuid}` variations
- Empty or whitespace-only tags

### ✅ Kept (Valid Tags)
- Descriptive keywords - e.g., `function`, `utility-function`, `api-routes`
- Content types - e.g., `code-snippet`, `documentation`, `mermaid`
- Categories - e.g., `architecture`, `testing`, `security`
- Repository names (sanitized) - e.g., `demo-mcp`
- File/directory info - e.g., `src-tools`, `api-configuration`
- Language/technology - e.g., `typescript`, `javascript`

## Example

### Before (❌ Bad)
```typescript
tags: [
  "function",
  "utility-function",
  "repo-6c119199-0ac9-4055-a297-5bf044fdb64d",  // ❌ ID tag
  "project-85c5d8c8-7679-41e2-a8a5-f9ab364b3326", // ❌ ID tag
  "typescript"
]
```

### After (✅ Good)
```typescript
tags: [
  "function",
  "utility-function",
  "typescript"
]
// repositoryId and projectId are passed as separate fields
```

## Usage in Tools

```typescript
import { processTags } from "../../../utils/tag-filter.js";

// In execute method:
const filteredTags = processTags(params.tags, repositoryId, projectId);
if (filteredTags.length > 0) body.tags = filteredTags;
```

## Benefits

✅ **Cleaner Tags** - Only meaningful, searchable tags are saved  
✅ **Better Search** - Tags are more discoverable without ID noise  
✅ **Consistent** - All tools use the same filtering logic  
✅ **Maintainable** - Centralized utility for easy updates  
✅ **Defensive** - Prevents accidental ID inclusion even if caller provides them  

## Verification

- ✅ All create tools updated
- ✅ Tag filter utility created
- ✅ UUID pattern detection working
- ✅ ID pattern detection working
- ✅ Normalization working
- ✅ No linter errors

---

**Related:**
- `docs/TAGS_FIX_SUMMARY.md` - Previous fix for analyze-and-save-repo tool
- `src/utils/tag-filter.ts` - Tag filtering utility
