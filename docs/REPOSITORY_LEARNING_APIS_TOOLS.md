# Repository Learning APIs Tools

**Created:** 2025-12-25  
**Status:** ✅ All 15 tools created and registered

## Overview

This document describes the 15 MCP tools created for the Repository Learning APIs, covering Errors, Learnings, and Patterns management.

---

## Tools Created

### 1. Errors API (5 tools)

#### `listRepositoryErrors`
- **Description:** List all errors for a repository
- **Endpoint:** `GET /api/repositories/{repositoryId}/errors`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository

#### `createRepositoryError`
- **Description:** Create a new error log for a repository
- **Endpoint:** `POST /api/repositories/{repositoryId}/errors`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `errorName` (string, required): Name/title of the error
  - `errorMessage` (string, required): The actual error message
  - `context` (string, optional): Where/when error occurred
  - `rootCause` (string, optional): Why the error happened
  - `solution` (string, optional): How it was fixed
  - `learning` (string, optional): What was learned
  - `prevention` (string, optional): How to prevent it
  - `severity` (enum, optional, default: "medium"): `low`, `medium`, `high`, `critical`
  - `status` (enum, optional, default: "resolved"): `new`, `investigating`, `resolved`, `recurring`
  - `tags` (string[], optional, default: []): Array of tags

#### `getRepositoryError`
- **Description:** Get a specific error log by ID
- **Endpoint:** `GET /api/repositories/{repositoryId}/errors/{errorId}`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `errorId` (string, required): The ID of the error

#### `updateRepositoryError`
- **Description:** Update an error log for a repository
- **Endpoint:** `PATCH /api/repositories/{repositoryId}/errors/{errorId}`
- **Parameters:** (All optional, but at least one must be provided)
  - `repositoryId` (string, required): The ID of the repository
  - `errorId` (string, required): The ID of the error
  - `errorName`, `errorMessage`, `context`, `rootCause`, `solution`, `learning`, `prevention`, `severity`, `status`, `tags`

#### `deleteRepositoryError`
- **Description:** Delete an error log from a repository (cannot be undone)
- **Endpoint:** `DELETE /api/repositories/{repositoryId}/errors/{errorId}`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `errorId` (string, required): The ID of the error to delete

---

### 2. Learnings API (5 tools)

#### `listRepositoryLearnings`
- **Description:** List all learnings for a repository
- **Endpoint:** `GET /api/repositories/{repositoryId}/learnings`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository

#### `createRepositoryLearning`
- **Description:** Create a new learning for a repository
- **Endpoint:** `POST /api/repositories/{repositoryId}/learnings`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `title` (string, required): Title of the learning
  - `content` (string, required): Markdown content describing the learning
  - `category` (enum, optional, default: "general"): `general`, `architecture`, `patterns`, `performance`, `security`, `testing`, `deployment`, `troubleshooting`
  - `keyTakeaways` (string[], optional, default: []): Array of key points
  - `relatedFiles` (string[], optional, default: []): Array of file paths
  - `tags` (string[], optional, default: []): Array of tags
  - `importance` (enum, optional, default: "medium"): `low`, `medium`, `high`, `critical`

#### `getRepositoryLearning`
- **Description:** Get a specific learning by ID
- **Endpoint:** `GET /api/repositories/{repositoryId}/learnings/{learningId}`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `learningId` (string, required): The ID of the learning

#### `updateRepositoryLearning`
- **Description:** Update a learning for a repository
- **Endpoint:** `PATCH /api/repositories/{repositoryId}/learnings/{learningId}`
- **Parameters:** (All optional, but at least one must be provided)
  - `repositoryId` (string, required): The ID of the repository
  - `learningId` (string, required): The ID of the learning
  - `title`, `content`, `category`, `keyTakeaways`, `relatedFiles`, `tags`, `importance`

#### `deleteRepositoryLearning`
- **Description:** Delete a learning from a repository (cannot be undone)
- **Endpoint:** `DELETE /api/repositories/{repositoryId}/learnings/{learningId}`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `learningId` (string, required): The ID of the learning to delete

---

### 3. Patterns API (5 tools)

#### `listRepositoryPatterns`
- **Description:** List all coding patterns for a repository
- **Endpoint:** `GET /api/repositories/{repositoryId}/patterns`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository

