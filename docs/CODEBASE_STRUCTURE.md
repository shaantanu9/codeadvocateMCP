# Codebase Structure

## Final Organization

The codebase has been organized into a clean, maintainable structure.

## Directory Structure

```
demo_mcp/
├── README.md                    # Main readme (keep in root)
├── ARCHITECTURE.md              # Architecture documentation (keep in root)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── .gitignore                   # Git ignore rules
│
├── src/                         # Source code
│   ├── index.ts                 # Entry point
│   ├── config/                  # Configuration
│   │   └── env.ts              # Environment configuration
│   ├── server/                  # HTTP server
│   │   ├── app.ts              # Express app setup
│   │   └── index.ts            # Server startup
│   ├── mcp/                     # MCP protocol
│   │   ├── server.ts           # MCP server factory
│   │   └── transport.ts         # Transport handler
│   ├── tools/                   # MCP tools
│   │   ├── ai-tools.ts         # AI tools
│   │   ├── auth-tools.ts       # Auth tools
│   │   └── external-api-tools.ts # External API tools
│   ├── services/                # Business logic services
│   │   ├── ai-service-factory.ts
│   │   ├── ai-service.interface.ts
│   │   ├── anthropic-service.ts
│   │   ├── external-api-service.ts
│   │   ├── openai-service.ts
│   │   └── token-verification-service.ts
│   ├── middleware/              # Express middleware
│   │   └── auth.ts             # Authentication middleware
│   ├── utils/                   # Utilities
│   │   ├── error-handler.ts
│   │   ├── request-context.ts
│   │   └── response-formatter.ts
│   ├── core/                    # Core functionality
│   │   ├── context.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   └── types.ts
│   ├── application/             # Application layer
│   │   └── services/
│   │       └── external-api.service.ts
│   ├── infrastructure/          # Infrastructure layer
│   │   └── http-client.ts
│   └── presentation/            # Presentation layer
│       └── middleware/
│           ├── auth.middleware.ts
│           └── context.middleware.ts
│
├── docs/                         # Documentation
│   ├── setup/                   # Setup and configuration guides
│   │   ├── ALL_MCP_TOOLS.md
│   │   ├── MCP_TOOLS_LIST.md
│   │   ├── MCP_CONFIG_GUIDE.md
│   │   ├── TOKEN_VERIFICATION_SETUP.md
│   │   └── ... (all setup docs)
│   └── api/                     # API documentation
│       └── MASTER_API_ENDPOINTS_GUIDE.md
│
├── tests/                        # Test files
│   ├── test-mcp.js              # Main MCP test
│   ├── test-list-tools.js        # Tools listing test
│   ├── test-mcp-with-auth.js    # Auth test
│   └── list-tools.js             # Tools lister
│
├── scripts/                      # Utility scripts
│   ├── setup-env.sh             # Environment setup
│   ├── organize-codebase.mjs    # Organization script
│   ├── final-organize.sh        # Final organization
│   └── ... (other utility scripts)
│
└── dist/                         # Compiled output
    ├── index.js
    └── index.d.ts
```

## File Organization Rules

### Root Directory
- **Keep:** `README.md`, `ARCHITECTURE.md`, `package.json`, `tsconfig.json`, `.gitignore`
- **Move:** All other `.md` files → `docs/setup/` or `docs/api/`
- **Move:** All `.js` test files → `tests/`
- **Move:** All `.sh` scripts → `scripts/`

### Documentation (`docs/`)
- **`docs/setup/`**: All setup, configuration, and guide documentation
- **`docs/api/`**: API endpoint documentation

### Tests (`tests/`)
- All test scripts (`.js` files that test the MCP server)

### Scripts (`scripts/`)
- All utility scripts (`.sh`, `.js`, `.mjs` files for setup, organization, etc.)

### Source Code (`src/`)
- Organized by layer and concern
- Clear separation between MCP, server, tools, services, middleware, utils

## Verification

After organization, verify:
- Only 2 `.md` files in root (README.md, ARCHITECTURE.md)
- No `.js` or `.sh` files in root
- All documentation in `docs/setup/` or `docs/api/`
- All tests in `tests/`
- All scripts in `scripts/`

