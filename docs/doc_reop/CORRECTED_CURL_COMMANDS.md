# Corrected CURL Commands for MCP Developer

This document provides **corrected** curl commands that work with the API, along with explanations of what was wrong and how to fix it.

## Base Configuration

```bash
# Base URL (update if different)
BASE_URL="http://localhost:5656/api"
REPO_ID="6c119199-0ac9-4055-a297-5bf044fdb64d"

# Authentication (update with actual token or API key)
TOKEN="your-api-token-here"
API_KEY="your-api-key-here"  # Alternative: Use X-API-Key header
```

---

## Issue Summary

### ❌ Problems Found:

1. **Repository Rules**: `rule_type: "code-quality"` is invalid. Must use one of the allowed enum values.
2. **PR Rules**: `rule_type: "code-quality"` is invalid. Must use one of the allowed enum values.
3. **Prompts**: Field name `prompt_content` is wrong. API expects `prompt_text`.

### ✅ Solutions:

1. Map `code-quality` → `coding_standard` (for repository rules) or `review_checklist` (for PR rules)
2. Change `prompt_content` → `prompt_text` for prompts
3. Use correct enum values as documented below

---

## 1. Create Repository Rule - CORRECTED ✅

### ❌ Original (Failing) Request:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "React Hook Dependencies - useCallback Pattern",
    "rule_content": "...",
    "rule_type": "code-quality",  # ❌ INVALID
    "severity": "error"
  }'
```

**Error**: `Invalid rule_type. Allowed values: coding_standard, naming_convention, architecture, security, performance, testing, documentation, git_workflow, other`

### ✅ Corrected Request:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "React Hook Dependencies - useCallback Pattern",
    "rule_content": "**CRITICAL**: Always use `useCallback` for functions used in `useEffect` dependencies.\n\n**Rule**: When a function is used inside `useEffect` or passed as a dependency, wrap it with `useCallback`. Include all dependencies in the `useCallback` dependency array.\n\n**Examples**:\n- Functions like `calculateSEOScore`, `fetchOrders`, `validateFile` should be wrapped in `useCallback`\n- If a function must be recreated on each render but shouldn'\''t trigger `useEffect`, use `useCallback` with proper dependencies\n- For functions that are intentionally excluded (like `fetchPost` that depends on `postId`), use `eslint-disable-next-line react-hooks/exhaustive-deps` with a comment explaining why\n\n**Pattern**:\n```typescript\nconst myFunction = useCallback(() => {\n  // function logic\n}, [dependency1, dependency2]);\n```\n\n**Violation**: Functions in `useEffect` dependencies without `useCallback` will cause linting errors and potential infinite loops.",
    "rule_type": "coding_standard",
    "severity": "error"
  }'
```

**Key Changes:**
- ✅ Changed `rule_type` from `"code-quality"` to `"coding_standard"`

**Allowed `rule_type` Values for Repository Rules:**
- `coding_standard` ✅ (Use this for code quality rules)
- `naming_convention`
- `architecture`
- `security`
- `performance`
- `testing`
- `documentation`
- `git_workflow`
- `other` (default if not provided)

**Allowed `severity` Values:**
- `info`
- `warning`
- `error`
- `critical`

---

## 2. Create Repository PR Rule - CORRECTED ✅

### ❌ Original (Failing) Request:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "PR Checklist - Code Quality",
    "rule_content": "...",
    "rule_type": "code-quality",  # ❌ INVALID
    "severity": "error"
  }'
```

**Error**: `Invalid rule_type. Allowed values: review_checklist, approval_requirement, merge_condition, automated_check, comment_template, other`

### ✅ Corrected Request:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "PR Checklist - Code Quality",
    "rule_content": "**REQUIRED**: All PRs must pass these checks before merge.\n\n**Checklist**:\n- [ ] Code is formatted with Prettier (`npm run format:check` passes)\n- [ ] ESLint passes (`npm run lint` passes)\n- [ ] All TypeScript errors are resolved\n- [ ] No `console.log` statements (use `console.error` for errors only)\n- [ ] All functions used in `useEffect` dependencies are wrapped in `useCallback`\n- [ ] JSX entities are properly escaped (`&apos;`, `&quot;`)\n- [ ] Next.js `Image` component is used instead of `<img>` tags\n- [ ] Server Components are used by default (no unnecessary `\"use client\"`)\n- [ ] API routes have proper error handling and authentication checks\n- [ ] Database migrations are idempotent and include proper indexes\n\n**Review Focus**:\n- Code follows project patterns and conventions\n- No security vulnerabilities (authentication, authorization)\n- Performance optimizations (Server Components, image optimization)\n- Proper error handling\n\n**Violation**: PRs that don'\''t meet these standards will be requested for changes.",
    "rule_type": "review_checklist",
    "priority": "high"
  }'
