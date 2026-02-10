# MCP Server Gap Analysis & Improvement Plan

> Main App: 235 API routes | MCP Server: 107 tools | Gap: ~50 missing endpoints + quality improvements
> Last updated: February 2026

---

## Table of Contents

1. [Coverage Summary](#1-coverage-summary)
2. [Critical Gaps — Must Fix](#2-critical-gaps--must-fix)
3. [Important Gaps — High Value](#3-important-gaps--high-value)
4. [Nice-to-Have Gaps](#4-nice-to-have-gaps)
5. [MCP-Specific Improvements](#5-mcp-specific-improvements)
6. [Full Endpoint Coverage Matrix](#6-full-endpoint-coverage-matrix)
7. [Implementation Priority](#7-implementation-priority)

---

## 1. Coverage Summary

### What's Well Covered (✅)
- **Snippets** — 11/17 endpoints (list, get, create, update, favorite, archive, recent, trending, public, archived, recently-viewed)
- **Collections** — 8/8 endpoints (full CRUD + snippet management)
- **Repositories** — 34/34+ endpoints (rules, prompts, PR rules, files, permissions, feedback, errors, learnings, patterns, mermaid, templates)
- **Documentations** — 5/7 endpoints (list, get, create, update, MCP context)
- **Markdown Documents** — 4/4 endpoints (full CRUD)
- **Code Snippets** — 4/4 endpoints (list, get, create, by-tags)
- **Teams** — 3/5 endpoints (list, members, projects)
- **Repository Analysis** — 5/5 endpoints (analyze, context, cached, checkpoints)
- **Session Management** — 6 tools (workspace, session data, cache)
- **Wellness** — 2 tools (break reminder, record break)

### What's Partially Covered (⚠️)
- **Snippets** — missing delete, unarchive, trash, restore, permanent delete, annotations, analysis, count
- **Personal Knowledge** — only list operations, no create/update/delete
- **Analytics** — basic coverage, missing detailed endpoints
- **Archive/Trash** — list only, no restore/permanent operations
- **Accounts** — only context and repositories, missing 10+ endpoints

### What's Completely Missing (❌)
- **Search** — no global search tool
- **Dashboard Stats** — no stats/overview tool
- **User Profile** — no "who am I" or profile tools
- **Notifications** — no notification tools
- **Q&A System** — no questions/answers tools
- **Learning Items** — no learning management tools
- **Leaderboards** — no gamification tools
- **Code Analysis** — no code quality/security analysis tool
- **GitHub Integration** — no connect/sync/status tools
- **Companies** — tools exist but disabled
- **Projects** — tools exist but disabled

---

## 2. Critical Gaps — Must Fix

These are missing tools that break basic workflows.

### 2.1 Delete Snippet
**API:** `DELETE /api/snippets/[id]`
**Impact:** Users can create and update snippets but cannot delete them via MCP. This is a fundamental CRUD gap.
```
Tool: deleteSnippet
Params: snippetId (required)
Endpoint: DELETE /api/snippets/${snippetId}
```

### 2.2 Snippet Count
**API:** `GET /api/snippets/count`
**Impact:** AI assistants cannot know how many snippets a user has. Useful for context and decision-making.
```
Tool: getSnippetCount
Params: (none, or optional language/tag filters)
Endpoint: GET /api/snippets/count
```

### 2.3 Unarchive Snippet
**API:** `POST /api/snippets/[id]/unarchive`
**Impact:** Users can archive but cannot unarchive. One-way operation.
```
Tool: unarchiveSnippet
Params: snippetId (required)
Endpoint: POST /api/snippets/${snippetId}/unarchive
```

### 2.4 Trash / Restore / Permanent Delete
**APIs:**
- `POST /api/snippets/[id]/trash` — move to trash
- `POST /api/snippets/[id]/restore` — restore from trash
- `DELETE /api/snippets/[id]/permanent` — permanently delete
**Impact:** Complete lifecycle management is broken without these.
```
Tool: trashSnippet        → POST /api/snippets/${snippetId}/trash
Tool: restoreSnippet      → POST /api/snippets/${snippetId}/restore
Tool: permanentlyDelete   → DELETE /api/snippets/${snippetId}/permanent
```

### 2.5 Global Search / Skills Search
**APIs:**
- `GET /api/search` — basic search
- `GET /api/skills/search` — multi-source search (aggregates snippets, docs, learnings, patterns by relevance)
**Impact:** This is the #1 most useful tool for AI assistants. Without search, the AI has to list everything and filter manually.
```
Tool: search
Params: query (required), type (optional: snippets|docs|learnings|all), page, limit
Endpoint: GET /api/skills/search?q=${query}
```

### 2.6 Dashboard Stats
**API:** `GET /api/dashboard/stats`
**Impact:** AI assistants cannot give users an overview of their data. Essential for "summarize my workspace" type requests.
```
Tool: getDashboardStats
Params: (none)
Endpoint: GET /api/dashboard/stats
```

### 2.7 Who Am I / Current User
**API:** `GET /api/auth/me`
**Impact:** AI assistants don't know who the current user is, their role, or account type. Needed for personalized responses.
```
Tool: whoAmI
Params: (none)
Endpoint: GET /api/auth/me
```

---

## 3. Important Gaps — High Value

These add significant value for developer workflows.

### 3.1 Snippet Annotations
**APIs:**
- `GET /api/snippets/[id]/annotations` — get annotations for a snippet
- `POST /api/snippets/[id]/annotations` — create annotation (code review comments)
**Impact:** AI can review code and leave annotations, or read existing review comments.
```
Tool: getSnippetAnnotations  → GET /api/snippets/${snippetId}/annotations
Tool: createAnnotation       → POST /api/snippets/${snippetId}/annotations
```

### 3.2 Snippet / Code Analysis
**APIs:**
- `GET /api/snippets/[id]/analyze` — get cached analysis
- `POST /api/snippets/[id]/analyze` — trigger analysis
- `POST /api/code/analyze` — analyze arbitrary code
**Impact:** AI can analyze code quality, security issues, performance problems. Huge value for developer workflows.
```
Tool: analyzeSnippet    → POST /api/snippets/${snippetId}/analyze
Tool: analyzeCode       → POST /api/code/analyze (body: { code, language })
```

### 3.3 Notifications
**APIs:**
- `GET /api/notifications` — list notifications (paginated, filterable)
- `GET /api/notifications/unread-count` — unread count
- `PATCH /api/notifications/[id]/read` — mark as read
**Impact:** AI can check and manage notifications for the user.
```
Tool: listNotifications      → GET /api/notifications
Tool: getUnreadCount         → GET /api/notifications/unread-count
Tool: markNotificationRead   → PATCH /api/notifications/${id}/read
```

### 3.4 Questions & Answers (Q&A)
**APIs:**
- `GET /api/questions` — list questions
- `POST /api/questions` — create question
- `GET /api/questions/[id]` — get question
- `GET /api/questions/[id]/answers` — get answers
- `POST /api/questions/[id]/answers` — post answer
- `GET /api/answers/[id]` — get specific answer
- `PATCH /api/answers/[id]` — update answer
- `POST /api/answers/[id]/accept` — accept answer
**Impact:** AI can participate in Q&A — ask questions, answer them, accept solutions.
```
Tool: listQuestions     → GET /api/questions
Tool: createQuestion    → POST /api/questions
Tool: getQuestion       → GET /api/questions/${id}
Tool: answerQuestion    → POST /api/questions/${id}/answers
Tool: acceptAnswer      → POST /api/answers/${id}/accept
```

### 3.5 Learning Items
**APIs:**
- `GET /api/learning` — list learning items
- `POST /api/learning` — create learning item
- `GET /api/learning/[id]` — get learning item
**Impact:** AI can create learning notes from code sessions, building a knowledge base over time.
```
Tool: listLearningItems   → GET /api/learning
Tool: createLearningItem  → POST /api/learning
Tool: getLearningItem     → GET /api/learning/${id}
```

### 3.6 Personal Knowledge CRUD (Complete)
**Current state:** Only list operations exist. Missing create, get-by-id, update, delete for notes, links, files.
**APIs:**
- `POST /api/personal/notes` — create note
- `GET/PUT/DELETE /api/personal/notes/[id]` — CRUD
- `POST /api/personal/links` — create link
- `GET/PUT/DELETE /api/personal/links/[id]` — CRUD
- `POST /api/personal/files` — create file
- `GET/PUT/DELETE /api/personal/files/[id]` — CRUD
- `GET/POST /api/personal/tags` — tag management
**Impact:** AI can create and manage personal knowledge, not just read it.
```
Tool: createPersonalNote    → POST /api/personal/notes
Tool: getPersonalNote       → GET /api/personal/notes/${id}
Tool: updatePersonalNote    → PUT /api/personal/notes/${id}
Tool: deletePersonalNote    → DELETE /api/personal/notes/${id}
Tool: createPersonalLink    → POST /api/personal/links
Tool: createPersonalFile    → POST /api/personal/files
Tool: listPersonalTags      → GET /api/personal/tags
Tool: createPersonalTag     → POST /api/personal/tags
```

### 3.7 Leaderboards
**API:** `GET /api/leaderboards/[type]` (all-time, weekly, monthly)
**Impact:** Gamification engagement — AI can show user ranking, motivate contributions.
```
Tool: getLeaderboard → GET /api/leaderboards/${type}
```

### 3.8 User Profile & Reputation
**APIs:**
- `GET /api/users/[username]` — public profile
- `GET /api/users/[username]/activity` — user activity
- `GET /api/users/by-id/[userId]/reputation` — reputation data
- `GET /api/users/by-id/[userId]/reputation/history` — reputation history
- `GET /api/users/profile/stats` — profile stats
**Impact:** AI can show user's public profile, reputation progress, activity history.
```
Tool: getUserProfile       → GET /api/users/${username}
Tool: getUserReputation    → GET /api/users/by-id/${userId}/reputation
Tool: getProfileStats      → GET /api/users/profile/stats
```

---

## 4. Nice-to-Have Gaps

Lower priority but would make the MCP server more complete.

### 4.1 GitHub Integration
- `GET /api/integrations/github/status` — check GitHub connection status
- `POST /api/integrations/github/sync` — trigger sync
- `GET /api/integrations/github/settings` — get sync settings

### 4.2 Account Management
- `POST /api/accounts/switch-company` — switch account context
- `GET /api/accounts/linked` — list linked accounts

### 4.3 Documentation Sections & Functions
- `GET/POST /api/documentations/[id]/sections`
- `GET/POST /api/documentations/[id]/functions`

### 4.4 Annotation Voting
- `POST /api/annotations/[id]/vote` — upvote/downvote annotations

### 4.5 Teams CRUD (Full)
- `POST /api/teams` — create team
- `PUT /api/teams/[id]` — update team
- `DELETE /api/teams/[id]` — delete team
- `POST /api/teams/[id]/members` — add member
- `DELETE /api/teams/[id]/members/[userId]` — remove member

### 4.6 Image Management
- `POST /api/images/upload` — upload image
- `DELETE /api/images/delete` — delete image

### 4.7 Companies (Enable Disabled Tools)
The company tools exist in `/src/tools/companies/` but are commented out in `tool-registry.ts`. Enable them:
- listCompanies, getCompany, createCompany, updateCompany
- listCompanyMembers, addCompanyMember, updateCompanyMember, removeCompanyMember, inviteCompanyMember
- listCompanyRepositories, createCompanyRepository, unlinkCompanyRepository

### 4.8 Projects (Enable Disabled Tools)
The project tools exist in `/src/tools/projects/` but are commented out. Enable them:
- listProjects, getProject, createProject, updateProject, getProjectSnippets

---

## 5. MCP-Specific Improvements

These aren't about adding new endpoints — they're about making the MCP server **better** as an MCP server.

### 5.1 Add MCP Resources (Not Just Tools)

Currently the MCP server only exposes **tools**. MCP also supports **resources** — read-only data that AI clients can pull into context without tool calls.

**Resources to add:**
```typescript
// User's snippet library summary (lightweight context)
server.resource("snippets://summary", "Summary of user's snippet library");

// Recent snippets (auto-included in AI context)
server.resource("snippets://recent", "Last 10 snippets created/modified");

// Repository overview (workspace-aware)
server.resource("repo://current", "Current repository's rules, patterns, and prompts");

// Personal knowledge digest
server.resource("knowledge://digest", "Summary of personal notes, links, and learnings");
```

**Why:** Resources are cheaper than tools — they're read once and cached. AI clients like Claude Code and Cursor can load them into context automatically without the user asking.

### 5.2 Add MCP Prompts

MCP servers can expose **prompt templates** that users can trigger from their AI client.

**Prompts to add:**
```typescript
// Review code using repository rules
server.prompt("review-code", "Review code against repository's coding standards", {
  code: z.string(),
  repositoryId: z.string().optional(),
});

// Save and annotate current code
server.prompt("save-snippet", "Save the current code as a snippet with auto-generated metadata", {
  code: z.string(),
  context: z.string().optional(),
});

// Search knowledge base
server.prompt("find-pattern", "Find a code pattern or snippet for a specific task", {
  task: z.string(),
});

// Weekly recap
server.prompt("weekly-recap", "Generate a summary of this week's coding activity", {});
```

**Why:** Prompts appear as slash commands in Cursor and Claude Code. They're discoverable and reduce the friction of using your MCP server.

### 5.3 Composite / Workflow Tools

Add higher-level tools that combine multiple API calls into a single operation.

**saveAndAnalyzeSnippet:**
```
1. Create snippet (POST /api/snippets)
2. Analyze code (POST /api/snippets/:id/analyze)
3. Return snippet + analysis result
```

**searchAndSummarize:**
```
1. Search across all sources (GET /api/skills/search)
2. Get top 5 results with full details
3. Return formatted summary with code blocks
```

**getWorkspaceOverview:**
```
1. Get dashboard stats (GET /api/dashboard/stats)
2. Get current user (GET /api/auth/me)
3. Get recent snippets (GET /api/snippets/recent)
4. Get notifications (GET /api/notifications/unread-count)
5. Return combined overview
```

**createSnippetFromContext:**
```
1. Detect repository from workspace
2. Auto-generate title, description, tags from code
3. Create snippet with repository association
4. Return snippet with link
```

### 5.4 Better Tool Descriptions

Current tool descriptions are brief. MCP tool descriptions are the primary way AI models understand when and how to use a tool. They should be:

**Before:**
```
"Search code snippets by natural language query, language, or tags"
```

**After:**
```
"Search the user's code snippet library. Use this when the user asks for a code pattern,
wants to reuse existing code, or needs to find something they saved before. Supports
natural language queries like 'React authentication hook' as well as filters by
programming language and tags. Returns matching snippets with code, metadata, and
relevance scoring. Prefer this over listSnippets when the user has a specific need."
```

Longer descriptions help AI models:
- Know WHEN to use the tool (not just what it does)
- Understand the difference between similar tools (search vs list)
- Provide better parameters

### 5.5 Tool Result Formatting

Current tools return raw JSON. Better formatting helps AI models interpret results and present them to users.

**Improvements:**
- Add `summary` field to all list responses: "Found 12 JavaScript snippets matching 'auth'"
- Add `suggestedActions` to responses: "You might also want to: search for related patterns, analyze this code"
- Truncate long code blocks in list results (show first 5 lines + "... N more lines")
- Include relevance/freshness indicators: "Last modified 2 hours ago", "★ 42 stars"

### 5.6 Error Recovery Guidance

When tools fail, return actionable guidance instead of raw errors.

**Before:**
```json
{ "error": "Not found" }
```

**After:**
```json
{
  "error": "Snippet not found",
  "suggestion": "The snippet may have been deleted or you may not have access. Try: 1) listSnippets to see available snippets, 2) search with a keyword instead of ID",
  "alternatives": ["listSnippets", "search"]
}
```

### 5.7 Workspace-Aware Defaults

The MCP server already detects the workspace. Enhance this:
- Auto-detect the repository from `.git/config` remote URL
- Pre-filter snippets to the current repository when listing
- Suggest repository-specific rules and patterns
- Auto-tag new snippets with the current project language

### 5.8 Batch Operations

Add tools for operating on multiple items at once.

```
Tool: batchCreateSnippets
Params: snippets[] (array of snippet objects)
Purpose: Save multiple code blocks from a single session

Tool: batchTagSnippets
Params: snippetIds[], tags[]
Purpose: Apply tags to multiple snippets at once

Tool: batchMoveToCollection
Params: snippetIds[], collectionId
Purpose: Organize multiple snippets into a collection
```

### 5.9 Rate Limit Awareness

Add a tool or resource that shows the user's rate limit status.
```
Tool: getRateLimitStatus
Returns: { used: 23, limit: 1000, remaining: 977, resetsAt: "..." }
```

### 5.10 Changelog / Version Info

Add a tool that shows what's new in the MCP server.
```
Tool: getServerInfo
Returns: { version, changelog, availableTools: 107, newTools: [...] }
```

---

## 6. Full Endpoint Coverage Matrix

### Snippets

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/snippets | GET | listSnippets | ✅ |
| /api/snippets | POST | createSnippet | ✅ |
| /api/snippets/[id] | GET | getSnippet | ✅ |
| /api/snippets/[id] | PUT | updateSnippet | ✅ |
| /api/snippets/[id] | DELETE | — | ❌ MISSING |
| /api/snippets/count | GET | — | ❌ MISSING |
| /api/snippets/trending | GET | getTrendingSnippets | ✅ |
| /api/snippets/public | GET | getPublicSnippets | ✅ |
| /api/snippets/recent | GET | getRecentSnippets | ✅ |
| /api/snippets/recently-viewed | GET | getRecentlyViewedSnippets | ✅ |
| /api/snippets/archived | GET | getArchivedSnippets | ✅ |
| /api/snippets/[id]/favorite | POST | toggleFavoriteSnippet | ✅ |
| /api/snippets/[id]/archive | POST | archiveSnippet | ✅ |
| /api/snippets/[id]/unarchive | POST | — | ❌ MISSING |
| /api/snippets/[id]/trash | POST | — | ❌ MISSING |
| /api/snippets/[id]/restore | POST | — | ❌ MISSING |
| /api/snippets/[id]/permanent | DELETE | — | ❌ MISSING |
| /api/snippets/[id]/annotations | GET | — | ❌ MISSING |
| /api/snippets/[id]/annotations | POST | — | ❌ MISSING |
| /api/snippets/[id]/analyze | GET | — | ❌ MISSING |
| /api/snippets/[id]/analyze | POST | — | ❌ MISSING |

### Search & Discovery

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/search | GET | — | ❌ MISSING |
| /api/skills/search | GET | — | ❌ MISSING |
| /api/explore/public | GET | explorePublicContent | ✅ |

### Dashboard & Analytics

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/dashboard/stats | GET | — | ❌ MISSING |
| /api/analytics | GET | getAnalytics | ✅ |
| /api/analytics/popular | GET | getPopularItems | ✅ |
| /api/analytics/activity | GET | — | ❌ MISSING |
| /api/analytics/usage | GET | — | ❌ MISSING |
| /api/activity | GET | getActivity | ✅ |

### User & Auth

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/auth/me | GET | — | ❌ MISSING |
| /api/users/[username] | GET | — | ❌ MISSING |
| /api/users/[username]/activity | GET | — | ❌ MISSING |
| /api/users/by-id/[id]/reputation | GET | — | ❌ MISSING |
| /api/users/profile/stats | GET | — | ❌ MISSING |
| /api/leaderboards/[type] | GET | — | ❌ MISSING |

### Notifications

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/notifications | GET | — | ❌ MISSING |
| /api/notifications/unread-count | GET | — | ❌ MISSING |
| /api/notifications/[id]/read | PATCH | — | ❌ MISSING |

### Q&A System

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/questions | GET | — | ❌ MISSING |
| /api/questions | POST | — | ❌ MISSING |
| /api/questions/[id] | GET | — | ❌ MISSING |
| /api/questions/[id]/answers | GET | — | ❌ MISSING |
| /api/questions/[id]/answers | POST | — | ❌ MISSING |
| /api/answers/[id] | GET | — | ❌ MISSING |
| /api/answers/[id] | PATCH | — | ❌ MISSING |
| /api/answers/[id]/accept | POST | — | ❌ MISSING |

### Learning

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/learning | GET | — | ❌ MISSING |
| /api/learning | POST | — | ❌ MISSING |
| /api/learning/[id] | GET | — | ❌ MISSING |

### Personal Knowledge (Expanded)

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/personal/notes | GET | listPersonalNotes | ✅ |
| /api/personal/notes | POST | — | ❌ MISSING |
| /api/personal/notes/[id] | GET/PUT/DELETE | — | ❌ MISSING |
| /api/personal/links | GET | listPersonalLinks | ✅ |
| /api/personal/links | POST | — | ❌ MISSING |
| /api/personal/links/[id] | GET/PUT/DELETE | — | ❌ MISSING |
| /api/personal/files | GET | listPersonalFiles | ✅ |
| /api/personal/files | POST | — | ❌ MISSING |
| /api/personal/files/[id] | GET/PUT/DELETE | — | ❌ MISSING |
| /api/personal/tags | GET/POST | — | ❌ MISSING |
| /api/personal/search | GET | searchPersonalKnowledge | ✅ |

### Code Analysis

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/code/analyze | POST | — | ❌ MISSING |

### GitHub Integration

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| /api/integrations/github/status | GET | — | ❌ MISSING |
| /api/integrations/github/sync | POST | — | ❌ MISSING |
| /api/integrations/github/settings | GET | — | ❌ MISSING |

### Collections ✅ FULLY COVERED
### Repositories ✅ FULLY COVERED (34 tools)
### Documentations ✅ MOSTLY COVERED (5/7)
### Markdown Documents ✅ FULLY COVERED
### Code Snippets ✅ FULLY COVERED
### Teams ⚠️ PARTIALLY COVERED (3/8+)

---

## 7. Implementation Priority

### Tier 1: Do Now (1-2 days) — Critical Workflow Gaps

| # | Tool | API Endpoint | Why |
|---|------|-------------|-----|
| 1 | `deleteSnippet` | DELETE /api/snippets/[id] | Basic CRUD completeness |
| 2 | `search` | GET /api/skills/search | Most useful tool for AI |
| 3 | `getDashboardStats` | GET /api/dashboard/stats | Overview / orientation |
| 4 | `whoAmI` | GET /api/auth/me | Identity / personalization |
| 5 | `unarchiveSnippet` | POST /api/snippets/[id]/unarchive | Reverse archive operation |
| 6 | `trashSnippet` | POST /api/snippets/[id]/trash | Lifecycle management |
| 7 | `restoreSnippet` | POST /api/snippets/[id]/restore | Lifecycle management |
| 8 | `getSnippetCount` | GET /api/snippets/count | Context for AI decisions |

### Tier 2: Do Soon (3-5 days) — High Value Features

| # | Tool | API Endpoint | Why |
|---|------|-------------|-----|
| 9 | `analyzeCode` | POST /api/code/analyze | Code quality in IDE |
| 10 | `analyzeSnippet` | POST /api/snippets/[id]/analyze | Snippet-specific analysis |
| 11 | `getSnippetAnnotations` | GET /api/snippets/[id]/annotations | Code review integration |
| 12 | `createAnnotation` | POST /api/snippets/[id]/annotations | AI code review |
| 13 | `listNotifications` | GET /api/notifications | Stay informed |
| 14 | `getUnreadCount` | GET /api/notifications/unread-count | Quick status check |
| 15 | `listQuestions` | GET /api/questions | Q&A participation |
| 16 | `createQuestion` | POST /api/questions | Ask from IDE |
| 17 | `answerQuestion` | POST /api/questions/[id]/answers | Answer from IDE |
| 18 | `getLeaderboard` | GET /api/leaderboards/[type] | Gamification |
| 19 | `getUserProfile` | GET /api/users/[username] | Community features |
| 20 | `getProfileStats` | GET /api/users/profile/stats | Self-awareness |

### Tier 3: Do Later (1-2 weeks) — Complete Coverage

| # | Category | Tools to Add |
|---|----------|-------------|
| 21 | Personal Knowledge CRUD | createNote, getNote, updateNote, deleteNote, createLink, createFile, tags |
| 22 | Learning Items | listLearnings, createLearning, getLearning |
| 23 | MCP Resources | snippets://summary, repo://current, knowledge://digest |
| 24 | MCP Prompts | review-code, save-snippet, find-pattern, weekly-recap |
| 25 | Composite Tools | saveAndAnalyze, searchAndSummarize, getWorkspaceOverview |
| 26 | GitHub Integration | status, sync, settings |
| 27 | Enable Companies | uncomment in tool-registry.ts |
| 28 | Enable Projects | uncomment in tool-registry.ts |
| 29 | Batch Operations | batchCreate, batchTag, batchMove |
| 30 | Better Descriptions | Rewrite all 107 tool descriptions for AI clarity |

### Tier 4: Polish — Best-in-Class MCP Server

| # | Improvement | Impact |
|---|------------|--------|
| 31 | Tool result formatting (summary, suggestedActions) | Better AI responses |
| 32 | Error recovery guidance | Fewer dead-end interactions |
| 33 | Rate limit awareness tool | Transparency |
| 34 | Server info / changelog tool | Discoverability |
| 35 | Workspace-aware auto-defaults | Less friction |

---

## Quick Reference: Missing Tool Count by Category

| Category | Existing | Missing | % Coverage |
|----------|----------|---------|-----------|
| Snippets | 11 | 10 | 52% |
| Search | 0 | 2 | 0% |
| Dashboard/Stats | 0 | 1 | 0% |
| User/Auth | 0 | 5 | 0% |
| Notifications | 0 | 3 | 0% |
| Q&A | 0 | 8 | 0% |
| Learning | 0 | 3 | 0% |
| Personal CRUD | 4 | 10 | 29% |
| Code Analysis | 0 | 2 | 0% |
| Leaderboards | 0 | 1 | 0% |
| GitHub | 0 | 3 | 0% |
| Collections | 8 | 0 | 100% |
| Repositories | 34 | 0 | 100% |
| Documentations | 5 | 2 | 71% |
| Teams | 3 | 5 | 38% |
| **TOTAL** | **107** | **~55** | **66%** |

**Target: 160+ tools with Resources and Prompts for a best-in-class MCP server.**
