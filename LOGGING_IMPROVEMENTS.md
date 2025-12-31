# Logging Improvements Summary

## Overview

Enhanced logging throughout the codebase to help debug API issues and improve tool reliability. All improvements are based on analysis of failed tool calls in `logs/tool-calls-failed/tool-calls-2025-12-24.log`.

## Changes Made

### 1. HTTP Client Logging (`src/infrastructure/http-client.ts`)

**Enhanced Request Logging**:
- ✅ Logs request body preview (first 200 chars, sanitized)
- ✅ Logs endpoint, method, query parameters
- ✅ Sanitizes sensitive fields (password, token, api_key, etc.)

**Enhanced Error Logging**:
- ✅ Logs full error details including API response
- ✅ Logs request body that caused the error
- ✅ Logs HTTP status code and status text
- ✅ Logs full URL for debugging

**Example Log Output**:
```json
{
  "level": "error",
  "message": "HTTP POST /api/repositories/{id}/rules failed",
  "status": 400,
  "statusText": "Bad Request",
  "endpoint": "/api/repositories/{id}/rules",
  "method": "POST",
  "requestId": "...",
  "errorMessage": "Invalid rule_type. Allowed values: ...",
  "errorDetails": { ... },
  "requestBody": {
    "title": "...",
    "rule_content_length": 1234,
    "rule_type": "code-quality",
    "severity": "error"
  },
  "url": "http://localhost:5656/api/repositories/{id}/rules"
}
```

### 2. External API Service Logging (`src/application/services/external-api.service.ts`)

**Enhanced POST Request Logging**:
- ✅ Logs request body keys before sending
- ✅ Logs body preview (first 100 chars per field)
- ✅ Enhanced error context with request details

**Example Log Output**:
```json
{
  "level": "debug",
  "message": "External API POST request",
  "endpoint": "/api/repositories/{id}/prompts",
  "hasBody": true,
  "bodyType": "object",
  "bodyKeys": ["title", "prompt_text", "prompt_type", "category"]
}
```

### 3. Tool-Specific Logging

#### Create Repository Rule Tool (`src/tools/repositories/rules/create-repository-rule.tool.ts`)

**Added**:
- ✅ Pre-request logging with body preview
- ✅ Validation error hints for invalid `rule_type`
- ✅ Suggests correct enum values when validation fails

**Example Log Output**:
```json
{
  "level": "warn",
  "message": "[createRepositoryRule] Invalid rule_type provided",
  "providedRuleType": "code-quality",
  "allowedValues": ["coding_standard", "naming_convention", ...],
  "suggestion": "Consider using 'coding_standard'",
  "repositoryId": "...",
  "title": "..."
}
```

#### Create Repository PR Rule Tool (`src/tools/repositories/pr-rules/create-repository-pr-rule.tool.ts`)

**Added**:
- ✅ Pre-request logging with body preview
- ✅ Validation error hints for invalid `rule_type`
- ✅ Suggests correct enum values when validation fails

#### Create Repository Prompt Tool (`src/tools/repositories/prompts/create-repository-prompt.tool.ts`)

**Added**:
- ✅ Pre-request logging with body preview
- ✅ Field validation hints for `prompt_text` errors
- ✅ Notes that field name has been fixed in code

**Example Log Output**:
```json
{
  "level": "debug",
  "message": "[createRepositoryPrompt] Preparing API request",
  "endpoint": "/api/repositories/{id}/prompts",
  "method": "POST",
  "body": {
    "title": "...",
    "prompt_text_length": 1234,
    "prompt_type": "development",
    "category": "api"
  },
  "note": "Using 'prompt_text' field (API requirement)"
}
```

### 4. Tool Call Logger Enhancements (`src/core/tool-call-logger.ts`)

**Added Validation Hints**:
- ✅ Automatically adds validation hints to error logs
- ✅ Provides suggestions for common validation errors
- ✅ Maps user-friendly values to API enum values

