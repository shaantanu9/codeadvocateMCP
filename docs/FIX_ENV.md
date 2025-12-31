# 🔧 Fix: Create .env File with Token

## Quick Fix

Run this command to create the `.env` file with a generated token:

```bash
cd /Users/shantanubombatkar/Documents/GitHub/personal/memory-testing/demo_mcp
./create-env.sh
```

Or manually:

```bash
# Generate token
TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create .env file
cat > .env << EOF
# MCP Server Authentication (REQUIRED)
MCP_SERVER_TOKEN=$TOKEN

# External API Configuration
EXTERNAL_API_KEY=sk_GVCVDiKHNHkP2XgXHHaOkAgTdYLemgD_UFGdS2f7kps
EXTERNAL_API_URL=http://localhost:5656

# Server Configuration
PORT=3111
NODE_ENV=development
EOF

echo "Token: $TOKEN"
```

## Then Start Server

```bash
npm run dev
```

The server should now start successfully! ✅

