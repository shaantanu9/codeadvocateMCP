# Quick Auto-Start Guide for MCP Server

## ⚠️ Important Note

**MCP servers must run continuously** - they maintain persistent connections with clients. They should NOT run on intervals, but rather:
- Start automatically on boot
- Restart automatically if they crash
- Stay running 24/7

## Fastest Setup: PM2 (Recommended)

```bash
# 1. Install PM2
npm install -g pm2

# 2. Build project
npm run build

# 3. Start with PM2
pm2 start npm --name "mcp-server" -- run start

# 4. Save and enable on boot
pm2 save
pm2 startup
# Follow instructions, then:
pm2 save

# Done! Server will now:
# - Start on boot
# - Auto-restart if crashes
# - Run continuously
```

## Alternative: System Service

```bash
# Build and install
npm run build
bash scripts/install-service.sh

# macOS:
launchctl load ~/Library/LaunchAgents/demo-mcp-server.plist

# Linux:
sudo systemctl enable demo-mcp-server
sudo systemctl start demo-mcp-server
```

## Health Check at Intervals (Optional)

If you want to check server health periodically and restart if down:

```bash
# Check every 5 minutes
bash scripts/schedule-server.sh 5
```

## Verify It's Working

```bash
# Check server
curl http://localhost:3111/health

# PM2 status
pm2 status

# Service status (macOS)
launchctl list | grep demo-mcp-server

# Service status (Linux)
sudo systemctl status demo-mcp-server
```

## Why Continuous, Not Intervals?

MCP servers use **Server-Sent Events (SSE)** or **WebSocket** for persistent connections. Clients (like Cursor IDE) maintain long-lived connections that would break if the server restarted on intervals.

The server should:
- ✅ Run continuously
- ✅ Auto-restart on crash
- ✅ Start on boot
- ❌ NOT restart on schedule (would break client connections)




