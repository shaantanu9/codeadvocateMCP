# Auto-Start MCP Server Guide

This guide shows how to run the MCP server automatically at specific time intervals or on system startup.

## Options

### Option 1: Auto-Restart Script (Recommended for Development)

Keeps the server running and automatically restarts if it crashes.

```bash
# Run with auto-restart
bash scripts/auto-start.sh

# Or with custom settings
MAX_RESTARTS=20 RESTART_DELAY=10 bash scripts/auto-start.sh
```

**Features:**
- Automatically restarts if server crashes
- Configurable max restarts and delay
- Logs to `/tmp/mcp-server.log`

### Option 2: System Service (Recommended for Production)

Install as a system service that starts on boot and keeps running.

#### macOS (Launchd)

```bash
# 1. Build the project
npm run build

# 2. Install service
bash scripts/install-service.sh

# 3. Load the service
launchctl load ~/Library/LaunchAgents/demo-mcp-server.plist

# 4. Check status
launchctl list | grep demo-mcp-server

# 5. View logs
tail -f logs/mcp-server.log
```

**To unload:**
```bash
launchctl unload ~/Library/LaunchAgents/demo-mcp-server.plist
```

#### Linux (Systemd)

```bash
# 1. Build the project
npm run build

# 2. Install service (requires root)
sudo bash scripts/install-service.sh

# 3. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable demo-mcp-server
sudo systemctl start demo-mcp-server

# 4. Check status
sudo systemctl status demo-mcp-server

# 5. View logs
sudo journalctl -u demo-mcp-server -f
```

**To stop:**
```bash
sudo systemctl stop demo-mcp-server
sudo systemctl disable demo-mcp-server
```

### Option 3: Scheduled Checks (Cron Job)

Check and start the server at specific intervals.

```bash
# Schedule to check every 5 minutes
bash scripts/schedule-server.sh 5

# Schedule to check every 1 minute
bash scripts/schedule-server.sh 1
```

**Features:**
- Checks if server is running at specified intervals
- Starts server if it's not running
- Logs to `/tmp/mcp-scheduler.log`

**Manual cron setup:**
```bash
# Edit crontab
crontab -e

# Add this line (checks every 5 minutes)
*/5 * * * * /path/to/demo_mcp/scripts/check-and-start.sh

# View cron jobs
crontab -l
```

### Option 4: Background Process with nohup

Run in background and keep it running.

```bash
# Start in background
nohup npm run dev > logs/mcp-server.log 2>&1 &

# Check if running
ps aux | grep "tsx src/index"

# View logs
tail -f logs/mcp-server.log

# Stop
pkill -f "tsx src/index"
```

### Option 5: Using PM2 (Process Manager)

Install PM2 for advanced process management.

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start npm --name "mcp-server" -- run dev

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Check status
pm2 status

# View logs
pm2 logs mcp-server

# Restart
pm2 restart mcp-server

# Stop
pm2 stop mcp-server
```

## Comparison

| Method | Auto-Start | Auto-Restart | Best For |
|--------|-----------|--------------|----------|
| Auto-Start Script | ❌ | ✅ | Development |
| System Service | ✅ | ✅ | Production |
| Cron Job | ❌ | ✅ | Scheduled checks |
| nohup | ❌ | ❌ | Simple background |
| PM2 | ✅ | ✅ | Advanced management |

## Recommended Setup

### For Development
```bash
# Use auto-start script
bash scripts/auto-start.sh
```

### For Production
```bash
# Build and install as service
npm run build
bash scripts/install-service.sh
# Then load/start the service (see above)
```

## Verification

After setting up auto-start, verify it's working:

```bash
# Check if server is running
curl http://localhost:3111/health

# Check process
ps aux | grep "node.*index.js" | grep -v grep

# Check logs
tail -f logs/mcp-server.log
```

## Troubleshooting

### Server not starting automatically

1. **Check logs:**
   ```bash
   tail -f logs/mcp-server.log
   tail -f logs/mcp-server.error.log
   ```

2. **Check if port is available:**
   ```bash
   lsof -ti:3111
   ```

3. **Check service status:**
   - macOS: `launchctl list | grep demo-mcp-server`
   - Linux: `sudo systemctl status demo-mcp-server`

4. **Verify .env file exists:**
   ```bash
   ls -la .env
   ```

### Server keeps restarting

Check error logs to find the issue:
```bash
tail -100 logs/mcp-server.error.log
```

## Environment Variables

You can set environment variables in:
- `.env` file (loaded automatically)
- Service configuration (launchd plist or systemd service file)
- Shell before running scripts

Common variables:
- `PORT` - Server port (default: 3111)
- `NODE_ENV` - Environment (development/production)
- `MCP_SERVER_TOKEN` - Authentication token
- `EXTERNAL_API_BASE_URL` - External API base URL




