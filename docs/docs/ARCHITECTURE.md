# Architecture Documentation

## Project Structure

```
demo_mcp/
├── src/                          # Source code
│   ├── index.ts                  # Main entry point
│   ├── config/                   # Configuration
│   │   └── env.ts               # Environment configuration
│   ├── server/                   # HTTP server setup
│   │   ├── app.ts               # Express app configuration
│   │   └── index.ts             # Server startup and lifecycle
│   ├── mcp/                      # MCP protocol implementation
│   │   ├── server.ts            # MCP server factory
│   │   └── transport.ts         # Transport handler
│   ├── tools/                    # MCP tools
│   │   ├── ai-tools.ts          # AI-powered tools
│   │   ├── auth-tools.ts        # Authentication tools
│   │   └── external-api-tools.ts # External API tools
│   ├── services/                 # Business logic services
│   │   ├── ai-service-factory.ts
│   │   ├── ai-service.interface.ts
│   │   ├── anthropic-service.ts
│   │   ├── external-api-service.ts
│   │   └── openai-service.ts
│   ├── middleware/               # Express middleware
│   │   └── auth.ts               # Authentication middleware
│   └── utils/                     # Utility functions
│       ├── error-handler.ts
│       └── response-formatter.ts
├── docs/                          # Documentation
│   ├── setup/                    # Setup guides
│   └── api/                      # API documentation
├── scripts/                       # Utility scripts
│   ├── test-*.js                 # Test scripts
│   └── *.sh                      # Shell scripts
├── tests/                         # Test files
├── dist/                          # Compiled JavaScript
└── package.json                   # Dependencies and scripts
```

## Architecture Overview

### Layer Separation

1. **Entry Point (`src/index.ts`)**
   - Minimal entry point that starts the server
   - No business logic

2. **Server Layer (`src/server/`)**
   - Express application setup
   - Middleware configuration
   - Route definitions
   - Error handling
   - Server lifecycle management

3. **MCP Layer (`src/mcp/`)**
   - MCP server creation and configuration
   - Transport handling (Streamable HTTP)
   - Protocol-specific logic

4. **Tools Layer (`src/tools/`)**
   - MCP tool definitions
   - Tool registration
   - Tool-specific business logic

5. **Services Layer (`src/services/`)**
   - External API integrations
   - AI service implementations
   - Business logic abstraction

6. **Middleware Layer (`src/middleware/`)**
   - Request processing
   - Authentication
   - Authorization

7. **Utilities (`src/utils/`)**
   - Shared helper functions
   - Error handling utilities
   - Response formatting

## Key Design Decisions

### Stateless Architecture
- Each MCP request creates a new server and transport instance
- Prevents connection conflicts and request ID collisions
- Suitable for HTTP-based deployments

### Separation of Concerns
- Clear boundaries between layers
- Each module has a single responsibility
- Easy to test and maintain

### Configuration Management
- Centralized environment configuration
- Type-safe configuration access
- Easy to extend

## File Organization Principles

1. **Group by Feature**: Related functionality is grouped together
2. **Single Responsibility**: Each file has one clear purpose
3. **Dependency Direction**: Higher layers depend on lower layers
4. **Clear Naming**: File names clearly indicate their purpose

## Adding New Features

### Adding a New Tool
1. Create tool handler in `src/tools/`
2. Register tool in `src/mcp/server.ts`
3. Add tests in `tests/`

### Adding a New Service
1. Create service interface in `src/services/`
2. Implement service in `src/services/`
3. Use service in tools or middleware

### Adding Middleware
1. Create middleware in `src/middleware/`
2. Register in `src/server/app.ts`
3. Document usage

## Testing

- Unit tests: Test individual modules
- Integration tests: Test module interactions
- E2E tests: Test complete request flows

## Documentation

- Code comments: Explain complex logic
- Architecture docs: Explain design decisions
- API docs: Document endpoints and tools
- Setup guides: Help users get started

