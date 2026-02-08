# Architecture Improvements & Best Practices Guide

**File:** `ARCHITECTURE_IMPROVEMENTS.md`  
**Focus:** Long-term codebase health, scalability, and maintainability  

---

## 🏗️ Part 1: Architecture Strengths to Maintain

The codebase has several strong architectural foundations:

### ✅ Layered Architecture
```
Presentation Layer (HTTP, Middleware)
    ↓
Application Layer (Services, Use Cases)
    ↓
Infrastructure Layer (HTTP Client, External APIs)
    ↓
Core Layer (Types, Context, Logger, Errors)
```

**Keep:** This separation is excellent for maintainability.

### ✅ Dependency Injection Pattern
Services accept dependencies in constructors rather than creating them directly.

**Keep:** Extend this pattern to all new services.

### ✅ Custom Error Classes
Domain-specific errors (`AuthenticationError`, `ValidationError`, etc.) instead of generic `Error`.

**Keep:** Use these consistently throughout codebase.

### ✅ Configuration Management
Centralized environment config with type safety and validation.

**Keep:** Extend with feature flags and secrets management.

---

## 🔧 Part 2: Critical Improvements Needed

### 1. Eliminate Duplicate Service Implementations ⚠️ CRITICAL

**Current State:**
```
src/services/
├── external-api-service.ts          (OLD - LEGACY)
└── token-verification-service.ts    (OLD - LEGACY)

src/application/services/
├── external-api.service.ts          (NEW - MODERN)
└── [other services]
```

**Problem:** Two implementations of same service cause confusion and inconsistency.

**Solution:**
1. Migrate all imports from `src/services/` to `src/application/services/`
2. Delete old service files
3. Update tool handlers to use new services

**Migration Steps:**
```bash
# Step 1: Find all imports of old services
grep -r "from.*services/external-api-service" src/

# Step 2: Update imports
# OLD: import { ExternalApiService } from '@/services/external-api-service';
# NEW: import { ExternalApiService } from '@/application/services/external-api.service';

# Step 3: Verify tests pass
npm test

# Step 4: Delete old files
rm src/services/external-api-service.ts
rm src/services/token-verification-service.ts
```

### 2. Standardize Logging Everywhere ⚠️ HIGH

**Current State:**
```typescript
// Some files use logger
import { logger } from "@/core/logger";
logger.info("Event", { context });

// Some use console.error
console.error("Error:", error);

// Some use nothing
// Silent failures
```

**Solution - Create Logging Standard:**

```typescript
// ✅ DO THIS EVERYWHERE
import { logger } from "@/core/logger";

// At method entry (for debugging)
logger.debug("Processing request", { userId, params });

// For info events
logger.info("User logged in", { userId, timestamp });

// For warnings
logger.warn("Slow operation", { duration: 5000, threshold: 1000 });

// For errors
logger.error("Operation failed", error, { context: "payment", userId });

// ❌ DON'T DO THIS
console.log("Debug info");
console.error("Error occurred");
console.warn("Warning");
```

**Files to Update:**
- `src/services/` - All services should use logger
- `src/mcp/transport.ts` - Replace `console.error`
- `src/core/session-manager.ts` - Standardize logging
- All middleware files
- All error handlers

**Script to Find Violations:**
```bash
grep -r "console\\.log\|console\\.error\|console\\.warn" src/ --include="*.ts" | grep -v ".test.ts"
```

### 3. Establish Error Handling Conventions ⚠️ HIGH

**Current Inconsistencies:**
```typescript
// Inconsistent Error #1: Generic Error
throw new Error("Failed to get user");

// Inconsistent Error #2: App Error but wrong code
throw new AppError("Failed", "GENERIC_ERROR");

// Inconsistent Error #3: Silent failure
const result = await api.get().catch(() => null);

// Inconsistent Error #4: Promise rejection not handled
async function process() {
  return api.get(); // What if this fails?
}
```

**Standard Error Handling Pattern:**

