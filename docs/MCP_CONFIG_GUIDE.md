# MCP Configuration Guide for Cursor IDE

## How to Add Token to `mcp.json`

Your MCP server requires authentication. Update your `~/.cursor/mcp.json` file to include the token in headers.

## Step 1: Get Your Token

The token is either:
- In your `.env` file as `MCP_SERVER_TOKEN=...`
- Or generated automatically when the server starts (check server logs)

To get the token from `.env`:
```bash
grep MCP_SERVER_TOKEN .env
```

Or check the server startup logs - it will show the generated token if one wasn't set.

## Step 2: Update `mcp.json`

Edit `~/.cursor/mcp.json` and add the `headers` field:

### Option 1: Using Authorization Bearer (Recommended)

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

### Option 2: Using X-MCP-Token Header

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

## Step 3: Replace `YOUR_TOKEN_HERE`

Replace `YOUR_TOKEN_HERE` with your actual token from:
- `.env` file: `MCP_SERVER_TOKEN=...`
- Or the token shown in server startup logs

## Example

If your token is `abc123def456...`, your config would look like:

```json
{
  "mcpServers": {
    "demo_mcp": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer abc123def456..."
      }
    }
  }
}
```

## Step 4: Restart Cursor

After updating `mcp.json`:
1. Save the file
2. Restart Cursor IDE
3. The MCP server should now authenticate successfully

## Verification

After restarting Cursor, check the server logs. You should see:
```
[Auth] ✅ Authenticated request from ::ffff:127.0.0.1
```

Instead of:
```
[Auth] ❌ Unauthorized access attempt from ::ffff:127.0.0.1 - No token provided
```

## Troubleshooting

### Still getting unauthorized errors?

1. **Check token matches**: Ensure the token in `mcp.json` exactly matches the token in `.env` or server logs
2. **Check server is running**: Make sure `npm run dev` is running
3. **Check URL**: Verify the URL in `mcp.json` matches your server URL
4. **Restart Cursor**: After changing `mcp.json`, always restart Cursor

### Token format

- Token should be a long hex string (64 characters if generated with `randomBytes(32)`)
- No spaces or quotes needed in the JSON
- The `Bearer ` prefix is included automatically in the header value

