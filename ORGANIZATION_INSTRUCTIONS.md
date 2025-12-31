# Complete Guide: Building a Streamable MCP Server

## Overview

This guide provides step-by-step instructions for creating a Model Context Protocol (MCP) server using the **Streamable HTTP transport**. This is a modern, stateless approach that supports both JSON-RPC responses and Server-Sent Events (SSE) streaming.

## Table of Contents

1. [What is Streamable HTTP MCP?](#what-is-streamable-http-mcp)
2. [Project Setup](#project-setup)
3. [Core Architecture](#core-architecture)
4. [Implementation Steps](#implementation-steps)
5. [Configuration](#configuration)
6. [Client Setup](#client-setup)
7. [Testing](#testing)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## What is Streamable HTTP MCP?

**Streamable HTTP** is a modern MCP transport protocol that:

- ✅ Supports both **JSON-RPC** (POST requests) and **SSE streaming** (GET requests)
- ✅ Works in **stateless mode** (no session management required)
- ✅ Can be deployed as a standard HTTP server
- ✅ Supports authentication via headers
- ✅ Works with Cursor IDE, VS Code, and other MCP clients

### Key Features

- **Stateless**: Each request gets a new server/transport instance
- **Flexible**: Supports both streaming and non-streaming requests
- **Secure**: Token-based authentication
- **Scalable**: Can handle multiple concurrent requests

---

## Project Setup

### 1. Initialize Project

```bash
mkdir my-mcp-server
cd my-mcp-server
npm init -y
```

### 2. Install Dependencies

```bash
npm install @modelcontextprotocol/sdk express dotenv zod
npm install -D typescript @types/express @types/node tsx
```

### 3. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Project Structure

```
my-mcp-server/
├── src/
│   ├── index.ts              # Entry point
│   ├── server/
│   │   ├── index.ts          # Server startup
│   │   └── app.ts            # Express app setup
│   ├── mcp/
│   │   ├── server.ts          # MCP server factory
│   │   └── transport.ts      # Transport handler
│   ├── tools/
│   │   ├── tool-registry.ts  # Tool registration
│   │   └── ...               # Your tools
│   ├── config/
│   │   └── env.ts            # Environment config
│   └── core/
│       └── logger.ts         # Logging utility
├── package.json
├── tsconfig.json
└── .env
```

---

## Core Architecture

### Stateless Design

The key principle: **Each request gets a new server and transport instance**.

```typescript
// ❌ WRONG: Reusing server/transport (causes conflicts)
const server = new McpServer(...);
const transport = new StreamableHTTPServerTransport(...);
await server.connect(transport);
// Reusing this causes request ID collisions!

// ✅ CORRECT: New instance per request
export async function handleMcpRequest(req, res) {
  const server = createMcpServer();  // New instance
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,  // Stateless mode
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
  // Cleanup after request
}
```

### Request Flow

```
Client Request
    ↓
Express Middleware (Auth, CORS, etc.)
    ↓
handleMcpRequest()
    ↓
Create New McpServer Instance
    ↓
Create New StreamableHTTPServerTransport (stateless)
    ↓
Connect Server to Transport
    ↓
Handle Request via Transport
    ↓
Cleanup (close transport & server)
```

---

## Implementation Steps

### Step 1: Create MCP Server Factory

**File**: `src/mcp/server.ts`

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "../tools/tool-registry.js";

/**
 * Creates a new MCP server instance with all tools registered.
 * Uses stateless mode: creates a new server for each request.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "my-mcp-server",
    version: "1.0.0",
    description: "My custom MCP server",
  });

  // Register all tools
  registerAllTools(server);

  return server;
}
```

### Step 2: Create Transport Handler

**File**: `src/mcp/transport.ts`

```typescript
import { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server.js";

/**
 * Handles MCP protocol requests (both GET for streaming and POST for JSON-RPC).
 * Uses stateless mode: creates a new server and transport for each request.
 */
export async function handleMcpRequest(
  req: Request,
  res: Response
): Promise<void> {
  let transport: StreamableHTTPServerTransport | null = null;
  let server: McpServer | null = null;

  try {
    // Create a new server instance for this request
    server = createMcpServer();

    // Create transport in stateless mode (no session management)
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
    });

    // Cleanup function
    const cleanup = () => {
      try {
        if (transport) transport.close();
        if (server) server.close();
      } catch (error) {
        console.error("[MCP] Error during cleanup:", error);
      }
    };

    // Set up cleanup handlers
    res.on("close", cleanup);
    res.on("error", cleanup);

    // Connect server to transport
    await server.connect(transport);

    // Prepare request body (for POST requests)
    const requestBody = req.method === "POST" ? req.body : undefined;

    // Handle the request through transport
    await transport.handleRequest(req, res, requestBody);
  } catch (error) {
    // Cleanup on error
    if (transport) transport.close();
    if (server) server.close();

    // Send error response if headers not sent
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        id: req.body?.id || null,
      });
    }
  }
}
```

### Step 3: Setup Express Application

**File**: `src/server/app.ts`

```typescript
import express, { Request, Response } from "express";
import { handleMcpRequest } from "../mcp/transport.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export function createApp() {
  const app = express();

  // Body parser
  app.use(express.json({ limit: "10mb" }));

  // CORS middleware
  app.use((req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, mcp-session-id, mcp-protocol-version, Authorization"
    );
    res.header("Access-Control-Expose-Headers", "Mcp-Session-Id");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health check endpoint (no auth required)
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      protocol: "Streamable HTTP",
    });
  });

  // MCP endpoint - handle both GET (streaming) and POST (JSON-RPC)
  app.get("/mcp", authMiddleware, handleMcpRequest);
  app.post("/mcp", authMiddleware, handleMcpRequest);

  return app;
}
```

### Step 4: Server Startup

**File**: `src/server/index.ts`

```typescript
import { Server } from "http";
import { createApp } from "./app.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3111;

