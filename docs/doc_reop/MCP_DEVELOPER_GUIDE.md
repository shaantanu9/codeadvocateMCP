# MCP Developer Guide - API Integration Fixes

This guide provides all the information needed to fix the MCP tools that are failing when calling the repository content APIs.

## 📋 Quick Summary

Three main issues were identified and fixed:

1. **Repository Rules**: Invalid `rule_type` value (`code-quality` → should be `coding_standard`)
2. **PR Rules**: Invalid `rule_type` value (`code-quality` → should be `review_checklist`) + wrong field (`severity` → should be `priority`)
3. **Prompts**: Wrong field name (`prompt_content` → should be `prompt_text`)

## 📁 Documents

1. **`CORRECTED_CURL_COMMANDS.md`** ⭐ **START HERE**
   - Complete corrected curl commands
   - Field mapping guide
   - All allowed enum values
   - Working examples

2. **`FAILING_CURL_COMMANDS.md`**
   - Original failing commands (for reference)
   - Shows what was wrong

3. **`test-corrected-curl-commands.sh`**
   - Automated test script
   - Verifies all corrected commands work

## 🔧 Required Changes in MCP Tools

### 1. Repository Rules Tool

**File**: `create-repository-rule.tool.ts` (or similar)

**Changes Needed**:

```typescript
// ❌ OLD (Wrong)
{
  rule_type: "code-quality",  // Invalid enum value
  severity: "error"
}

// ✅ NEW (Correct)
{
  rule_type: "coding_standard",  // Valid enum value
  severity: "error"
}
```

**Field Mapping Function**:
```typescript
function mapRuleType(userType: string): string {
  const mapping: Record<string, string> = {
    "code-quality": "coding_standard",
    "testing": "testing",
    "documentation": "documentation",
    "security": "security",
    "performance": "performance",
    "architecture": "architecture",
    "naming": "naming_convention",
    "git": "git_workflow",
  };
  return mapping[userType] || "other";
}
```

**Allowed `rule_type` Values**:
- `coding_standard` ✅
- `naming_convention`
- `architecture`
- `security`
- `performance`
- `testing`
- `documentation`
- `git_workflow`
- `other` (default)

**Allowed `severity` Values**:
- `info`
- `warning`
- `error`
- `critical`

---

### 2. PR Rules Tool

**File**: `create-repository-pr-rule.tool.ts` (or similar)

**Changes Needed**:

```typescript
// ❌ OLD (Wrong)
{
  rule_type: "code-quality",  // Invalid enum value
  severity: "error"            // Wrong field name
}

// ✅ NEW (Correct)
{
  rule_type: "review_checklist",  // Valid enum value
  priority: "high"                // Correct field name
}
```

**Field Mapping Function**:
```typescript
function mapPrRuleType(userType: string): string {
  const mapping: Record<string, string> = {
    "code-quality": "review_checklist",
    "testing": "review_checklist",
    "documentation": "comment_template",
    "approval": "approval_requirement",
    "merge": "merge_condition",
    "automated": "automated_check",
  };
  return mapping[userType] || "other";
}
```

**Allowed `rule_type` Values**:
- `review_checklist` ✅
- `approval_requirement`
- `merge_condition`
- `automated_check`
- `comment_template`
- `other` (default)

**Allowed `priority` Values** (Note: PR rules use `priority`, not `severity`):
- `low`
- `medium`
- `high`
- `critical`

---

### 3. Prompts Tool

**File**: `create-repository-prompt.tool.ts` (or similar)

**Changes Needed**:

```typescript
// ❌ OLD (Wrong)
{
  prompt_content: "...",  // Wrong field name
  prompt_type: "development"  // Invalid enum value
}

// ✅ NEW (Correct)
{
  prompt_text: "...",  // Correct field name
  prompt_type: "code_generation"  // Valid enum value
}
```

**Field Mapping Function**:
```typescript
function mapPromptType(userType: string): string {
  const mapping: Record<string, string> = {
    "development": "code_generation",
    "review": "code_review",
    "documentation": "documentation",
    "refactor": "refactoring",
    "test": "testing",
    "debug": "debugging",
    "explain": "explanation",
  };
  return mapping[userType] || "other";
}
```

**Allowed `prompt_type` Values**:
- `code_generation` ✅
- `code_review`
- `documentation`
- `refactoring`
- `testing`
- `debugging`
- `explanation`
- `other` (default)

**Note**: `category` is optional and can be any string value.

---

## 🧪 Testing

### Manual Testing

Use the corrected curl commands from `CORRECTED_CURL_COMMANDS.md`:

```bash
# Set your credentials
export TOKEN="your-token-here"
export REPO_ID="your-repo-id-here"
export BASE_URL="http://localhost:5656/api"

# Test Repository Rule
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Test Rule",
    "rule_content": "Test content",
    "rule_type": "coding_standard",
    "severity": "error"
  }'

# Test PR Rule
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/pr-rules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Test PR Rule",
    "rule_content": "Test content",
    "rule_type": "review_checklist",
    "priority": "high"
  }'

# Test Prompt
curl -X POST "${BASE_URL}/repositories/${REPO_ID}/prompts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "title": "Test Prompt",
    "prompt_text": "Test prompt text",
    "prompt_type": "code_generation",
    "category": "test"
  }'
```

### Automated Testing

Run the test script:

```bash
# Using Bearer token
TOKEN="your-token" ./test-corrected-curl-commands.sh

# Or using API key
API_KEY="your-api-key" ./test-corrected-curl-commands.sh
```

---

## 📊 Complete Field Reference

### Repository Rules API

**Endpoint**: `POST /api/repositories/{id}/rules`

**Required Fields**:
- `title` (string)
- `rule_content` (string)

**Optional Fields**:
- `description` (string)
- `rule_type` (enum, default: `"other"`)
- `severity` (enum, default: `"warning"`)
- `category` (string)
- `tags` (array)
- `conditions` (object)
- `examples` (array)
- `metadata` (object)

**Validation**:
- `rule_type` must be one of: `coding_standard`, `naming_convention`, `architecture`, `security`, `performance`, `testing`, `documentation`, `git_workflow`, `other`
- `severity` must be one of: `info`, `warning`, `error`, `critical`

---

### PR Rules API

**Endpoint**: `POST /api/repositories/{id}/pr-rules`

**Required Fields**:
- `title` (string)
- `rule_content` (string)

**Optional Fields**:
- `description` (string)
- `rule_type` (enum, default: `"other"`)
- `priority` (enum) ⚠️ **Note**: PR rules use `priority`, not `severity`
- `category` (string)
- `conditions` (object)
- `triggers` (array)
- `actions` (array)
- `metadata` (object)

**Validation**:
- `rule_type` must be one of: `review_checklist`, `approval_requirement`, `merge_condition`, `automated_check`, `comment_template`, `other`
- `priority` must be one of: `low`, `medium`, `high`, `critical`

---

### Prompts API

**Endpoint**: `POST /api/repositories/{id}/prompts`

**Required Fields**:
- `title` (string)
- `prompt_text` (string) ⚠️ **Note**: Field name is `prompt_text`, not `prompt_content`

**Optional Fields**:
- `description` (string)
- `prompt_type` (enum, default: `"other"`)
- `category` (string)
- `tags` (array)
- `variables` (object)
- `examples` (array)
- `metadata` (object)

**Validation**:
- `prompt_type` must be one of: `code_generation`, `code_review`, `documentation`, `refactoring`, `testing`, `debugging`, `explanation`, `other`

---

## 🔐 Authentication

Both authentication methods are supported:

### Bearer Token
```bash
-H "Authorization: Bearer ${TOKEN}"
```

### API Key
```bash
-H "X-API-Key: ${API_KEY}"
```

---

## ✅ Checklist for MCP Developer

- [ ] Update Repository Rules tool to map `code-quality` → `coding_standard`
- [ ] Update PR Rules tool to map `code-quality` → `review_checklist`
- [ ] Update PR Rules tool to use `priority` instead of `severity`
- [ ] Update Prompts tool to use `prompt_text` instead of `prompt_content`
- [ ] Add enum validation for all `rule_type` and `prompt_type` fields
- [ ] Add default values (`"other"` for types, `"warning"` for severity)
- [ ] Test all three endpoints with corrected values
- [ ] Update any documentation or examples in the MCP tools

---

## 📞 Support

If you encounter any issues:

1. Check `CORRECTED_CURL_COMMANDS.md` for working examples
2. Run `test-corrected-curl-commands.sh` to verify API connectivity
3. Review API error messages - they now include allowed values
4. Check `docs/REPOSITORY_CONTENT_ENDPOINTS.md` for complete API documentation

---

## 🎯 Quick Fix Summary

| Tool | Issue | Fix |
|------|-------|-----|
| Repository Rules | `rule_type: "code-quality"` | Use `"coding_standard"` |
| PR Rules | `rule_type: "code-quality"` | Use `"review_checklist"` |
| PR Rules | `severity` field | Use `priority` instead |
| Prompts | `prompt_content` field | Use `prompt_text` instead |
| Prompts | `prompt_type: "development"` | Use `"code_generation"` |

All fixes are documented in detail in `CORRECTED_CURL_COMMANDS.md`.

