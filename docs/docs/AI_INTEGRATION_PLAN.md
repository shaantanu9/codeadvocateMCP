# 🤖 AI API Integration Plan for MCP Server

## Overview
This plan outlines how to integrate AI APIs (OpenAI, Anthropic, etc.) into the MCP server with multiple tools, each calling different AI endpoints and handling results properly.

---

## 📋 Architecture Plan

### 1. **Project Structure**
```
demo_mcp/
├── src/
│   ├── index.ts                 # Main server file
│   ├── tools/                   # Tool implementations
│   │   ├── ai-tools.ts         # AI-related tools
│   │   └── base-tool.ts        # Base tool utilities
│   ├── services/               # External API services
│   │   ├── openai-service.ts   # OpenAI API client
│   │   ├── anthropic-service.ts # Anthropic API client
│   │   └── ai-service-factory.ts # Factory for AI services
│   ├── config/                  # Configuration
│   │   └── env.ts              # Environment variable handling
│   └── utils/                   # Utilities
│       ├── error-handler.ts    # Error handling utilities
│       └── response-formatter.ts # Response formatting
├── .env.example                 # Example environment file
├── .env                         # Actual environment file (gitignored)
└── package.json
```

### 2. **Key Components**

#### A. Environment Configuration
- Use `.env` file for API keys
- Support multiple AI providers
- Validate API keys on startup
- Provide clear error messages if keys are missing

#### B. AI Service Layer
- Abstract AI provider calls
- Handle rate limiting
- Implement retry logic
- Format responses consistently

#### C. Tool Layer
- Each tool is independent
- Tools call AI services
- Tools format responses for MCP
- Tools handle errors gracefully

#### D. Error Handling
- Catch API errors
- Return user-friendly messages
- Log errors for debugging
- Don't expose API keys in errors

---

## 🔧 Implementation Plan

### Phase 1: Setup & Configuration

#### 1.1 Install Required Dependencies
```bash
npm install openai @anthropic-ai/sdk dotenv
npm install -D @types/node
```

#### 1.2 Create Environment Configuration
- Create `.env.example` with template
- Create `.env` file (gitignored)
- Create `src/config/env.ts` to load and validate env vars

#### 1.3 API Key Management
- Store API keys in `.env` file
- Never commit `.env` to git
- Validate keys on server startup
- Support optional keys (some tools may not need all APIs)

### Phase 2: AI Service Layer

#### 2.1 Create Base AI Service Interface
```typescript
interface AIService {
  generateText(prompt: string, options?: any): Promise<string>;
  // Add other common methods
}
```

#### 2.2 Implement Provider Services
- OpenAI service wrapper
- Anthropic service wrapper
- Generic service that can be extended

#### 2.3 Service Factory
- Factory pattern to create services
- Lazy initialization (only create if API key exists)
- Error handling for missing keys

### Phase 3: Tool Implementation

#### 3.1 Tool Structure Pattern
Each tool should:
1. Accept parameters via Zod schema
2. Call appropriate AI service
3. Format response for MCP
4. Handle errors gracefully
5. Log operations

#### 3.2 Example Tool Pattern
```typescript
server.tool(
  "toolName",
  "Tool description",
  {
    param1: z.string().describe("..."),
    param2: z.number().optional(),
  },
  async ({ param1, param2 }) => {
    try {
      // Call AI service
      const result = await aiService.generateText(...);
      
      // Format for MCP
      return {
        content: [{
          type: "text",
          text: result
        }]
      };
    } catch (error) {
      // Handle error
      return errorResponse(error);
    }
  }
);
```

### Phase 4: Response Handling

#### 4.1 Response Formatting
- Consistent response structure
- Support text, JSON, and structured content
- Include metadata when useful

#### 4.2 Error Responses
- User-friendly error messages
- Don't expose internal details
- Log full errors server-side
- Return proper MCP error format

---

## 🔐 Security Best Practices

### 1. API Key Management
- ✅ Store in `.env` file (gitignored)
- ✅ Never log API keys
- ✅ Validate keys on startup
- ✅ Support key rotation
- ❌ Never hardcode keys
- ❌ Never expose in error messages

