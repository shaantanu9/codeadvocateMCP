# File Organization Instructions

## Current Issue

Files are in incorrect locations:
- `docs/docs/` - Should be in `docs/setup/`
- `docs/sh-files/` - Should be in `scripts/`
- Some files still in root that should be moved

## Quick Fix Command

Run this single command from the project root:

```bash
# Create directories
mkdir -p docs/setup docs/api scripts

# Move from docs/docs/ to docs/setup/ (except ARCHITECTURE and REORGANIZATION)
mv docs/docs/AI_INTEGRATION_PLAN.md docs/docs/AI_TOOLS_SETUP.md \
   docs/docs/API_KEY_SETUP_GUIDE.md docs/docs/COMPLETE_API_KEY_SETUP.md \
   docs/docs/COMPLETE_SETUP.md docs/docs/FIX_ENV.md \
   docs/docs/IMPLEMENTATION_SUMMARY.md docs/docs/MCP_AUTHENTICATION_SETUP.md \
   docs/docs/QUICK_START.md docs/docs/SECURE_MCP_SETUP.md \
   docs/docs/TOKEN_TESTING_GUIDE.md docs/docs/FILE_ORGANIZATION.md \
   docs/docs/ORGANIZE_FILES.md docs/setup/

# Move ARCHITECTURE and REORGANIZATION to root
mv docs/docs/ARCHITECTURE.md docs/docs/REORGANIZATION_SUMMARY.md .

# Remove empty docs/docs directory
rmdir docs/docs

# Move API doc
mv docs/MASTER_API_ENDPOINTS_GUIDE.md docs/api/

# Move SERVER_STATUS.md
mv SERVER_STATUS.md docs/setup/

# Move scripts from docs/sh-files/ to scripts/
mv docs/sh-files/*.sh scripts/

# Remove empty sh-files directory
rmdir docs/sh-files

# Move test-mcp.js
mv test-mcp.js scripts/

echo "✅ All files organized!"
```

## Or Use the Fix Script

```bash
bash scripts/fix-organization.sh
```

## Expected Final Structure

```
demo_mcp/
├── README.md                    # ✓ Keep in root
├── ARCHITECTURE.md              # ✓ Keep in root  
├── REORGANIZATION_SUMMARY.md    # ✓ Keep in root
├── docs/
│   ├── setup/                   # All setup guides (12+ files)
│   └── api/                     # API documentation
│       └── MASTER_API_ENDPOINTS_GUIDE.md
├── scripts/                     # All scripts (7+ files)
└── src/                         # Source code
```

## Verification

After running the commands, verify:

```bash
# Should show only 3 files
ls -1 *.md

# Should show 12+ files
ls -1 docs/setup/*.md | wc -l

# Should show 7+ files
ls -1 scripts/*.{sh,js} | wc -l
```

