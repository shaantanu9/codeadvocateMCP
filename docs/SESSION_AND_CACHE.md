# Session and Cache Management

This MCP server includes built-in session and cache management that automatically detects workspace context and stores data per chat session.

## Features

### 🎯 Workspace Detection
- Automatically detects the workspace/folder where Cursor chat is open
- Extracts project metadata (type, package manager, Git info)
- Workspace-aware caching (cache keys are scoped to workspace)

### 💾 Session Storage
- Persistent storage per chat session
- Data survives across tool calls within the same chat
- Sessions are identified by client (IP + User Agent) + workspace
- Automatic cleanup of expired sessions (30 minutes inactivity)

### ⚡ Cache Management
- Workspace-aware caching with TTL (Time To Live)
- Automatic expiration and cleanup
- Fast in-memory access with disk persistence
- Cache keys are automatically scoped to workspace

## Available Tools

### Workspace Information
- **`getWorkspaceInfo`** - Get information about the current workspace/folder

### Session Management
- **`getSessionId`** - Get the current chat session ID
- **`setSessionData`** - Store data in the current chat session
- **`getSessionData`** - Retrieve data from the current chat session
- **`getAllSessionData`** - Get all data stored in the current session
- **`clearSessionData`** - Clear all data from the current session

### Cache Management
- **`setCache`** - Store data in cache (workspace-aware, expires after TTL)
- **`getCache`** - Retrieve data from cache (workspace-aware)

## Usage Examples

### Storing Session Data

```typescript
// In your tool implementation
import { setSessionData, getSessionData } from "../core/session-helpers.js";

// Store data
setSessionData("userPreferences", { theme: "dark", language: "en" });

// Retrieve data
const preferences = getSessionData<{ theme: string; language: string }>("userPreferences");
```

### Using Cache

```typescript
// In your tool implementation
import { setCache, getCache } from "../core/session-helpers.js";

// Set cache with 5 minute TTL
setCache("apiResponse", responseData, 300);

// Get cache (automatically workspace-aware)
const cached = getCache<ResponseType>("apiResponse");
```

### Getting Workspace Context

```typescript
// In your tool implementation
import { getCurrentWorkspace, getCurrentWorkspacePath } from "../core/session-helpers.js";

// Get full workspace context
const workspace = getCurrentWorkspace();
if (workspace) {
  console.log(`Working in: ${workspace.workspacePath}`);
  console.log(`Project type: ${workspace.projectType}`);
  console.log(`Package manager: ${workspace.packageManager}`);
}

// Or just get the path
const workspacePath = getCurrentWorkspacePath();
```

## How It Works

### Session Identification
Sessions are identified by:
1. Client IP address
2. User Agent
3. Workspace path (if available)

This ensures that:
- Different chats in the same workspace share the same session
- Different workspaces have separate sessions
- Different clients have separate sessions

### Workspace Detection
The system tries to detect workspace in this order:
1. MCP client initialization params (`workspacePath`)
2. Request headers (`x-workspace-path`, `x-cursor-workspace`)
3. Environment variables (`CURSOR_WORKSPACE`, `WORKSPACE_PATH`)
4. Current working directory (fallback)

### Storage Location
- Sessions: `.mcp-sessions/sessions/`
- Cache: `.mcp-sessions/cache/`
- Files are stored as JSON for easy inspection

### Automatic Cleanup
- Sessions expire after 30 minutes of inactivity
- Cache entries expire based on their TTL
- Cleanup runs every 5 minutes

## Best Practices

1. **Use Session for Chat State**: Store user preferences, conversation context, or temporary state that should persist across tool calls in the same chat.

2. **Use Cache for Expensive Operations**: Cache API responses, file reads, or computed values that are expensive to regenerate.

3. **Workspace-Aware Keys**: Cache keys are automatically workspace-aware, so you don't need to include workspace path in your keys.

4. **Set Appropriate TTLs**: Use shorter TTLs for frequently changing data, longer TTLs for stable data.

5. **Check for Null**: Always check if session/cache data exists before using it.

## Example: Caching API Responses

```typescript
import { getCache, setCache } from "../core/session-helpers.js";

async function fetchUserData(userId: string) {
  // Check cache first
  const cached = getCache<UserData>(`user:${userId}`);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const userData = await api.getUser(userId);

  // Cache for 10 minutes
  setCache(`user:${userId}`, userData, 600);

  return userData;
}
```

## Example: Storing Chat Context

```typescript
import { setSessionData, getSessionData } from "../core/session-helpers.js";

// Store conversation context
setSessionData("conversationHistory", [
  { role: "user", content: "What is React?" },
  { role: "assistant", content: "React is a JavaScript library..." }
]);

// Later, retrieve it
const history = getSessionData<Message[]>("conversationHistory");
```

## Troubleshooting

### Workspace Not Detected
If workspace is not detected:
1. Check if Cursor is sending workspace info in MCP initialization
2. Try setting `CURSOR_WORKSPACE` environment variable
3. The system will fall back to current working directory

### Session Data Not Persisting
- Ensure you're using the same workspace
- Check that session hasn't expired (30 min inactivity)
- Verify session files exist in `.mcp-sessions/sessions/`

### Cache Not Working
- Check TTL hasn't expired
- Verify cache files exist in `.mcp-sessions/cache/`
- Ensure workspace context is available




