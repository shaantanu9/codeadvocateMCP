# Tool Call Logging System

**Date:** 2025-01-23  
**Status:** ✅ **IMPLEMENTED**

---

## 📊 Overview

Comprehensive logging system that tracks all tool calls with detailed information including:
- Tool name and parameters
- Success/failure status
- Error details for failures
- Execution time
- Timestamp and request ID

---

## 📁 Log File Structure

### Log Directories
```
logs/
├── tool-calls/              # All tool calls (success + failure)
│   └── tool-calls-YYYY-MM-DD.log
└── tool-calls-failed/       # Failed tool calls only
    └── tool-calls-YYYY-MM-DD.log
```

### Log File Format

Each log entry is a JSON object on a single line (JSONL format):

```json
{
  "timestamp": "2025-01-23T10:30:45.123Z",
  "requestId": "req_123456",
  "toolName": "createRepositoryRule",
  "status": "success",
  "params": {
    "repositoryId": "repo-123",
    "title": "Test Rule",
    "ruleContent": "Content here"
  },
  "executionTimeMs": 245,
  "result": {
    "success": true,
    "message": "Created rule for repository: repo-123"
  }
}
```

**Failed Call Example:**
```json
{
  "timestamp": "2025-01-23T10:31:12.456Z",
  "requestId": "req_123457",
  "toolName": "createRepositoryRule",
  "status": "failure",
  "params": {
    "repositoryId": "repo-123",
    "title": "Test Rule"
  },
  "executionTimeMs": 120,
  "error": {
    "name": "ExternalApiError",
    "message": "Failed to create repository rule: API returned 500",
    "stack": "Error: ...",
    "details": {}
  }
}
```

---

## 🔧 Implementation

### Base Tool Handler Integration

All tools automatically log their calls through `BaseToolHandler`:

```typescript
class MyTool extends BaseToolHandler {
  async execute(params: MyParams): Promise<FormattedResponse> {
    // Start logging (returns startTime)
    const { startTime } = this.logStart(this.name, params);

    try {
      // Tool logic here
      const result = await someOperation();
      
      // Log success
      this.logSuccess(this.name, params, startTime, {
        success: true,
        message: "Operation completed",
      });
      
      return jsonResponse(result);
    } catch (error) {
      // Log failure (automatically handles error details)
      return this.handleError(
        this.name,
        error,
        "Failed to execute operation",
        params,
        startTime
      );
    }
  }
}
```

### Automatic Logging

The logging system automatically:
- ✅ Captures tool name and all parameters
- ✅ Tracks execution time
- ✅ Logs success with result summary
- ✅ Logs failures with full error details (name, message, stack)
- ✅ Includes request ID for tracing
- ✅ Writes to both main log and failed log (for failures)

---

## 📊 Viewing Logs

### Option 1: Using the Node.js Script (Recommended)

```bash
# View today's logs
node scripts/view-tool-logs.js

# View specific date
node scripts/view-tool-logs.js 2025-01-23
```

**Output includes:**
- Statistics (total, successful, failed, success rate)
- Failed tools summary
- Recent failed calls (last 10)
- Recent successful calls (last 10)

### Option 2: Using the Bash Script

```bash
# View today's logs
./scripts/view-tool-logs.sh

# View specific date
./scripts/view-tool-logs.sh 2025-01-23
```

### Option 3: Direct File Access

```bash
# View all logs for today
cat logs/tool-calls/tool-calls-2025-01-23.log | jq '.'

# View only failed calls
cat logs/tool-calls-failed/tool-calls-2025-01-23.log | jq '.'

# View specific tool
grep '"toolName":"createRepositoryRule"' logs/tool-calls/tool-calls-2025-01-23.log | jq '.'

# Count failures by tool
grep '"status":"failure"' logs/tool-calls/tool-calls-2025-01-23.log | \
  grep -o '"toolName":"[^"]*"' | \
  sort | uniq -c | sort -rn
```

---

