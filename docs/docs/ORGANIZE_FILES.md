# File Organization Guide

## Current Status

Files need to be organized into proper folders. Here's what needs to be done:

## Quick Organization Command

Run this command from the project root:

```bash
# Create directories
mkdir -p docs/setup docs/api scripts

# Move setup documentation
mv AI_INTEGRATION_PLAN.md AI_TOOLS_SETUP.md API_KEY_SETUP_GUIDE.md \
   COMPLETE_API_KEY_SETUP.md COMPLETE_SETUP.md FIX_ENV.md \
   IMPLEMENTATION_SUMMARY.md MCP_AUTHENTICATION_SETUP.md QUICK_START.md \
   SECURE_MCP_SETUP.md SERVER_STATUS.md TOKEN_TESTING_GUIDE.md \
   docs/setup/

# Move API documentation  
mv docs/MASTER_API_ENDPOINTS_GUIDE.md docs/api/

# Move scripts
mv create-env.sh generate-token.sh start-server.sh verify-server.sh \
   test-simple.sh test-server.sh test-mcp.js scripts/
```

## Expected Final Structure

```
demo_mcp/
├── README.md                    # Main readme (keep in root)
├── ARCHITECTURE.md              # Architecture docs (keep in root)
├── REORGANIZATION_SUMMARY.md   # Reorganization summary (keep in root)
├── docs/
│   ├── setup/                  # All setup/configuration guides
│   │   ├── AI_INTEGRATION_PLAN.md
│   │   ├── AI_TOOLS_SETUP.md
│   │   ├── API_KEY_SETUP_GUIDE.md
│   │   ├── COMPLETE_API_KEY_SETUP.md
│   │   ├── COMPLETE_SETUP.md
│   │   ├── FIX_ENV.md
│   │   ├── IMPLEMENTATION_SUMMARY.md
│   │   ├── MCP_AUTHENTICATION_SETUP.md
│   │   ├── QUICK_START.md
│   │   ├── SECURE_MCP_SETUP.md
│   │   ├── SERVER_STATUS.md
│   │   └── TOKEN_TESTING_GUIDE.md
│   └── api/                    # API documentation
│       └── MASTER_API_ENDPOINTS_GUIDE.md
├── scripts/                     # All utility scripts
│   ├── create-env.sh
│   ├── generate-token.sh
│   ├── start-server.sh
│   ├── verify-server.sh
│   ├── test-simple.sh
│   ├── test-server.sh
│   ├── test-mcp.js
│   └── organize-files.sh
└── src/                        # Source code (already organized)
```

## Verification

After moving files, verify with:

```bash
# Check root - should only have 3 .md files
ls -1 *.md

# Check docs/setup - should have 12 files
ls -1 docs/setup/ | wc -l

# Check scripts - should have 7+ files
ls -1 scripts/ | wc -l
```

