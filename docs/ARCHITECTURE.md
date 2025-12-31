# 🏗️ Architecture Documentation

## Overview

This MCP server follows a **layered architecture** with clear separation of concerns, dependency injection, and scalable design patterns.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│     Presentation Layer                  │
│  (HTTP, Middleware, Routes)             │
├─────────────────────────────────────────┤
│     Application Layer                   │
│  (Services, Use Cases)                  │
├─────────────────────────────────────────┤
│     Infrastructure Layer                │
│  (HTTP Client, External APIs)           │
├─────────────────────────────────────────┤
│     Core Layer                          │
│  (Types, Context, Logger, Errors)       │
└─────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── core/                    # Core utilities and shared types
│   ├── types.ts            # Shared interfaces and types
│   ├── context.ts          # Request context management (AsyncLocalStorage)
│   ├── logger.ts           # Centralized logging
│   └── errors.ts           # Custom error classes
│
├── infrastructure/          # External dependencies and infrastructure
│   └── http-client.ts      # HTTP client with retry logic
│
├── application/            # Application services and business logic
│   └── services/
│       └── external-api.service.ts  # External API service
│
├── presentation/           # HTTP layer and middleware
│   └── middleware/
│       ├── context.middleware.ts   # Request context setup
│       └── auth.middleware.ts      # Authentication
│
├── config/                 # Configuration
│   └── env.ts             # Environment configuration
│
├── services/               # Legacy services (to be migrated)
│   └── token-verification-service.ts
│
├── tools/                  # MCP tools
│   └── external-api-tools.ts
│
├── mcp/                   # MCP server setup
│   ├── server.ts          # MCP server factory
│   └── transport.ts       # Transport handler
│
└── server/                # Express server setup
    ├── app.ts             # Express app configuration
    └── index.ts           # Server startup
```

## Key Design Patterns

### 1. **Request Context Management (AsyncLocalStorage)**

Uses Node.js `AsyncLocalStorage` for thread-safe request-scoped data:

```typescript
// Set context in middleware
runInContext(context, () => {
  // All async operations in this context can access the context
  const token = getRequestToken(); // Gets token from context
});

// Access context anywhere in the request lifecycle
const context = getContext();
const token = getRequestToken();
```

**Benefits:**
- Thread-safe across async operations
- No need to pass context through function parameters
- Automatic cleanup when request completes

### 2. **Dependency Injection**

Services accept dependencies via constructor:

```typescript
class ExternalApiService {
  constructor(httpClient?: HttpClient) {
    this.httpClient = httpClient || new HttpClient({...});
  }
}
```

**Benefits:**
- Easy to test (mock dependencies)
- Flexible (can swap implementations)
- Clear dependencies

### 3. **Service Layer Pattern**

Application services encapsulate business logic:

```typescript
// Application service
export class ExternalApiService {
  async get<T>(endpoint: string, queryParams?: Record<string, any>): Promise<T> {
    // Business logic + error handling
  }
}
```

**Benefits:**
- Separation of concerns
- Reusable business logic
- Centralized error handling

### 4. **Custom Error Classes**

Domain-specific error types:

```typescript
throw new AuthenticationError("Invalid token");
throw new ExternalApiError("API request failed", response, 502);
throw new ValidationError("Invalid input", { field: "email" });
```

**Benefits:**
- Type-safe error handling
- Consistent error responses
- Better error context

### 5. **Centralized Logging**

Structured logging with context:

```typescript
logger.info("Request processed", { userId: 123 });
logger.error("Operation failed", error, { context: "payment" });
```

**Benefits:**
- Consistent log format
- Request ID tracking
- Configurable log levels

## Request Flow

```
1. HTTP Request arrives
   ↓
2. Context Middleware
   - Creates RequestContext
   - Extracts token from headers
   - Sets up AsyncLocalStorage context
   ↓
3. Auth Middleware
   - Gets token from context
   - Verifies token via external API
   ↓
4. MCP Transport Handler
   - Creates MCP server instance
   - Handles MCP protocol
   ↓
5. MCP Tool Execution
   - Gets token from context
   - Creates service instance
   - Calls external API
   ↓
6. Response
   - Returns result to client
   - Context automatically cleaned up
```

## Error Handling

### Error Hierarchy

```
AppError (base)
├── AuthenticationError (401)
├── ValidationError (400)
├── NotFoundError (404)
├── ExternalApiError (502)
└── ServiceUnavailableError (503)
```

### Error Flow

1. **Service throws domain error**
   ```typescript
   throw new AuthenticationError("Invalid token");
   ```

2. **Logger captures error**
   ```typescript
   logger.error("Operation failed", error, { context });
   ```

3. **Global error handler formats response**
   ```typescript
   res.status(error.statusCode).json({ error: error.message });
   ```

## Configuration Management

- Environment variables via `.env`
- Type-safe config interface
- Validation on startup
- Sensitive data never logged

## Scalability Features

### 1. **Stateless Design**
- Each request creates new MCP server instance
- No shared state between requests
- Horizontal scaling ready

### 2. **Async Operations**
- All I/O operations are async
- Non-blocking event loop
- High concurrency support

### 3. **Retry Logic**
- HTTP client has built-in retry
- Exponential backoff
- Configurable retry count

### 4. **Request Isolation**
- AsyncLocalStorage ensures request isolation
- No cross-request data leakage
- Thread-safe operations

## Testing Strategy

### Unit Tests
- Test services in isolation
- Mock HTTP client
- Test error scenarios

### Integration Tests
- Test middleware chain
- Test MCP protocol handling
- Test external API integration

### E2E Tests
- Test full request flow
- Test authentication
- Test tool execution

## Performance Considerations

1. **Connection Pooling**: HTTP client reuses connections
2. **Request Timeout**: Prevents hanging requests
3. **Retry Logic**: Handles transient failures
4. **Logging**: Async logging to avoid blocking
5. **Context Cleanup**: Automatic cleanup prevents memory leaks

## Security

1. **Token Extraction**: From Authorization header
2. **Token Verification**: Via external API
3. **No Token Logging**: Tokens never logged
4. **Error Messages**: Sanitized in production
5. **CORS**: Properly configured

## Future Improvements

1. **Caching Layer**: Redis for frequently accessed data
2. **Rate Limiting**: Per-token rate limiting
3. **Metrics**: Prometheus metrics
4. **Tracing**: OpenTelemetry integration
5. **Health Checks**: More detailed health endpoints
6. **Circuit Breaker**: For external API calls

## Migration Notes

### Old Architecture → New Architecture

- `utils/request-context.ts` → `core/context.ts` (AsyncLocalStorage)
- `services/external-api-service.ts` → `application/services/external-api.service.ts`
- `middleware/auth.ts` → `presentation/middleware/auth.middleware.ts`
- `console.log` → `logger.info/debug/error`
- Custom errors → `core/errors.ts` error classes

## Best Practices

1. ✅ **Always use context for request-scoped data**
2. ✅ **Use logger instead of console.log**
3. ✅ **Throw domain errors, not generic Error**
4. ✅ **Services should be testable (dependency injection)**
5. ✅ **Keep middleware focused and single-purpose**
6. ✅ **Use TypeScript types for all interfaces**
7. ✅ **Handle errors at appropriate layers**