## 🔍 Log Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp |
| `requestId` | string? | Request ID for tracing |
| `toolName` | string | Name of the tool called |
| `status` | "success" \| "failure" | Execution status |
| `params` | object | All parameters passed to the tool |
| `executionTimeMs` | number? | Execution time in milliseconds |
| `error` | object? | Error details (only for failures) |
| `result` | object? | Result summary (only for successes) |

### Error Object Structure

```typescript
{
  name: string;        // Error class name
  message: string;    // Error message
  stack?: string;     // Stack trace (if available)
  details?: unknown;  // Additional error details
}
```

### Result Object Structure

```typescript
{
  success: boolean;
  message?: string;   // Success message
  dataSize?: number;  // Size of returned data
}
```

---

## 📈 Statistics

The logging system provides statistics:

```typescript
import { toolCallLogger } from "./core/tool-call-logger.js";

const stats = toolCallLogger.getStatistics("2025-01-23");
console.log(stats);
// {
//   total: 150,
//   successful: 142,
//   failed: 8,
//   successRate: 94.67,
//   averageExecutionTime: 245,
//   failedTools: [
//     { toolName: "createRepositoryRule", count: 3 },
//     { toolName: "updateRepositoryFile", count: 2 },
//     ...
//   ]
// }
```

---

## 🎯 Use Cases

### 1. Debugging Failed Tool Calls

```bash
# Find all failures for a specific tool
grep '"toolName":"createRepositoryRule"' logs/tool-calls-failed/tool-calls-2025-01-23.log | jq '.'

# Find failures with specific error
grep '"message":"API returned 500"' logs/tool-calls-failed/tool-calls-2025-01-23.log | jq '.'
```

### 2. Performance Analysis

```bash
# Find slow tool calls (>1 second)
cat logs/tool-calls/tool-calls-2025-01-23.log | \
  jq 'select(.executionTimeMs > 1000) | {toolName, executionTimeMs, timestamp}'
```

### 3. Parameter Analysis

```bash
# See what parameters were used for failed calls
cat logs/tool-calls-failed/tool-calls-2025-01-23.log | \
  jq '{toolName, params, error: .error.message}'
```

### 4. Daily Reports

```bash
# Generate daily statistics
node scripts/view-tool-logs.js 2025-01-23
```

---

## 🔧 Configuration

### Log Directory

Logs are stored in:
- `logs/tool-calls/` - All tool calls
- `logs/tool-calls-failed/` - Failed calls only

### Log Retention

Currently, logs are kept indefinitely. You can implement cleanup:

```bash
# Remove logs older than 30 days
find logs/tool-calls -name "*.log" -mtime +30 -delete
find logs/tool-calls-failed -name "*.log" -mtime +30 -delete
```

---

## ✅ Benefits

1. **Complete Audit Trail**: Every tool call is logged with full context
2. **Easy Debugging**: Failed calls include full error details and parameters
3. **Performance Monitoring**: Execution times tracked for all calls
4. **Parameter Tracking**: See exactly what parameters were used
5. **Request Tracing**: Request IDs link related operations
6. **Separate Failed Logs**: Easy to find and analyze failures
7. **JSON Format**: Easy to parse and analyze with tools like `jq`

---

## 📝 Example Workflow

### Debugging a Failed Tool Call

1. **Check recent failures:**
   ```bash
   node scripts/view-tool-logs.js
   ```

2. **Find specific tool failures:**
   ```bash
   grep '"toolName":"createRepositoryRule"' logs/tool-calls-failed/tool-calls-2025-01-23.log | jq '.'
   ```

3. **Extract parameters to retry:**
   ```bash
   cat logs/tool-calls-failed/tool-calls-2025-01-23.log | \
     jq 'select(.toolName == "createRepositoryRule") | .params'
   ```

4. **Retry with same parameters:**
   Use the extracted parameters to test the tool again

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Log rotation (daily/weekly)
- [ ] Log compression for old logs
- [ ] Web dashboard for viewing logs
- [ ] Alerting on high failure rates
- [ ] Integration with monitoring tools
- [ ] Log aggregation across multiple instances

---

**Status:** ✅ **FULLY IMPLEMENTED AND READY TO USE**



