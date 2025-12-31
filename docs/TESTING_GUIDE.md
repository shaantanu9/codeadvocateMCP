# Testing Guide for analyzeAndSaveRepository Tool

## 🧪 Quick Test

### Simple Test (No Dependencies)
```bash
./test-analyze-repo-simple.sh
```

### Full Test Suite (Node.js)
```bash
# Set environment variables (optional)
export MCP_SERVER_URL="http://localhost:3111/mcp"
export API_KEY="your-api-key"  # Optional
export REPOSITORY_ID="repo-id"  # Optional, for API save tests
export PROJECT_ID="project-id"  # Optional, for API save tests

# Run tests
node test-analyze-repo-node.js
```

### Bash Test Suite
```bash
# Set environment variables
export MCP_SERVER_URL="http://localhost:3111/mcp"
export API_KEY="your-api-key"  # Optional
export REPOSITORY_ID="repo-id"  # Optional
export PROJECT_ID="project-id"  # Optional

# Run tests
./test-analyze-repo.sh
```

---

## 📋 Test Cases

### 1. Basic Analysis
Tests basic repository analysis without LLM or API save.

**Expected:**
- ✅ Repository info extracted
- ✅ Code structure analyzed
- ✅ Documentation generated
- ✅ Saved to local cache

### 2. Cache Test
Tests that cached analysis is used when available.

**Expected:**
- ✅ Uses cached data
- ✅ Faster response
- ✅ Same results as fresh analysis

### 3. LLM Enhancement
Tests LLM-powered analysis (requires API keys).

**Expected:**
- ✅ LLM service available
- ✅ Enhanced function descriptions
- ✅ LLM insights included
- ✅ Coding standards enhanced

### 4. Custom LLM Prompt
Tests custom prompt for LLM analysis.

**Expected:**
- ✅ Custom prompt used
- ✅ LLM responds to specific request
- ✅ Insights match prompt focus

### 5. API Save
Tests saving analysis to external API.

**Expected:**
- ✅ Repository created/found
- ✅ Project created/found
- ✅ Analysis saved to API
- ✅ All data properly structured

### 6. Complete Analysis
Tests full workflow: LLM + API save.

**Expected:**
- ✅ All features working
- ✅ Complete data saved
- ✅ LLM insights included
- ✅ Queryable via API

---

## 🔍 Manual Testing

### Test 1: Basic Analysis
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
  }'
```

### Test 2: With LLM
```bash
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "analyzeAndSaveRepository",
      "arguments": {
        "projectPath": ".",
        "useLLM": true,
        "llmProvider": "auto",
        "deepAnalysis": true
      }
    }
  }'
```

### Test 3: With API Save
```bash
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "analyzeAndSaveRepository",
      "arguments": {
        "projectPath": ".",
        "repositoryId": "your-repo-id",
        "projectId": "your-project-id",
        "deepAnalysis": true
      }
    }
  }'
```

### Test 4: Complete (LLM + API)
```bash
curl -X POST "http://localhost:3111/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "analyzeAndSaveRepository",
      "arguments": {
        "projectPath": ".",
        "repositoryId": "your-repo-id",
        "projectId": "your-project-id",
        "useLLM": true,
        "llmPrompt": "Extract utility functions and coding standards",
        "llmProvider": "auto",
        "deepAnalysis": true
      }
    }
  }'
```

---

## ✅ Verification Checklist

After running tests, verify:

- [ ] Repository info extracted correctly
- [ ] README and docs read successfully
- [ ] Folder structure built
- [ ] Utility functions extracted
- [ ] Coding standards detected
- [ ] Architecture patterns identified
- [ ] Linting configs found
- [ ] Dependencies parsed
- [ ] Entry points detected
- [ ] Local cache working
- [ ] LLM enhancement (if enabled)
- [ ] API save (if IDs provided)
- [ ] All data properly structured

---

## 🐛 Troubleshooting

### Issue: "Not a git repository"
**Solution:** Run from a git repository directory

### Issue: "LLM service not available"
**Solution:** Add API keys to `.env`:
```env
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
```

### Issue: "API save failed"
**Solution:** 
- Check API server is running
- Verify API key is correct
- Check repositoryId/projectId are valid

### Issue: "Cache not working"
**Solution:**
- Check `.cache/repository-analysis/` directory exists
- Try `forceRefresh: true` to bypass cache

---

## 📊 Expected Output

### Success Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Analyzed repository \"demo_mcp\" and initialized project:\n- Repository ID: abc123 (created)\n- Project ID: def456 (created)\n- Comprehensive Analysis saved: ✅ (ID: analysis789)\n..."
      }
    ]
  }
}
```

### Error Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": {
      "message": "Error details here"
    }
  }
}
```

---

## 🚀 Next Steps

After successful testing:

1. **Verify Data Saved:**
   - Check API for saved analysis
   - Query saved data using endpoints
   - Verify LLM insights (if used)

2. **Test Querying:**
   - Use `getCachedRepositoryAnalysis` tool
   - Query via API endpoints
   - Verify all data accessible

3. **Performance:**
   - Test with large repositories
   - Verify caching improves speed
   - Check memory usage

---

## 📝 Notes

- Tests run from current directory (`.`)
- Make sure you're in a git repository
- LLM tests require API keys
- API save tests require valid IDs
- Cache tests need previous analysis



