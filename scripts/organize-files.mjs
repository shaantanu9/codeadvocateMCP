#!/usr/bin/env node

import { mkdir, rename, access } from 'fs/promises';
import { constants } from 'fs';

const root = process.cwd();

// Create directories
await mkdir('docs/setup', { recursive: true });
await mkdir('docs/api', { recursive: true });
await mkdir('scripts', { recursive: true });

const keepInRoot = new Set(['README.md', 'ARCHITECTURE.md', 'REORGANIZATION_SUMMARY.md', 'ORGANIZE_FILES.md', 'FILE_ORGANIZATION.md']);

// Setup docs
const setupDocs = [
  'AI_INTEGRATION_PLAN.md',
  'AI_TOOLS_SETUP.md',
  'API_KEY_SETUP_GUIDE.md',
  'COMPLETE_API_KEY_SETUP.md',
  'COMPLETE_SETUP.md',
  'FIX_ENV.md',
  'IMPLEMENTATION_SUMMARY.md',
  'MCP_AUTHENTICATION_SETUP.md',
  'QUICK_START.md',
  'SECURE_MCP_SETUP.md',
  'SERVER_STATUS.md',
  'TOKEN_TESTING_GUIDE.md'
];

let moved = 0;

console.log('📁 Organizing files...\n');

// Move setup docs
for (const file of setupDocs) {
  try {
    await access(file, constants.F_OK);
    if (!keepInRoot.has(file)) {
      await rename(file, `docs/setup/${file}`);
      console.log(`  ✓ Moved ${file} → docs/setup/`);
      moved++;
    }
  } catch {
    // File doesn't exist, skip
  }
}

// Move API docs
try {
  await access('docs/MASTER_API_ENDPOINTS_GUIDE.md', constants.F_OK);
  await rename('docs/MASTER_API_ENDPOINTS_GUIDE.md', 'docs/api/MASTER_API_ENDPOINTS_GUIDE.md');
  console.log(`  ✓ Moved MASTER_API_ENDPOINTS_GUIDE.md → docs/api/`);
  moved++;
} catch {
  // File doesn't exist or already moved
}

// Move scripts
const scripts = [
  'create-env.sh',
  'generate-token.sh',
  'start-server.sh',
  'verify-server.sh',
  'test-simple.sh',
  'test-server.sh',
  'test-mcp.js'
];

for (const file of scripts) {
  try {
    await access(file, constants.F_OK);
    await rename(file, `scripts/${file}`);
    console.log(`  ✓ Moved ${file} → scripts/`);
    moved++;
  } catch {
    // File doesn't exist, skip
  }
}

console.log(`\n✅ File organization complete! Moved ${moved} files.\n`);
console.log('Root directory should now only contain:');
console.log('  - README.md');
console.log('  - ARCHITECTURE.md');
console.log('  - REORGANIZATION_SUMMARY.md\n');




