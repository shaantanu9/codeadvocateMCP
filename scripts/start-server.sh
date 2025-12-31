#!/bin/bash
# Start MCP Server Script
# This script starts the MCP server and keeps it running

cd "$(dirname "$0")/.."

echo "🚀 Starting MCP Server..."
echo ""

# Check if server is already running
if lsof -ti:3111 > /dev/null 2>&1; then
    echo "⚠️  Server is already running on port 3111"
    echo "   PID: $(lsof -ti:3111)"
    echo "   To restart, run: ./scripts/stop-server.sh"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one..."
    bash scripts/setup-env.sh
fi

# Start the server
echo "Starting server on port 3111..."
npm run dev