```typescript
// ✅ Service Layer - Throw domain errors
export class UserService {
  async getUser(id: string): Promise<User> {
    if (!id) {
      throw new ValidationError("User ID is required", { field: "id" });
    }
    
    try {
      const user = await this.api.get(`/users/${id}`);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw domain errors
      }
      throw new ExternalApiError(
        `Failed to fetch user ${id}`,
        error,
        500
      );
    }
  }
}

// ✅ Tool Handler - Log and format error
export class GetUserTool extends BaseToolHandler {
  async execute(params: GetUserParams): Promise<ToolResult> {
    try {
      const user = await this.userService.getUser(params.userId);
      return this.success({ user });
    } catch (error) {
      logger.error("GetUserTool failed", error, { userId: params.userId });
      
      if (error instanceof ValidationError) {
        return this.error(error.message, { code: error.code });
      }
      if (error instanceof NotFoundError) {
        return this.error("User not found", { code: "NOT_FOUND" });
      }
      
      return this.error("Failed to get user", { code: "INTERNAL_ERROR" });
    }
  }
}

// ✅ API Layer - Return error responses
app.get("/users/:id", async (req, res) => {
  try {
    const user = await userService.getUser(req.params.id);
    res.json({ user });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    
    logger.error("Request failed", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

**Error Handling Checklist:**
- [ ] All errors are typed (specific error class, not `Error`)
- [ ] Context is logged with errors (`logger.error(..., context)`)
- [ ] User-friendly messages in responses
- [ ] Technical details in logs, not responses
- [ ] No silent failures (`.catch(() => null)`)
- [ ] Errors include enough context for debugging

### 4. Improve Test Isolation ⚠️ MEDIUM

**Current Issues:**
```typescript
// ❌ Tests share global state
const config = loadConfig(); // Loaded once, shared by all tests

vi.mock("./snippets/index.js"); // Mock persists across tests

// ❌ Tests write to real disk
const sessionDir = ".cache/sessions";
fs.writeFileSync(`${sessionDir}/session.json`, ...); // Real files!

// ❌ Tests have real delays
await sleep(16000); // Actual wait, not mocked
```

**Solution - Fix Test Setup:**

```typescript
// ✅ Reset mocks between tests
import { beforeEach, afterEach, vi } from "vitest";

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ✅ Use temp directories
import { mkdtempSync } from "fs";
import { tmpdir } from "os";

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "test-"));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true });
});

// ✅ Mock time delays
vi.useFakeTimers();
// ... run test ...
vi.useRealTimers();

// ✅ Proper mock setup
vi.mock("./snippets/index.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    someFunction: vi.fn().mockResolvedValue({})
  };
});
```

---

## 🎯 Part 3: Scalability Improvements

### 1. Add Request ID Tracking

**Current State:** No way to trace requests across logs

**Solution:**
```typescript
// middleware/request-id.middleware.ts
import { v4 as uuid } from "uuid";
import { getContext, setContext } from "@/core/context";

export function requestIdMiddleware(req, res, next) {
  const requestId = req.headers["x-request-id"] || uuid();
  
  setContext({ requestId });
  res.setHeader("x-request-id", requestId);
  
  logger.info("Request started", { method: req.method, path: req.path, requestId });
  next();
}

// usage in logger
logger.info("Processing", { 
  ...context, 
  requestId: getContext().requestId 
});

// Logs now show: [req-123] Processing
```

### 2. Add Circuit Breaker for External API

**Problem:** If external API fails, all requests fail

**Solution:**
```typescript
// infrastructure/circuit-breaker.ts
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: number;
  private state: "closed" | "open" | "half-open" = "closed";

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime! > 60000) {
        this.state = "half-open";
      } else {
        throw new ServiceUnavailableError("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = "closed";
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= 5) {
      this.state = "open";
    }
  }
}

// Usage
const breaker = new CircuitBreaker();

try {
  await breaker.execute(() => externalApi.get("/data"));
} catch (error) {
  // Return cached data or default
}
```

### 3. Add Caching Layer

**Current State:** Every request hits external API

**Solution:**
```typescript
// infrastructure/cache.ts
export class Cache {
  private store = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string, loader: () => Promise<T>, ttl = 300000): Promise<T> {
    const cached = this.store.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.value as T;
    }

    const value = await loader();
    this.store.set(key, { value, expires: Date.now() + ttl });
    return value;
  }

  clear(pattern?: string) {
    if (!pattern) {
      this.store.clear();
      return;
    }
    for (const [key] of this.store) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }
}

// Usage
const cache = new Cache();

