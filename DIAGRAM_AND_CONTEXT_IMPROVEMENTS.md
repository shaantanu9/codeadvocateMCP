# Diagram and Context Retrieval Improvements

**Date:** 2026-01-01  
**Status:** ✅ Complete

## Overview

This document describes improvements made to ensure:
1. The `createRepositoryMermaid` tool is properly called when users request diagrams
2. Context is automatically retrieved before answering questions
3. Web search is used when needed for comprehensive answers

---

## Changes Made

### 1. Enhanced `createRepositoryMermaid` Tool

#### Updated Tool Description
- **Before:** Generic description about creating Mermaid diagrams
- **After:** Explicit instruction to "ALWAYS USE THIS TOOL" when users ask for diagrams
- Added clear trigger phrases: "create", "add", "make", "generate" diagrams
- Emphasized that the tool MUST be called, not just code shown

#### Made `repositoryId` Optional
- **Before:** Required parameter
- **After:** Optional parameter with auto-detection
- Uses `resolveRepositoryId()` from `BaseToolHandler` to auto-detect from workspace
- Falls back to git remote URL, repository name, or workspace path

#### Code Changes
```typescript
// Before
repositoryId: string;  // Required

// After
repositoryId?: string;  // Optional with auto-detection
const repositoryId = await this.resolveRepositoryId(params.repositoryId);
```

**File:** `src/tools/repositories/mermaid/create-repository-mermaid.tool.ts`

---

### 2. Created `.cursorrules` File

Created comprehensive rules file that instructs the AI assistant to:

#### Mermaid Diagram Creation
- **ALWAYS** call `createRepositoryMermaid` when users request diagrams
- Do NOT just show code - actually create the diagram
- Auto-detect repositoryId when not provided
- Generate proper Mermaid syntax

#### Automatic Context Retrieval
- **ALWAYS** retrieve context before answering questions about:
  - Codebase structure
  - Repository information
  - Implementation details
  - Architecture patterns
  - Functionality
  - Any technical question

#### Context Retrieval Priority
1. Check local cache first (`getCachedRepoAnalysis`)
2. Get repository context from API (`getRepoContext`)
3. Search documentation and markdown files
4. Search online if information not available locally
5. Combine all sources for comprehensive answers

#### Web Search Integration
- Use web search when:
  - Information not available in local context
  - User asks about current technologies/libraries
  - Need to verify or get latest information
  - Solving problems requiring external knowledge

**File:** `.cursorrules`

---

## How It Works

### Diagram Creation Flow

```
User: "Create a flowchart showing authentication"
  ↓
AI recognizes diagram request
  ↓
Calls createRepositoryMermaid tool
  ↓
Auto-detects repositoryId from workspace
  ↓
Generates Mermaid syntax
  ↓
Creates diagram in repository
  ↓
Returns success message
```

### Context Retrieval Flow

```
User: "How does authentication work?"
  ↓
AI recognizes question about codebase
  ↓
Calls getRepoContext with search: "authentication"
  ↓
Calls getCachedRepoAnalysis if available
  ↓
Searches markdown documents
  ↓
Combines all context
  ↓
Provides comprehensive answer
```

---

## Benefits

### For Users
- ✅ No need to provide repositoryId manually
- ✅ Diagrams are actually created, not just described
- ✅ Answers are based on actual repository context
- ✅ Up-to-date information from web search when needed

### For AI Assistant
- ✅ Clear instructions on when to use tools
- ✅ Automatic context retrieval workflow
- ✅ Better answers based on real data
- ✅ Proactive information gathering

---

## Testing

### Test Diagram Creation
```bash
# User request: "Create a flowchart for user login"
# Expected: createRepositoryMermaid tool is called
# Expected: repositoryId is auto-detected
# Expected: Diagram is created in repository
```

### Test Context Retrieval
```bash
# User request: "How does the authentication system work?"
# Expected: getRepoContext is called first
# Expected: getCachedRepoAnalysis is checked
# Expected: Documentation is searched
# Expected: Answer is based on retrieved context
```

---

## Files Modified

1. `src/tools/repositories/mermaid/create-repository-mermaid.tool.ts`
   - Updated tool description
   - Made repositoryId optional
   - Added auto-detection logic

2. `.cursorrules` (new file, auto-created on first run)
   - Added comprehensive rules for tool usage
   - Added context retrieval instructions
   - Added web search integration guidelines
   - **Auto-created by initializer on server startup**

3. `src/core/initializer.ts` (new file)
   - Creates `.cursorrules` file on first run
   - Ensures all cache directories exist
   - Runs automatically on server startup

4. `src/server/index.ts`
   - Integrated initialization into server startup
   - Calls `initializeMcpServer()` before starting server

---

## Auto-Initialization

The MCP server now automatically initializes on first run:

- ✅ Creates `.cursorrules` file if it doesn't exist
- ✅ Creates all required cache directories
- ✅ Sets up proper directory structure
- ✅ Runs on every server startup (checks and creates missing items)

**See:** `docs/AUTO_INITIALIZATION.md` for details

## Next Steps

1. Monitor tool usage to ensure diagrams are being created
2. Verify context retrieval is happening automatically
3. Adjust rules if needed based on usage patterns
4. Consider adding more automatic context retrieval hooks if needed
5. Test auto-initialization on fresh installations

---

## Related Documentation

- `docs/HOW_TO_USE_MERMAID_TOOL.md` - How to use Mermaid tools
- `docs/REPOSITORY_ID_AUTO_DETECTION.md` - Repository ID auto-detection
- `docs/REPOSITORY_CACHE_SYSTEM.md` - Repository caching system
