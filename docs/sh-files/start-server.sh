#!/bin/bash

# MCP Server Start Script
# This script starts the MCP server and keeps it running

echo "🚀 Starting MCP Server..."
echo ""

# Kill any existing processes on port 3111
echo "Cleaning up old processes..."
lsof -ti:3111 | xargs kill -9 2>/dev/null
sleep 1

# Start the server
echo "Starting server on port 3111..."
npm run dev

