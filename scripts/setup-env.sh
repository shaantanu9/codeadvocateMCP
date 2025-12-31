#!/bin/bash
# Setup environment file with required configuration

cd "$(dirname "$0")/.."

ENV_FILE=".env"
EXAMPLE_FILE=".env.example"

echo "🔧 Setting up environment configuration..."
echo ""

# Create .env.example if it doesn't exist
if [ ! -f "$EXAMPLE_FILE" ]; then
    cat > "$EXAMPLE_FILE" << 'EOF'
# MCP Server Configuration
# Copy this file to .env and fill in your values

# REQUIRED: MCP Server Authentication Token
# Generate a secure token: openssl rand -hex 32
MCP_SERVER_TOKEN=your-secure-token-here

# AI Provider API Keys (Optional - only needed if using AI tools)
# OPENAI_API_KEY=sk-your-openai-key-here
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# External API Configuration (Optional)
# EXTERNAL_API_KEY=your-external-api-key
# EXTERNAL_API_URL=http://localhost:5656

# Server Configuration
PORT=3111
NODE_ENV=development

# Default AI Models (Optional)
# DEFAULT_OPENAI_MODEL=gpt-4
# DEFAULT_ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Optional Settings
# MAX_REQUESTS_PER_MINUTE=60
# LOG_LEVEL=info
EOF
    echo "✅ Created $EXAMPLE_FILE"
fi

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    # Check if MCP_SERVER_TOKEN is set
    if grep -q "^MCP_SERVER_TOKEN=" "$ENV_FILE" && ! grep -q "^MCP_SERVER_TOKEN=your-secure-token-here" "$ENV_FILE" && ! grep -q "^MCP_SERVER_TOKEN=$" "$ENV_FILE"; then
        echo "✅ .env file exists and MCP_SERVER_TOKEN is configured"
        echo ""
        echo "Current configuration:"
        grep "^MCP_SERVER_TOKEN=" "$ENV_FILE" | sed 's/=.*/=***HIDDEN***/'
        exit 0
    else
        echo "⚠️  .env file exists but MCP_SERVER_TOKEN is not set or is placeholder"
        echo ""
        read -p "Generate a new token and update .env? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            NEW_TOKEN=$(openssl rand -hex 32)
            if grep -q "^MCP_SERVER_TOKEN=" "$ENV_FILE"; then
                # Update existing token
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "s/^MCP_SERVER_TOKEN=.*/MCP_SERVER_TOKEN=$NEW_TOKEN/" "$ENV_FILE"
                else
                    # Linux
                    sed -i "s/^MCP_SERVER_TOKEN=.*/MCP_SERVER_TOKEN=$NEW_TOKEN/" "$ENV_FILE"
                fi
            else
                # Add new token
                echo "MCP_SERVER_TOKEN=$NEW_TOKEN" >> "$ENV_FILE"
            fi
            echo "✅ Updated MCP_SERVER_TOKEN in .env"
        else
            echo "Skipping token generation. Please set MCP_SERVER_TOKEN manually in .env"
            exit 1
        fi
    fi
else
    # Create new .env file
    echo "Creating new .env file..."
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    
    # Generate secure token
    NEW_TOKEN=$(openssl rand -hex 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^MCP_SERVER_TOKEN=.*/MCP_SERVER_TOKEN=$NEW_TOKEN/" "$ENV_FILE"
    else
        # Linux
        sed -i "s/^MCP_SERVER_TOKEN=.*/MCP_SERVER_TOKEN=$NEW_TOKEN/" "$ENV_FILE"
    fi
    
    echo "✅ Created .env file with generated MCP_SERVER_TOKEN"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Review .env file and add any optional API keys"
    echo "   2. Run 'npm run dev' to start the server"
    echo ""
    echo "⚠️  Keep your .env file secure and never commit it to git!"
fi

echo ""
echo "✅ Environment setup complete!"




