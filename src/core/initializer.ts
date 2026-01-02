/**
 * MCP Server Initialization
 *
 * Handles first-time setup and ensures all required files and directories exist.
 * Runs on server startup to ensure proper configuration.
 */

import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { logger } from "./logger.js";

const CURSOR_RULES_CONTENT = `# Cursor Rules for MCP Server

## Introduction

This MCP server provides comprehensive tools for repository management, code analysis, documentation, and knowledge retrieval. You have access to 100+ tools organized by category. **ALWAYS use these tools proactively** to retrieve context, search for information, and perform actions rather than guessing or making assumptions.

## Available Tool Categories

### Repository Tools (34+ tools)
- **Repository Management**: listRepositories, getRepository, createRepository, updateRepository
- **Repository Analysis**: analyzeAndSaveRepository, getRepoContext, getCachedRepoAnalysis, listCachedRepositories
- **Repository Rules**: listRepositoryRules, createRepositoryRule, setupMcpGuidanceRules
- **Repository Prompts**: listRepositoryPrompts, createRepositoryPrompt
- **Repository Files**: listRepositoryFiles, getRepositoryFile, createRepositoryFile
- **Repository Feedback**: listRepositoryFeedback, createRepositoryFeedback
- **Repository Errors**: listRepositoryErrors, createRepositoryError
- **Repository Learnings**: listRepositoryLearnings, createRepositoryLearning
- **Repository Patterns**: listRepositoryPatterns, createRepositoryPattern
- **Repository Mermaid**: listRepositoryMermaid, createRepositoryMermaid, getRepositoryMermaid
- **Repository Templates**: listRepositoryTemplates, createRepositoryTemplate

### Code Snippets & Knowledge (15+ tools)
- **Snippets**: listSnippets, getSnippet, createSnippet, updateSnippet, getRecentSnippets
- **Code Snippets**: listCodeSnippets, getCodeSnippet, createCodeSnippet
- **Collections**: listCollections, createCollection, listCollectionSnippets
- **Personal Knowledge**: searchPersonalKnowledge, listPersonalLinks, listPersonalNotes, listPersonalFiles

### Documentation Tools (9+ tools)
- **Documentations**: listDocumentations, getDocumentation, createDocumentation, getMcpContext
- **Markdown Documents**: listMarkdownDocuments, getMarkdownDocument, createMarkdownDocument

### Analysis & Context Tools
- **Repository Analysis**: analyzeAndSaveRepository (comprehensive codebase analysis)
- **Context Retrieval**: getRepoContext, getCachedRepoAnalysis, getMcpContext
- **Cache Management**: listCachedRepositories, listCheckpoints

### Other Tools
- **Analytics**: getActivity, getAnalytics, getPopularItems
- **Accounts**: getAccountContext, getAccessibleRepositories
- **Teams**: listTeams, getTeamMembers, getTeamProjects
- **Wellness**: breakReminder, recordBreak

## CodeAdvocate MCP Integration - CRITICAL

**YOU MUST use CodeAdvocate MCP tools to search and fetch related context.** CodeAdvocate provides access to saved code snippets, patterns, learnings, errors, and documentation that can help answer user questions.

### CodeAdvocate Search Tools (ALWAYS USE THESE FIRST)

When user asks about or wants to achieve something:

1. **Search CodeAdvocate Snippets** - Use \`mcp_codeAdvocate_listSnippets\` with:
   - \`search\`: Extract key terms from user's question/goal
   - \`language\`: If user mentions a specific language
   - \`tags\`: Relevant tags based on user's intent
   - \`favorite\`: true if looking for commonly used patterns

2. **Search CodeAdvocate Collections** - Use \`mcp_codeAdvocate_listCollections\` with:
   - \`search\`: Topic or category user is asking about

3. **Search Repository Context in CodeAdvocate** - Use repository-specific CodeAdvocate tools:
   - \`mcp_codeAdvocate_listRepositorySnippets\` - Find saved code snippets for the repository
   - \`mcp_codeAdvocate_listRepositoryLearnings\` - Find saved learnings about the repository
   - \`mcp_codeAdvocate_listRepositoryErrors\` - Find similar errors/solutions
   - \`mcp_codeAdvocate_listRepositoryPatterns\` - Find coding patterns used
   - \`mcp_codeAdvocate_listRepositoryMermaid\` - Find existing diagrams
   - \`mcp_codeAdvocate_listRepositoryTemplates\` - Find code templates
   - \`mcp_codeAdvocate_listRepositoryFiles\` - Find saved documentation files
   - \`mcp_codeAdvocate_listRepositoryFeedback\` - Find related feedback/discussions

4. **Search Documentation** - Use \`mcp_codeAdvocate_listDocumentations\` or \`mcp_codeAdvocate_listMarkdownDocuments\` with:
   - \`search\`: Topic user is asking about
   - \`category\`: Relevant category (e.g., "api", "backend", "frontend")

### CodeAdvocate Context Retrieval Workflow

**BEFORE answering ANY question or performing ANY task:**

1. **Extract User Intent**: What is the user trying to achieve?
   - What problem are they solving?
   - What information do they need?
   - What action do they want to perform?

2. **Search CodeAdvocate First**:
   - Use \`mcp_codeAdvocate_listSnippets\` with search terms from user's intent
   - Use repository-specific CodeAdvocate tools if working with a repository
   - Search for similar patterns, learnings, or solutions

3. **Search Local Context**:
   - Use \`getRepoContext\` with search terms
   - Use \`getCachedRepoAnalysis\` if repository was analyzed
   - Use \`listMarkdownDocuments\` or \`listDocumentations\` for documentation

4. **Combine Sources**:
   - Merge CodeAdvocate results with local context
   - Use web search if needed for current best practices
   - Provide comprehensive answer based on all sources

### Example: User asks "How do I implement authentication?"

1. ✅ Call \`mcp_codeAdvocate_listSnippets\` with search: "authentication"
2. ✅ Call \`mcp_codeAdvocate_listRepositorySnippets\` if in a repository
3. ✅ Call \`mcp_codeAdvocate_listRepositoryLearnings\` with search: "authentication"
4. ✅ Call \`mcp_codeAdvocate_listRepositoryPatterns\` with search: "auth"
5. ✅ Call \`getRepoContext\` with search: "authentication"
6. ✅ Call \`getCachedRepoAnalysis\` if available
7. ✅ Search markdown documents for auth docs
8. ✅ Combine all results and provide comprehensive answer

## Critical Tool Usage Rules

### 1. Mermaid Diagram Creation - ALWAYS USE THE TOOL
When a user asks to:
- "create a diagram"
- "add a mermaid diagram"
- "make a flowchart"
- "generate a sequence diagram"
- "create an architecture diagram"
- "add a visual diagram"
- Any variation of creating/adding/making diagrams

**YOU MUST:**
1. Call the \`createRepositoryMermaid\` tool immediately
2. Do NOT just describe or show code - actually create the diagram
3. Auto-detect repositoryId from workspace if not provided
4. Generate proper Mermaid syntax for the requested diagram type
5. Include a clear title and explanation

**DO NOT:**
- Just show Mermaid code without calling the tool
- Ask the user to create it manually
- Skip creating the diagram

### 2. Automatic Context Retrieval - ALWAYS RETRIEVE CONTEXT FIRST

Before answering ANY question or performing ANY task about:
- Codebase structure
- Repository information
- Implementation details
- Architecture patterns
- Functionality
- How to do something
- Best practices
- Any technical question

**YOU MUST follow this priority order:**

**Step 1: Search CodeAdvocate First (CRITICAL)**
1. Extract key terms from user's question/goal
2. Call \`mcp_codeAdvocate_listSnippets\` with search terms
3. Call repository-specific CodeAdvocate tools if in a repository:
   - \`mcp_codeAdvocate_listRepositorySnippets\`
   - \`mcp_codeAdvocate_listRepositoryLearnings\`
   - \`mcp_codeAdvocate_listRepositoryPatterns\`
   - \`mcp_codeAdvocate_listRepositoryErrors\`
   - \`mcp_codeAdvocate_listRepositoryMermaid\`
   - \`mcp_codeAdvocate_listRepositoryTemplates\`
   - \`mcp_codeAdvocate_listRepositoryFiles\`
4. Call \`mcp_codeAdvocate_listDocumentations\` or \`mcp_codeAdvocate_listMarkdownDocuments\` for documentation

**Step 2: Search Local Context**
1. Call \`getCachedRepoAnalysis\` if repository was analyzed (fastest)
2. Call \`getRepoContext\` with search terms from user's intent
3. Call \`listMarkdownDocuments\` or \`listDocumentations\` for local docs
4. Call \`listSnippets\` or \`searchPersonalKnowledge\` for saved knowledge

**Step 3: Search Online (if needed)**
1. Use web search tools for current best practices
2. Search for latest information if local context is outdated
3. Find external documentation or examples

**Step 4: Combine and Synthesize**
1. Merge all CodeAdvocate results
2. Combine with local context
3. Add web search results if relevant
4. Provide comprehensive answer based on ALL sources

**Context Retrieval Priority (Summary):**
1. **CodeAdvocate MCP tools** (search snippets, learnings, patterns, errors)
2. Local cache (\`getCachedRepoAnalysis\`)
3. Repository context from API (\`getRepoContext\`)
4. Local documentation (\`listMarkdownDocuments\`, \`listDocumentations\`)
5. Web search for current information
6. Combine all sources for comprehensive answers

### 3. Web Search Integration

When:
- Information is not available in local context
- User asks about current technologies, libraries, or best practices
- Need to verify or get latest information
- Solving problems that require external knowledge

**YOU MUST:**
- Use web search tools to find current information
- Combine web search results with local context
- Provide accurate, up-to-date answers

### 4. Repository ID Auto-Detection

Most repository tools support auto-detection of \`repositoryId\`:
- If \`repositoryId\` is not provided, tools will auto-detect from workspace
- Workspace detection uses git remote URL, repository name, or workspace path
- Always try to use tools without requiring explicit repositoryId when possible

### 5. Tool Calling Best Practices

**When to call tools:**
- Always call tools when user explicitly requests an action (create, add, get, list, etc.)
- Retrieve context before answering questions
- Search online when local context is insufficient
- Use tools proactively to gather information

**Tool calling patterns:**
- For questions → Retrieve context first, then answer
- For actions → Call the appropriate tool immediately
- For diagrams → Always call \`createRepositoryMermaid\`
- For searches → Use multiple tools to gather comprehensive information

## Example Workflows

### User asks: "Create a flowchart showing the authentication flow"
1. ✅ Call \`createRepositoryMermaid\` with:
   - title: "Authentication Flow"
   - content: [proper Mermaid flowchart syntax]
   - category: "workflow"
   - Auto-detect repositoryId

### User asks: "How does authentication work in this codebase?"
1. ✅ Call \`mcp_codeAdvocate_listSnippets\` with search: "authentication"
2. ✅ Call \`mcp_codeAdvocate_listRepositorySnippets\` with search: "authentication"
3. ✅ Call \`mcp_codeAdvocate_listRepositoryLearnings\` with search: "authentication"
4. ✅ Call \`mcp_codeAdvocate_listRepositoryPatterns\` with search: "auth"
5. ✅ Call \`getCachedRepoAnalysis\` if available
6. ✅ Call \`getRepoContext\` with search: "authentication"
7. ✅ Call \`listMarkdownDocuments\` with search: "authentication"
8. ✅ Combine ALL results from CodeAdvocate and local context
9. ✅ Provide comprehensive answer based on retrieved context

### User asks: "What's the best way to implement rate limiting?"
1. ✅ Call \`mcp_codeAdvocate_listSnippets\` with search: "rate limiting"
2. ✅ Call \`mcp_codeAdvocate_listRepositorySnippets\` with search: "rate limit"
3. ✅ Call \`mcp_codeAdvocate_listRepositoryLearnings\` with search: "rate limiting"
4. ✅ Call \`mcp_codeAdvocate_listRepositoryPatterns\` with search: "rate limit"
5. ✅ Call \`getRepoContext\` with search: "rate limiting"
6. ✅ Call \`getCachedRepoAnalysis\` if available
7. ✅ Search online for current best practices
8. ✅ Combine CodeAdvocate results + local context + web search
9. ✅ Provide informed recommendation based on all sources

## Important Notes

- **ALWAYS use CodeAdvocate MCP tools first** - Search CodeAdvocate before local context
- **Never skip tool calls** - If a tool exists for a task, use it
- **Always retrieve context** - Don't guess, retrieve actual data from tools
- **Extract user intent** - Understand what the user wants to achieve, then search accordingly
- **Combine all sources** - CodeAdvocate + local context + web search for best results
- **Auto-detect when possible** - Don't require explicit IDs when tools support auto-detection
- **Be proactive** - Retrieve context and search CodeAdvocate without being asked
- **Search with relevant terms** - Extract key terms from user's question/goal for better search results
- **Use multiple CodeAdvocate tools** - Don't just search snippets, also search learnings, patterns, errors, templates
- **Repository-specific searches** - Always use repository-specific CodeAdvocate tools when working with a repository
`;

