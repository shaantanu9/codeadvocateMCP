#!/bin/bash

# Generate a secure token for MCP server authentication

echo "🔐 Generating secure MCP server token..."
echo ""

TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "✅ Token generated:"
echo ""
echo "$TOKEN"
echo ""
echo "📝 Add this to your .env file:"
echo "MCP_SERVER_TOKEN=$TOKEN"
echo ""
echo "🔒 Keep this token secret and never commit it to git!"

