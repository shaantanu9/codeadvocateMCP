# Testing and Verification Guide

## Overview
This document provides a comprehensive guide for testing and verifying the repository tools and codebase improvements.

## Quick Test Commands

### 1. Test Repository Feedback Tools
```bash
# Basic test
./scripts/test-repository-feedback-tools.sh

# With specific repository ID
./scripts/test-repository-feedback-tools.sh <repository-id>

# With custom API URL
EXTERNAL_API_URL=http://localhost:5656 ./scripts/test-repository-feedback-tools.sh
```

### 2. TypeScript Compilation Check
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Build the project
npm run build
```

### 3. Linter Check
```bash
# Check for linter errors
npm run lint

# Or use the linter directly
npx eslint src/
```

## Verification Checklist

### ✅ Code Quality
- [x] All tools use `buildQueryParams` utility
- [x] All list tools use `buildPaginationParams` with validation
- [x] Pagination limits enforced (min: 1, max: 100)
- [x] Consistent error handling across all tools
- [x] Comprehensive logging with `toolCallLogger`
- [x] Type-safe parameter handling

### ✅ Query Parameter Utilities
- [x] `buildQueryParams` handles camelCase to snake_case conversion
- [x] `buildPaginationParams` validates and normalizes pagination
- [x] Both utilities filter undefined/null values
- [x] Utilities are properly typed

### ✅ Repository Feedback Tools
- [x] `listRepositoryFeedback` - Pagination and filtering
- [x] `getRepositoryFeedbackStats` - Statistics endpoint
- [x] `createRepositoryFeedback` - Create with validation
- [x] `getRepositoryFeedback` - Get single feedback
- [x] `updateRepositoryFeedback` - Update feedback
- [x] `getRepositoryFeedbackNotifications` - Notifications with pagination
- [x] `listRepositoryFeedbackSavedFilters` - List saved filters
- [x] `createRepositoryFeedbackSavedFilter` - Create saved filter
- [x] `getRepositoryFeedbackSavedFilter` - Get saved filter
- [x] `updateRepositoryFeedbackSavedFilter` - Update saved filter
- [x] `deleteRepositoryFeedbackSavedFilter` - Delete saved filter

### ✅ Standardized Tools
- [x] `listRepositoryRules` - Uses query-params utilities
- [x] `listRepositoryPrRules` - Uses query-params utilities
- [x] `listRepositories` - Uses query-params utilities
- [x] `listRepositoryFiles` - Already has validation
- [x] `listRepositoryFeedback` - Uses query-params utilities
- [x] `getRepositoryFeedbackNotifications` - Uses query-params utilities

## Test Scenarios

### Scenario 1: Pagination Validation
**Test**: Verify that pagination limits are enforced
```typescript
// Should normalize to max 100
const pagination = buildPaginationParams(1, 200, 1, 20, 100);
// Expected: { page: 1, limit: 100 }

// Should normalize to min 1
const pagination = buildPaginationParams(0, 10, 1, 20, 100);
// Expected: { page: 1, limit: 10 }
```

### Scenario 2: Query Parameter Building
**Test**: Verify camelCase to snake_case conversion
```typescript
const params = {
  dateFrom: "2024-01-01",
  dateTo: "2024-01-31",
  page: 1,
  limit: 20,
};

const queryParams = buildQueryParams(params, {
  dateFrom: "date_from",
  dateTo: "date_to",
});

// Expected: { date_from: "2024-01-01", date_to: "2024-01-31", page: 1, limit: 20 }
```

### Scenario 3: Date Range Transformation
**Test**: Verify dateRange transformation in saved filters
```typescript
const filterData = {
  status: "open",
  dateRange: {
    from: "2024-01-01T00:00:00Z",
    to: "2024-01-31T23:59:59Z",
  },
};

// After transformation
const transformed = {
  status: "open",
  date_range: {
    from: "2024-01-01T00:00:00Z",
    to: "2024-01-31T23:59:59Z",
  },
};
```

## API Endpoint Testing

### Test Repository Feedback Endpoints
```bash
# List feedback
curl -X GET "http://localhost:5656/api/repositories/{repo-id}/feedback?page=1&limit=20" \
  -H "Authorization: Bearer $API_KEY"

# Get stats
curl -X GET "http://localhost:5656/api/repositories/{repo-id}/feedback/stats" \
  -H "Authorization: Bearer $API_KEY"

# Create feedback
curl -X POST "http://localhost:5656/api/repositories/{repo-id}/feedback" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "title": "Test Feedback",
    "description": "Test description",
    "category": "feature_request",
    "priority": "medium"
  }'
```

## Performance Testing

### Load Testing
```bash
# Test pagination with large limits
for i in {1..10}; do
  curl -X GET "http://localhost:5656/api/repositories/{repo-id}/feedback?limit=100" \
    -H "Authorization: Bearer $API_KEY"
done
```

### Concurrent Requests
```bash
# Test concurrent requests
for i in {1..5}; do
  curl -X GET "http://localhost:5656/api/repositories/{repo-id}/feedback" \
    -H "Authorization: Bearer $API_KEY" &
done
wait
```

## Error Handling Verification

### Test Invalid Pagination
```typescript
// Should handle negative page
const pagination = buildPaginationParams(-1, 10, 1, 20, 100);
// Expected: { page: 1, limit: 10 }

// Should handle limit > max
const pagination = buildPaginationParams(1, 200, 1, 20, 100);
// Expected: { page: 1, limit: 100 }
```

### Test Missing Parameters
```typescript
// Should use defaults
const pagination = buildPaginationParams(undefined, undefined, 1, 20, 100);
// Expected: { page: 1, limit: 20 }
```

## Logging Verification

### Check Tool Call Logs
```bash
# View today's logs
cat logs/tool-calls/tool-calls-$(date +%Y-%m-%d).log | jq '.'

# View failed calls
cat logs/tool-calls-failed/tool-calls-$(date +%Y-%m-%d).log | jq '.'

# Get statistics
node scripts/view-tool-logs.js
```

## Integration Testing

### End-to-End Test Flow
1. **Create Repository** (if needed)
2. **Create Feedback** - Verify creation
3. **List Feedback** - Verify pagination and filtering
4. **Get Stats** - Verify statistics
5. **Update Feedback** - Verify update
6. **Create Saved Filter** - Verify filter creation
7. **List Saved Filters** - Verify filter listing

## Known Issues

### Non-Critical Issues
- Some endpoints require user context (not testable with API key alone)
- Table existence checks may return 503 (expected for new repositories)

### Resolved Issues
- ✅ Pagination validation now enforced
- ✅ Query parameter building standardized
- ✅ Date range transformation fixed
- ✅ Type safety improved

## Continuous Improvement

### Monitoring
- Review tool call logs regularly
- Monitor failed calls for patterns
- Track execution times for performance

### Optimization Opportunities
- Consider caching for frequently accessed data
- Implement request batching for bulk operations
- Add retry logic for transient failures


