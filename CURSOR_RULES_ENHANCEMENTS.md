# Cursor Rules Enhancements

**Date:** 2026-01-01  
**Status:** ✅ Complete

## Overview

Enhanced the `.cursorrules` file to include comprehensive tool introductions, CodeAdvocate MCP integration, and improved context retrieval workflows. The rules now guide the AI to proactively use CodeAdvocate tools for searching and fetching related context based on user intent.

---

## Key Enhancements

### 1. Comprehensive Tool Introduction

Added detailed introduction section covering:
- **Repository Tools** (34+ tools) - Management, analysis, rules, prompts, files, feedback, errors, learnings, patterns, mermaid, templates
- **Code Snippets & Knowledge** (15+ tools) - Snippets, collections, personal knowledge
- **Documentation Tools** (9+ tools) - Documentations, markdown documents
- **Analysis & Context Tools** - Repository analysis, context retrieval, cache management
- **Other Tools** - Analytics, accounts, teams, wellness

**Purpose:** Helps AI understand what tools are available and when to use them.

---

### 2. CodeAdvocate MCP Integration (CRITICAL)

Added comprehensive CodeAdvocate integration section with:

#### CodeAdvocate Search Tools (Priority 1)
- **Snippet Search**: `mcp_codeAdvocate_listSnippets` with search terms
- **Collection Search**: `mcp_codeAdvocate_listCollections`
- **Repository-Specific Tools**:
  - `mcp_codeAdvocate_listRepositorySnippets`
  - `mcp_codeAdvocate_listRepositoryLearnings`
  - `mcp_codeAdvocate_listRepositoryPatterns`
  - `mcp_codeAdvocate_listRepositoryErrors`
  - `mcp_codeAdvocate_listRepositoryMermaid`
  - `mcp_codeAdvocate_listRepositoryTemplates`
  - `mcp_codeAdvocate_listRepositoryFiles`
  - `mcp_codeAdvocate_listRepositoryFeedback`
- **Documentation Search**: `mcp_codeAdvocate_listDocumentations`, `mcp_codeAdvocate_listMarkdownDocuments`

#### CodeAdvocate Context Retrieval Workflow

**BEFORE answering ANY question or performing ANY task:**

1. **Extract User Intent**: What is the user trying to achieve?
2. **Search CodeAdvocate First**: Use CodeAdvocate tools with search terms from user's intent
3. **Search Local Context**: Use local tools (getRepoContext, getCachedRepoAnalysis, etc.)
4. **Combine Sources**: Merge CodeAdvocate results with local context

**Purpose:** Ensures AI always searches CodeAdvocate first for saved knowledge, patterns, learnings, and solutions.

---

### 3. Enhanced Context Retrieval Priority

Updated context retrieval to follow this priority:

1. **CodeAdvocate MCP tools** (search snippets, learnings, patterns, errors) - **FIRST**
2. Local cache (`getCachedRepoAnalysis`)
3. Repository context from API (`getRepoContext`)
4. Local documentation (`listMarkdownDocuments`, `listDocumentations`)
5. Web search for current information
6. Combine all sources

**Purpose:** Ensures CodeAdvocate is always searched first, leveraging saved knowledge and patterns.

---

### 4. Improved Example Workflows

Enhanced examples to show:
- How to use multiple CodeAdvocate tools
- How to extract search terms from user intent
- How to combine CodeAdvocate results with local context
- How to provide comprehensive answers

**Example: "How does authentication work in this codebase?"**

1. ✅ Call `mcp_codeAdvocate_listSnippets` with search: "authentication"
2. ✅ Call `mcp_codeAdvocate_listRepositorySnippets` with search: "authentication"
3. ✅ Call `mcp_codeAdvocate_listRepositoryLearnings` with search: "authentication"
4. ✅ Call `mcp_codeAdvocate_listRepositoryPatterns` with search: "auth"
5. ✅ Call `getCachedRepoAnalysis` if available
6. ✅ Call `getRepoContext` with search: "authentication"
7. ✅ Call `listMarkdownDocuments` with search: "authentication"
8. ✅ Combine ALL results from CodeAdvocate and local context
9. ✅ Provide comprehensive answer

---

### 5. User Intent Extraction

Added emphasis on:
- **Extract User Intent**: Understand what the user wants to achieve
- **Search with Relevant Terms**: Extract key terms from user's question/goal
- **Use Multiple CodeAdvocate Tools**: Don't just search snippets, also search learnings, patterns, errors, templates
- **Repository-Specific Searches**: Always use repository-specific CodeAdvocate tools when working with a repository

**Purpose:** Ensures AI understands user intent and searches CodeAdvocate appropriately.

---

## Benefits

### For Users
- ✅ **Better answers** - AI searches CodeAdvocate for saved knowledge first
- ✅ **Faster responses** - Leverages existing patterns and solutions
- ✅ **More comprehensive** - Combines CodeAdvocate + local context + web search
- ✅ **Context-aware** - Understands user intent and searches accordingly

### For AI Assistant
- ✅ **Clear instructions** - Knows exactly what tools to use and when
- ✅ **Priority order** - CodeAdvocate first, then local, then web
- ✅ **Proactive searching** - Searches CodeAdvocate without being asked
- ✅ **Comprehensive coverage** - Uses multiple CodeAdvocate tools for thorough search

---

## Implementation

### Auto-Creation
The enhanced `.cursorrules` file is automatically created on server startup if it doesn't exist.

**File:** `src/core/initializer.ts`

### Manual Update
If `.cursorrules` already exists, you can manually update it with the new content, or delete it and let the initializer recreate it on next server start.

---

## Testing

### Test CodeAdvocate Integration

1. **Start server** - Initializer creates `.cursorrules` automatically
2. **Ask a question** - "How do I implement authentication?"
3. **Verify** - AI should:
   - Call CodeAdvocate tools first
   - Search with relevant terms
   - Combine with local context
   - Provide comprehensive answer

### Test Context Retrieval

1. **Ask about codebase** - "How does X work in this codebase?"
2. **Verify** - AI should:
   - Extract key terms
   - Search CodeAdvocate with those terms
   - Search local context
   - Combine all results

---

## Files Modified

1. `src/core/initializer.ts`
   - Enhanced `CURSOR_RULES_CONTENT` with:
     - Comprehensive tool introduction
     - CodeAdvocate MCP integration section
     - Enhanced context retrieval workflows
     - Improved examples
     - User intent extraction guidance

---

## Related Documentation

- `docs/AUTO_INITIALIZATION.md` - Auto-initialization system
- `DIAGRAM_AND_CONTEXT_IMPROVEMENTS.md` - Context retrieval improvements
- `docs/MCP_SERVERS_AND_TOOLS_SUMMARY.md` - Available tools documentation

---

## Next Steps

1. Monitor AI behavior to ensure CodeAdvocate tools are being used
2. Verify context retrieval follows the priority order
3. Adjust rules if needed based on usage patterns
4. Add more CodeAdvocate tool examples if needed
