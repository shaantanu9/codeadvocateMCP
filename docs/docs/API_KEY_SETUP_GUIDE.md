# 🔑 API Key Setup Guide - Complete Instructions

## ✅ Secure API Key Management

Your MCP server now supports secure API key management for calling external APIs.

---

## 📋 Step-by-Step Setup

### Step 1: Create `.env` File

```bash
cd /Users/shantanubombatkar/Documents/GitHub/personal/memory-testing/demo_mcp
cp .env.example .env
```

### Step 2: Add Your API Key

Edit the `.env` file and add your external API key:

```env
# External API Configuration
EXTERNAL_API_KEY=sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps
EXTERNAL_API_URL=http://localhost:5656
```

**Important:**
- ✅ The `.env` file is already in `.gitignore` (won't be committed)
- ✅ API keys are never logged or exposed in errors
- ✅ Keys are loaded securely at startup

### Step 3: Verify Configuration

The server will automatically:
- ✅ Load the API key from `.env`
- ✅ Validate it on startup
- ✅ Use it for all external API calls
- ✅ Show a warning if key is missing

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API keys in `.env` file
- Keep `.env` in `.gitignore`
- Use environment variables in production
- Rotate keys regularly

### ❌ DON'T:
- Commit `.env` to git
- Hardcode keys in source code
- Log API keys
- Expose keys in error messages

---

## 🛠️ How It Works

### 1. API Key Storage
```env
# .env file (gitignored)
EXTERNAL_API_KEY=sk_your_key_here
EXTERNAL_API_URL=http://localhost:5656
```

### 2. Automatic Loading
The server automatically loads the key on startup:
```typescript
// src/config/env.ts
export const envConfig = loadEnvConfig();
// API key is available as: envConfig.externalApiKey
```

### 3. Secure Usage
The API service uses the key in headers:
```typescript
// src/services/external-api-service.ts
headers: {
  "X-API-Key": this.apiKey,  // From .env, never logged
  "Content-Type": "application/json"
}
```

---

## 🚀 Available External API Tools

### 1. `listSnippets`
List code snippets with filters

**Parameters:**
- `search` (optional) - Search term
- `language` (optional) - Programming language
- `tags` (optional) - Comma-separated tags
- `projectId` (optional) - Filter by project
- `favorite` (optional) - Filter by favorite
- `page` (optional) - Page number
- `limit` (optional) - Items per page

### 2. `getSnippet`
Get a specific snippet by ID

**Parameters:**
- `snippetId` (required) - Snippet ID

### 3. `createSnippet`
Create a new code snippet

**Parameters:**
- `title` (required) - Snippet title
- `code` (required) - Code content
- `language` (required) - Programming language
- `description` (optional) - Description
- `tags` (optional) - Array of tags
- `projectId` (optional) - Project ID
- `repositoryId` (optional) - Repository ID

### 4. `listProjects`
List projects with filters

**Parameters:**
- `search` (optional) - Search term
- `teamId` (optional) - Filter by team
- `page` (optional) - Page number
- `limit` (optional) - Items per page

### 5. `listCollections`
List collections

**Parameters:**
- `search` (optional) - Search term
- `page` (optional) - Page number
- `limit` (optional) - Items per page

### 6. `callExternalAPI`
Generic API call for any endpoint

**Parameters:**
- `method` (required) - HTTP method (GET, POST, PUT, PATCH, DELETE)
- `endpoint` (required) - API endpoint path
- `body` (optional) - Request body
- `queryParams` (optional) - Query parameters

---

## 🧪 Testing

### Test API Key Configuration

```bash
# Start server
npm run dev

# You should see:
# [Config] External API configured: http://localhost:5656
```

### Test a Tool

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "listSnippets",
      "arguments": {
        "limit": 5
      }
    }
  }'
```

---

## 📝 Example `.env` File

```env
# External API (Required for external API tools)
EXTERNAL_API_KEY=sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps
EXTERNAL_API_URL=http://localhost:5656

# AI Providers (Optional - for AI tools)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Server Config
PORT=3111
NODE_ENV=development
```

---

## 🔍 How API Key is Used

### In API Requests

Every request to the external API automatically includes:

```typescript
headers: {
  "X-API-Key": "sk_your_key_from_env",  // From .env
  "Content-Type": "application/json"
}
```

### Example Request Flow

1. **Tool called** → `listSnippets`
2. **Service gets key** → From `envConfig.externalApiKey`
3. **Request made** → `GET http://localhost:5656/api/snippets`
4. **Headers added** → `X-API-Key: sk_...`
5. **Response received** → Formatted and returned

---

## ✅ Verification Checklist

- [ ] `.env` file created
- [ ] `EXTERNAL_API_KEY` added to `.env`
- [ ] `EXTERNAL_API_URL` set (default: http://localhost:5656)
- [ ] Server starts without errors
- [ ] See "[Config] External API configured" in logs
- [ ] Tools can call external API successfully

---

## 🐛 Troubleshooting

### "External API service is not available"

**Solution:** Add `EXTERNAL_API_KEY` to `.env` file

### "API request failed: 401"

**Solution:** 
- Verify API key is correct
- Check key hasn't expired
- Ensure external API server is running

### "API request failed: 404"

**Solution:**
- Check `EXTERNAL_API_URL` is correct
- Verify external API server is running on that URL
- Test with curl: `curl -H "X-API-Key: $KEY" http://localhost:5656/api/snippets`

---

## 🎯 Next Steps

1. ✅ **Add API key to `.env`**
2. ✅ **Start server**: `npm run dev`
3. ✅ **Test tools** in Cursor IDE
4. ✅ **Use tools** to interact with external API

---

**Your API key is now securely configured and ready to use!** 🔐