/**
 * Starts the HTTP server
 */
export function startServer(): Server {
  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`[MCP] Server running at http://localhost:${PORT}/mcp`);
    console.log(`[MCP] Health check: http://localhost:${PORT}/health`);
    console.log(`[MCP] Ready to accept connections`);
    console.log(`[MCP] Protocol: Streamable HTTP`);
  });

  // Graceful shutdown handlers
  setupGracefulShutdown(server);

  return server;
}

/**
 * Sets up graceful shutdown handlers
 */
function setupGracefulShutdown(server: Server) {
  const shutdown = (signal: string) => {
    console.log(`[MCP] ${signal} signal received: closing HTTP server`);
    server.close(() => {
      console.log("[MCP] HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
```

**File**: `src/index.ts` (Entry Point)

```typescript
import { startServer } from "./server/index.js";

// Start the server
startServer();
```

### Step 5: Environment Configuration

**File**: `src/config/env.ts`

```typescript
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional().default("3111"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MCP_SERVER_TOKEN: z.string().optional(),
  EXTERNAL_API_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:5656/api"),
});

export const envConfig = envSchema.parse(process.env);
```

**File**: `.env` (Example)

```env
PORT=3111
NODE_ENV=development
MCP_SERVER_TOKEN=your-secret-token-here
EXTERNAL_API_URL=http://localhost:5656/api
```

### Step 6: Create a Simple Tool

**File**: `src/tools/example-tool.ts`

```typescript
import { BaseToolHandler } from "./base/tool-handler.base.js";
import { z } from "zod";
import type { BaseToolDefinition } from "./base/base-tool.interface.js";

export interface ExampleToolParams {
  message: string;
}

class ExampleTool
  extends BaseToolHandler
  implements BaseToolDefinition<ExampleToolParams>
{
  name = "exampleTool";
  description = "An example tool that echoes a message";

  paramsSchema = z.object({
    message: z.string().describe("The message to echo"),
  });

  async execute(params: ExampleToolParams) {
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${params.message}`,
        },
      ],
    };
  }
}

export const exampleTool = new ExampleTool();
```

**File**: `src/tools/tool-registry.ts`

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { exampleTool } from "./example-tool.js";

/**
 * Registers all tools with the MCP server
 */
export function registerAllTools(server: McpServer): void {
  // Register your tools here
  server.setRequestHandler("tools/list", async () => {
    return {
      tools: [exampleTool],
    };
  });

  server.setRequestHandler("tools/call", async (request) => {
    const { name, arguments: args } = request.params;

    if (name === exampleTool.name) {
      const result = await exampleTool.execute(args as any);
      return { content: result.content };
    }

    throw new Error(`Unknown tool: ${name}`);
  });
}
```

---

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Server Configuration
PORT=3111
NODE_ENV=development

# Authentication
MCP_SERVER_TOKEN=your-secret-token-here

# External API (if needed)
EXTERNAL_API_URL=http://localhost:5656/api
```

### Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "test": "echo \"No tests specified\" && exit 0"
  }
}
```

---

## Client Setup

### Cursor IDE Configuration

Create or update `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer your-secret-token-here"
      }
    }
  }
}
```

**Important Notes:**

- Replace `your-secret-token-here` with your actual `MCP_SERVER_TOKEN`
- The `transport` should be `"sse"` for Streamable HTTP
- The URL should point to your `/mcp` endpoint

### VS Code Configuration

For VS Code, create `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "my-mcp-server": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer your-secret-token-here"
      }
    }
  }
}
```

---

## Testing

### 1. Start the Server

```bash
npm run dev
```

You should see:

```
[MCP] Server running at http://localhost:3111/mcp
[MCP] Health check: http://localhost:3111/health
[MCP] Ready to accept connections
[MCP] Protocol: Streamable HTTP
```

### 2. Test Health Endpoint

```bash
curl http://localhost:3111/health
```

Expected response:

```json
{
  "status": "healthy",
  "protocol": "Streamable HTTP"
}
```

### 3. Test MCP Endpoint (with authentication)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token-here" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

Expected response:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "exampleTool",
        "description": "An example tool that echoes a message",
        "inputSchema": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string",
              "description": "The message to echo"
            }
          },
          "required": ["message"]
        }
      }
    ]
  }
}
```

