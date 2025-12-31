# MCP Servers and Tools Summary

**Date:** 2025-01-27  
**Status:** ✅ Complete Inventory

## 🖥️ MCP Server Configuration

### Our MCP Server: `demo_mcp`

**Server Details:**

- **Name:** demo-mcp-server
- **Version:** 1.0.0
- **URL:** `http://localhost:3111/mcp`
- **Transport:** Streamable HTTP (SSE)
- **Protocol:** MCP 2025-03-26
- **Authentication:** Token-based (Bearer token required)

**Configuration File:** `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "demo_mcp": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

---

## 📊 Available Tools Summary

**Total Tools:** 100+ tools organized into 15 categories

### 1. **Snippets** (11 tools)

- `listSnippets` - List code snippets with filters
- `getSnippet` - Get specific snippet by ID
- `createSnippet` - Create new code snippet
- `updateSnippet` - Update existing snippet
- `toggleFavoriteSnippet` - Toggle favorite status
- `archiveSnippet` - Archive a snippet
- `getRecentSnippets` - Get recently created snippets
- `getRecentlyViewedSnippets` - Get recently viewed snippets
- `getTrendingSnippets` - Get trending snippets
- `getPublicSnippets` - Get public snippets
- `getArchivedSnippets` - Get archived snippets

### 2. **Projects** (5 tools)

- `listProjects` - List projects with filters
- `getProject` - Get specific project by ID
- `createProject` - Create new project
- `updateProject` - Update existing project
- `getProjectSnippets` - Get snippets for a project

### 3. **Collections** (8 tools)

- `listCollections` - List collections
- `createCollection` - Create new collection
- `getCollection` - Get specific collection
- `updateCollection` - Update collection
- `deleteCollection` - Delete collection
- `listCollectionSnippets` - List snippets in collection
- `addSnippetToCollection` - Add snippet to collection
- `removeSnippetFromCollection` - Remove snippet from collection

### 4. **Repositories** (18 tools)

#### Repository Management (4 tools)

- `listRepositories` - List repositories
- `getRepository` - Get specific repository
- `createRepository` - Create new repository
- `updateRepository` - Update repository

#### Repository Rules (4 tools)

- `listRepositoryRules` - List rules for repository
- `createRepositoryRule` - Create repository rule
- `getRepositoryRule` - Get specific rule
- `updateRepositoryRule` - Update rule

#### Repository Prompts (4 tools)

- `listRepositoryPrompts` - List prompts for repository
- `createRepositoryPrompt` - Create repository prompt
- `getRepositoryPrompt` - Get specific prompt
- `updateRepositoryPrompt` - Update prompt

#### Repository PR Rules (4 tools)

- `listRepositoryPrRules` - List PR rules
- `createRepositoryPrRule` - Create PR rule
- `getRepositoryPrRule` - Get specific PR rule
- `updateRepositoryPrRule` - Update PR rule

#### Repository Files (5 tools)

- `listRepositoryFiles` - List files for repository
- `createRepositoryFile` - Create repository file
- `getRepositoryFile` - Get specific file
- `updateRepositoryFile` - Update file
- `deleteRepositoryFile` - Delete file

#### Repository Permissions (1 tool)

- `getRepositoryPermissions` - Get repository permissions

#### Repository Analysis (1 tool)

- `getRepositoryAnalysis` - Get analysis data for repository

### 5. **Documentations** (5 tools)

- `listDocumentations` - List documentations
- `getDocumentation` - Get specific documentation
- `createDocumentation` - Create documentation
- `updateDocumentation` - Update documentation
- `getMcpContext` - Get MCP context from documentations

### 6. **Markdown Documents** (4 tools)

- `listMarkdownDocuments` - List markdown documents
- `getMarkdownDocument` - Get specific document
- `createMarkdownDocument` - Create markdown document
- `updateMarkdownDocument` - Update markdown document

### 7. **Code Snippets** (4 tools)

- `listCodeSnippets` - List code snippets
- `getCodeSnippet` - Get specific code snippet
- `createCodeSnippet` - Create code snippet
- `getCodeSnippetsByTags` - Get snippets by tags

### 8. **Personal Knowledge** (4 tools)

- `listPersonalLinks` - List personal links
- `listPersonalNotes` - List personal notes
- `listPersonalFiles` - List personal files
- `searchPersonalKnowledge` - Search personal knowledge

### 9. **Archive & Trash** (2 tools)

- `listArchive` - List archived items
- `listTrash` - List trashed items

### 10. **Analytics** (3 tools)

- `getActivity` - Get activity feed
- `getAnalytics` - Get analytics data
- `getPopularItems` - Get popular items

### 11. **Explore** (1 tool)

- `explorePublicContent` - Explore public content

### 12. **Accounts & Permissions** (2 tools)

- `getAccountContext` - Get account context
- `getAccessibleRepositories` - Get accessible repositories

### 13. **Companies** (2 tools)

- `listCompanies` - List companies
- `getCompany` - Get specific company

### 14. **Teams** (3 tools)

- `listTeams` - List teams
- `getTeamMembers` - Get team members
- `getTeamProjects` - Get team projects

### 15. **Repository Analysis** (5 tools)

- `analyzeAndSaveRepository` - Analyze and save repository (comprehensive)
- `getRepositoryContext` - Get repository context
- `getCachedRepositoryAnalysis` - Get cached analysis
- `listCachedRepositories` - List cached repositories
- `listProgressCheckpoints` - List progress checkpoints

### 16. **Generic** (1 tool)

- `callExternalApi` - Make generic API call

### 17. **Client Info** (1 tool)

- `getClientInfo` - Get client/editor information

### 18. **Wellness** (2 tools)

- `breakReminder` - Get break reminders
- `recordBreak` - Record break taken

### 19. **Session Management** (Multiple tools)

- Session management tools registered separately
- See `src/tools/session-tools.ts` for details

---

## 🔗 External MCP Servers

### CodeAdvocate MCP Server

**Available Tools:**
The CodeAdvocate MCP server provides tools for managing code snippets, projects, collections, and more. These tools are available through the MCP protocol.

**Key CodeAdvocate Tools:**

- `mcp_codeAdvocate_createCodeSnippet` - Create code snippet
- `mcp_codeAdvocate_getSnippet` - Get snippet
- `mcp_codeAdvocate_listSnippets` - List snippets
- `mcp_codeAdvocate_createProject` - Create project
- `mcp_codeAdvocate_listProjects` - List projects
- `mcp_codeAdvocate_createCollection` - Create collection
- `mcp_codeAdvocate_listCollections` - List collections
- And many more...

**Usage:**
These tools can be called directly from other MCP servers or from Cursor IDE when CodeAdvocate MCP server is configured.

---

## 📝 How to Use Tools

### From Cursor IDE

1. **Ensure MCP server is running:**

   ```bash
   npm run dev
   ```

2. **Restart Cursor IDE** to connect to MCP server

3. **Use tools in chat:**
   - "Use the listSnippets tool to show all snippets"
   - "Create a new project using createProject"
   - "Analyze the current repository using analyzeAndSaveRepository"

### From Other MCP Servers

Tools can be called programmatically using the MCP protocol. See individual tool implementations in `src/tools/` for details.

---

## 🔍 Tool Discovery

### List All Tools

Use the MCP protocol's `tools/list` method to get all available tools:

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Get Tool Details

Use `tools/call` to execute a tool:

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "listSnippets",
      "arguments": {}
    }
  }'
```

