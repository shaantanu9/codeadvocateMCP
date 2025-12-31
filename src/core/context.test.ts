import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInContext, getRequestId, getRequestToken } from "./context.js";
import type { RequestContext } from "./types.js";

describe("Context Management", () => {
  beforeEach(() => {
    // Clear any existing context
  });

  afterEach(() => {
    // Clean up
  });

  describe("runInContext", () => {
    it("should execute function within context", async () => {
      const context: RequestContext = {
        requestId: "test-request-123",
        token: "test-token",
        ip: "127.0.0.1",
        timestamp: Date.now(),
      };

      const result = await runInContext(context, async () => {
        return "test-value";
      });

      expect(result).toBe("test-value");
    });

    it("should make context available during execution", async () => {
      const context: RequestContext = {
        requestId: "test-request-456",
        token: "test-token-456",
        ip: "127.0.0.1",
        timestamp: Date.now(),
      };

      await runInContext(context, async () => {
        const requestId = getRequestId();
        const token = getRequestToken();

        expect(requestId).toBe("test-request-456");
        expect(token).toBe("test-token-456");
      });
    });

    it("should handle errors within context", async () => {
      const context: RequestContext = {
        requestId: "test-request-error",
        token: "test-token",
        ip: "127.0.0.1",
        timestamp: Date.now(),
      };

      await expect(
        runInContext(context, async () => {
          throw new Error("Test error");
        })
      ).rejects.toThrow("Test error");
    });

    it("should isolate contexts between calls", async () => {
      const context1: RequestContext = {
        requestId: "request-1",
        token: "token-1",
        ip: "127.0.0.1",
        timestamp: Date.now(),
      };

      const context2: RequestContext = {
        requestId: "request-2",
        token: "token-2",
        ip: "127.0.0.1",
        timestamp: Date.now(),
      };

      await runInContext(context1, async () => {
        expect(getRequestId()).toBe("request-1");
      });

      await runInContext(context2, async () => {
        expect(getRequestId()).toBe("request-2");
      });
    });
  });

  describe("getRequestId", () => {
    it("should return null or undefined outside of context", () => {
      const requestId = getRequestId();
      expect(requestId === null || requestId === undefined).toBe(true);
    });

    it("should return request ID within context", async () => {
      const context: RequestContext = {
        requestId: "test-id",
        token: "test-token",
        ip: "127.0.0.1",
        timestamp: Date.now(),
      };

      await runInContext(context, () => {
        expect(getRequestId()).toBe("test-id");
      });
    });
  });

  describe("getRequestToken", () => {
    it("should return null or undefined outside of context", () => {
      const token = getRequestToken();
      expect(token === null || token === undefined).toBe(true);
    });

    it("should return token within context", async () => {
      const context: RequestContext = {
        requestId: "test-id",
        token: "test-token",
        ip: "127.0.0.1",
        timestamp: Date.now(),
      };

      await runInContext(context, () => {
        expect(getRequestToken()).toBe("test-token");
      });
    });
  });
});

