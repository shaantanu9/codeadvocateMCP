# External API URL Configuration Fix

**Date:** 2026-01-02  
**Status:** ✅ Complete

## Problem

Token verification was failing with "fetch failed" error because the external API endpoint URL was incorrectly constructed.

**Root Cause:**
- `.env` file has `EXTERNAL_API_URL=https://codeadvocate.vercel.app`
- But `EXTERNAL_API_BASE_URL` was not set
- Config was defaulting to `http://localhost:5656/api/` instead of using `EXTERNAL_API_URL`
- Even when using `EXTERNAL_API_URL`, it was incorrectly adding `/api/` prefix
- Production API (`codeadvocate.vercel.app`) does NOT use `/api/` prefix
- Only localhost API uses `/api/` prefix

---

## Solution

### 1. Fixed Config to Derive Base URL from EXTERNAL_API_URL ✅

**File:** `src/config/env.ts`

**Before:**
```typescript
externalApiBaseUrl: validatedEnv.EXTERNAL_API_BASE_URL || "http://localhost:5656/api/",
```

**After:**
```typescript
externalApiBaseUrl: validatedEnv.EXTERNAL_API_BASE_URL || 
  (validatedEnv.EXTERNAL_API_URL 
    ? (validatedEnv.EXTERNAL_API_URL.includes("localhost") || validatedEnv.EXTERNAL_API_URL.includes("127.0.0.1")
        ? `${validatedEnv.EXTERNAL_API_URL}/api/` // /api/ prefix for localhost
        : `${validatedEnv.EXTERNAL_API_URL}/`) // No /api/ prefix for production
    : "http://localhost:5656/api/"),
```

**Logic:**
- If `EXTERNAL_API_BASE_URL` is explicitly set → Use it
- If `EXTERNAL_API_URL` is set:
  - Localhost → Add `/api/` prefix: `http://localhost:5656/api/`
  - Production → No prefix: `https://codeadvocate.vercel.app/`
- Default → `http://localhost:5656/api/`

### 2. Fixed URL Construction in Token Verification Service ✅

**File:** `src/services/token-verification-service.ts`

**Before:**
```typescript
const baseUrl = envConfig.externalApiBaseUrl.endsWith("/")
  ? envConfig.externalApiBaseUrl
  : `${envConfig.externalApiBaseUrl}/`;
const verifyUrl = new URL("api-keys/verify", baseUrl).toString();
```

**After:**
```typescript
let baseUrl = envConfig.externalApiBaseUrl;
if (!baseUrl.endsWith("/")) {
  baseUrl = `${baseUrl}/`;
}
const verifyUrl = `${baseUrl}api-keys/verify`;
```

**Improvements:**
- Simpler URL construction (no `new URL()` which can cause issues)
- Ensures trailing slash
- Direct string concatenation
- Added debug logging

---

## URL Formats

### Production API (codeadvocate.vercel.app)

**Base URL:** `https://codeadvocate.vercel.app/`  
**Verification Endpoint:** `https://codeadvocate.vercel.app/api-keys/verify`  
**Note:** No `/api/` prefix

### Localhost API

**Base URL:** `http://localhost:5656/api/`  
**Verification Endpoint:** `http://localhost:5656/api/api-keys/verify`  
**Note:** Uses `/api/` prefix

---

## Verification

### Test URL Construction

```bash
# Production URL
EXTERNAL_API_URL=https://codeadvocate.vercel.app
# Result: https://codeadvocate.vercel.app/api-keys/verify ✅

# Localhost URL
EXTERNAL_API_URL=http://localhost:5656
# Result: http://localhost:5656/api/api-keys/verify ✅
```

### Test API Endpoint

```bash
# Production endpoint (returns 200)
curl -X POST https://codeadvocate.vercel.app/api-keys/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}'
# Returns: 200 ✅

# Wrong endpoint (returns 400)
curl -X POST https://codeadvocate.vercel.app/api/api-keys/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}'
# Returns: 400 ❌
```

---

## Environment Variables

### .env File

```env
# External API URL (required)
EXTERNAL_API_URL=https://codeadvocate.vercel.app

# External API Base URL (optional - will be derived from EXTERNAL_API_URL if not set)
# EXTERNAL_API_BASE_URL=https://codeadvocate.vercel.app/

# MCP Server Token (required for authentication)
MCP_SERVER_TOKEN=your-token-here
```

### Configuration Priority

1. **EXTERNAL_API_BASE_URL** (if set) → Use directly
2. **EXTERNAL_API_URL** (if set) → Derive base URL:
   - Localhost → Add `/api/` prefix
   - Production → No prefix
3. **Default** → `http://localhost:5656/api/`

---

## Files Modified

1. **`src/config/env.ts`**
   - Fixed `externalApiBaseUrl` derivation logic
   - Handles localhost vs production URL formats
   - Properly constructs base URL from `EXTERNAL_API_URL`

2. **`src/services/token-verification-service.ts`**
   - Fixed URL construction (removed `new URL()`)
   - Added debug logging
   - Updated comments with correct URL formats

---

## Result

✅ **Correct URL Construction**
- Production: `https://codeadvocate.vercel.app/api-keys/verify`
- Localhost: `http://localhost:5656/api/api-keys/verify`

✅ **Automatic Detection**
- Detects localhost vs production automatically
- Uses correct URL format based on `EXTERNAL_API_URL`

✅ **Debug Logging**
- Logs the verification URL for debugging
- Easy to verify correct endpoint is being used

---

## Testing

After restarting the server, you should see:
```
[Config] External API Base URL: https://codeadvocate.vercel.app/
[Config] Token Verification Endpoint: https://codeadvocate.vercel.app/api-keys/verify
[Token Verification] Verifying token at: https://codeadvocate.vercel.app/api-keys/verify
```

The token verification should now work correctly! ✅
