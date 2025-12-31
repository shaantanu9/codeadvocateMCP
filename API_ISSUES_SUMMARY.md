# API Issues Summary - For API Developer

## Overview

Three tools are failing due to API field mismatches. This document contains the exact curl commands that are failing.

---

## Issue 1: Create Repository Rule - Invalid `rule_type`

### Error

```
Invalid rule_type. Allowed values: coding_standard, naming_convention, architecture, security, performance, testing, documentation, git_workflow, other
```

### Failing CURL Command

```bash
curl -X POST "http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "React Hook Dependencies - useCallback Pattern",
    "rule_content": "**CRITICAL**: Always use `useCallback` for functions used in `useEffect` dependencies.",
    "rule_type": "code-quality",
    "severity": "error"
  }'
```

### Problem

- Tool is sending `"rule_type": "code-quality"`
- API only accepts: `coding_standard, naming_convention, architecture, security, performance, testing, documentation, git_workflow, other`

### Questions

1. Should `"code-quality"` map to `"coding_standard"`?
2. Should `"database"` map to `"other"`?
3. Should we add these as new valid enum values?

---

## Issue 2: Create Repository PR Rule - Invalid `rule_type`

### Error

```
Invalid rule_type. Allowed values: review_checklist, approval_requirement, merge_condition, automated_check, comment_template, other
```

### Failing CURL Command

```bash
curl -X POST "http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "PR Checklist - Code Quality",
    "rule_content": "**REQUIRED**: All PRs must pass these checks before merge.",
    "rule_type": "code-quality",
    "severity": "error"
  }'
```

### Problem

- Tool is sending `"rule_type": "code-quality"`, `"testing"`, `"documentation"`
- API only accepts: `review_checklist, approval_requirement, merge_condition, automated_check, comment_template, other`

### Questions

1. Should `"code-quality"` map to `"review_checklist"`?
2. Should `"testing"` map to `"review_checklist"`?
3. Should `"documentation"` map to `"comment_template"`?

---

## Issue 3: Create Repository Prompt - Wrong Field Name

### Error

```
title and prompt_text are required
```

### Failing CURL Command (OLD - what we were sending)

```bash
curl -X POST "http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Create New API Route",
    "prompt_content": "Create a new API route following the project'\''s standard patterns...",
    "prompt_type": "development",
    "category": "api"
  }'
```

### Fixed CURL Command (NEW - what we're sending now)

```bash
curl -X POST "http://localhost:5656/api/repositories/6c119199-0ac9-4055-a297-5bf044fdb64d/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Create New API Route",
    "prompt_text": "Create a new API route following the project'\''s standard patterns...",
    "prompt_type": "development",
    "category": "api"
  }'
```

### Problem

- Tool was sending `"prompt_content"`
- API expects `"prompt_text"`

### Status

✅ **FIXED** - Changed field name from `prompt_content` to `prompt_text` in code

---

## Code Fixes Applied

1. ✅ Changed `prompt_content` → `prompt_text` in `create-repository-prompt.tool.ts`
2. ✅ Added enum validation for `rule_type` in `create-repository-rule.tool.ts`
3. ✅ Added enum validation for `rule_type` in `create-repository-pr-rule.tool.ts`

## Remaining Questions

1. **Rule Type Mapping Strategy**: How should we handle user-friendly rule types like `"code-quality"`, `"database"`, etc.?
2. **Default Values**: What should be the default `rule_type` when not provided?
3. **Prompt Fields**: What are the allowed values for `prompt_type` and `category`?

## Test Script

Run `./test-failing-endpoints.sh` to test all endpoints. Update the script with your actual `BASE_URL` and `TOKEN` values.