```

**Key Changes:**
- ✅ Changed `rule_type` from `"code-quality"` to `"review_checklist"`
- ✅ Changed `severity` to `priority` (PR rules use `priority`, not `severity`)

**Allowed `rule_type` Values for PR Rules:**
- `review_checklist` ✅ (Use this for code quality checklists)
- `approval_requirement`
- `merge_condition`
- `automated_check`
- `comment_template`
- `other` (default if not provided)

**Allowed `priority` Values (PR Rules use `priority`, not `severity`):**
- `low`
- `medium`
- `high`
- `critical`

---

## 3. Create Repository Prompt - CORRECTED ✅

### ❌ Original (Failing) Request:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Create New API Route",
    "prompt_content": "...",  # ❌ WRONG FIELD NAME
    "prompt_type": "development",
    "category": "api"
  }'
```

**Error**: `title and prompt_text are required`

### ✅ Corrected Request:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Create New API Route",
    "prompt_text": "Create a new API route following the project'\''s standard patterns:\n\n1. **File Location**: Place in `app/api/[route-name]/route.ts`\n\n2. **Standard Structure**:\n```typescript\nimport { NextRequest, NextResponse } from \"next/server\"\nimport { getServerSession } from \"next-auth\"\nimport { authOptions } from \"@/lib/auth-options\"\nimport { supabaseAdmin } from \"@/lib/supabase/server\"\n\nexport async function GET(request: NextRequest) {\n  try {\n    // 1. Authentication check\n    const session = await getServerSession(authOptions)\n    if (!session?.user) {\n      return NextResponse.json({ error: \"Unauthorized\" }, { status: 401 })\n    }\n\n    // 2. Admin-only check (if needed)\n    if (session.user.role !== \"admin\") {\n      return NextResponse.json({ error: \"Forbidden\" }, { status: 403 })\n    }\n\n    // 3. Business logic\n    const { data, error } = await supabaseAdmin.from(\"table\").select(\"*\")\n\n    if (error) {\n      return NextResponse.json({ error: error.message }, { status: 500 })\n    }\n\n    return NextResponse.json({ data })\n  } catch (error) {\n    console.error(\"Error in GET /api/route:\", error)\n    return NextResponse.json({ error: \"Internal server error\" }, { status: 500 })\n  }\n}\n```\n\n3. **Key Requirements**:\n   - Always use try-catch blocks\n   - Check authentication first\n   - Use `supabaseAdmin` for API routes\n   - Return consistent error responses\n   - Log errors with `console.error`\n   - Use appropriate HTTP status codes\n\n4. **For Dynamic Routes**: Use `{ params }: { params: { id: string } }` pattern",
    "prompt_type": "code_generation",
    "category": "api"
  }'