### 4. Test Tool Execution

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token-here" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "exampleTool",
      "arguments": {
        "message": "Hello, MCP!"
      }
    }
  }'
```

---

## Best Practices

### 1. Stateless Design

✅ **DO**: Create a new server and transport for each request

```typescript
export async function handleMcpRequest(req, res) {
  const server = createMcpServer(); // New instance
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless
  });
  // ...
}
```

❌ **DON'T**: Reuse server/transport instances

```typescript
// This causes request ID collisions!
const server = createMcpServer();
const transport = new StreamableHTTPServerTransport();
// Reusing these will fail!
```

### 2. Error Handling

Always handle errors gracefully:

```typescript
try {
  await transport.handleRequest(req, res, requestBody);
} catch (error) {
  // Cleanup resources
  if (transport) transport.close();
  if (server) server.close();

  // Send proper JSON-RPC error response
  if (!res.headersSent) {
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : "Internal error",
      },
      id: req.body?.id || null,
    });
  }
}
```

### 3. Cleanup Resources

Always clean up transport and server instances:

```typescript
const cleanup = () => {
  try {
    if (transport) transport.close();
    if (server) server.close();
  } catch (error) {
    console.error("[MCP] Error during cleanup:", error);
  }
};

res.on("close", cleanup);
res.on("error", cleanup);
```

### 4. Authentication

Protect your MCP endpoint with authentication middleware:

```typescript
app.get("/mcp", authMiddleware, handleMcpRequest);
app.post("/mcp", authMiddleware, handleMcpRequest);
```

### 5. CORS Configuration

Configure CORS properly for browser clients:

```typescript
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, mcp-session-id, mcp-protocol-version, Authorization"
  );
  res.header("Access-Control-Expose-Headers", "Mcp-Session-Id");
  next();
});
```

### 6. Logging

Use structured logging:

```typescript
import { logger } from "./core/logger.js";

