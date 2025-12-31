#!/bin/bash

# Generate a secure token and create .env file

echo "🔐 Generating secure MCP server token..."

TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

cat > .env << EOF
# MCP Server Authentication (REQUIRED)
MCP_SERVER_TOKEN=$TOKEN

# External API Configuration (for tools that call external APIs)
EXTERNAL_API_KEY=sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps
EXTERNAL_API_URL=http://localhost:5656

# Server Configuration
PORT=3111
NODE_ENV=development
EOF

echo "✅ .env file created!"
echo ""
echo "🔑 Your MCP Server Token:"
echo "$TOKEN"
echo ""
echo "📝 IMPORTANT: Save this token!"
echo "   Add it to ~/.cursor/mcp.json:"
echo '   "headers": { "Authorization": "Bearer '"$TOKEN"'" }'
echo ""




