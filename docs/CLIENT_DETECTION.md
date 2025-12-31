# Client Detection Guide

## Overview

The MCP server can detect which editor/application is using it by analyzing:
- **User-Agent headers** (most reliable)
- **Custom headers** (X-MCP-Client, X-Client-Type, etc.)
- **Environment variables** (TERM_PROGRAM, EDITOR, etc.)

## Supported Clients

The server can detect the following clients:

| Client | Detection Method | Confidence |
|--------|-----------------|------------|
| **Cursor IDE** | User-Agent: `Cursor/X.X.X` | High |
| **Visual Studio Code** | User-Agent: `VSCode/X.X.X` | High |
| **Claude Desktop** | User-Agent: `Claude/X.X.X` | High |
| **Continue** | User-Agent contains "continue" | Medium |
| **Aider** | User-Agent contains "aider" | Medium |
| **Sourcegraph Cody** | User-Agent contains "cody" | Medium |
| **Browser** | Standard browser User-Agent | High |
| **Custom Clients** | Custom headers | Medium |

## How It Works

### 1. User-Agent Detection

The server analyzes the `User-Agent` header sent by the client:

```
Cursor/2.2.23 (darwin arm64)
```

This is parsed to extract:
- Client type: `Cursor IDE`
- Version: `2.2.23`
- Platform: `macOS` (from darwin)

### 2. Custom Headers

Clients can send custom headers to identify themselves:

```http
X-MCP-Client: Cursor/2.2.23
X-Client-Type: cursor
X-Editor: cursor
```

### 3. Environment Variables

The server checks environment variables:
- `TERM_PROGRAM` - Set by some editors
- `EDITOR` - Default editor
- `CURSOR_WORKSPACE` - Cursor-specific

## Usage

### Automatic Detection

Client detection happens automatically for every request. The detected information is:
- Logged in the request context
- Available in the `RequestContext` object
- Accessible via the `getClientInfo` tool

### Get Client Info Tool

Use the `getClientInfo` tool to retrieve client information:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "getClientInfo",
    "arguments": {}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "client": {
      "type": "Cursor IDE",
      "name": "Cursor IDE",
      "version": "2.2.23",
      "platform": "macOS",
      "userAgent": "Cursor/2.2.23 (darwin arm64)",
      "detectedFrom": "user-agent",
      "confidence": "high"
    },
    "request": {
      "requestId": "...",
      "ip": "127.0.0.1",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "sessionId": "..."
    },
    "workspace": {
      "path": "/path/to/workspace",
      "name": "my-project",
      "gitBranch": "main"
    }
  }
}
```

## Logging

Client detection is automatically logged:

```
[INFO] Client detected {
  client: "Cursor IDE v2.2.23 on macOS (detected via user-agent, high confidence)",
  type: "Cursor IDE",
  confidence: "high",
  platform: "macOS"
}
```

## Custom Client Identification

If you're building a custom MCP client, you can identify yourself by:

1. **Setting a custom User-Agent:**
   ```http
   User-Agent: MyCustomClient/1.0.0
   ```

2. **Sending custom headers:**
   ```http
   X-MCP-Client: MyCustomClient/1.0.0
   X-Client-Type: my-custom-client
   ```

3. **Setting environment variables:**
   ```bash
   export TERM_PROGRAM=my-custom-client
   ```

## Detection Confidence Levels

- **High**: Detected from User-Agent with known pattern
- **Medium**: Detected from headers or partial User-Agent match
- **Low**: Detected from environment variables or fallback

## Platform Detection

The server also detects the platform from the User-Agent:
- **macOS**: `darwin`, `mac`
- **Windows**: `win`, `windows`
- **Linux**: `linux`
- **Android**: `android`
- **iOS**: `ios`, `iphone`, `ipad`

## Examples

### Cursor IDE
```
User-Agent: Cursor/2.2.23 (darwin arm64)
→ Detected: Cursor IDE v2.2.23 on macOS (high confidence)
```

### VS Code
```
User-Agent: VSCode/1.85.0
→ Detected: Visual Studio Code v1.85.0 (high confidence)
```

### Claude Desktop
```
User-Agent: Claude/1.0.0 (darwin arm64)
→ Detected: Claude Desktop v1.0.0 on macOS (high confidence)
```

### Browser
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...
→ Detected: Browser on macOS (high confidence)
```

## API Access

Client information is available in the request context:

```typescript
import { getContext } from "../core/context.js";

const context = getContext();
if (context?.client) {
  console.log(`Client: ${context.client.name}`);
  console.log(`Type: ${context.client.type}`);
  console.log(`Platform: ${context.client.platform}`);
  console.log(`Confidence: ${context.client.confidence}`);
}
```

## Troubleshooting

### Client Not Detected

If your client is not detected:
1. Check the User-Agent header being sent
2. Try adding custom headers (`X-MCP-Client`)
3. Set environment variables (`TERM_PROGRAM`)
4. Check server logs for detection attempts

### Low Confidence

If detection has low confidence:
- The User-Agent doesn't match known patterns
- Detection relied on environment variables
- Consider updating your client to send a clearer User-Agent

## Privacy

Client detection only analyzes:
- Public headers (User-Agent, custom headers)
- Environment variables (if available)
- No personal information is collected
- No tracking or analytics

All detection happens server-side and is only used for:
- Logging and debugging
- Providing context to tools
- Improving user experience



