# 🔐 Secure MCP Server - Complete Setup

## ✅ Token-Based Authentication Implemented!

Your MCP server now **requires a token** for all connections. Without a valid token, the server will reject all requests.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Generate Token

```bash
# Option 1: Use the helper script
./generate-token.sh

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Using OpenSSL
openssl rand -hex 32
```

### Step 2: Create `.env` File

```bash
cd /Users/shantanubombatkar/Documents/GitHub/personal/memory-testing/demo_mcp
cat > .env << 'EOF'
# MCP Server Authentication (REQUIRED - Server won't start without this!)
MCP_SERVER_TOKEN=your-generated-token-here

# External API (for tools that call external APIs)
EXTERNAL_API_KEY=sk_your_external_api_key
EXTERNAL_API_URL=http://localhost:5656

# Server Config
PORT=3111
NODE_ENV=development
EOF
```

**Replace `your-generated-token-here` with the token from Step 1!**

### Step 3: Start Server

```bash
npm run dev
```

**If token is missing, server will exit with error!**

---

## 🔒 How It Works

### Authentication Flow

```
1. Client sends request → With token in header
2. Server extracts token → From Authorization or X-MCP-Token header
3. Server validates token → Compares with MCP_SERVER_TOKEN from .env
4. If valid → Request proceeds ✅
5. If invalid/missing → Returns 401 Unauthorized ❌
```

### Token Headers Supported

**Method 1: Authorization Bearer (Recommended)**
```
Authorization: Bearer your-token-here
```

**Method 2: X-MCP-Token Header**
```
X-MCP-Token: your-token-here
```

---

## 📝 Configure Cursor IDE

Update `~/.cursor/mcp.json`:

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

**Important:** Replace `your-token-here` with your actual token from `.env`!

---

## 🧪 Test Authentication

### ❌ Without Token (Should Fail)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Response:**
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

### ✅ With Valid Token (Should Work)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Response:** List of available tools

### ❌ With Invalid Token (Should Fail)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong-token" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Response:**
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

✅ **Token Required** - Server exits if token missing  
✅ **Token Validation** - Every request authenticated  
✅ **401 Responses** - Clear errors for unauthorized access  
✅ **Token in .env** - Never committed to git  
✅ **Logging** - Failed attempts logged with IP  
✅ **Secure by Default** - No way to bypass authentication  

---

## 📊 What's Protected

- ✅ `/mcp` endpoint - **REQUIRES TOKEN**
- ❌ `/health` endpoint - Public (no token needed)
- ❌ `/` endpoint - Public (no token needed)

---

## 🚨 Important Notes

1. **Server Won't Start** without `MCP_SERVER_TOKEN` in `.env`
2. **All MCP Requests** require valid token
3. **Token Must Match** exactly (case-sensitive)
4. **Keep Token Secret** - Never share or commit
5. **Rotate Token** - Change periodically for security

---

## ✅ Verification

After setup, you should see:

```
[Config] ✅ MCP Server Authentication: ENABLED (Token required)
[MCP] Server running at http://localhost:3111/mcp
```

If you see:
```
[Config] ❌ ERROR: MCP_SERVER_TOKEN is required but not set!
```

→ Add `MCP_SERVER_TOKEN` to your `.env` file!

---

## 🎯 Summary

- ✅ **Token-based authentication** implemented
- ✅ **Server requires token** to start
- ✅ **All MCP requests** validated
- ✅ **401 errors** for invalid/missing tokens
- ✅ **Secure by default** - no bypass possible

**Your MCP server is now secure!** 🔐

