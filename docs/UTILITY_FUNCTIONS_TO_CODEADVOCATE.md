# Save Utility Functions to CodeAdvocate

**Purpose:** Extract all utility functions from the codebase and save them to CodeAdvocate for reuse in other MCP servers.

---

## 📋 Utility Functions Found

### 1. **Response Formatter Utilities** (`src/utils/response-formatter.ts`)

#### Functions:
- `textResponse(text: string)` - Format simple text response
- `codeResponse(text: string, code: string, language?: string)` - Format response with code block
- `jsonResponse(data: unknown, description?: string)` - Format JSON response
- `structuredResponse(parts: Array<...>)` - Format structured response with multiple parts

#### Interface:
- `FormattedResponse` - Response format interface

**Tags:** `["utility", "response", "formatting", "mcp", "demo_mcp", "utils"]`

---

### 2. **Error Handler Utilities** (`src/utils/error-handler.ts`)

#### Functions:
- `formatError(error: unknown)` - Create user-friendly error message
- `createErrorResponse(error: unknown, userMessage?: string)` - Create MCP-compatible error response
- `logError(context: string, error: unknown)` - Log error with context

#### Interface:
- `MCPError` - Error interface

**Tags:** `["utility", "error", "handling", "mcp", "demo_mcp", "utils"]`

---

### 3. **Request Context Utilities** (`src/utils/request-context.ts`)

#### Functions:
- `setRequestToken(token: string)` - Set current request token
- `getRequestToken()` - Get current request token
- `clearRequestToken()` - Clear request token

**Tags:** `["utility", "context", "request", "mcp", "demo_mcp", "utils"]`

---

### 4. **Context Management** (`src/core/context.ts`)

#### Functions:
- `getContext()` - Get current request context
- `getRequestToken()` - Get current request token
- `getRequestId()` - Get current request ID
- `runInContext<T>(context, fn)` - Run function within request context
- `hasContext()` - Check if in request context

**Tags:** `["utility", "context", "async-local-storage", "mcp", "demo_mcp", "core"]`

---

### 5. **Session Helpers** (`src/core/session-helpers.ts`)

#### Functions:
- `getCurrentSessionId()` - Get current session ID
- `getCurrentWorkspacePath()` - Get current workspace path
- `getCurrentWorkspace()` - Get current workspace
- `getCurrentSession()` - Get current session data
- `setSessionData(key: string, value: unknown)` - Set session data
- `getSessionData<T>(key: string)` - Get session data
- `setCache<T>(key: string, value: T, ttlSeconds?: number)` - Set cache
- `getCache<T>(key: string)` - Get cache
- `getAllSessionData()` - Get all session data
- `clearSessionData()` - Clear session data

**Tags:** `["utility", "session", "cache", "workspace", "mcp", "demo_mcp", "core"]`

---

### 6. **Repository Analysis Helpers** (`src/tools/repository-analysis/analyze-and-save-repo.tool.ts`)

#### Functions:
- `extractIdFromResponse(response, resourceType)` - Extract ID from API response (handles different formats)
- `extractArrayFromListResponse(response, resourceType)` - Extract array from list API response

**Tags:** `["utility", "helper", "api", "response-parsing", "mcp", "demo_mcp", "repository"]`

---

## 🚀 How to Save to CodeAdvocate

### Method 1: Using MCP Tool Directly

You can use the `mcp_codeAdvocate_createCodeSnippet` tool from Cursor IDE or another MCP server:

```typescript
// Example: Save textResponse function
await mcp_codeAdvocate_createCodeSnippet({
  title: "demo_mcp - textResponse",
  code: `export function textResponse(text: string): FormattedResponse {
    return {
      content: [
        {
          type: "text" as const,
          text,
        },
      ],
    };
  }`,
  language: "typescript",
  description: "Formats a simple text response for MCP tools\n\nFile: src/utils/response-formatter.ts\nCategory: utility",
  tags: ["utility", "response", "formatting", "mcp", "demo_mcp", "utils"],
});
```

### Method 2: Create a Tool to Automate

Create a new MCP tool `saveUtilityFunctions` that:
1. Extracts all utility functions from the codebase
2. Uses `mcp_codeAdvocate_createCodeSnippet` to save each one
3. Tags them appropriately for easy discovery

### Method 3: Manual Extraction Script

Run a script that:
1. Reads utility files
2. Extracts functions
3. Generates CodeAdvocate API calls
4. Saves them to CodeAdvocate

---

## 📝 Recommended Tags

For all utility functions, use these base tags:
- `utility` - Marks as utility function
- `mcp` - Related to MCP
- `demo_mcp` - From demo_mcp project
- `[category]` - Category (utils, core, repository, etc.)
- `[function-name]` - Function name for searchability

---

## ✅ Benefits

1. **Reusability** - Functions available across MCP servers
2. **Discoverability** - Tagged and searchable in CodeAdvocate
3. **Documentation** - Each function includes description and file path
4. **Version Control** - Tracked in CodeAdvocate
5. **Sharing** - Can be shared with other developers/projects

---

## 🔍 Finding Saved Functions

Once saved, you can find them in CodeAdvocate by:
- Searching for tag: `demo_mcp`
- Searching for tag: `utility`
- Searching by function name
- Browsing by category

---

## 📊 Summary

**Total Utility Functions:** ~25 functions across 6 files

**Categories:**
- Response Formatting: 4 functions
- Error Handling: 3 functions
- Request Context: 3 functions
- Context Management: 5 functions
- Session Helpers: 10 functions
- Repository Helpers: 2 functions

**Next Step:** Create an MCP tool to automate saving all these functions to CodeAdvocate.