logger.info("MCP request received", {
  method: req.method,
  path: req.path,
  requestId: req.body?.id,
});
```

### 7. Tool Organization

Organize tools by category:

```
src/tools/
├── tool-registry.ts      # Central registry
├── base/                 # Base classes
│   ├── tool-handler.base.ts
│   └── base-tool.interface.ts
├── snippets/            # Snippet tools
├── repositories/        # Repository tools
└── ...
```

---

## Troubleshooting

### Issue: "Request ID collision" errors

**Cause**: Reusing server/transport instances across requests

**Solution**: Always create new instances per request:

```typescript
// ✅ Correct
export async function handleMcpRequest(req, res) {
  const server = createMcpServer(); // New instance
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  // ...
}
```

### Issue: "Unauthorized" errors

**Cause**: Missing or invalid authentication token

**Solution**:

1. Check that `MCP_SERVER_TOKEN` is set in `.env`
2. Verify the token in client configuration matches
3. Ensure `Authorization: Bearer <token>` header is sent

### Issue: CORS errors in browser

**Cause**: Missing or incorrect CORS headers

**Solution**: Ensure CORS middleware is configured:

```typescript
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
res.header("Access-Control-Expose-Headers", "Mcp-Session-Id");
```

### Issue: "Connection refused" when testing

**Cause**: Server not running or wrong port

**Solution**:

1. Verify server is running: `npm run dev`
2. Check the port matches client configuration
3. Test health endpoint: `curl http://localhost:3111/health`

### Issue: Tools not appearing in client

**Cause**: Tools not properly registered

**Solution**:

1. Verify `registerAllTools()` is called in `createMcpServer()`
2. Check tool implements `BaseToolDefinition` interface
3. Test with `tools/list` request

### Issue: TypeScript compilation errors

**Cause**: Missing type definitions or incorrect configuration

**Solution**:

1. Install types: `npm install -D @types/express @types/node`
2. Verify `tsconfig.json` is correct
3. Check all imports use `.js` extension (ES modules)

---

## Complete Example Project Structure

```
my-mcp-server/
├── src/
│   ├── index.ts                    # Entry point
│   ├── server/
│   │   ├── index.ts                # Server startup
│   │   └── app.ts                  # Express app
│   ├── mcp/
│   │   ├── server.ts               # MCP server factory
│   │   └── transport.ts            # Transport handler
│   ├── tools/
│   │   ├── tool-registry.ts       # Tool registration
│   │   ├── base/
│   │   │   ├── tool-handler.base.ts
│   │   │   └── base-tool.interface.ts
│   │   └── example-tool.ts         # Example tool
│   ├── config/
│   │   └── env.ts                  # Environment config
│   └── core/
│       └── logger.ts               # Logging
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

---

## Quick Start Checklist

- [ ] Initialize project: `npm init -y`
- [ ] Install dependencies: `npm install @modelcontextprotocol/sdk express dotenv zod`
- [ ] Create `tsconfig.json` with proper configuration
- [ ] Create project structure (`src/` directories)
- [ ] Implement `src/mcp/server.ts` (MCP server factory)
- [ ] Implement `src/mcp/transport.ts` (transport handler)
- [ ] Implement `src/server/app.ts` (Express setup)
- [ ] Implement `src/server/index.ts` (server startup)
- [ ] Create `src/index.ts` (entry point)
- [ ] Create `.env` file with configuration
- [ ] Create at least one tool
- [ ] Register tools in `tool-registry.ts`
- [ ] Test health endpoint
- [ ] Test MCP endpoint
- [ ] Configure client (Cursor/VS Code)
- [ ] Test tool execution

---

## Additional Resources

- [MCP SDK Documentation](https://modelcontextprotocol.io)
- [Streamable HTTP Transport Spec](https://spec.modelcontextprotocol.io/transports/http)
- [Express.js Documentation](https://expressjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

---

## Summary

This guide provides a complete foundation for building a Streamable HTTP MCP server. Key takeaways:

1. **Stateless Design**: Always create new server/transport instances per request
2. **Proper Cleanup**: Close transport and server after each request
3. **Authentication**: Protect endpoints with token-based auth
4. **Error Handling**: Gracefully handle errors with proper JSON-RPC responses
5. **Tool Organization**: Structure tools in a scalable way

With this foundation, you can build powerful MCP servers that integrate with AI assistants like Cursor IDE and VS Code.

---

**Happy Building! 🚀**
