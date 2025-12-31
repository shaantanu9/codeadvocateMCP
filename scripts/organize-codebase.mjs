#!/usr/bin/env node

/**
 * Organize codebase - move files to proper folders
 */

import { mkdir, rename, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();

// Create directories
await mkdir('docs/setup', { recursive: true });
await mkdir('docs/api', { recursive: true });
await mkdir('scripts', { recursive: true });
await mkdir('tests', { recursive: true });

const keepInRoot = new Set(['README.md', 'ARCHITECTURE.md']);

let moved = 0;

// Move setup documentation from root
const setupDocs = [
  'ALL_MCP_TOOLS.md', 'MCP_TOOLS_LIST.md', 'MCP_CONFIG_GUIDE.md',
  'MCP_CONFIGURATION_GUIDE.md', 'TOKEN_VERIFICATION_SETUP.md',
  'FINAL_ORGANIZATION.md', 'ORGANIZE_FILES.md', 'FILE_ORGANIZATION.md',
  'MOVE_FILES_INSTRUCTIONS.md', 'FIX_ENV.md', 'SERVER_STATUS.md',
  'REFACTORING_SUMMARY.md'
];

for (const file of setupDocs) {
  if (existsSync(file) && !keepInRoot.has(file)) {
    try {
      await rename(file, `docs/setup/${file}`);
      console.log(`✓ Moved ${file} → docs/setup/`);
      moved++;
    } catch (err) {
      console.error(`✗ Failed to move ${file}:`, err.message);
    }
  }
}

// Move test files
const testFiles = ['test-mcp.js', 'test-list-tools.js', 'test-mcp-with-auth.js', 'list-tools.js'];
for (const file of testFiles) {
  if (existsSync(file)) {
    try {
      await rename(file, `tests/${file}`);
      console.log(`✓ Moved ${file} → tests/`);
      moved++;
    } catch (err) {
      console.error(`✗ Failed to move ${file}:`, err.message);
    }
  }
}

// Move scripts from docs/sh-files/
if (existsSync('docs/sh-files')) {
  const files = await readdir('docs/sh-files');
  for (const file of files) {
    const src = join('docs/sh-files', file);
    const stats = await stat(src);
    if (stats.isFile()) {
      try {
        await rename(src, `scripts/${file}`);
        console.log(`✓ Moved ${file} → scripts/`);
        moved++;
      } catch (err) {
        console.error(`✗ Failed to move ${file}:`, err.message);
      }
    }
  }
  try {
    await rename('docs/sh-files', 'docs/.sh-files-backup');
    console.log('✓ Moved docs/sh-files/ to backup');
  } catch (err) {
    // Ignore if can't remove
  }
}

// Move create-env.sh from root
if (existsSync('create-env.sh')) {
  try {
    await rename('create-env.sh', 'scripts/create-env.sh');
    console.log('✓ Moved create-env.sh → scripts/');
    moved++;
  } catch (err) {
    console.error('✗ Failed to move create-env.sh:', err.message);
  }
}

// Move files from docs/docs/ to docs/setup/
if (existsSync('docs/docs')) {
  const files = await readdir('docs/docs');
  for (const file of files) {
    if (file.endsWith('.md')) {
      const src = join('docs/docs', file);
      // Skip ARCHITECTURE.md if duplicate
      if (file === 'ARCHITECTURE.md' && existsSync('ARCHITECTURE.md')) {
        try {
          await rename(src, join('docs/docs', `${file}.backup`));
          console.log(`✓ Removed duplicate ${file}`);
        } catch (err) {
          // Ignore
        }
      } else if (!keepInRoot.has(file)) {
        try {
          await rename(src, `docs/setup/${file}`);
          console.log(`✓ Moved ${file} → docs/setup/`);
          moved++;
        } catch (err) {
          console.error(`✗ Failed to move ${file}:`, err.message);
        }
      }
    }
  }
}

// Move API docs
if (existsSync('docs/MASTER_API_ENDPOINTS_GUIDE.md')) {
  try {
    await rename('docs/MASTER_API_ENDPOINTS_GUIDE.md', 'docs/api/MASTER_API_ENDPOINTS_GUIDE.md');
    console.log('✓ Moved MASTER_API_ENDPOINTS_GUIDE.md → docs/api/');
    moved++;
  } catch (err) {
    console.error('✗ Failed to move API guide:', err.message);
  }
}

console.log(`\n✅ Total files moved: ${moved}`);