---

## 📚 Tool Categories Location

All tools are organized in `src/tools/` by category:

```
src/tools/
├── snippets/          # 11 tools
├── projects/          # 5 tools
├── collections/       # 8 tools
├── repositories/      # 18 tools
├── documentations/    # 5 tools
├── markdown/         # 4 tools
├── code-snippets/    # 4 tools
├── personal/         # 4 tools
├── archive/          # 2 tools
├── analytics/        # 3 tools
├── explore/          # 1 tool
├── accounts/         # 2 tools
├── companies/        # 2 tools
├── teams/            # 3 tools
├── repository-analysis/ # 5 tools
├── generic/          # 1 tool
└── wellness/         # 2 tools
```

---

## ✅ Status

- **MCP Server:** ✅ Running and configured
- **Tools Registered:** ✅ 100+ tools
- **CodeAdvocate Integration:** ✅ Available via MCP
- **Documentation:** ✅ Complete

---

## 🚀 Next Steps

To add utility functions to CodeAdvocate:

1. Use `mcp_codeAdvocate_createCodeSnippet` tool
2. Extract utility functions from codebase
3. Save each function as a code snippet with proper tags
4. Functions will be available for reuse in other MCP servers

See `docs/UTILITY_FUNCTIONS_TO_CODEADVOCATE.md` for detailed instructions.

