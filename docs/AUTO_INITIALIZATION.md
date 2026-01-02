# MCP Server Auto-Initialization

**Created:** 2026-01-01  
**Status:** ✅ Implemented

## Overview

The MCP server now automatically initializes on first run, ensuring all required files and directories are created and properly configured. This eliminates the need for manual setup steps.

---

## What Gets Initialized

### 1. `.cursorrules` File

**Location:** Project root (`.cursorrules`)

**Purpose:** Contains rules and instructions for the AI assistant to:
- Always call `createRepositoryMermaid` when users request diagrams
- Automatically retrieve context before answering questions
- Use web search when needed
- Follow best practices for tool usage

**Behavior:**
- ✅ Created automatically on first run if it doesn't exist
- ✅ Not overwritten if it already exists (preserves user customizations)
- ✅ Contains comprehensive rules for proper tool usage

### 2. Cache Directories

The following directories are automatically created:

#### Repository Analysis Cache
- **Path:** `.cache/repository-analysis/`
- **Purpose:** Stores analyzed repository data for fast retrieval
- **Used by:** `RepositoryCache` class

#### Session Storage
- **Path:** `.mcp-sessions/sessions/`
- **Purpose:** Stores per-chat session data
- **Used by:** `SessionManager` class

#### Session Cache
- **Path:** `.mcp-sessions/cache/`
- **Purpose:** Stores cached data for sessions
- **Used by:** `SessionManager` class

#### Tool Call Logs
- **Path:** `logs/tool-calls/`
- **Purpose:** Stores successful tool call logs
- **Used by:** `ToolCallLogger` class

#### Failed Tool Call Logs
- **Path:** `logs/tool-calls-failed/`
- **Purpose:** Stores failed tool call logs for debugging
- **Used by:** `ToolCallLogger` class

---

## When Initialization Runs

### Automatic Initialization
Initialization runs automatically when:
- ✅ Server starts for the first time
- ✅ Server restarts (checks and creates missing directories)
- ✅ After installation

### Initialization Flow

```
Server Start
    ↓
initializeMcpServer() called
    ↓
Check .cursorrules exists?
    ├─ No → Create with default rules
    └─ Yes → Skip (preserve existing)
    ↓
Check cache directories exist?
    ├─ No → Create all directories
    └─ Yes → Skip
    ↓
Initialization Complete
    ↓
Server continues startup
```

---

## Implementation Details

### Initializer Module

**File:** `src/core/initializer.ts`

**Functions:**
- `initializeMcpServer()` - Main initialization function
- `isFirstRun()` - Checks if this is the first run

### Integration

Initialization is integrated into server startup:

```typescript
// src/server/index.ts
export function startServer(): Server {
  // Initialize MCP server (creates .cursorrules, cache directories, etc.)
  initializeMcpServer();
  
  // ... rest of server startup
}
```

---

## Benefits

### For Users
- ✅ **Zero manual setup** - Everything is created automatically
- ✅ **Consistent configuration** - Same rules and structure every time
- ✅ **No missing directories** - All cache/log directories exist
- ✅ **Preserves customizations** - Existing `.cursorrules` is not overwritten

### For Developers
- ✅ **Reliable startup** - No need to manually create directories
- ✅ **Consistent behavior** - Same initialization every time
- ✅ **Easy debugging** - Logs show what was created
- ✅ **Safe operation** - Doesn't overwrite existing files

---

## Customization

### Custom `.cursorrules`

If you want to customize the `.cursorrules` file:

1. **Before first run:** Create your own `.cursorrules` file
   - The initializer will detect it and skip creation
   - Your custom rules will be preserved

2. **After first run:** Edit the existing `.cursorrules` file
   - Your changes will be preserved on server restarts
   - The initializer never overwrites existing files

### Custom Cache Directories

Cache directories are created automatically, but you can:
- Manually create them before first run
- Customize their locations (requires code changes)
- Add `.gitignore` entries to exclude them from version control

---

## Verification

### Check Initialization

After server starts, check the logs:

```bash
# Look for initialization messages
grep "Initializer" logs/*.log

# Or check server startup output
# Should see:
# [Initializer] Checking MCP server initialization...
# [Initializer] ✅ Created .cursorrules file (if first run)
# [Initializer] ✅ MCP server initialization complete
```

### Verify Files Created

```bash
# Check .cursorrules exists
ls -la .cursorrules

# Check cache directories exist
ls -la .cache/repository-analysis/
ls -la .mcp-sessions/sessions/
ls -la .mcp-sessions/cache/
ls -la logs/tool-calls/
ls -la logs/tool-calls-failed/
```

---

## Troubleshooting

### `.cursorrules` Not Created

**Possible causes:**
- File system permissions issue
- Workspace path detection failed
- Write permission denied

**Solution:**
- Check file system permissions
- Verify workspace path is correct
- Check server logs for error messages

### Cache Directories Not Created

**Possible causes:**
- File system permissions issue
- Disk space full
- Path too long

**Solution:**
- Check file system permissions
- Verify disk space
- Check server logs for specific error messages

### Initialization Runs Every Time

**Expected behavior:**
- Initialization checks run on every startup
- But only creates missing files/directories
- This is normal and safe

**If you see repeated creation:**
- Check if files are being deleted between runs
- Verify file system is stable
- Check for permission issues

---

## Related Documentation

- `.cursorrules` - Rules file for AI assistant
- `docs/REPOSITORY_CACHE_SYSTEM.md` - Repository caching system
- `docs/SESSION_AND_CACHE.md` - Session and cache management
- `DIAGRAM_AND_CONTEXT_IMPROVEMENTS.md` - Context retrieval improvements
