# 🔐 MCP Server Authentication Setup

## ✅ Secure Token-Based Authentication

Your MCP server now requires a **token** for all connections. Without a valid token, clients cannot access the MCP server.

---

## 🚀 Quick Setup

### Step 1: Generate a Secure Token

```bash
# Option 1: Using OpenSSL
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Step 2: Add Token to `.env` File

Create or edit `.env` file:

```bash
cd /Users/shantanubombatkar/Documents/GitHub/personal/memory-testing/demo_mcp
```

Add your token:

```env
# MCP Server Authentication (REQUIRED)
MCP_SERVER_TOKEN=your-generated-token-here

# External API (for tools)
EXTERNAL_API_KEY=sk_your_external_api_key
EXTERNAL_API_URL=http://localhost:5656

# Server Config
PORT=3111
NODE_ENV=development
```

### Step 3: Start Server

```bash
npm run dev
```

You should see:

```
[Config] ✅ MCP Server Authentication: ENABLED (Token required)
[MCP] Server running at http://localhost:3111/mcp
```

**Important:** Server will **NOT start** if `MCP_SERVER_TOKEN` is missing!

---

## 🔒 How Authentication Works

### Token Validation

1. **Client sends request** with token in header
2. **Server extracts token** from `Authorization: Bearer <token>` or `X-MCP-Token: <token>`
3. **Server validates token** against `MCP_SERVER_TOKEN` from `.env`
4. **If valid** → Request proceeds
5. **If invalid/missing** → Returns 401 Unauthorized

### Supported Token Headers

**Method 1: Authorization Bearer (Recommended)**

```bash
Authorization: Bearer your-token-here
```

**Method 2: X-MCP-Token Header**

```bash
X-MCP-Token: your-token-here
```

---

## 📝 Configure Cursor IDE

Update `~/.cursor/mcp.json` to include the token:

```json
{
  "mcpServers": {
    "demo_mcp": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer your-token-here"
      }
    }
  }
}
```

**Or using X-MCP-Token:**

```json
{
  "mcpServers": {
    "demo_mcp": {
      "url": "http://localhost:3111/mcp",
      "transport": "sse",
      "headers": {
        "X-MCP-Token": "your-token-here"
      }
    }
  }
}
```

---

## 🧪 Testing Authentication

### Test Without Token (Should Fail)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Expected Response:**

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Unauthorized: MCP server requires authentication token"
  },
  "id": 1
}
```

### Test With Valid Token (Should Work)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Expected Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [...]
  },
  "id": 1
}
```

### Test With Invalid Token (Should Fail)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong-token" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Expected Response:**

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Unauthorized: Invalid authentication token"
  },
  "id": 1
}
```

---

## 🔐 Security Features

✅ **Token Required** - Server won't start without token  
✅ **Token Validation** - Every request is authenticated  
✅ **401 Unauthorized** - Clear error for invalid/missing tokens  
✅ **Token in .env** - Never committed to git  
✅ **Logging** - Failed auth attempts are logged  
✅ **IP Tracking** - Logs show which IP attempted access

---

## 📊 Authentication Flow

```
Client Request
    ↓
Extract Token (Authorization or X-MCP-Token)
    ↓
Token Provided?
    ├─ No → 401 Unauthorized
    └─ Yes → Validate Token
            ├─ Invalid → 401 Unauthorized
            └─ Valid → Process Request ✅
```

---

## 🛠️ Error Responses

### Missing Token

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Unauthorized: MCP server requires authentication token"
  },
  "id": null
}
```

### Invalid Token

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Unauthorized: Invalid authentication token"
  },
  "id": null
}
```

---

## ✅ Verification Checklist

- [ ] Token generated (32+ characters recommended)
- [ ] `MCP_SERVER_TOKEN` added to `.env`
- [ ] Server starts successfully
- [ ] See "[Config] ✅ MCP Server Authentication: ENABLED" in logs
- [ ] Request without token returns 401
- [ ] Request with valid token works
- [ ] Request with invalid token returns 401
- [ ] Cursor IDE configured with token

---

## 🔄 Token Rotation

To rotate your token:

1. **Generate new token**
2. **Update `.env` file** with new token
3. **Update Cursor config** (`~/.cursor/mcp.json`)
4. **Restart MCP server**
5. **Restart Cursor IDE**

---

## 🎯 Best Practices

1. **Use Strong Tokens** - At least 32 characters, random
2. **Keep Token Secret** - Never commit to git
3. **Rotate Regularly** - Change token periodically
4. **Use HTTPS** - In production, always use HTTPS
5. **Monitor Logs** - Watch for unauthorized access attempts

---

## 🚨 Important Notes

- ⚠️ **Server won't start** without `MCP_SERVER_TOKEN`
- ⚠️ **All MCP requests** require valid token
- ⚠️ **Health endpoint** (`/health`) doesn't require token
- ⚠️ **Root endpoint** (`/`) doesn't require token
- ✅ **Only `/mcp` endpoint** is protected

---

**Your MCP server is now secured with token authentication!** 🔐
