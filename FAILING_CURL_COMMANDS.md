# Failing CURL Commands for API Developer

These are the exact curl commands that are failing. Please verify the API requirements and provide the correct field names/values.

## Base Configuration

```bash
# Base URL (update if different)
BASE_URL="http://localhost:5656/api"
REPO_ID="6c119199-0ac9-4055-a297-5bf044fdb64d"

# Authentication (update with actual token)
TOKEN="your-api-token-here"
```

---

## 1. Create Repository Rule - FAILING

**Error**: `Invalid rule_type. Allowed values: coding_standard, naming_convention, architecture, security, performance, testing, documentation, git_workflow, other`

**Current Request**:

````bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "React Hook Dependencies - useCallback Pattern",
    "rule_content": "**CRITICAL**: Always use `useCallback` for functions used in `useEffect` dependencies.\n\n**Rule**: When a function is used inside `useEffect` or passed as a dependency, wrap it with `useCallback`. Include all dependencies in the `useCallback` dependency array.\n\n**Examples**:\n- Functions like `calculateSEOScore`, `fetchOrders`, `validateFile` should be wrapped in `useCallback`\n- If a function must be recreated on each render but shouldn'\''t trigger `useEffect`, use `useCallback` with proper dependencies\n- For functions that are intentionally excluded (like `fetchPost` that depends on `postId`), use `eslint-disable-next-line react-hooks/exhaustive-deps` with a comment explaining why\n\n**Pattern**:\n```typescript\nconst myFunction = useCallback(() => {\n  // function logic\n}, [dependency1, dependency2]);\n```\n\n**Violation**: Functions in `useEffect` dependencies without `useCallback` will cause linting errors and potential infinite loops.",
    "rule_type": "code-quality",
    "severity": "error"
  }'
````

**Questions for API Developer**:

1. Should `rule_type: "code-quality"` be mapped to one of the allowed values? If so, which one?
2. Should we add a mapping function to convert user-friendly types to API types?
3. What should be the default `rule_type` if not provided?

---

## 2. Create Repository PR Rule - FAILING

**Error**: `Invalid rule_type. Allowed values: review_checklist, approval_requirement, merge_condition, automated_check, comment_template, other`

**Current Request**:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "PR Checklist - Code Quality",
    "rule_content": "**REQUIRED**: All PRs must pass these checks before merge.\n\n**Checklist**:\n- [ ] Code is formatted with Prettier (`npm run format:check` passes)\n- [ ] ESLint passes (`npm run lint` passes)\n- [ ] All TypeScript errors are resolved\n- [ ] No `console.log` statements (use `console.error` for errors only)\n- [ ] All functions used in `useEffect` dependencies are wrapped in `useCallback`\n- [ ] JSX entities are properly escaped (`&apos;`, `&quot;`)\n- [ ] Next.js `Image` component is used instead of `<img>` tags\n- [ ] Server Components are used by default (no unnecessary `\"use client\"`)\n- [ ] API routes have proper error handling and authentication checks\n- [ ] Database migrations are idempotent and include proper indexes\n\n**Review Focus**:\n- Code follows project patterns and conventions\n- No security vulnerabilities (authentication, authorization)\n- Performance optimizations (Server Components, image optimization)\n- Proper error handling\n\n**Violation**: PRs that don'\''t meet these standards will be requested for changes.",
    "rule_type": "code-quality",
    "severity": "error"
  }'
```

**Questions for API Developer**:

1. Should `rule_type: "code-quality"` be mapped to `review_checklist`?
2. Should `rule_type: "testing"` be mapped to `review_checklist`?
3. Should `rule_type: "documentation"` be mapped to `comment_template`?
4. What should be the default `rule_type` if not provided?

---

## 3. Create Repository Prompt - FAILING

**Error**: `title and prompt_text are required`

**Current Request**:

````bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Create New API Route",
    "prompt_content": "Create a new API route following the project'\''s standard patterns:\n\n1. **File Location**: Place in `app/api/[route-name]/route.ts`\n\n2. **Standard Structure**:\n```typescript\nimport { NextRequest, NextResponse } from \"next/server\"\nimport { getServerSession } from \"next-auth\"\nimport { authOptions } from \"@/lib/auth-options\"\nimport { supabaseAdmin } from \"@/lib/supabase/server\"\n\nexport async function GET(request: NextRequest) {\n  try {\n    // 1. Authentication check\n    const session = await getServerSession(authOptions)\n    if (!session?.user) {\n      return NextResponse.json({ error: \"Unauthorized\" }, { status: 401 })\n    }\n\n    // 2. Admin-only check (if needed)\n    if (session.user.role !== \"admin\") {\n      return NextResponse.json({ error: \"Forbidden\" }, { status: 403 })\n    }\n\n    // 3. Business logic\n    const { data, error } = await supabaseAdmin.from(\"table\").select(\"*\")\n\n    if (error) {\n      return NextResponse.json({ error: error.message }, { status: 500 })\n    }\n\n    return NextResponse.json({ data })\n  } catch (error) {\n    console.error(\"Error in GET /api/route:\", error)\n    return NextResponse.json({ error: \"Internal server error\" }, { status: 500 })\n  }\n}\n```\n\n3. **Key Requirements**:\n   - Always use try-catch blocks\n   - Check authentication first\n   - Use `supabaseAdmin` for API routes\n   - Return consistent error responses\n   - Log errors with `console.error`\n   - Use appropriate HTTP status codes\n\n4. **For Dynamic Routes**: Use `{ params }: { params: { id: string } }` pattern",
    "prompt_type": "development",
    "category": "api"
  }'
````

**Questions for API Developer**:

1. The API expects `prompt_text` but we're sending `prompt_content`. Should we change our field name?
2. Are `prompt_type` and `category` optional or required?
3. What are the allowed values for `prompt_type` and `category`?

---

## Summary of Issues

1. **Repository Rules**: `rule_type` values need to be validated/mapped to allowed enum values
2. **PR Rules**: `rule_type` values need to be validated/mapped to allowed enum values
3. **Prompts**: Field name mismatch - API expects `prompt_text` but tool sends `prompt_content`

## Fixed in Code

✅ Changed `prompt_content` → `prompt_text` in create-repository-prompt.tool.ts
✅ Added enum validation for `rule_type` in create-repository-rule.tool.ts
✅ Added enum validation for `rule_type` in create-repository-pr-rule.tool.ts

## Still Need from API Developer

1. Confirmation that `prompt_text` is the correct field name
2. Mapping strategy for user-friendly `rule_type` values to API enum values
3. Default values when `rule_type` is not provided
4. Allowed values for `prompt_type` and `category` fields


