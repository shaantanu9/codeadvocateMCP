# CURL Commands for API Developer

These are the exact curl commands that are currently failing. Please verify the API requirements.

## Base Configuration

```bash
# Update these with your actual values
BASE_URL="http://localhost:5656/api"
REPO_ID="6c119199-0ac9-4055-a297-5bf044fdb64d"
TOKEN="your-api-token-here"  # Replace with actual MCP_SERVER_TOKEN or API key
```

---

## Issue 1: Create Repository Rule - Invalid rule_type

**Error Message**:

```
Invalid rule_type. Allowed values: coding_standard, naming_convention, architecture, security, performance, testing, documentation, git_workflow, other
```

**Failing Request**:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "React Hook Dependencies - useCallback Pattern",
    "rule_content": "**CRITICAL**: Always use `useCallback` for functions used in `useEffect` dependencies.",
    "rule_type": "code-quality",
    "severity": "error"
  }'
```

**Question**: Should `"code-quality"` be mapped to `"coding_standard"` or should we add `"code-quality"` as a valid value?

---

## Issue 2: Create Repository PR Rule - Invalid rule_type

**Error Message**:

```
Invalid rule_type. Allowed values: review_checklist, approval_requirement, merge_condition, automated_check, comment_template, other
```

**Failing Request**:

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "PR Checklist - Code Quality",
    "rule_content": "**REQUIRED**: All PRs must pass these checks before merge.",
    "rule_type": "code-quality",
    "severity": "error"
  }'
```

**Question**: Should `"code-quality"` be mapped to `"review_checklist"`? What about `"testing"` and `"documentation"`?

---

## Issue 3: Create Repository Prompt - Wrong field name

**Error Message**:

```
title and prompt_text are required
```

**Failing Request** (we were sending `prompt_content`):

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Create New API Route",
    "prompt_content": "Create a new API route...",
    "prompt_type": "development",
    "category": "api"
  }'
```

**Fixed Request** (now sending `prompt_text`):

```bash
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Create New API Route",
    "prompt_text": "Create a new API route...",
    "prompt_type": "development",
    "category": "api"
  }'
```

**Question**: Confirmed - API expects `prompt_text`, not `prompt_content`. ✅ Fixed in code.

---

## Summary of Fixes Applied

✅ **Fixed**: Changed `prompt_content` → `prompt_text` in create-repository-prompt.tool.ts
✅ **Fixed**: Added enum validation for `rule_type` in create-repository-rule.tool.ts (restricts to API values)
✅ **Fixed**: Added enum validation for `rule_type` in create-repository-pr-rule.tool.ts (restricts to API values)

## Questions for API Developer

1. **Rule Type Mapping**: When users provide `"code-quality"`, `"database"`, `"testing"`, `"documentation"`, etc., should we:

   - Map them to the closest API enum value?
   - Reject them and require users to use exact API values?
   - Add these as new valid enum values in the API?

2. **Default Values**: What should be the default `rule_type` if not provided?

   - Repository Rules: Should default to `"other"`?
   - PR Rules: Should default to `"other"`?

3. **Prompt Fields**:
   - Are `prompt_type` and `category` required or optional?
   - What are the allowed values for `prompt_type` and `category`?

## Test Script

Run `./test-failing-endpoints.sh` to test all endpoints with both failing and fixed requests.


