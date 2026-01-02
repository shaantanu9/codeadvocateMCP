# HTTP Client Fixes - Network Error Handling

**Date:** 2026-01-02  
**Status:** ✅ Complete

## Problem Summary

The HTTP client was failing to fetch from `https://codeadvocate.vercel.app` even though the API was reachable via curl. Failures occurred with:
- "fetch failed" errors after 3 retries
- Network timeout issues
- Retry logic only retrying on 5xx HTTP errors, not network-level errors
- Linear retry delay instead of exponential backoff
- Insufficient timeout (30s) and retries (3)

---

## Root Causes Identified

### 1. Network Error Detection
- **Issue**: Retry logic only checked for `ExternalApiError` and `AbortError`
- **Problem**: Network errors like "fetch failed", DNS errors, connection timeouts were not being properly detected as retryable
- **Impact**: Network errors were not retried, causing immediate failures

### 2. Retry Configuration
- **Issue**: Only 3 retries with 30s timeout
- **Problem**: Insufficient for transient network issues
- **Impact**: Quick failures without enough retry attempts

### 3. Retry Delay Strategy
- **Issue**: Linear delay: `retryDelay * (attempt + 1)`
- **Problem**: Not optimal for network errors (should use exponential backoff)
- **Impact**: Retries happened too quickly, not giving network time to recover

### 4. Error Logging
- **Issue**: Limited error details for network failures
- **Problem**: Hard to debug network issues
- **Impact**: Difficult to diagnose root cause

---

## Solutions Implemented

### 1. Enhanced Network Error Detection ✅

Added `isRetryableError()` method that detects:
- `TypeError` (fetch failed)
- `AbortError` (timeout)
- `NetworkError`
- DNS errors (`ENOTFOUND`)
- Connection errors (`ECONNRESET`, `ECONNREFUSED`, `ETIMEDOUT`)
- Error messages containing: "fetch failed", "network error", "connection", "timeout", "dns"

**Code:**
```typescript
private isRetryableError(error: unknown): boolean {
  // Detects network-level errors that should be retried
  // Checks error name and message patterns
}
```

### 2. Increased Retry Configuration ✅

**Before:**
- Retries: 3
- Timeout: 30s (30000ms)
- Retry delay: 1000ms (linear)

**After:**
- Retries: 5 (increased)
- Timeout: 60s (60000ms) (doubled)
- Retry delay: 1000ms base (exponential backoff)

### 3. Exponential Backoff ✅

**Before:**
```typescript
await this.delay(this.config.retryDelay * (attempt + 1));
// Attempt 1: 2000ms, Attempt 2: 3000ms, Attempt 3: 4000ms
```

**After:**
```typescript
private calculateBackoffDelay(attempt: number): number {
  // Exponential backoff: 2^attempt * baseDelay
  // Cap at 30 seconds max delay
  const maxDelay = 30000;
  const delay = Math.pow(2, attempt) * this.config.retryDelay;
  return Math.min(delay, maxDelay);
}
// Attempt 1: 2000ms, Attempt 2: 4000ms, Attempt 3: 8000ms, Attempt 4: 16000ms, Attempt 5: 30000ms (capped)
```

### 4. Improved Retry Logic ✅

**Network Errors:**
- Now properly detected and retried
- Uses exponential backoff
- Logs detailed error information

**HTTP Errors:**
- 4xx errors: Not retried (client errors)
- 5xx errors: Retried with exponential backoff
- Better error logging with attempt numbers

**Code Flow:**
```typescript
1. Try fetch
2. If network error → Check if retryable → Retry with exponential backoff
3. If HTTP error → Check status code → Retry 5xx, throw 4xx
4. If success → Return data
5. If all retries exhausted → Throw ServiceUnavailableError with details
```

### 5. Enhanced Error Logging ✅

**Added logging for:**
- Network error details (name, message, stack)
- Retry attempts with backoff delay
- Elapsed time per attempt
- Total elapsed time
- Error context (endpoint, method, URL)

**Example log:**
```json
{
  "attempt": 2,
  "maxRetries": 5,
  "endpoint": "/repositories",
  "backoffDelayMs": 4000,
  "elapsedTime": 5234,
  "errorDetails": {
    "name": "TypeError",
    "message": "fetch failed",
    "stack": "..."
  }
}
```