/**
 * Initialize MCP server on first run
 * - Creates .cursorrules file if it doesn't exist
 * - Ensures all cache directories exist
 * - Sets up proper directory structure
 */
export function initializeMcpServer(): void {
  const workspaceRoot = process.cwd();
  const cursorRulesPath = join(workspaceRoot, ".cursorrules");

  logger.info("[Initializer] Checking MCP server initialization...");

  // 1. Create .cursorrules file if it doesn't exist
  if (!existsSync(cursorRulesPath)) {
    try {
      writeFileSync(cursorRulesPath, CURSOR_RULES_CONTENT, "utf-8");
      logger.info("[Initializer] ✅ Created .cursorrules file");
    } catch (error) {
      logger.error("[Initializer] Failed to create .cursorrules file", {
        error: error instanceof Error ? error.message : String(error),
        path: cursorRulesPath,
      });
    }
  } else {
    logger.debug("[Initializer] .cursorrules file already exists");
  }

  // 2. Ensure cache directories exist
  const cacheDirs = [
    join(workspaceRoot, ".cache", "repository-analysis"),
    join(workspaceRoot, ".mcp-sessions", "sessions"),
    join(workspaceRoot, ".mcp-sessions", "cache"),
    join(workspaceRoot, "logs", "tool-calls"),
    join(workspaceRoot, "logs", "tool-calls-failed"),
  ];

  for (const dir of cacheDirs) {
    if (!existsSync(dir)) {
      try {
        mkdirSync(dir, { recursive: true });
        logger.debug(`[Initializer] Created directory: ${dir}`);
      } catch (error) {
        logger.error(`[Initializer] Failed to create directory: ${dir}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  logger.info("[Initializer] ✅ MCP server initialization complete");
}

/**
 * Check if this is the first run (no .cursorrules file)
 */
export function isFirstRun(): boolean {
  const workspaceRoot = process.cwd();
  const cursorRulesPath = join(workspaceRoot, ".cursorrules");
  return !existsSync(cursorRulesPath);
}
