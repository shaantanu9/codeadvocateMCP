# 🔑 Token Setup Guide for MCP Server

## Overview

The MCP server now includes comprehensive token acquisition and setup features that will appear in the MCP dashboard when authentication errors occur.

## Features Added

### 1. **Token Acquisition URL Configuration**
- Automatically configured from `EXTERNAL_API_URL` environment variable
- Default: `http://localhost:5656/api-keys`
- Can be overridden with `TOKEN_ACQUISITION_URL` environment variable

### 2. **Error Messages with Setup Instructions**
When authentication fails, the MCP dashboard will now show:
- Clear error messages
- Token acquisition URL
- Step-by-step setup instructions
- Configuration file location

### 3. **Token Setup Web Page**
- **URL**: `http://localhost:3111/token-setup`
- Beautiful, user-friendly HTML page with:
  - Step-by-step instructions
  - Direct link to API keys page
  - Code examples for configuration
  - Visual guides

### 4. **Token Info API Endpoint**
- **URL**: `http://localhost:3111/token-info`
- Returns JSON with:
  - Token acquisition URL
  - Setup steps
  - Configuration format
  - Verification endpoint

## How It Works

### In Cursor MCP Dashboard

When you see an authentication error in Cursor's MCP settings, you'll now see:

```json
{
  "error": {
    "code": -32001,
    "message": "Unauthorized: The provided API key is invalid, expired, or revoked",
    "data": {
      "tokenAcquisitionUrl": "http://localhost:5656/api-keys",
      "setupInstructions": {
        "step1": "Visit http://localhost:5656/api-keys to get your API key",
        "step2": "Add the token to your MCP configuration in Cursor",
        "step3": "Restart Cursor IDE to apply changes"
      }
    }
  }
}
```

### Setup Steps

1. **Get Your API Key**
   - Visit: `http://localhost:5656/api-keys` (or your configured URL)
   - Copy your API key

2. **Configure in Cursor**
   - Open: `~/.cursor/mcp.json`
   - Add the token to headers:
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

3. **Restart Cursor**
   - Completely quit Cursor IDE
   - Reopen Cursor
   - The MCP server will connect automatically

## Available Endpoints

### `/token-setup` (HTML Page)
- **Method**: GET
- **Auth**: Not required
- **Description**: Beautiful web page with setup instructions
- **Usage**: Open in browser for visual guide

### `/token-info` (JSON API)
- **Method**: GET
- **Auth**: Not required
- **Description**: JSON API with setup information
- **Response**: Includes URLs, steps, and configuration format

### `/health` (Health Check)
- **Method**: GET
- **Auth**: Not required
- **Description**: Server health status

## Environment Variables

```bash
# Token acquisition URL (optional, auto-detected from EXTERNAL_API_URL)
TOKEN_ACQUISITION_URL=http://localhost:5656/api-keys

# External API URL (used to auto-detect token URL)
EXTERNAL_API_URL=http://localhost:5656
```

## Testing

1. **Test Token Setup Page**:
   ```bash
   open http://localhost:3111/token-setup
   ```

2. **Test Token Info API**:
   ```bash
   curl http://localhost:3111/token-info
   ```

3. **Test Error with Setup Instructions**:
   ```bash
   curl -X POST http://localhost:3111/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
   ```

## Benefits

✅ **Clear Error Messages**: Users see exactly what went wrong  
✅ **Actionable Instructions**: Step-by-step guide to fix issues  
✅ **Visual Guide**: Beautiful HTML page for setup  
✅ **Automatic Detection**: Token URL auto-detected from API URL  
✅ **Dashboard Integration**: Errors show properly in Cursor MCP dashboard  

## Next Steps

1. Ensure your external API has a token acquisition endpoint
2. Set `EXTERNAL_API_URL` in your `.env` file
3. Optionally set `TOKEN_ACQUISITION_URL` if different from default
4. Restart your MCP server
5. Test the setup page and error messages