async function getUser(id: string) {
  return cache.get(
    `user:${id}`,
    () => api.getUser(id),
    300000 // 5 minute TTL
  );
}
```

### 4. Add Rate Limiting

**Problem:** No protection against abuse

**Solution:**
```typescript
// middleware/rate-limit.ts
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
```

---

## 📊 Part 4: File Organization Improvements

### Recommended Structure
```
src/
├── core/                          # Core domain logic
│   ├── types.ts                  # Shared types
│   ├── context.ts                # Request context
│   ├── logger.ts                 # Logging
│   ├── errors.ts                 # Error classes
│   └── constants.ts              # Constants
│
├── infrastructure/                # External dependencies
│   ├── http-client.ts            # HTTP requests
│   ├── circuit-breaker.ts        # Circuit breaker pattern
│   ├── cache.ts                  # Caching
│   └── rate-limiter.ts           # Rate limiting
│
├── application/                   # Application services
│   ├── services/
│   │   ├── external-api.service.ts
│   │   ├── user.service.ts
│   │   └── repository.service.ts
│   └── use-cases/
│       ├── get-user.use-case.ts
│       └── analyze-repo.use-case.ts
│
├── presentation/                  # HTTP layer
│   ├── middleware/
│   │   ├── context.middleware.ts
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── request-id.middleware.ts
│   └── controllers/
│       ├── user.controller.ts
│       └── repository.controller.ts
│
├── mcp/                          # MCP specific
│   ├── server.ts
│   ├── transport.ts
│   └── tools/
│
├── config/                       # Configuration
│   ├── env.ts
│   └── constants.ts
│
└── index.ts                      # Entry point
```

---

## 🔒 Part 5: Security Enhancements

### 1. Add Security Headers
```typescript
import helmet from "helmet";

app.use(helmet());
```

### 2. Add CORS Configuration
```typescript
import cors from "cors";

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(","),
  credentials: true,
}));
```

### 3. Add Input Validation
```typescript
import { body, validationResult } from "express-validator";

app.post("/api/users", [
  body("email").isEmail(),
  body("name").trim().notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
```

### 4. Add API Key Rotation
```typescript
// Track old keys for short period
const activeKeys = new Map();
const revokedKeys = new Map();

function rotateApiKey(oldKey: string) {
  const newKey = generateKey();
  revokedKeys.set(oldKey, Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  activeKeys.set(newKey, true);
  return newKey;
}
```

---

## 📈 Part 6: Performance Optimizations

### 1. Add Response Compression
```typescript
import compression from "compression";

app.use(compression());
```

### 2. Add Database Connection Pooling
```typescript
// For any database connections
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Add Query Optimization
```typescript
// Instead of N+1 queries
// ❌ BAD
users.forEach(async (user) => {
  user.profile = await getProfile(user.id);
});

// ✅ GOOD
const profiles = await getProfiles(users.map(u => u.id));
const profileMap = new Map(profiles.map(p => [p.userId, p]));
users.forEach(user => {
  user.profile = profileMap.get(user.id);
});
```

---

## 📋 Implementation Roadmap

### Week 1: Cleanup
- [ ] Remove duplicate services
- [ ] Standardize logging
- [ ] Fix error handling consistency
- [ ] Improve test isolation

### Week 2: Enhancements
- [ ] Add request ID tracking
- [ ] Add circuit breaker
- [ ] Add caching layer
- [ ] Add rate limiting

### Week 3: Security & Performance
- [ ] Add security headers
- [ ] Add CORS configuration
- [ ] Add response compression
- [ ] Add input validation

### Week 4: Testing & Monitoring
- [ ] Achieve 100% test pass rate
- [ ] Add integration tests
- [ ] Add performance benchmarks
- [ ] Set up monitoring/alerting

---

## 🎓 Development Guidelines

### Code Review Checklist
- [ ] Code follows architecture layers
- [ ] Proper error handling with domain errors
- [ ] Logging at appropriate levels
- [ ] Tests cover happy path + error cases
- [ ] No console.log/console.error calls
- [ ] Type safety maintained (strict mode)
- [ ] No duplicate code
- [ ] Documentation updated

### Commit Message Convention
```
feat(scope): Short description

Longer description explaining what and why.

Fixes #123
```

### Pull Request Template
```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes?

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## 📞 Questions & Support

For architectural questions:
1. Check `ARCHITECTURE.md` for design decisions
2. Review existing implementations for patterns
3. Discuss in code review before implementation
4. Update documentation after implementing

---

**Document Version:** 1.0  
**Last Updated:** January 21, 2026  
**Status:** Ready for implementation
