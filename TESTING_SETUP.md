# 🧪 Testing Setup Guide

## ✅ Testing Framework: Vitest

We've set up **Vitest** as the testing framework for this MCP server project.

### Why Vitest?

- ✅ **Fast**: Built on Vite, extremely fast test execution
- ✅ **TypeScript Native**: Works seamlessly with TypeScript
- ✅ **ES Modules**: Full ES module support (matches our project)
- ✅ **Modern**: Best-in-class developer experience
- ✅ **Compatible**: Jest-compatible API for easy migration

---

## 📦 Installation

```bash
npm install
```

Dependencies are already added to `package.json`:
- `vitest`: Testing framework
- `@vitest/coverage-v8`: Code coverage

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

---

## 📁 Test File Structure

Tests are organized alongside source files:

```
src/
├── core/
│   ├── errors.ts
│   └── errors.test.ts          ✅ Tests for error classes
│   ├── context.ts
│   └── context.test.ts         ✅ Tests for context management
├── tools/
│   ├── base/
│   │   ├── tool-handler.base.ts
│   │   └── tool-handler.base.test.ts  ✅ Tests for base tool handler
│   └── repository-analysis/
│       ├── analyze-and-save-repo.tool.ts
│       └── analyze-and-save-repo.tool.test.ts  ✅ Tests for repo analysis tool
├── services/
│   ├── ai-service-factory.ts
│   └── ai-service-factory.test.ts     ✅ Tests for AI service factory
└── ...

tests/
├── integration/
│   └── mcp-server.integration.test.ts  ✅ Integration tests
└── helpers/
    └── test-helpers.ts                 ✅ Test utilities
```

---

## ✅ Test Coverage

### Core Components ✅
- [x] Error classes (`errors.test.ts`)
- [x] Context management (`context.test.ts`)
- [x] Logger (via mocks)
- [x] Repository cache (`repository-cache.test.ts`)

### Tools ✅
- [x] Base tool handler (`tool-handler.base.test.ts`)
- [x] Repository analysis tool (`analyze-and-save-repo.tool.test.ts`)
- [x] Tool registry (`tool-registry.test.ts`)

### Services ✅
- [x] AI service factory (`ai-service-factory.test.ts`)
- [x] HTTP client (`http-client.test.ts`)

### Middleware ✅
- [x] Auth middleware (`auth.middleware.test.ts`)

### MCP Server ✅
- [x] MCP server creation (`server.test.ts`)
- [x] MCP transport (`transport.test.ts`)

### Utilities ✅
- [x] Response formatter (`response-formatter.test.ts`)

---

## 🧪 Writing Tests

### Test File Naming

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- Test files should be next to the source file they test

### Example Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ComponentName", () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  describe("methodName", () => {
    it("should do something", () => {
      // Arrange
      const input = "test";
      
      // Act
      const result = component.method(input);
      
      // Assert
      expect(result).toBe("expected");
    });
  });
});
```

### Mocking Patterns

```typescript
// Mock a module
vi.mock("./module.js", () => ({
  exportedFunction: vi.fn(),
}));

// Mock a class
vi.mock("./service.js", () => ({
  Service: vi.fn().mockImplementation(() => ({
    method: vi.fn(),
  })),
}));
```

---

## 📊 Test Categories

### 1. Unit Tests
Test individual functions/classes in isolation.

**Location:** `src/**/*.test.ts`

**Example:**
- `errors.test.ts` - Tests error classes
- `context.test.ts` - Tests context management

### 2. Integration Tests
Test multiple components working together.

**Location:** `tests/integration/**/*.test.ts`

**Example:**
- `mcp-server.integration.test.ts` - Tests full MCP server setup

### 3. Tool Tests
Test MCP tools end-to-end.

**Location:** `src/tools/**/*.test.ts`

**Example:**
- `analyze-and-save-repo.tool.test.ts` - Tests repository analysis tool

---

## 🎯 Testing Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)
```typescript
it("should calculate sum", () => {
  // Arrange
  const a = 1;
  const b = 2;
  
  // Act
  const result = sum(a, b);
  
  // Assert
  expect(result).toBe(3);
});
```

### 2. Descriptive Test Names
```typescript
// ✅ Good
it("should return error when token is invalid", () => { ... });

// ❌ Bad
it("test1", () => { ... });
```

### 3. Test Isolation
Each test should be independent and not rely on other tests.

### 4. Mock External Dependencies
Always mock:
- File system operations
- Network requests
- External APIs
- Environment variables

### 5. Test Edge Cases
- Empty inputs
- Null/undefined values
- Error conditions
- Boundary values

---

## 🔧 Configuration

### Vitest Config (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,              // Global test functions
    environment: "node",        // Node.js environment
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

---

## 📝 Test Helpers

Use `tests/helpers/test-helpers.ts` for common utilities:

```typescript
import { createMockRequest, createMockResponse } from "../../tests/helpers/test-helpers.js";

const req = createMockRequest({ body: { id: 1 } });
const res = createMockResponse();
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Check import paths use `.js` extension for ES modules

### Issue: "Mock not working"
**Solution:** Ensure `vi.mock()` is called before imports

### Issue: "Async test timeout"
**Solution:** Increase timeout in test: `it("test", async () => { ... }, { timeout: 10000 })`

---

## 📈 Coverage Goals

- **Target:** 80%+ code coverage
- **Critical paths:** 100% coverage
- **Tools:** 90%+ coverage

Run coverage report:
```bash
npm run test:coverage
```

View HTML report:
```bash
open coverage/index.html
```

---

## 🔄 Continuous Integration

Tests should run:
- ✅ Before commits (pre-commit hook)
- ✅ On pull requests
- ✅ On main branch merges

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://vitest.dev/guide/)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)

---

*Last Updated: 2025-12-23*



