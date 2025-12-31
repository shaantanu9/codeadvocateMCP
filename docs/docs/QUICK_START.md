# 🚀 Quick Start Guide - MCP Server

## Step-by-Step Instructions

### 1. Install Dependencies (if not already done)
```bash
cd /Users/shantanubombatkar/Documents/GitHub/personal/memory-testing/demo_mcp
npm install
```

### 2. Start the Server

**Option A: Development Mode (Recommended)**
```bash
npm run dev
```
This will:
- Start the server on `http://localhost:3111/mcp`
- Show real-time logs
- Keep running until you press `Ctrl+C`

**Option B: Background Mode**
```bash
npm run dev > /tmp/mcp-server.log 2>&1 &
```
This runs in the background. Check logs with:
```bash
tail -f /tmp/mcp-server.log
```

**Option C: Production Mode**
```bash
npm run build
npm start
```

### 3. Verify Server is Running

**Quick Check:**
```bash
curl http://localhost:3111/health
```

**Full Verification:**
```bash
./verify-server.sh
```

### 4. Test the MCP Server

**List Available Tools:**
```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Call a Tool:**
```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"listAIModels","arguments":{}}}'
```

### 5. Connect to Cursor IDE

1. **Ensure server is running** (see step 2)
2. **Verify Cursor config** is correct:
   ```bash
   cat ~/.cursor/mcp.json
   ```
   Should contain:
   ```json
   "demo_mcp": {
     "url": "http://localhost:3111/mcp",
     "transport": "sse"
   }
   ```
3. **Restart Cursor IDE completely** (quit and reopen)
4. **Use MCP tools in Cursor chat**

## Troubleshooting

### Server Won't Start

**Check if port is in use:**
```bash
lsof -ti:3111
```

**Kill existing processes:**
```bash
pkill -f "tsx src/index"
pkill -f "node.*index.js"
```

**Try a different port:**
```bash
PORT=3000 npm run dev
```

### Server Starts But Stops Immediately

**Check for errors:**
```bash
npm run dev
```
Look for error messages in the output.

**Check Node.js version:**
```bash
node -v  # Should be 18+ (recommended: 20+)
```

### Cursor Not Connecting

1. **Verify server is running:**
   ```bash
   curl http://localhost:3111/health
   ```

2. **Check Cursor config:**
   ```bash
   cat ~/.cursor/mcp.json | grep demo_mcp
   ```

3. **Restart Cursor completely** (not just reload)

4. **Check Cursor logs** for MCP connection errors

## Common Commands

```bash
# Start server
npm run dev

# Check status
./verify-server.sh

# Stop server (if running in foreground)
# Press Ctrl+C

# Stop server (if running in background)
pkill -f "tsx src/index"

# View logs (if running in background)
tail -f /tmp/mcp-server.log

# Test health
curl http://localhost:3111/health

# Test MCP endpoint
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Expected Output

When server starts successfully, you should see:
```
[MCP] Server running at http://localhost:3111/mcp
[MCP] Health check: http://localhost:3111/health
[MCP] Ready to accept connections
[MCP] Protocol: Streamable HTTP (2025-03-26)
```

## Next Steps

Once server is running:
1. ✅ Server is running
2. ✅ Health check passes
3. ✅ MCP tools are available
4. 🔄 **Restart Cursor IDE**
5. 🎯 **Start using MCP tools in Cursor!**

