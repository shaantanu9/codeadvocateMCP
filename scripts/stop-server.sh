#!/bin/bash
# Stop MCP Server Script

cd "$(dirname "$0")/.."

echo "🛑 Stopping MCP Server..."
echo ""

# Find and kill processes
PIDS=$(lsof -ti:3111 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ No server running on port 3111"
    exit 0
fi

echo "Found processes: $PIDS"
for PID in $PIDS; do
    echo "Killing process $PID..."
    kill -TERM "$PID" 2>/dev/null || kill -9 "$PID" 2>/dev/null
done

sleep 1

# Verify
if lsof -ti:3111 > /dev/null 2>&1; then
    echo "⚠️  Some processes still running, force killing..."
    lsof -ti:3111 | xargs kill -9 2>/dev/null
fi

echo "✅ Server stopped"