```

**Key Changes:**
- ✅ Changed `prompt_content` to `prompt_text`
- ✅ Changed `prompt_type` from `"development"` to `"code_generation"` (more appropriate for this use case)

**Allowed `prompt_type` Values:**
- `code_generation` ✅ (Use this for creating new code)
- `code_review`
- `documentation`
- `refactoring`
- `testing`
- `debugging`
- `explanation`
- `other` (default if not provided)

**Note:** `category` is optional and can be any string value (e.g., `"api"`, `"frontend"`, `"backend"`).

---

## Field Mapping Guide for MCP Developer

### Repository Rules

| User-Friendly Value | API Enum Value | When to Use |
|---------------------|----------------|-------------|
| `code-quality` | `coding_standard` | Code quality, best practices |
| `testing` | `testing` | Testing requirements |
| `documentation` | `documentation` | Documentation requirements |
| `security` | `security` | Security rules |
| `performance` | `performance` | Performance rules |
| `architecture` | `architecture` | Architecture patterns |
| `naming` | `naming_convention` | Naming conventions |
| `git` | `git_workflow` | Git workflow rules |
| `other` | `other` | Default/fallback |

### PR Rules

| User-Friendly Value | API Enum Value | When to Use |
|---------------------|----------------|-------------|
| `code-quality` | `review_checklist` | Code quality checklists |
| `testing` | `review_checklist` | Testing checklists |
| `documentation` | `comment_template` | Documentation templates |
| `approval` | `approval_requirement` | Approval requirements |
| `merge` | `merge_condition` | Merge conditions |
| `automated` | `automated_check` | Automated checks |
| `other` | `other` | Default/fallback |

### Prompts

| User-Friendly Value | API Enum Value | When to Use |
|---------------------|----------------|-------------|
| `development` | `code_generation` | Creating new code |
| `review` | `code_review` | Code review prompts |
| `documentation` | `documentation` | Documentation prompts |
| `refactor` | `refactoring` | Refactoring prompts |
| `test` | `testing` | Testing prompts |
| `debug` | `debugging` | Debugging prompts |
| `explain` | `explanation` | Explanation prompts |
| `other` | `other` | Default/fallback |

---

## Complete Working Examples

### Example 1: Create Repository Rule with API Key

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "title": "TypeScript Strict Mode",
    "rule_content": "Always use TypeScript strict mode. Enable all strict checks in tsconfig.json.",
    "rule_type": "coding_standard",
    "severity": "error"
  }'
```

### Example 2: Create PR Rule with Bearer Token

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Required Tests",
    "rule_content": "All PRs must include unit tests for new features.",
    "rule_type": "review_checklist",
    "priority": "high"
  }'
```

### Example 3: Create Prompt with All Fields

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Generate React Component",
    "description": "Template for creating React components",
    "prompt_text": "Create a React component with TypeScript, following these patterns:\n1. Use functional components\n2. Include PropTypes or TypeScript interfaces\n3. Follow naming conventions",
    "prompt_type": "code_generation",
    "category": "frontend",
    "tags": ["react", "typescript", "component"],
    "variables": {
      "componentName": "string",
      "props": "object"
    }
  }'
```

---

## Testing the Corrected Commands

### Quick Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:5656/api"
REPO_ID="your-repo-id-here"
TOKEN="your-token-here"

# Test 1: Create Repository Rule
echo "Testing Repository Rule..."
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Test Rule",
    "rule_content": "Test content",
    "rule_type": "coding_standard",
    "severity": "error"
  }' | jq

# Test 2: Create PR Rule
echo "Testing PR Rule..."
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Test PR Rule",
    "rule_content": "Test content",
    "rule_type": "review_checklist",
    "priority": "high"
  }' | jq

# Test 3: Create Prompt
echo "Testing Prompt..."
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Test Prompt",
    "prompt_text": "Test prompt text",
    "prompt_type": "code_generation",
    "category": "test"
  }' | jq
```

---

## Summary for MCP Developer

### Required Changes in MCP Tools:

1. **Repository Rules Tool**:
   - Map `code-quality` → `coding_standard`
   - Validate `rule_type` against allowed enum values
   - Use `severity` (not `priority`)

2. **PR Rules Tool**:
   - Map `code-quality` → `review_checklist`
   - Validate `rule_type` against allowed enum values
   - Use `priority` (not `severity`)

3. **Prompts Tool**:
   - Change field name from `prompt_content` to `prompt_text`
   - Map `development` → `code_generation` (or use appropriate enum)
   - Validate `prompt_type` against allowed enum values

### Default Values:

- `rule_type`: Defaults to `"other"` if not provided
- `prompt_type`: Defaults to `"other"` if not provided
- `severity`: Defaults to `"warning"` if not provided
- `priority`: No default (optional field)

### Authentication:

Both methods are supported:
- `Authorization: Bearer <token>`
- `X-API-Key: <api-key>`

---

## API Reference Links

- Repository Rules: `/api/repositories/{id}/rules`
- PR Rules: `/api/repositories/{id}/pr-rules`
- Prompts: `/api/repositories/{id}/prompts`

For complete API documentation, see:
- `docs/REPOSITORY_CONTENT_ENDPOINTS.md`
- `docs/API_FIXES_VERIFICATION.md`