### 2. Environment Variables
```env
# AI Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Model defaults
DEFAULT_OPENAI_MODEL=gpt-4
DEFAULT_ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Server Configuration
PORT=3111
NODE_ENV=development
```

### 3. Validation
- Check API keys exist before using
- Validate key format (if possible)
- Provide clear error if key missing
- Support tools that don't require keys

---

## 📝 Tool Examples

### Example 1: Text Generation Tool
```typescript
server.tool(
  "generateText",
  "Generate text using AI",
  {
    prompt: z.string().describe("The prompt to generate text"),
    model: z.string().optional().describe("Model to use"),
    maxTokens: z.number().optional().describe("Max tokens"),
  },
  async ({ prompt, model, maxTokens }) => {
    const result = await openaiService.generateText(prompt, { model, maxTokens });
    return { content: [{ type: "text", text: result }] };
  }
);
```

### Example 2: Analysis Tool
```typescript
server.tool(
  "analyzeText",
  "Analyze text using AI",
  {
    text: z.string().describe("Text to analyze"),
    analysisType: z.enum(["sentiment", "summary", "keywords"]),
  },
  async ({ text, analysisType }) => {
    const prompt = buildAnalysisPrompt(text, analysisType);
    const result = await aiService.generateText(prompt);
    return { content: [{ type: "text", text: result }] };
  }
);
```

### Example 3: Code Generation Tool
```typescript
server.tool(
  "generateCode",
  "Generate code using AI",
  {
    description: z.string().describe("Code description"),
    language: z.string().describe("Programming language"),
    requirements: z.string().optional(),
  },
  async ({ description, language, requirements }) => {
    const prompt = buildCodePrompt(description, language, requirements);
    const result = await aiService.generateText(prompt);
    return { 
      content: [
        { type: "text", text: result },
        { type: "code", language, text: result }
      ]
    };
  }
);
```

---

## 🚀 Implementation Steps

### Step 1: Setup Environment
1. Create `.env.example` template
2. Create `.env` file
3. Add `.env` to `.gitignore`
4. Create `src/config/env.ts`

### Step 2: Install Dependencies
1. Install AI SDK packages
2. Install dotenv
3. Update package.json

### Step 3: Create Service Layer
1. Create base service interface
2. Implement OpenAI service
3. Implement Anthropic service
4. Create service factory

### Step 4: Create Tools
1. Create tool directory structure
2. Implement first tool
3. Test tool
4. Add more tools incrementally

### Step 5: Error Handling
1. Create error handler utility
2. Add error handling to all tools
3. Test error scenarios

### Step 6: Testing
1. Test each tool individually
2. Test with missing API keys
3. Test error scenarios
4. Test with Cursor IDE

---

## 📊 Response Format Standards

### Success Response
```typescript
{
  content: [
    {
      type: "text",
      text: "Result text here"
    }
  ]
}
```

### Error Response
```typescript
{
  content: [
    {
      type: "text",
      text: "Error: User-friendly error message"
    }
  ]
}
```

### Structured Response
```typescript
{
  content: [
    {
      type: "text",
      text: "Summary"
    },
    {
      type: "code",
      language: "json",
      text: JSON.stringify(data, null, 2)
    }
  ]
}
```

---

## 🔍 Questions to Clarify

Before implementation, please share:

1. **Which AI providers do you want to use?**
   - OpenAI (GPT-4, GPT-3.5)
   - Anthropic (Claude)
   - Others?

2. **What types of tools do you need?**
   - Text generation
   - Code generation
   - Analysis
   - Translation
   - Other?

3. **What's in the markdown file you'll share?**
   - API documentation?
   - Tool specifications?
   - Example requests/responses?

4. **Do you have API keys ready?**
   - Which providers?
   - Test or production keys?

5. **Any specific requirements?**
   - Rate limiting?
   - Caching?
   - Streaming responses?
   - Cost tracking?

---

## 📚 Next Steps

1. **Review this plan**
2. **Share your markdown file** with API details
3. **Answer clarifying questions** above
4. **I'll implement** the solution step by step

---

## 🛠️ Ready to Implement

Once you share the markdown file and answer the questions, I'll:
1. Set up the environment configuration
2. Create the AI service layer
3. Implement the tools based on your specifications
4. Add proper error handling
5. Test everything
6. Document the usage

Let's make this work! 🚀

