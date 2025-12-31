# MCP Server Auto-Start Guide

## ⚠️ Important: MCP Servers Must Run Continuously

**MCP servers need to run continuously**, not on intervals. They maintain persistent connections with clients (like Cursor IDE) using Server-Sent Events (SSE) or WebSocket protocols.

The server should:

- ✅ Start automatically on system boot
- ✅ Restart automatically if it crashes
- ✅ Stay running 24/7 to accept client connections
- ❌ NOT run on intervals (clients need persistent connections)

## Recommended Solutions

### Option 1: PM2 Process Manager (Best for MCP Servers) ⭐

PM2 is ideal for Node.js/MCP servers with auto-restart, monitoring, and boot startup.

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Build the project
npm run build

# 3. Start MCP server with PM2
cd /Users/shantanubombatkar/Documents/GitHub/personal/memory-testing/demo_mcp
pm2 start npm --name "mcp-server" -- run start

# 4. Save PM2 configuration
pm2 save

# 5. Setup PM2 to start on system boot
pm2 startup
# Follow the instructions it prints, then:
pm2 save

# 6. Monitor
pm2 status
pm2 logs mcp-server
pm2 monit
```

**PM2 Features:**

- ✅ Auto-restart on crash
- ✅ Auto-start on boot
- ✅ Process monitoring
- ✅ Log management
- ✅ Zero-downtime restarts
- ✅ Resource monitoring

### Option 2: System Service (macOS/Linux)

Install as a system service that starts on boot and keeps running.

#### macOS (Launchd)

```bash
# 1. Build the project
npm run build

# 2. Install service
bash scripts/install-service.sh

# 3. Load the service (starts on boot)
launchctl load ~/Library/LaunchAgents/demo-mcp-server.plist

# 4. Check status
launchctl list | grep demo-mcp-server

# 5. View logs
tail -f logs/mcp-server.log
```

#### Linux (Systemd)

```bash
# 1. Build the project
npm run build

# 2. Install service (requires root)
sudo bash scripts/install-service.sh

# 3. Enable and start (starts on boot)
sudo systemctl daemon-reload
sudo systemctl enable demo-mcp-server
sudo systemctl start demo-mcp-server

# 4. Check status
sudo systemctl status demo-mcp-server
```

### Option 3: Health Check with Auto-Restart (Interval Checks)

If you want to check server health at intervals and restart if needed:

```bash
# Schedule health checks every 5 minutes
bash scripts/schedule-server.sh 5

# This creates a cron job that:
# - Checks if server is running every N minutes
# - Starts server if it's not running
# - Logs all activity to /tmp/mcp-scheduler.log
```

**Manual cron setup:**

```bash
# Edit crontab
crontab -e

# Add this line (checks every 5 minutes)
*/5 * * * * /path/to/demo_mcp/scripts/check-and-start.sh

# View cron jobs
crontab -l
```

### Option 4: Auto-Restart Script

Keep server running with automatic restart on crash.

```bash
# Run with auto-restart
bash scripts/auto-start.sh

# Or with custom settings
MAX_RESTARTS=20 RESTART_DELAY=10 bash scripts/auto-start.sh
```

## Quick Setup After Installation

```bash
# 1. Setup environment
bash scripts/setup-env.sh

# 2. Build project
npm run build

# 3. Choose one method:

# Method A: PM2 (Recommended)
npm install -g pm2
pm2 start npm --name "mcp-server" -- run start
pm2 startup
pm2 save

# Method B: System Service
bash scripts/install-service.sh
# Then load/start (see commands above)

# Method C: Health Check Cron
bash scripts/schedule-server.sh 5
```

## Verification

After setting up auto-start:

```bash
# Check if server is running
curl http://localhost:3111/health

# Check process
ps aux | grep "node.*index.js" | grep -v grep

# Check service status
# macOS:
launchctl list | grep demo-mcp-server

# Linux:
sudo systemctl status demo-mcp-server

# PM2:
pm2 status
pm2 logs mcp-server
```

## MCP-Specific Considerations

1. **Persistent Connections**: MCP servers use SSE/WebSocket, so they must stay running
2. **Session Management**: Server maintains session state with clients
3. **Health Endpoint**: Use `/health` to verify server is running
4. **Graceful Shutdown**: Server handles SIGTERM/SIGINT for clean shutdown
5. **Stateless Mode**: This server uses stateless mode (new instance per request)

## Best Practice for MCP Servers

**Use PM2** - It's specifically designed for Node.js applications and provides:

- ✅ Automatic start on boot
- ✅ Automatic restart on crash
- ✅ Process monitoring and health checks
- ✅ Log rotation and management
- ✅ Resource monitoring
- ✅ Easy management commands

## Troubleshooting

### Server stops after some time

Check logs:

```bash
# PM2
pm2 logs mcp-server

# System service
tail -100 logs/mcp-server.log
tail -100 logs/mcp-server.error.log

# Health check scheduler
tail -100 /tmp/mcp-scheduler.log
```

### Port already in use

```bash
# Find process
lsof -ti:3111

# Kill it
kill -9 $(lsof -ti:3111)
```

### Service not starting on boot

- **PM2**: Run `pm2 startup` again and follow instructions
- **macOS**: Check `launchctl list | grep demo-mcp-server`
- **Linux**: Check `sudo systemctl status demo-mcp-server`
- Verify service file paths are correct
- Check logs for errors



