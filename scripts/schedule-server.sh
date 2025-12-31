#!/bin/bash
# Schedule MCP Server to run at specific intervals
# Creates a cron job to check and start the server

cd "$(dirname "$0")/.."

PROJECT_DIR="$(pwd)"
SCRIPT_PATH="${PROJECT_DIR}/scripts/check-and-start.sh"
INTERVAL=${1:-5}  # Default: check every 5 minutes

echo "⏰ Scheduling MCP Server to run every $INTERVAL minutes"
echo "   Project: $PROJECT_DIR"
echo ""

# Create check-and-start script if it doesn't exist
cat > "$SCRIPT_PATH" << 'SCRIPT'
#!/bin/bash
# Check if MCP server is running, start if not

PROJECT_DIR="SCRIPT_DIR_PLACEHOLDER"
cd "$PROJECT_DIR"

# Check if server is running
if ! lsof -ti:3111 > /dev/null 2>&1; then
    echo "[$(date)] MCP server not running. Starting..." >> /tmp/mcp-scheduler.log
    cd "$PROJECT_DIR"
    npm run dev >> /tmp/mcp-server.log 2>&1 &
    echo "[$(date)] MCP server started (PID: $!)" >> /tmp/mcp-scheduler.log
else
    echo "[$(date)] MCP server is running (PID: $(lsof -ti:3111))" >> /tmp/mcp-scheduler.log
fi
SCRIPT

# Replace placeholder with actual directory
sed -i.bak "s|SCRIPT_DIR_PLACEHOLDER|${PROJECT_DIR}|g" "$SCRIPT_PATH"
rm -f "${SCRIPT_PATH}.bak"
chmod +x "$SCRIPT_PATH"

# Create cron job
CRON_JOB="*/${INTERVAL} * * * * $SCRIPT_PATH"

echo "📋 Cron job to add:"
echo "   $CRON_JOB"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$SCRIPT_PATH"; then
    echo "⚠️  Cron job already exists"
    echo "   To remove: crontab -e (then delete the line)"
else
    echo "To add this cron job, run:"
    echo "  (crontab -l 2>/dev/null; echo \"$CRON_JOB\") | crontab -"
    echo ""
    read -p "Add cron job now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo "✅ Cron job added!"
        echo ""
        echo "To view cron jobs: crontab -l"
        echo "To remove: crontab -e"
    fi
fi

echo ""
echo "📝 Logs:"
echo "   Scheduler log: /tmp/mcp-scheduler.log"
echo "   Server log: /tmp/mcp-server.log"




