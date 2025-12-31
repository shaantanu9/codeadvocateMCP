# LLM-Powered Repository Analysis

## 🚀 Overview

The `analyzeAndSaveRepository` tool now supports **LLM-powered analysis** using OpenAI or Anthropic (Claude) to provide deeper insights into your codebase.

---

## ✨ Features

### 1. **Natural Language Analysis**
- Pass a custom prompt to analyze specific aspects
- LLM understands code context and patterns
- Extracts insights that static analysis might miss

### 2. **Enhanced Function Documentation**
- LLM provides descriptions for utility functions
- Understands function purposes and relationships
- Categorizes functions more accurately

### 3. **Coding Standards Detection**
- Identifies naming conventions
- Detects architectural patterns
- Recognizes best practices

### 4. **Architectural Insights**
- Identifies design patterns
- Analyzes architectural decisions
- Provides recommendations

### 5. **LLM Insights**
- Strengths of the codebase
- Areas for improvement
- Recommendations for better practices

---

## 📖 Usage

### Basic LLM Analysis

```json
{
  "useLLM": true,
  "llmProvider": "auto"
}
```

This will:
- Use the first available LLM service (OpenAI or Anthropic)
- Analyze the repository with default prompts
- Enhance function documentation
- Extract coding standards and patterns

### Custom Prompt Analysis

```json
{
  "useLLM": true,
  "llmPrompt": "Analyze this repository and extract all utility functions, identify the main architectural patterns, and provide recommendations for improving code organization",
  "llmProvider": "anthropic"
}
```

### Complete Example

```json
{
  "projectPath": ".",
  "repositoryId": "optional-repo-id",
  "projectId": "optional-project-id",
  "deepAnalysis": true,
  "useLLM": true,
  "llmPrompt": "Focus on extracting all helper functions and utility methods, identify coding patterns, and suggest improvements",
  "llmProvider": "openai"
}
```

---

## 🔧 Setup

### 1. Configure API Keys

Add to your `.env` file:

```env
# OpenAI (optional)
OPENAI_API_KEY=sk-your-openai-key-here
DEFAULT_OPENAI_MODEL=gpt-4

# Anthropic (optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
DEFAULT_ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

**At least one API key is required for LLM analysis.**

### 2. Use the Tool

The tool will automatically:
- Detect available LLM services
- Use the specified provider (or auto-select)
- Enhance analysis with LLM insights
- Save all data including LLM insights

---

## 📊 What LLM Enhances

### 1. **Utility Functions**
- Adds descriptions for each function
- Understands function purposes
- Categorizes more accurately

### 2. **Coding Standards**
- Detects naming conventions
- Identifies patterns
- Recognizes best practices

### 3. **Architecture**
- Identifies design patterns
- Analyzes architectural decisions
- Maps relationships

### 4. **Insights**
- Strengths of the codebase
- Areas for improvement
- Actionable recommendations

---

## 💾 Saved Data Structure

When LLM is used, the analysis includes:

```typescript
{
  // ... all standard analysis data ...
  llmInsights: {
    strengths: string[];        // What the codebase does well
    improvements: string[];     // Areas that could be improved
    recommendations: string[];   // Actionable recommendations
    patterns: string[];          // Detected patterns
    decisions: string[];         // Architectural decisions
    provider: string;            // "OpenAI" or "Anthropic"
    enhanced: boolean;            // true
  }
}
```

---

## 🔍 Querying LLM Insights

### Using Dedicated Endpoint (if created)
```bash
GET /api/repositories/{id}/analysis/llm-insights
```

### Using Full Analysis
```bash
GET /api/repositories/{id}/analysis
# Extract: response.llmInsights
```

### Using Existing Endpoints
```bash
# From comprehensive analysis file
GET /api/repositories/{id}/files?search=repository-analysis
# Parse JSON and extract llmInsights
```

---

## 🎯 Example Prompts

### Extract Utility Functions
```
"Analyze this repository and extract all utility functions, helper methods, and helper classes. For each, provide a clear description of what it does and categorize it."
```

### Identify Patterns
```
"Identify all design patterns used in this codebase (e.g., Factory, Singleton, Observer, etc.) and explain where they are used."
```

### Coding Standards
```
"Analyze the coding standards in this repository: naming conventions, file organization, import patterns, error handling approaches, and testing practices."
```

### Architecture Analysis
```
"Analyze the architecture of this codebase: identify layers, patterns, dependencies between modules, and provide recommendations for improvement."
```

### Complete Analysis
```
"Perform a comprehensive analysis of this repository: extract utility functions, identify coding standards, detect architectural patterns, analyze design decisions, and provide actionable recommendations for improvement."
```

---

## ⚙️ Configuration

### LLM Provider Options

- **`"auto"`** (default): Uses first available service
- **`"openai"`**: Uses OpenAI (requires `OPENAI_API_KEY`)
- **`"anthropic"`**: Uses Anthropic/Claude (requires `ANTHROPIC_API_KEY`)

### Model Selection

Models are automatically selected based on:
- `DEFAULT_OPENAI_MODEL` env var (default: `gpt-4`)
- `DEFAULT_ANTHROPIC_MODEL` env var (default: `claude-3-sonnet-20240229`)

---

## 📈 Benefits

1. **Deeper Understanding**: LLM understands code context and relationships
2. **Better Documentation**: Automatic function descriptions
3. **Pattern Recognition**: Identifies patterns static analysis might miss
4. **Actionable Insights**: Provides recommendations for improvement
5. **Natural Language**: Use prompts in plain English

---

## 🔄 Workflow

1. **Static Analysis** (always runs)
   - Extracts functions, structure, dependencies
   - Detects patterns, coding standards
   - Builds comprehensive analysis

2. **LLM Enhancement** (if `useLLM: true`)
   - Analyzes repository with natural language understanding
   - Enhances function documentation
   - Provides insights and recommendations
   - Merges with static analysis

3. **Save to API**
   - Saves complete analysis (static + LLM)
   - All data properly structured
   - Queryable via API endpoints

---

## 💡 Tips

1. **Be Specific**: Custom prompts get better results
2. **Use Auto**: Let the tool select the best available LLM
3. **Combine Approaches**: Static analysis + LLM = best results
4. **Cache Results**: Use `useCache: true` to avoid re-analysis
5. **Query Insights**: Use API endpoints to fetch LLM insights later

---

## 🎉 Result

After running with LLM:

```
✅ Analyzed repository "my-repo" with LLM enhancement:
- Repository ID: abc123 (created)
- Project ID: def456 (created)
- Comprehensive Analysis saved: ✅ (ID: analysis789)
- LLM Enhanced: ✅ (Provider: Anthropic)
- Utility functions extracted: 42 (with descriptions)
- LLM Insights: ✅ (strengths, improvements, recommendations)
- Coding standards: ✅ Enhanced
- Architecture patterns: ✅ Identified
```

All data is saved and ready to query! 🚀



