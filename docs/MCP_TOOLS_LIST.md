# Demo MCP Server - Available Tools

## How to List Tools Using MCP Protocol

### Method 1: Using the Test Script

```bash
# Without authentication (will show auth error but you can see the structure)
node test-list-tools.js

# With authentication token
MCP_TOKEN=your-token node test-list-tools.js
```

### Method 2: Using curl

```bash
# Initialize MCP connection
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'

# List tools
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

## Available Tools

Based on the code, the following tools are registered:

### 📌 Core Tools (2 tools)

1. **getAIModelInfo**
   - Description: Get detailed information about AI models and their capabilities
   - Parameters:
     - `modelName` (required, string): The name of the AI model to get details for

2. **listAIModels**
   - Description: List all available AI models in the system
   - Parameters: None

### 🤖 AI Tools (4 tools)

3. **generateText**
   - Description: Generate text using AI (OpenAI or Anthropic)
   - Parameters:
     - `prompt` (required, string): The prompt to generate text from
     - `provider` (optional, enum: "openai" | "anthropic" | "auto"): AI provider to use
     - `model` (optional, string): Specific model to use
     - `maxTokens` (optional, number): Maximum tokens to generate
     - `temperature` (optional, number): Temperature for generation (0-2)
     - `systemPrompt` (optional, string): System prompt to guide the AI behavior

4. **analyzeText**
   - Description: Analyze text using AI (sentiment, summary, keywords, etc.)
   - Parameters:
     - `text` (required, string): Text to analyze
     - `analysisType` (required, enum: "sentiment" | "summary" | "keywords" | "topics" | "grammar"): Type of analysis to perform
     - `provider` (optional, enum: "openai" | "anthropic" | "auto"): AI provider to use

5. **generateCode**
   - Description: Generate code using AI
   - Parameters:
     - `description` (required, string): Description of the code to generate
     - `language` (required, string): Programming language (e.g., python, javascript, typescript)
     - `requirements` (optional, string): Additional requirements or constraints
     - `provider` (optional, enum: "openai" | "anthropic" | "auto"): AI provider to use

6. **getAIModelInfo** (from AI tools)
   - Description: Get detailed information about AI models and their capabilities
   - Parameters:
     - `modelName` (required, string): The name of the AI model to get details for

### 🌐 External API Tools (6 tools)

7. **listSnippets**
   - Description: List code snippets from the external API
   - Parameters:
     - `search` (optional, string): Search term to filter snippets
     - `language` (optional, string): Filter by programming language
     - `tags` (optional, string): Comma-separated tags to filter
     - `projectId` (optional, string): Filter by project ID
     - `favorite` (optional, boolean): Filter by favorite status
     - `page` (optional, number): Page number for pagination (default: 1)
     - `limit` (optional, number): Number of items per page (default: 20)

8. **getSnippet**
   - Description: Get a specific code snippet by ID
   - Parameters:
     - `snippetId` (required, string): The ID of the snippet to retrieve

9. **createSnippet**
   - Description: Create a new code snippet
   - Parameters:
     - `title` (required, string): Title of the snippet
     - `code` (required, string): The code content
     - `language` (required, string): Programming language
     - `description` (optional, string): Description of the snippet
     - `tags` (optional, array of strings): Tags for the snippet
     - `projectId` (optional, string): Associated project ID
     - `repositoryId` (optional, string): Associated repository ID

10. **listProjects**
    - Description: List projects from the external API
    - Parameters:
      - `search` (optional, string): Search term to filter projects
      - `teamId` (optional, string): Filter by team ID
      - `page` (optional, number): Page number (default: 1)
      - `limit` (optional, number): Items per page (default: 20)

11. **listCollections**
    - Description: List collections from the external API
    - Parameters:
      - `search` (optional, string): Search term
      - `page` (optional, number): Page number (default: 1)
      - `limit` (optional, number): Items per page (default: 20)

12. **callExternalAPI**
    - Description: Make a generic API call to the external API
    - Parameters:
      - `method` (required, enum: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"): HTTP method
      - `endpoint` (required, string): API endpoint (e.g., /api/snippets, /api/projects)
      - `body` (optional, object): Request body (for POST/PUT/PATCH)
      - `queryParams` (optional, object): Query parameters

### 🔐 Authentication Tools (3 tools)

13. **validateToken**
    - Description: Validate if a provided token matches the MCP server's authentication token
    - Parameters:
      - `token` (required, string): The token to validate against the MCP server

14. **getTokenInfo**
    - Description: Get information about the MCP server's authentication token (without exposing the actual token)
    - Parameters: None

15. **testAuthentication**
    - Description: Test if the current request is authenticated (uses token from request headers)
    - Parameters: None

## Total: 15 Tools

- Core Tools: 2
- AI Tools: 4
- External API Tools: 6
- Authentication Tools: 3

## Quick Test

Run the test script to see all tools:

```bash
node test-list-tools.js
```

Or use the updated test script:

```bash
node test-mcp.js
```

Both scripts will:
1. Check server health
2. Initialize MCP connection
3. List all available tools using `tools/list` method
4. Display tools with descriptions and parameters

