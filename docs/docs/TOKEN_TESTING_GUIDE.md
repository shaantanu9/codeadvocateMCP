# 🧪 Token Testing Guide

## ✅ New Testing Tools Added!

Three new tools have been added to test and validate your MCP server authentication:

1. **`validateToken`** - Test if a specific token is valid
2. **`getTokenInfo`** - Get information about the server's token (without exposing it)
3. **`testAuthentication`** - Test if your current request is authenticated

---

## 🧪 Tool 1: `validateToken`

Test if a specific token matches the server's authentication token.

### Usage

```json
{
  "name": "validateToken",
  "arguments": {
    "token": "your-token-to-test-here"
  }
}
```

### Example: Valid Token

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-valid-token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "validateToken",
      "arguments": {
        "token": "your-valid-token"
      }
    }
  }'
```

**Response:**
```
✅ Token Validation: SUCCESS

Status: Valid token ✅
Token Preview: abcd...wxyz
Token Length: 64 characters
Server Token Length: 64 characters

🎉 The provided token matches the MCP server's authentication token!
```

### Example: Invalid Token

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-valid-token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "validateToken",
      "arguments": {
        "token": "wrong-token"
      }
    }
  }'
```

**Response:**
```
❌ Token Validation: FAILED

Status: Invalid token ❌
Token Preview: wron...oken
Token Length: 11 characters
Server Token Length: 64 characters

⚠️ The provided token does NOT match the MCP server's authentication token.
```

---

## 🔍 Tool 2: `getTokenInfo`

Get information about the server's token without exposing the actual token.

### Usage

```json
{
  "name": "getTokenInfo",
  "arguments": {}
}
```

### Example

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-valid-token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "getTokenInfo",
      "arguments": {}
    }
  }'
```

**Response:**
```json
{
  "tokenConfigured": true,
  "tokenLength": 64,
  "tokenPreview": "abcd...wxyz",
  "strength": "Very Strong",
  "characterTypes": {
    "hasLetters": true,
    "hasNumbers": true,
    "hasSpecial": false
  },
  "authenticationRequired": true
}
```

---

## ✅ Tool 3: `testAuthentication`

Test if your current request is properly authenticated.

### Usage

```json
{
  "name": "testAuthentication",
  "arguments": {}
}
```

### Example: With Valid Token

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-valid-token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "testAuthentication",
      "arguments": {}
    }
  }'
```

**Response:**
```
✅ Authentication Test: SUCCESS

Status: Authenticated ✅

🎉 If you can see this message, it means:
1. Your request included a valid token in the headers
2. The authentication middleware validated it successfully
3. The MCP server accepted your request
```

### Example: Without Token (Will Fail Before Tool is Called)

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "testAuthentication",
      "arguments": {}
    }
  }'
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Unauthorized: MCP server requires authentication token"
  },
  "id": 3
}
```

---

## 🧪 Complete Testing Workflow

### Step 1: Get Token Info

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "getTokenInfo",
      "arguments": {}
    }
  }'
```

This shows you:
- Token length
- Token preview (first/last 4 chars)
- Token strength
- Character types

### Step 2: Validate Your Token

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "validateToken",
      "arguments": {
        "token": "YOUR_TOKEN"
      }
    }
  }'
```

This confirms your token matches the server's token.

### Step 3: Test Authentication

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "testAuthentication",
      "arguments": {}
    }
  }'
```

This confirms the authentication middleware is working.

---

## 📝 Testing in Cursor IDE

1. **Open Cursor Chat**
2. **Use the tools:**
   - "Get token info"
   - "Validate token: YOUR_TOKEN"
   - "Test authentication"

---

## ✅ Expected Results

### Valid Token
- ✅ `validateToken` → SUCCESS
- ✅ `getTokenInfo` → Shows token info
- ✅ `testAuthentication` → SUCCESS

### Invalid Token
- ❌ `validateToken` → FAILED
- ✅ `getTokenInfo` → Still works (doesn't need token validation)
- ❌ Request without token → 401 Unauthorized (before tool is called)

---

## 🔒 Security Notes

- ✅ **Token never exposed** - Only preview shown (first/last 4 chars)
- ✅ **Validation is secure** - Compares tokens securely
- ✅ **No token leakage** - Full token never in responses
- ✅ **Clear feedback** - Shows if token is valid or not

---

## 🎯 Quick Test Script

```bash
#!/bin/bash

TOKEN="your-token-here"
MCP_URL="http://localhost:3111/mcp"

echo "Testing Token: ${TOKEN:0:4}...${TOKEN: -4}"
echo ""

echo "1. Getting token info..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"getTokenInfo\",\"arguments\":{}}}" | jq .

echo ""
echo "2. Validating token..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":\"validateToken\",\"arguments\":{\"token\":\"$TOKEN\"}}}" | jq .

echo ""
echo "3. Testing authentication..."
curl -s -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"tools/call\",\"params\":{\"name\":\"testAuthentication\",\"arguments\":{}}}" | jq .
```

---

**Now you can easily test if your token is working!** 🧪✅

