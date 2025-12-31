#!/bin/bash
# Install MCP Server as a system service
# Supports macOS (launchd) and Linux (systemd)

cd "$(dirname "$0")/.."

PROJECT_DIR="$(pwd)"
SERVICE_NAME="demo-mcp-server"
USER=$(whoami)

echo "📦 Installing MCP Server as System Service"
echo "   Project: $PROJECT_DIR"
echo "   User: $USER"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Use launchd
    echo "Detected macOS - Using launchd"
    
    PLIST_FILE="$HOME/Library/LaunchAgents/${SERVICE_NAME}.plist"
    
    cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${SERVICE_NAME}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/env</string>
        <string>node</string>
        <string>${PROJECT_DIR}/dist/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${PROJECT_DIR}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${PROJECT_DIR}/logs/mcp-server.log</string>
    <key>StandardErrorPath</key>
    <string>${PROJECT_DIR}/logs/mcp-server.error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
        <key>PORT</key>
        <string>3111</string>
    </dict>
</dict>
</plist>
EOF
    
    echo "✅ Created launchd plist: $PLIST_FILE"
    echo ""
    echo "To load the service:"
    echo "  launchctl load $PLIST_FILE"
    echo ""
    echo "To unload the service:"
    echo "  launchctl unload $PLIST_FILE"
    echo ""
    echo "To check status:"
    echo "  launchctl list | grep ${SERVICE_NAME}"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - Use systemd
    echo "Detected Linux - Using systemd"
    
    SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
    
    if [ "$EUID" -ne 0 ]; then
        echo "⚠️  Root access required for systemd. Creating service file locally..."
        SERVICE_FILE="${PROJECT_DIR}/${SERVICE_NAME}.service"
    fi
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Demo MCP Server
After=network.target

[Service]
Type=simple
User=${USER}
WorkingDirectory=${PROJECT_DIR}
ExecStart=/usr/bin/env node ${PROJECT_DIR}/dist/index.js
Restart=always
RestartSec=10
StandardOutput=append:${PROJECT_DIR}/logs/mcp-server.log
StandardError=append:${PROJECT_DIR}/logs/mcp-server.error.log
Environment=NODE_ENV=production
Environment=PORT=3111

[Install]
WantedBy=multi-user.target
EOF
    
    echo "✅ Created systemd service file: $SERVICE_FILE"
    echo ""
    
    if [ "$EUID" -eq 0 ]; then
        echo "To enable and start the service:"
        echo "  systemctl daemon-reload"
        echo "  systemctl enable ${SERVICE_NAME}"
        echo "  systemctl start ${SERVICE_NAME}"
        echo ""
        echo "To check status:"
        echo "  systemctl status ${SERVICE_NAME}"
    else
        echo "⚠️  Run as root to install systemd service:"
        echo "  sudo cp ${SERVICE_FILE} /etc/systemd/system/"
        echo "  sudo systemctl daemon-reload"
        echo "  sudo systemctl enable ${SERVICE_NAME}"
        echo "  sudo systemctl start ${SERVICE_NAME}"
    fi
else
    echo "⚠️  Unsupported OS: $OSTYPE"
    echo "   Please use the auto-start script manually:"
    echo "   bash scripts/auto-start.sh"
    exit 1
fi

# Create logs directory
mkdir -p "${PROJECT_DIR}/logs"

echo ""
echo "✅ Service installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Build the project: npm run build"
echo "   2. Load/start the service (see commands above)"
echo "   3. Check logs in: ${PROJECT_DIR}/logs/"

