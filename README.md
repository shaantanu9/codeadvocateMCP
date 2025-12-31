# Demo MCP Server

A Model Context Protocol (MCP) server implementation with Streamable HTTP transport, providing AI model information and various AI-powered tools.

## 🏗️ Architecture

This project follows a clean, layered architecture:

- **Entry Point**: `src/index.ts` - Minimal startup code
- **Server Layer**: `src/server/` - Express app setup and configuration
- **MCP Layer**: `src/mcp/` - MCP protocol implementation
- **Tools Layer**: `src/tools/` - MCP tool definitions
- **Services Layer**: `src/services/` - Business logic and external integrations
- **Middleware**: `src/middleware/` - Request processing middleware
- **Config**: `src/config/` - Configuration management
- **Utils**: `src/utils/` - Shared utilities

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🚀 Quick Start

### Prerequisites

- Node.js v18.x or higher
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

The server will automatically generate a development token if `MCP_SERVER_TOKEN` is not set. For production, create a `.env` file:

```bash
# Option 1: Use the setup script (recommended)
bash scripts/setup-env.sh

# Option 2: Manual setup
cp .env.example .env
# Edit .env and set MCP_SERVER_TOKEN (generate with: openssl rand -hex 32)
```

**Environment Variables (All Optional):**
- `MCP_SERVER_TOKEN` - Authentication token (optional - authentication is disabled by default)
- `OPENAI_API_KEY` - For OpenAI AI tools
- `ANTHROPIC_API_KEY` - For Anthropic AI tools
- `EXTERNAL_API_KEY` - For external API tools
- `PORT` - Server port (default: 3111)

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3111/mcp`

## 📁 Project Structure

```
demo_mcp/
├── src/                    # Source code
│   ├── index.ts           # Entry point
│   ├── server/            # HTTP server setup
│   ├── mcp/               # MCP protocol
│   ├── tools/             # MCP tools
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration
│   └── utils/             # Utilities
├── docs/                  # Documentation
│   ├── setup/            # Setup guides
│   └── api/              # API docs
├── scripts/               # Utility scripts
├── tests/                 # Test files
└── dist/                  # Compiled output
```

## 🔧 Available Tools

### Core Tools
- `getAIModelInfo` - Get detailed information about AI models
- `listAIModels` - List all available AI models

### AI Tools
- AI-powered text generation
- Text analysis
- Code generation

### External API Tools
- Integration with external APIs

### Auth Tools
- Authentication testing tools

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [Setup Guides](./docs/setup/)
- [API Documentation](./docs/api/)

## 🧪 Testing

Run tests:
```bash
npm test
```

Test the server manually:
```bash
./scripts/test-simple.sh
```

## 🔒 Security

- Optional authentication (disabled by default)
- Environment-based configuration
- Secure API key management

## 📝 License

ISC

## 🤝 Contributing

1. Follow the architecture patterns
2. Add tests for new features
3. Update documentation
4. Follow TypeScript best practices
