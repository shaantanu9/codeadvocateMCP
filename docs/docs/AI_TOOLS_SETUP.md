# 🤖 AI Tools Setup Guide

## ✅ Implementation Complete!

Your MCP server now supports multiple AI-powered tools that can call OpenAI and Anthropic APIs.

---

## 📁 Project Structure

```
src/
├── index.ts                    # Main server (updated with AI tools)
├── config/
│   └── env.ts                 # Environment configuration & API key management
├── services/
│   ├── ai-service.interface.ts # Base interface for AI services
│   ├── openai-service.ts      # OpenAI service implementation
│   ├── anthropic-service.ts   # Anthropic service implementation
│   └── ai-service-factory.ts  # Factory to create AI services
├── tools/
│   └── ai-tools.ts            # AI-powered MCP tools
└── utils/
    ├── error-handler.ts       # Error handling utilities
    └── response-formatter.ts  # Response formatting utilities
```

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install openai @anthropic-ai/sdk dotenv
```

### Step 2: Configure API Keys

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required: At least one AI provider API key
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Optional: Default models
DEFAULT_OPENAI_MODEL=gpt-4
DEFAULT_ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Server config
PORT=3111
NODE_ENV=development
```

**Get API Keys:**

- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys

### Step 3: Start the Server

```bash
npm run dev
```

You should see:

```
[Config] AI Providers configured: OpenAI, Anthropic
[MCP] Server running at http://localhost:3111/mcp
```

---

## 🛠️ Available AI Tools

### 1. `generateText`

Generate text using AI (OpenAI or Anthropic)

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

### 2. `analyzeText`

Analyze text using AI (sentiment, summary, keywords, etc.)

**Parameters:**

- `text` (string, required) - Text to analyze
- `analysisType` (enum: "sentiment" | "summary" | "keywords" | "topics" | "grammar") - Type of analysis
- `provider` (enum: "openai" | "anthropic" | "auto", default: "auto") - AI provider

**Example:**

```json
{
  "name": "analyzeText",
  "arguments": {
    "text": "I love this product! It's amazing.",
    "analysisType": "sentiment"
  }
}
```

### 3. `generateCode`

Generate code using AI

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
    "requirements": "Use memoization for efficiency"
  }
}
```

### 4. `listAIServices`

List available AI services and their status

**Parameters:** None

**Example:**

```json
{
  "name": "listAIServices",
  "arguments": {}
}
```

---

## 📝 Existing Tools (Still Available)

- `listAIModels` - List available AI models
- `getAIModelInfo` - Get detailed information about AI models

---

## 🧪 Testing the Tools

### Test with curl

**List AI Services:**

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "listAIServices",
      "arguments": {}
    }
  }'
```

**Generate Text:**

```bash
curl -X POST http://localhost:3111/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "generateText",
      "arguments": {
        "prompt": "Write a short poem about AI",
        "provider": "auto"
      }
    }
  }'
```

---

## 🔒 Security

✅ API keys stored in `.env` (gitignored)  
✅ Keys never logged or exposed in errors  
✅ Validation on startup  
✅ Clear error messages if keys missing

---

## 🚀 Adding New Tools

To add a new AI tool:

1. **Open `src/tools/ai-tools.ts`**
2. **Add a new tool registration:**

```typescript
server.tool(
  "yourToolName",
  "Tool description",
  {
    param1: z.string().describe("..."),
    param2: z.number().optional(),
  },
  async ({ param1, param2 }) => {
    try {
      // Get AI service
      const aiService = AIServiceFactory.getAvailableService();
      if (!aiService) {
        return createErrorResponse(null, "No AI service available");
      }

      // Call AI
      const result = await aiService.generateText(...);

      // Return formatted response
      return textResponse(result);
    } catch (error) {
      logError("yourToolName", error);
      return createErrorResponse(error);
    }
  }
);
```

3. **The tool will automatically be available in MCP!**

---

## 📊 Response Format

All tools return MCP-compatible responses:

```typescript
{
  content: [
    {
      type: "text",
      text: "Response text here",
    },
  ];
}
```

---

## 🐛 Troubleshooting

### "No AI service available" Error

**Solution:** Add API keys to `.env` file:

```env
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
```

### API Key Invalid

**Solution:**

1. Verify key is correct
2. Check key has proper permissions
3. Ensure no extra spaces in `.env` file

### Tool Not Appearing

**Solution:**

1. Restart the server: `npm run dev`
2. Check server logs for errors
3. Verify tool is registered in `ai-tools.ts`

---

## ✨ Next Steps

1. ✅ **Add your API keys** to `.env` file
2. ✅ **Start the server**: `npm run dev`
3. ✅ **Test tools** using curl or Cursor IDE
4. ✅ **Add more tools** as needed using the pattern above

---

## 📚 Share Your Markdown File

When you're ready, share your markdown file with:

- API documentation
- Tool specifications
- Example requests/responses

I'll help you implement custom tools based on your specific requirements!

---

**Status**: ✅ Ready to use!  
**Tools Available**: 7 (2 existing + 4 new AI tools + 1 service status)  
**AI Providers**: OpenAI, Anthropic (configurable)
