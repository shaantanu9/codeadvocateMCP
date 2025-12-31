# Quick Test Guide

## 🚀 Fastest Way to Test

### Option 1: Simple Bash Test (Recommended)
```bash
./test-analyze-repo-simple.sh
```

### Option 2: Manual curl Test
```bash
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "analyzeAndSaveRepository",
      "arguments": {
        "projectPath": ".",
        "deepAnalysis": true,
        "useCache": false,
        "forceRefresh": true
      }
    }
  }' | jq '.'
```

### Option 3: Full Test Suite
```bash
# Node.js version (more detailed)
node test-analyze-repo-node.js

# Bash version
./test-analyze-repo.sh
```

---

## ✅ What to Check

After running, you should see:

1. **Repository Info:**
   - Name, branch, commit
   - Remote URL (if configured)
   - Git config

2. **Analysis Results:**
   - File count
   - Languages detected
   - Entry points
   - Dependencies
   - Architecture layers

3. **Cache Status:**
   - Saved to `.cache/repository-analysis/`
   - Can be reused

4. **LLM Enhancement (if enabled):**
   - Provider used
   - Insights count
   - Enhanced descriptions

5. **API Save (if IDs provided):**
   - Repository ID
   - Project ID
   - Analysis ID

---

## 🎯 Test Scenarios

### Scenario 1: Basic Test
```bash
# Just analyze, no LLM, no API
./test-analyze-repo-simple.sh
```

### Scenario 2: With LLM
```bash
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "analyzeAndSaveRepository",
      "arguments": {
        "useLLM": true,
        "llmProvider": "auto"
      }
    }
  }'
```

### Scenario 3: With API Save
```bash
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "analyzeAndSaveRepository",
      "arguments": {
        "repositoryId": "your-repo-id",
        "projectId": "your-project-id"
      }
    }
  }'
```

---

## 📊 Expected Output Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Analyzed repository \"demo_mcp\"...\n- Repository ID: ...\n- Project ID: ...\n..."
      }
    ]
  }
}
```

---

## 🔧 Troubleshooting

**Issue:** Connection refused
- Make sure MCP server is running: `npm start`

**Issue:** Not a git repository
- Run from a git repository directory

**Issue:** LLM not working
- Add API keys to `.env` file

**Issue:** API save failed
- Check API server is running
- Verify repositoryId/projectId are valid

---

See `docs/TESTING_GUIDE.md` for complete testing documentation.