---

## Changes Made

### Files Modified

1. **`src/infrastructure/http-client.ts`**
   - Added `isRetryableError()` method
   - Added `calculateBackoffDelay()` method with exponential backoff
   - Enhanced retry logic to handle network errors
   - Improved error logging with detailed context
   - Increased default timeout to 60s
   - Increased default retries to 5

2. **`src/application/services/external-api.service.ts`**
   - Updated HttpClient configuration:
     - `timeout: 60000` (was 30000)
     - `retries: 5` (was 3)
     - `retryDelay: 1000` (exponential backoff base)

---

## Benefits

### Reliability
- ✅ **Better network error handling** - Network errors are now properly retried
- ✅ **More retry attempts** - 5 retries instead of 3
- ✅ **Longer timeout** - 60s instead of 30s
- ✅ **Exponential backoff** - Gives network time to recover

### Observability
- ✅ **Detailed error logging** - Know exactly what failed and why
- ✅ **Retry tracking** - See each retry attempt with timing
- ✅ **Error context** - Full context for debugging

### Performance
- ✅ **Smarter retries** - Exponential backoff prevents overwhelming the API
- ✅ **Faster recovery** - Network issues recover faster with proper backoff

---

## Testing

### Test Network Error Handling

```bash
# Simulate network error (temporarily block API)
# Should see:
# - 5 retry attempts
# - Exponential backoff delays
# - Detailed error logging
# - Proper error after all retries exhausted
```

### Test HTTP Error Handling

```bash
# Test with 5xx error
# Should see:
# - Retries on 5xx errors
# - No retries on 4xx errors
# - Exponential backoff
```

### Test Success After Retry

```bash
# Test with transient network issue
# Should see:
# - Retries on network error
# - Success after retry
# - Logs show retry attempts
```

---

## Retry Behavior

### Network Errors (fetch failed, timeout, DNS, etc.)

| Attempt | Backoff Delay | Total Wait Time |
|---------|---------------|-----------------|
| 1       | 0ms           | 0ms             |
| 2       | 2000ms        | 2000ms         |
| 3       | 4000ms        | 6000ms         |
| 4       | 8000ms        | 14000ms        |
| 5       | 16000ms       | 30000ms        |
| 6       | 30000ms (cap) | 60000ms        |

**Total max wait time:** ~60 seconds (timeout) + ~60 seconds (retries) = ~120 seconds

### HTTP 5xx Errors

Same exponential backoff as network errors.

### HTTP 4xx Errors

No retries - immediate failure (client errors shouldn't be retried).

---

## Monitoring

### Key Metrics to Watch

1. **Retry Rate**: How often requests are retried
2. **Success After Retry**: How many succeed after retry
3. **Network Error Rate**: Frequency of network errors
4. **Average Retry Attempts**: How many retries before success/failure
5. **Total Request Time**: Time including retries

### Log Patterns

**Successful retry:**
```
[WARN] Retrying after network error
[DEBUG] HTTP GET /repositories success (attempt: 3, elapsedTime: 8234)
```

**Failed after retries:**
```
[ERROR] HTTP request failed after 5 retries
[ERROR] Request failed after 5 retries: fetch failed
```

---

## Future Improvements (Optional)

### Circuit Breaker Pattern
- Track API health
- Fail fast after repeated failures
- Auto-recover when API is healthy again

### Adaptive Timeout
- Adjust timeout based on API response times
- Longer timeout for slow endpoints

### Request Queuing
- Queue requests during API downtime
- Process queue when API recovers

---

## Related Documentation

- `docs/ARCHITECTURE.md` - System architecture
- `LOGGING_IMPROVEMENTS.md` - Logging enhancements
- `src/infrastructure/http-client.ts` - HTTP client implementation

---

## Summary

✅ **Fixed network error detection** - Network errors are now properly identified and retried  
✅ **Increased retries** - 5 retries instead of 3  
✅ **Increased timeout** - 60s instead of 30s  
✅ **Exponential backoff** - Smarter retry delays  
✅ **Enhanced logging** - Better debugging information  
✅ **Improved reliability** - Better handling of transient network issues

The HTTP client should now handle network errors much more reliably, with proper retries and exponential backoff giving the network time to recover.
