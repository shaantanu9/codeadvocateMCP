# MCP Guidance Rules Setup

**Created:** 2025-12-26  
**Status:** ✅ **Implemented**

## Overview

The `setupMcpGuidanceRules` tool automatically creates default repository rules that help guide MCP when it's installed. These rules provide essential context about:

- Repository structure and conventions
- MCP architecture patterns
- Tool development best practices
- API integration guidelines
- Caching and performance patterns

## Purpose

When an MCP server is installed in a repository, it needs context to work effectively. These rules serve as a knowledge base that helps the MCP understand:

1. **How to use the MCP tools** - Auto-detection patterns, tool structure
2. **Repository conventions** - Code patterns, architecture decisions
3. **Best practices** - Error handling, logging, testing
4. **API integration** - Field mappings, validation patterns

## Usage

### Basic Usage (Auto-detect Repository)

```json
{
  "name": "setupMcpGuidanceRules",
  "arguments": {}
}
```

The tool will automatically detect the repository ID from:
1. Workspace cache
2. Git remote URL
3. Workspace name

### With Explicit Repository ID

```json
{
  "name": "setupMcpGuidanceRules",
  "arguments": {
    "repositoryId": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326"
  }
}
```

### Overwrite Existing Rules

```json
{
  "name": "setupMcpGuidanceRules",
  "arguments": {
    "overwrite": true
  }
}
```

This will replace any existing rules with the same titles.

## Default Rules Created

The tool creates **10 default rules** covering:

### 1. MCP Tool Usage - Repository ID Auto-Detection
- **Type:** `documentation`
- **Severity:** `info`
- Explains how repository ID auto-detection works

### 2. MCP Architecture - Stateless Design Pattern
- **Type:** `architecture`
- **Severity:** `info`
- Explains the stateless architecture pattern

### 3. MCP Tool Structure - BaseToolHandler Pattern
- **Type:** `coding_standard`
- **Severity:** `info`
- Guidelines for creating new tools

### 4. MCP Error Handling - Consistent Error Responses
- **Type:** `coding_standard`
- **Severity:** `warning`
- Error handling patterns

### 5. MCP API Integration - Field Mapping and Validation
- **Type:** `coding_standard`
- **Severity:** `warning`
- Field mapping and enum validation

### 6. MCP Cache System - Repository Analysis Cache
- **Type:** `architecture`
- **Severity:** `info`
- Cache system usage

### 7. MCP Logging - Structured Logging Pattern
- **Type:** `coding_standard`
- **Severity:** `info`
- Logging best practices

### 8. MCP File Organization - Layer Separation
- **Type:** `architecture`
- **Severity:** `info`
- Code organization patterns

### 9. MCP Type Safety - Zod Schema Validation
- **Type:** `coding_standard`
- **Severity:** `error`
- Type safety requirements

### 10. MCP Testing - Tool Testing Best Practices
- **Type:** `testing`
- **Severity:** `info`
- Testing guidelines

## Response Format

```json
{
  "repositoryId": "85c5d8c8-7679-41e2-a8a5-f9ab364b3326",
  "totalRules": 10,
  "successCount": 10,
  "failureCount": 0,
  "results": [
    {
      "title": "MCP Tool Usage - Repository ID Auto-Detection",
      "success": true,
      "message": "Created new rule",
      "ruleId": "abc123..."
    },
    // ... more results
  ]
}
```

## When to Use

### Initial Setup
Run this tool when:
- First installing MCP in a repository
- Setting up a new repository for MCP usage
- Onboarding new team members

### Updates
Run with `overwrite: true` when:
- MCP patterns have evolved
- New best practices need to be documented
- Rules need to be refreshed

## Benefits

✅ **Consistent Guidance** - All MCP instances get the same foundational knowledge  
✅ **Faster Onboarding** - New MCP installations understand the repository immediately  
✅ **Best Practices** - Rules enforce coding standards and patterns  
✅ **Self-Documenting** - Rules serve as living documentation  
✅ **Auto-Detection** - Works seamlessly with repository detection system  

## Integration with Other Tools

This tool works well with:

- `analyzeAndSaveRepository` - Analyzes repository and saves to API
- `listRepositoryRules` - Lists all rules (including these guidance rules)
- `getRepositoryRule` - Retrieves specific rule details
- `createRepositoryRule` - Creates custom rules beyond defaults

## Example Workflow

```bash
# 1. Analyze repository (creates cache with repositoryId)
analyzeAndSaveRepository()

# 2. Setup MCP guidance rules (uses cached repositoryId)
setupMcpGuidanceRules()

# 3. Verify rules were created
listRepositoryRules()
```

## Customization

After running the setup tool, you can:

1. **Add Custom Rules** - Use `createRepositoryRule` to add repository-specific rules
2. **Update Rules** - Use `updateRepositoryRule` to modify default rules
3. **Delete Rules** - Use `deleteRepositoryRule` to remove unwanted rules

## Notes

- Rules are stored in the external API, not locally
- Rules persist across MCP sessions
- Rules can be viewed by any MCP instance with access to the repository
- Rules are searchable via `listRepositoryRules` with search parameter

---

**Related Tools:**
- `createRepositoryRule` - Create custom rules
- `listRepositoryRules` - List all rules
- `getRepositoryRule` - Get rule details
- `updateRepositoryRule` - Update existing rules
