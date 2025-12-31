# Quick Start: LLM-Powered Repository Analysis

## 🚀 Use It Now

### Basic Usage (No LLM)
```json
{
  "projectPath": ".",
  "deepAnalysis": true
}
```

### With LLM Enhancement
```json
{
  "projectPath": ".",
  "useLLM": true,
  "llmPrompt": "Extract all utility functions, identify coding standards, and provide recommendations",
  "llmProvider": "auto"
}
```

---

## ⚙️ Setup (One Time)

### 1. Add LLM API Keys (Optional)

Add to `.env`:
```env
OPENAI_API_KEY=sk-your-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-key
```

### 2. Create API Endpoint (Required)

Create `POST /api/repositories/{id}/analysis` endpoint.

**See:** `docs/API_ENDPOINT_SPECIFICATION.md`

---

## 📊 What You Get

After running, you can query:

- ✅ **Repository Info** - Name, branch, commit, git config
- ✅ **README** - Saved separately, easy to fetch
- ✅ **Utility Functions** - All with full details
- ✅ **Coding Standards** - Naming, patterns, best practices
- ✅ **Folder Structure** - Complete tree
- ✅ **Architecture** - Layers and patterns
- ✅ **LLM Insights** - Strengths, improvements, recommendations

---

## 🔍 Query Examples

```bash
# Get full analysis
GET /api/repositories/{id}/analysis

# Get utility functions
GET /api/repositories/{id}/analysis/functions?category=utility

# Get LLM insights
GET /api/repositories/{id}/analysis/llm-insights
```

---

## 📚 Full Documentation

- **Complete Guide:** `docs/COMPLETE_IMPLEMENTATION_GUIDE.md`
- **LLM Features:** `docs/LLM_POWERED_REPOSITORY_ANALYSIS.md`
- **API Endpoints:** `docs/API_ENDPOINTS_FOR_QUERYING_REPOSITORY_DATA.md`
- **API Spec:** `docs/API_ENDPOINT_SPECIFICATION.md`

---

## ✅ That's It!

Everything is implemented and ready to use! 🎉



