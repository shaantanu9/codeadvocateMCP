#!/bin/bash
# Auto-start MCP Server Script
# Keeps the server running and restarts it if it crashes

cd "$(dirname "$0")/.."

LOG_FILE="${LOG_FILE:-/tmp/mcp-server.log}"
MAX_RESTARTS=${MAX_RESTARTS:-10}
RESTART_DELAY=${RESTART_DELAY:-5}

echo "🔄 Auto-start MCP Server (with auto-restart)"
echo "   Log file: $LOG_FILE"
echo "   Max restarts: $MAX_RESTARTS"
echo "   Restart delay: ${RESTART_DELAY}s"
echo ""

restart_count=0

while [ $restart_count -lt $MAX_RESTARTS ]; do
    echo "[$(date)] Starting MCP server (attempt $((restart_count + 1))/$MAX_RESTARTS)..." | tee -a "$LOG_FILE"
    
    # Start server and capture exit code
    npm run dev >> "$LOG_FILE" 2>&1
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "[$(date)] Server stopped normally" | tee -a "$LOG_FILE"
        break
    else
        restart_count=$((restart_count + 1))
        if [ $restart_count -lt $MAX_RESTARTS ]; then
            echo "[$(date)] Server crashed (exit code: $exit_code). Restarting in ${RESTART_DELAY}s..." | tee -a "$LOG_FILE"
            sleep $RESTART_DELAY
        else
            echo "[$(date)] Max restarts reached. Stopping." | tee -a "$LOG_FILE"
            exit 1
        fi
    fi
done