**Enhanced Error Details**:
- ✅ Extracts API error details from `ExternalApiError`
- ✅ Adds validation hints to error details
- ✅ Preserves full error context

**Example Enhanced Log Entry**:
```json
{
  "timestamp": "2025-12-24T11:26:39.435Z",
  "toolName": "createRepositoryRule",
  "status": "failure",
  "params": { ... },
  "executionTimeMs": 370,
  "error": {
    "name": "ExternalApiError",
    "message": "Invalid rule_type. Allowed values: ...",
    "details": {
      "validationHint": "Invalid rule_type 'code-quality'. Use 'coding_standard' instead"
    }
  }
}
```

## Log File Locations

- **All Tool Calls**: `logs/tool-calls/tool-calls-YYYY-MM-DD.log`
- **Failed Tool Calls**: `logs/tool-calls-failed/tool-calls-YYYY-MM-DD.log`

## What Gets Logged

### For Every Request:
1. **Request Details**:
   - Endpoint URL
   - HTTP method
   - Request body preview (sanitized)
   - Query parameters
   - Request ID

2. **Response Details**:
   - HTTP status code
   - Response body (on success)
   - Error details (on failure)

3. **Tool Execution**:
   - Tool name
   - Parameters (sanitized)
   - Execution time
   - Success/failure status
   - Error details with validation hints

### For Failures:
1. **Error Context**:
   - Full error message
   - Error stack trace
   - API response details
   - Request body that caused the error

2. **Validation Hints**:
   - Suggested correct values
   - Field name corrections
   - Enum value mappings

## Benefits

1. **Easier Debugging**: Full request/response context in logs
2. **Faster Issue Resolution**: Validation hints point to solutions
3. **Better Monitoring**: Track API failures and patterns
4. **Improved Development**: See exactly what's being sent to API
5. **API Developer Communication**: Clear curl commands and error details

## Example Debugging Workflow

1. **Check Failed Logs**:
   ```bash
   cat logs/tool-calls-failed/tool-calls-2025-12-24.log | jq '.'
   ```

2. **Find Validation Errors**:
   ```bash
   cat logs/tool-calls-failed/tool-calls-2025-12-24.log | jq 'select(.error.message | contains("Invalid rule_type"))'
   ```

3. **See Request Details**:
   ```bash
   cat logs/tool-calls-failed/tool-calls-2025-12-24.log | jq 'select(.toolName == "createRepositoryRule") | .params'
   ```

4. **Check Validation Hints**:
   ```bash
   cat logs/tool-calls-failed/tool-calls-2025-12-24.log | jq 'select(.error.details.validationHint) | .error.details.validationHint'
   ```

## Next Steps

1. ✅ Enhanced HTTP client logging
2. ✅ Enhanced tool-specific logging
3. ✅ Added validation hints
4. ✅ Created curl command documentation
5. ⏳ **Pending**: Add rule type mapping function (waiting for API developer confirmation)
6. ⏳ **Pending**: Add prompt type/category enum validation (waiting for API developer confirmation)

## Files Modified

- `src/infrastructure/http-client.ts` - Enhanced request/response logging
- `src/application/services/external-api.service.ts` - Enhanced POST logging
- `src/tools/repositories/rules/create-repository-rule.tool.ts` - Added validation hints
- `src/tools/repositories/pr-rules/create-repository-pr-rule.tool.ts` - Added validation hints
- `src/tools/repositories/prompts/create-repository-prompt.tool.ts` - Added validation hints
- `src/core/tool-call-logger.ts` - Added validation hint generation

## Documentation Created

- `FAILING_CURL_COMMANDS.md` - Detailed curl commands with questions
- `CURL_COMMANDS_FOR_API_DEVELOPER.md` - Formatted for API developer
- `API_ISSUES_SUMMARY.md` - Summary of all issues
- `test-failing-endpoints.sh` - Test script for all endpoints
- `LOGGING_IMPROVEMENTS.md` - This file



