# Token Verification Setup

## Overview

The MCP server now verifies tokens via an external API endpoint before allowing access to protected endpoints.

## Configuration

### External API Base URL

The base URL for the external API is configured in `.env`:

```env
EXTERNAL_API_BASE_URL=http://localhost:5656/api/
```

Default: `http://localhost:5656/api/`

### Token Verification Endpoint

Tokens are verified via:
```
POST http://localhost:5656/api/api-keys/verify
```

## Endpoints

### 1. Health Check (No Auth Required)

**Endpoint:** `GET /health`

**Purpose:** Confirms MCP server is running without requiring authentication

**Example:**
```bash
curl http://localhost:3111/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "server": {
    "name": "demo-mcp-server",
    "version": "1.0.0",
    "protocol": "Streamable HTTP"
  },
  "note": "This endpoint works without authentication to confirm MCP server is running"
}
```

### 2. MCP Endpoint (Auth Required)

**Endpoint:** `GET /mcp` or `POST /mcp`

**Purpose:** Main MCP protocol endpoint - requires valid token

**Authentication:** Token must be verified via external API

**Headers:**
- `Authorization: Bearer <token>` (preferred)
- OR `X-MCP-Token: <token>`

## Token Verification Flow

1. Client sends request with token in header
2. Server extracts token from `Authorization` or `X-MCP-Token` header
3. Server calls external API: `POST http://localhost:5656/api/api-keys/verify`
4. External API validates token
5. If valid → Request proceeds ✅
6. If invalid → Returns 401 Unauthorized ❌

## Cursor MCP Configuration

Update `~/.cursor/mcp.json`:

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

Replace `YOUR_TOKEN_HERE` with a valid token that will pass verification at `http://localhost:5656/api/api-keys/verify`.

## Testing

### Test Health Endpoint (No Auth)

```bash
curl http://localhost:3111/health
```

Should return 200 OK without any authentication.

### Test MCP Endpoint (With Auth)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Should return tools list if token is valid, or 401 if invalid.

### Test MCP Endpoint (Without Auth)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Should return 401 Unauthorized.

## Environment Variables

```env
# External API Base URL (for token verification and other API calls)
EXTERNAL_API_BASE_URL=http://localhost:5656/api/

# Optional: External API Key (for other API operations)
EXTERNAL_API_KEY=your-api-key-here

# Server Configuration
PORT=3111
NODE_ENV=development
```

## Implementation Details

- **Token Verification Service:** `src/services/token-verification-service.ts`
- **Auth Middleware:** `src/middleware/auth.ts`
- **Config:** `src/config/env.ts`

The verification service calls the external API and checks for:
- HTTP 200 status
- Response indicating `valid: true`, `status: "valid"`, or `success: true`

Adjust the validation logic in `token-verification-service.ts` based on your actual API response format.

