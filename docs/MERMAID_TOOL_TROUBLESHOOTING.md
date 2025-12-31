# Mermaid Tool Troubleshooting Guide

## Issue: `createRepositoryMermaid` Not Being Called

### Problem
When trying to call `createRepositoryMermaid`, the tool is not being invoked. Instead, other tools like `createSnippet` or `createRepositoryFile` are being called.

### Possible Causes

1. **Tool Description Not Clear Enough**
   - AI models may not understand when to use the tool
   - Description needs to be more specific about use cases

2. **Tool Name Ambiguity**
   - Name might not be clear enough for AI to match intent
   - Need to ensure description clearly explains what the tool does

3. **Parameter Mismatch**
   - Parameters might not match what the user is asking for
   - Need to ensure all required parameters are clearly documented

4. **Tool Not Discoverable**
   - Tool might not be showing up in tool list
   - Need to verify tool registration

## Solutions

### 1. Enhanced Description ✅ (Applied)
Updated the description to be more explicit:
- Clear use cases (architecture, workflow, database diagrams)
- Required vs optional parameters clearly stated
- Example Mermaid code format included

### 2. Verify Tool Registration
Check if tool is registered:
```bash
# Check tool registry
grep -n "createRepositoryMermaid" src/tools/tool-registry.ts
```

### 3. Check Tool Discovery
Verify the tool appears in the tool list:
```bash
# List all tools
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }' | jq '.result.tools[] | select(.name | contains("Mermaid"))'
```

### 4. Explicit Tool Calling
When calling the tool, be explicit:
```json
{
  "name": "createRepositoryMermaid",
  "arguments": {
    "repositoryId": "your-repo-id",
    "title": "Architecture Diagram",
    "content": "flowchart TD\n    A[Start] --> B[End]",
    "category": "architecture"
  }
}
```

## How to Call the Tool Properly

### Method 1: Direct Tool Call
```typescript
// In MCP client
await mcpClient.callTool("createRepositoryMermaid", {
  repositoryId: "692a91e7-8451-4ea0-88da-a0f56de86533",
  title: "System Architecture",
  content: "flowchart TD\n    A[Frontend] --> B[Backend]",
  category: "architecture",
  tags: ["architecture", "system"]
});
```

### Method 2: Natural Language (for AI)
When asking AI to create a Mermaid diagram:
- ✅ "Create a Mermaid diagram for repository X showing the architecture"
- ✅ "Generate a Mermaid flowchart for repository Y"
- ✅ "Create a Mermaid diagram with title 'Architecture' and content 'flowchart TD...'"
- ❌ "Create a diagram" (too vague - might use createRepositoryFile instead)
- ❌ "Save a mermaid file" (might use createRepositoryFile instead)

### Method 3: Explicit Parameters
Always include:
- `repositoryId` - Required
- `title` - Required
- `content` - Required (the actual Mermaid code)
- `category` - Optional but helpful (architecture, workflow, database, custom)

## Comparison with Working Tools

### `createSnippet` (Working)
- **Name:** `createSnippet`
- **Description:** "Create a new code snippet"
- **Why it works:** Simple, clear purpose

### `createRepositoryFile` (Working)
- **Name:** `createRepositoryFile`
- **Description:** "Create a file for a repository. Required: file_name, file_path, content..."
- **Why it works:** Very explicit about requirements

### `createRepositoryMermaid` (Fixed)
- **Name:** `createRepositoryMermaid`
- **Description:** Enhanced to match pattern of working tools
- **Improvements:**
  - Added use cases (architecture, workflow, database)
  - Explicit required vs optional parameters
  - Example Mermaid code format

## Testing

### Test Tool Registration
```bash
# Check if tool is in registry
grep "createRepositoryMermaid" src/tools/tool-registry.ts
# Should show: RepositoryTools.RepositoryMermaidTools.createRepositoryMermaidTool,
```

### Test Tool Discovery
```bash
# List all Mermaid tools
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }' | jq '.result.tools[] | select(.name | contains("Mermaid")) | .name'
```

Expected output:
```
"listRepositoryMermaid"
"getRepositoryMermaid"
"createRepositoryMermaid"
"updateRepositoryMermaid"
"deleteRepositoryMermaid"
```

### Test Tool Execution
```bash
# Test create Mermaid diagram
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "createRepositoryMermaid",
      "arguments": {
        "repositoryId": "692a91e7-8451-4ea0-88da-a0f56de86533",
        "title": "Test Diagram",
        "content": "flowchart TD\n    A[Start] --> B[End]",
        "category": "architecture"
      }
    }
  }'
```

## Common Issues and Fixes

### Issue 1: Tool Not Found
**Error:** "Tool not found: createRepositoryMermaid"
**Fix:** 
- Verify tool is registered in `tool-registry.ts`
- Restart MCP server
- Check for TypeScript compilation errors

### Issue 2: Wrong Tool Called
**Symptom:** `createSnippet` or `createRepositoryFile` called instead
**Fix:**
- Use more specific language: "Create a Mermaid diagram" not "Create a diagram"
- Include "Mermaid" in the request
- Specify diagram type: "architecture diagram", "workflow diagram"

### Issue 3: Parameter Validation Error
**Error:** "Invalid parameters"
**Fix:**
- Ensure `repositoryId`, `title`, and `content` are provided
- `content` must be valid Mermaid syntax
- `category` should be one of: architecture, workflow, database, custom

## Best Practices

1. **Be Explicit:** Always mention "Mermaid diagram" not just "diagram"
2. **Include Context:** Specify what type of diagram (architecture, workflow, etc.)
3. **Provide Content:** Include the Mermaid code in the request
4. **Use Correct Tool:** Use `createRepositoryMermaid` for diagrams, not `createRepositoryFile`

## Verification Checklist

- [ ] Tool is registered in `tool-registry.ts`
- [ ] Tool appears in `tools/list` response
- [ ] Description is clear and explicit
- [ ] Parameters match API requirements
- [ ] Server is restarted after changes
- [ ] No TypeScript compilation errors
- [ ] Tool can be called directly via MCP protocol

---

**Last Updated:** 2025-01-27
**Status:** ✅ Description enhanced, tool properly registered
