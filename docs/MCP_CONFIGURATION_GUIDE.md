# MCP Configuration Guide - Headers Setup

## Problem

Cursor is trying to connect but getting:
```
[Auth] ❌ Unauthorized access attempt from ::ffff:127.0.0.1 - No token provided
```

This means the token is not being sent in the request headers.

## Solution: Proper Header Configuration

### Step 1: Update `~/.cursor/mcp.json`

Your MCP configuration should include the `headers` field with the Authorization header:

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

### Step 2: Get Your Token

You need a valid token that will pass verification at:
```
POST http://localhost:5656/api/api-keys/verify
```

### Step 3: Complete Example

```json
{
  "mcpServers": {
    "demo_mcp": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer abc123def456789..."
      }
    }
  }
}
```

## Important Notes

1. **Header Format**: Use `"Authorization": "Bearer <token>"` (not just the token)
2. **No Quotes in Token**: The token value should not have extra quotes
3. **Restart Cursor**: After updating `mcp.json`, restart Cursor IDE completely
4. **Token Must Be Valid**: The token must pass verification at the external API endpoint

## Alternative: Using X-MCP-Token Header

If `Authorization` header doesn't work, you can also use:

```json
{
  "mcpServers": {
    "demo_mcp": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "X-MCP-Token": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

## Verification

After updating the configuration and restarting Cursor, check the server logs. You should see:

✅ **Success:**
```
[Auth] ✅ Authenticated request from ::ffff:127.0.0.1
[Token Verification] ✅ Token verified successfully
```

❌ **Failure (no token):**
```
[Auth] ❌ Unauthorized access attempt from ::ffff:127.0.0.1 - No token provided
```

❌ **Failure (invalid token):**
```
[Auth] ❌ Unauthorized access attempt from ::ffff:127.0.0.1 - Invalid token: Token verification failed
```

## Troubleshooting

### Issue: Headers not being sent

**Solution:** Make sure:
1. The `headers` field is at the same level as `url` and `transport`
2. JSON syntax is correct (no trailing commas, proper quotes)
3. Cursor IDE has been restarted after changes

### Issue: Token verification fails

**Solution:** 
1. Test the token directly:
   ```bash
   curl -X POST http://localhost:5656/api/api-keys/verify \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"token":"YOUR_TOKEN"}'
   ```
2. Check that the external API is running
3. Verify the token format matches what the API expects

### Issue: Still getting "No token provided"

**Possible causes:**
1. Headers not configured in `mcp.json`
2. Cursor not restarted after config change
3. Wrong file location (`~/.cursor/mcp.json`)
4. JSON syntax error preventing config from loading

**Debug steps:**
1. Verify JSON is valid: `cat ~/.cursor/mcp.json | jq .`
2. Check file location: `ls -la ~/.cursor/mcp.json`
3. Restart Cursor completely (quit and reopen)
4. Check server logs for incoming requests

## Example: Complete Working Configuration

```json
{
  "mcpServers": {
    "demo_mcp": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

After saving and restarting Cursor, the token will be sent with every request to the MCP server.

