# 📋 Complete List of All MCP Tools

## Total: 15 Tools

---

## 🔐 Authentication Tools (3)

### 1. `validateToken`
**Description:** Validate if a provided token matches the MCP server's authentication token

**Parameters:**
- `token` (string, required) - The token to validate

**Example:**
```json
{
  "name": "validateToken",
  "arguments": {
    "token": "your-token-here"
  }
}
```

### 2. `getTokenInfo`
**Description:** Get information about the MCP server's authentication token (without exposing the actual token)

**Parameters:** None

**Example:**
```json
{
  "name": "getTokenInfo",
  "arguments": {}
}
```

### 3. `testAuthentication`
**Description:** Test if the current request is authenticated (uses token from request headers)

**Parameters:** None

**Example:**
```json
{
  "name": "testAuthentication",
  "arguments": {}
}
```

---

## 🤖 AI Model Information Tools (2)

### 4. `getAIModelInfo`
**Description:** Get detailed information about AI models and their capabilities

**Parameters:**
- `modelName` (string, required) - The name of the AI model to get details for

**Available Models:**
- `shantanuDemo-3432`
- `gpt-4`
- `claude-3-sonnet`
- `llama-2-7b`

**Example:**
```json
{
  "name": "getAIModelInfo",
  "arguments": {
    "modelName": "gpt-4"
  }
}
```

### 5. `listAIModels`
**Description:** List all available AI models in the system

**Parameters:** None

**Example:**
```json
{
  "name": "listAIModels",
  "arguments": {}
}
```

---

## 🧠 AI-Powered Tools (4)

### 6. `generateText`
**Description:** Generate text using AI (OpenAI or Anthropic)

**Parameters:**
- `prompt` (string, required) - The prompt to generate text from
- `provider` (enum: "openai" | "anthropic" | "auto", default: "auto") - AI provider
- `model` (string, optional) - Specific model to use
- `maxTokens` (number, optional) - Maximum tokens to generate
- `temperature` (number, optional, 0-2) - Temperature for generation
- `systemPrompt` (string, optional) - System prompt to guide AI

**Example:**
```json
{
  "name": "generateText",
  "arguments": {
    "prompt": "Write a haiku about programming",
    "provider": "auto",
    "temperature": 0.7
  }
}
```

### 7. `analyzeText`
**Description:** Analyze text using AI (sentiment, summary, keywords, etc.)

**Parameters:**
- `text` (string, required) - Text to analyze
- `analysisType` (enum: "sentiment" | "summary" | "keywords" | "topics" | "grammar") - Type of analysis
- `provider` (enum: "openai" | "anthropic" | "auto", default: "auto") - AI provider

**Example:**
```json
{
  "name": "analyzeText",
  "arguments": {
    "text": "I love this product!",
    "analysisType": "sentiment"
  }
}
```

### 8. `generateCode`
**Description:** Generate code using AI

**Parameters:**
- `description` (string, required) - Description of code to generate
- `language` (string, required) - Programming language
- `requirements` (string, optional) - Additional requirements
- `provider` (enum: "openai" | "anthropic" | "auto", default: "auto") - AI provider

**Example:**
```json
{
  "name": "generateCode",
  "arguments": {
    "description": "A function to calculate fibonacci numbers",
    "language": "python",
    "requirements": "Use memoization"
  }
}
```

### 9. `listAIServices`
**Description:** List available AI services and their status

**Parameters:** None

**Example:**
```json
{
  "name": "listAIServices",
  "arguments": {}
}
```

---

## 🌐 External API Tools (6)

### 10. `listSnippets`
**Description:** List code snippets from the external API

**Parameters:**
- `search` (string, optional) - Search term
- `language` (string, optional) - Programming language filter
- `tags` (string, optional) - Comma-separated tags
- `projectId` (string, optional) - Filter by project ID
- `favorite` (boolean, optional) - Filter by favorite status
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 20) - Items per page

**Example:**
```json
{
  "name": "listSnippets",
  "arguments": {
    "search": "javascript",
    "language": "typescript",
    "page": 1,
    "limit": 20
  }
}
```

### 11. `getSnippet`
**Description:** Get a specific code snippet by ID

**Parameters:**
- `snippetId` (string, required) - The ID of the snippet to retrieve

**Example:**
```json
{
  "name": "getSnippet",
  "arguments": {
    "snippetId": "uuid-here"
  }
}
```

### 12. `createSnippet`
**Description:** Create a new code snippet

**Parameters:**
- `title` (string, required) - Title of the snippet
- `code` (string, required) - The code content
- `language` (string, required) - Programming language
- `description` (string, optional) - Description
- `tags` (array of strings, optional) - Tags
- `projectId` (string, optional) - Project ID
- `repositoryId` (string, optional) - Repository ID

**Example:**
```json
{
  "name": "createSnippet",
  "arguments": {
    "title": "My Snippet",
    "code": "console.log('Hello');",
    "language": "javascript",
    "tags": ["test", "example"]
  }
}
```

### 13. `listProjects`
**Description:** List projects from the external API

**Parameters:**
- `search` (string, optional) - Search term
- `teamId` (string, optional) - Filter by team ID
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 20) - Items per page

**Example:**
```json
{
  "name": "listProjects",
  "arguments": {
    "search": "my project",
    "page": 1
  }
}
```

### 14. `listCollections`
**Description:** List collections from the external API

**Parameters:**
- `search` (string, optional) - Search term
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 20) - Items per page

**Example:**
```json
{
  "name": "listCollections",
  "arguments": {
    "search": "test",
    "page": 1
  }
}
```

### 15. `callExternalAPI`
**Description:** Make a generic API call to the external API

**Parameters:**
- `method` (enum: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", required) - HTTP method
- `endpoint` (string, required) - API endpoint path
- `body` (object, optional) - Request body (for POST/PUT/PATCH)
- `queryParams` (object, optional) - Query parameters

**Example:**
```json
{
  "name": "callExternalAPI",
  "arguments": {
    "method": "GET",
    "endpoint": "/api/snippets",
    "queryParams": {
      "search": "test",
      "page": 1
    }
  }
}
```

---

## 📊 Summary by Category

| Category | Count | Tools |
|----------|-------|-------|
| **Authentication** | 3 | validateToken, getTokenInfo, testAuthentication |
| **AI Model Info** | 2 | getAIModelInfo, listAIModels |
| **AI-Powered** | 4 | generateText, analyzeText, generateCode, listAIServices |
| **External API** | 6 | listSnippets, getSnippet, createSnippet, listProjects, listCollections, callExternalAPI |
| **TOTAL** | **15** | |

---

## 🧪 Quick Test

Test all tools are available:

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

This will return a list of all 15 tools with their descriptions and parameters.

---

**Last Updated:** 2025-01-XX  
**Total Tools:** 15  
**Status:** ✅ All tools registered and available

