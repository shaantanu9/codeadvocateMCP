# Fix: "require is not defined" Error

## ✅ Issue Fixed

The `require is not defined` error has been fixed in the source code:
- ✅ Fixed `repository-cache.ts` - replaced all `require("node:fs")` with ES module imports
- ✅ Verified `session-manager.ts` - already using ES module imports correctly
- ✅ Rebuilt project - all compiled code is correct

## 🔄 Solution: Restart the Server

**The server is still running old code in memory.** You need to restart it:

### Steps:

1. **Stop the current server:**
   ```bash
   # Press Ctrl+C in the terminal where the server is running
   # Or find and kill the process:
   pkill -f "node.*mcp"
   ```

2. **Start the server again:**
   ```bash
   npm start
   # or
   node dist/index.js
   ```

3. **Verify the fix:**
   - The `require is not defined` errors should stop appearing
   - Check the logs - you should no longer see those errors

## 🔍 What Was Fixed

### Before (❌ Wrong):
```typescript
// repository-cache.ts
const files = require("node:fs").readdirSync(this.cacheDir);
require("node:fs").unlinkSync(cacheFile);
```

### After (✅ Correct):
```typescript
// repository-cache.ts
import { readdirSync, unlinkSync } from "node:fs";

const files = readdirSync(this.cacheDir);
unlinkSync(cacheFile);
```

## 📝 Note About Token Verification Error

The `ECONNREFUSED` error for token verification is **expected** if your external API server isn't running. This is not a bug - it just means the API server at `http://localhost:5656` needs to be started separately.

## ✅ Verification

After restarting, you should see:
- ✅ No more `require is not defined` errors
- ✅ Server starts normally
- ✅ Session cleanup works correctly

If errors persist after restart, let me know!



