#!/bin/bash
# Check if MCP server is running, start if not
# Used by cron job for health checks

cd "$(dirname "$0")/.."

# Check if server is running
if ! lsof -ti:3111 > /dev/null 2>&1; then
    echo "[$(date)] MCP server not running. Starting..." >> /tmp/mcp-scheduler.log
    cd "$(dirname "$0")/.."
    
    # Load environment
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Start server in background
    npm run dev >> /tmp/mcp-server.log 2>&1 &
    SERVER_PID=$!
    echo "[$(date)] MCP server started (PID: $SERVER_PID)" >> /tmp/mcp-scheduler.log
    
    # Wait a moment and verify it started
    sleep 2
    if lsof -ti:3111 > /dev/null 2>&1; then
        echo "[$(date)] ✅ Server verified running" >> /tmp/mcp-scheduler.log
    else
        echo "[$(date)] ❌ Server failed to start" >> /tmp/mcp-scheduler.log
    fi
else
    PID=$(lsof -ti:3111)
    echo "[$(date)] ✅ MCP server is running (PID: $PID)" >> /tmp/mcp-scheduler.log
fi




