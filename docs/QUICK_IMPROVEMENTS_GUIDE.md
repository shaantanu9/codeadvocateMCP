# 🚀 Quick Improvements Guide

## Immediate Actions (Do First)

### 1. Replace console.* with Logger (5 minutes)

**Script to find all instances:**
```bash
grep -r "console\." src/ --include="*.ts" | wc -l
```

**Manual replacements needed in:**
- `src/services/token-verification-service.ts` (6 instances)
- `src/core/session-manager.ts` (6 instances)
- `src/services/anthropic-service.ts` (2 instances)
- `src/services/openai-service.ts` (2 instances)
- `src/tools/tool-registry.ts` (1 instance)
- And 9 more files...

**Quick fix script:**
```bash
# Create: scripts/fix-console-logs.sh
#!/bin/bash
find src -name "*.ts" -type f | while read file; do
  # Add logger import if not present
  if ! grep -q "from.*logger" "$file"; then
    # Find first import line
    first_import=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)
    if [ -n "$first_import" ]; then
      sed -i '' "${first_import}a\\
import { logger } from \"../core/logger.js\";\\
" "$file"
    fi
  fi
  
  # Replace console.log with logger.info
  sed -i '' 's/console\.log(/logger.info(/g' "$file"
  sed -i '' 's/console\.error(/logger.error(/g' "$file"
  sed -i '' 's/console\.warn(/logger.warn(/g' "$file"
done
```

### 2. Consolidate Middleware (10 minutes)

**Action:**
```bash
# Remove duplicate
rm src/middleware/auth.ts

# Update imports in server/app.ts
# Change: import { mcpAuthMiddleware } from "../middleware/auth.js";
# To: import { authMiddleware } from "../presentation/middleware/auth.middleware.js";
```

### 3. Add Configuration Validation (15 minutes)

**Create:** `src/config/env.schema.ts`
```typescript
import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(65535)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MCP_SERVER_TOKEN: z.string().optional(),
  EXTERNAL_API_BASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;
```

**Update:** `src/config/env.ts`
```typescript
import { envSchema, type ValidatedEnv } from "./env.schema.js";

export function loadEnvConfig(): ValidatedEnv {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment configuration:");
      error.errors.forEach(err => {
        const path = err.path.join(".");
        console.error(`  - ${path}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}
```

### 4. Fix TypeScript Strict Mode (20 minutes)

**Update:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Then run:**
```bash
npm run build
# Fix all type errors that appear
```

### 5. Add ESLint and Prettier (15 minutes)

**Install:**
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier
```

**Create:** `.eslintrc.json`
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

**Create:** `.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Add to package.json:**
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

---

## Medium Priority (This Week)

### 6. Break Down Large Tool File

**Current:** `analyze-and-save-repo.tool.ts` (3780 lines!)

**Action Plan:**
1. Extract analyzers (lines 200-800) → `analyzers/code-analyzer.ts`
2. Extract processors (lines 800-1500) → `processors/file-processor.ts`
3. Extract API calls (lines 1500-2000) → `processors/api-processor.ts`
4. Keep main tool as orchestrator (~500 lines)

**Structure:**
```
src/tools/repository-analysis/
├── analyze-and-save-repo.tool.ts    # Main (orchestrator)
├── analyzers/
│   ├── code-analyzer.ts
│   ├── structure-analyzer.ts
│   └── dependency-analyzer.ts
├── processors/
│   ├── file-processor.ts
│   └── api-processor.ts
└── types.ts
```

### 7. Add Rate Limiting

**Create:** `src/middleware/rate-limit.middleware.ts`
```typescript
import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger.js";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const identifier = req.ip || "unknown";
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (record.count >= MAX_REQUESTS) {
    logger.warn("Rate limit exceeded", { ip: identifier });
    res.status(429).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Rate limit exceeded" },
      id: req.body?.id || null,
    });
    return;
  }

  record.count++;
  next();
}
```

**Add to:** `src/server/app.ts`
```typescript
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware.js";

app.use("/mcp", rateLimitMiddleware);
```

---

## Testing Improvements

### 8. Add Unit Test Structure

**Create:** `tests/unit/tools/snippets/create-snippet.test.ts`
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createSnippetTool } from "../../../../src/tools/snippets/create-snippet.tool.js";

describe("createSnippetTool", () => {
  it("should create a snippet with valid data", async () => {
    const result = await createSnippetTool.execute({
      title: "Test",
      code: "console.log('test');",
      language: "javascript",
    });

    expect(result.success).toBe(true);
  });
});
```

**Install:**
```bash
npm install -D vitest @vitest/ui
```

**Add to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## Quick Wins Summary

| Task | Time | Impact | Priority |
|------|------|--------|----------|
| Replace console.* | 5 min | High | 🔴 Critical |
| Consolidate middleware | 10 min | Medium | 🔴 Critical |
| Config validation | 15 min | High | 🟡 High |
| TypeScript strict | 20 min | High | 🟡 High |
| ESLint/Prettier | 15 min | Medium | 🟡 High |
| Break down large file | 2 hours | Very High | 🟢 Medium |
| Rate limiting | 30 min | Medium | 🟢 Medium |
| Unit tests | 1 hour | High | 🟢 Medium |

**Total time for critical items: ~1 hour**
**Total time for all quick wins: ~4 hours**

---

## Next Steps

1. ✅ Run the console.* replacement script
2. ✅ Consolidate middleware
3. ✅ Add config validation
4. ✅ Enable TypeScript strict mode
5. ✅ Set up linting
6. 📋 Plan the large file refactoring
7. 📋 Implement rate limiting
8. 📋 Add basic tests

See `CODEBASE_IMPROVEMENTS.md` for detailed implementation guides.