#### `createRepositoryPattern`
- **Description:** Create a new coding pattern for a repository
- **Endpoint:** `POST /api/repositories/{repositoryId}/patterns`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `patternName` (string, required): Name of the pattern
  - `description` (string, required): Description of the pattern
  - `codeExample` (string, optional): Code example showing the pattern
  - `usageContext` (string, optional): When/where to use this pattern
  - `benefits` (string, optional): Benefits of the pattern
  - `tradeoffs` (string, optional): Tradeoffs of the pattern
  - `relatedPatterns` (string[], optional, default: []): Array of related pattern names
  - `tags` (string[], optional, default: []): Array of tags
  - `category` (enum, optional, default: "general"): `general`, `design`, `architecture`, `data_access`, `state_management`, `error_handling`, `testing`, `performance`

#### `getRepositoryPattern`
- **Description:** Get a specific coding pattern by ID
- **Endpoint:** `GET /api/repositories/{repositoryId}/patterns/{patternId}`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `patternId` (string, required): The ID of the pattern

#### `updateRepositoryPattern`
- **Description:** Update a coding pattern for a repository
- **Endpoint:** `PATCH /api/repositories/{repositoryId}/patterns/{patternId}`
- **Parameters:** (All optional, but at least one must be provided)
  - `repositoryId` (string, required): The ID of the repository
  - `patternId` (string, required): The ID of the pattern
  - `patternName`, `description`, `codeExample`, `usageContext`, `benefits`, `tradeoffs`, `relatedPatterns`, `tags`, `category`

#### `deleteRepositoryPattern`
- **Description:** Delete a coding pattern from a repository (cannot be undone)
- **Endpoint:** `DELETE /api/repositories/{repositoryId}/patterns/{patternId}`
- **Parameters:**
  - `repositoryId` (string, required): The ID of the repository
  - `patternId` (string, required): The ID of the pattern to delete

---

## File Structure

```
src/tools/repositories/
├── errors/
│   ├── list-repository-errors.tool.ts
│   ├── create-repository-error.tool.ts
│   ├── get-repository-error.tool.ts
│   ├── update-repository-error.tool.ts
│   ├── delete-repository-error.tool.ts
│   └── index.ts
├── learnings/
│   ├── list-repository-learnings.tool.ts
│   ├── create-repository-learning.tool.ts
│   ├── get-repository-learning.tool.ts
│   ├── update-repository-learning.tool.ts
│   ├── delete-repository-learning.tool.ts
│   └── index.ts
└── patterns/
    ├── list-repository-patterns.tool.ts
    ├── create-repository-pattern.tool.ts
    ├── get-repository-pattern.tool.ts
    ├── update-repository-pattern.tool.ts
    ├── delete-repository-pattern.tool.ts
    └── index.ts
```

---

## Registration

All tools are registered in:
- `src/tools/repositories/index.ts` - Exports the tool groups
- `src/tools/tool-registry.ts` - Registers all tools with the MCP server

The tools are organized as:
- `RepositoryErrorsTools` (5 tools)
- `RepositoryLearningsTools` (5 tools)
- `RepositoryPatternsTools` (5 tools)

---

## Implementation Details

### Common Patterns

All tools follow the same structure:
1. Extend `BaseToolHandler`
2. Implement `BaseToolDefinition<T>`
3. Define `paramsSchema` using Zod
4. Implement `execute` method with:
   - Logging via `logStart`
   - API service calls
   - Success logging via `logSuccess`
   - Error handling via `handleError`

### Field Mapping

The tools map user-friendly parameter names to API field names:
- `errorName` → `error_name`
- `errorMessage` → `error_message`
- `rootCause` → `root_cause`
- `keyTakeaways` → `key_takeaways`
- `relatedFiles` → `related_files`
- `patternName` → `pattern_name`
- `codeExample` → `code_example`
- `usageContext` → `usage_context`
- `relatedPatterns` → `related_patterns`

### Validation

- All required fields are enforced via Zod schema
- Enum values are validated
- Update operations require at least one field to be provided
- Default values are set for optional enum fields

### Error Handling

- Consistent error handling across all tools
- Detailed logging for debugging
- Proper error messages returned to users
- Request/response logging for troubleshooting

---

## Testing

To test the tools, use the MCP client or make direct API calls. All endpoints follow the patterns documented in:
- `docs/doc_reop/REPOSITORY_LEARNING_APIS_CURL_AND_PARAMS_COMPLETE.md`

---

## Status

✅ **All 15 tools created and registered**
- ✅ Errors API (5 tools)
- ✅ Learnings API (5 tools)
- ✅ Patterns API (5 tools)
- ✅ All tools registered in tool registry
- ✅ No linting errors
- ✅ Type-safe implementation

---

**Last Updated:** 2025-12-25

