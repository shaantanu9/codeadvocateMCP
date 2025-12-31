import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "./auth.middleware.js";
import { runInContext } from "../../core/context.js";
import { verifyToken } from "../../services/token-verification-service.js";

// Mock dependencies
vi.mock("../../config/env.js", () => ({
  envConfig: {
    authEnabled: false,
    mcpServerToken: "test-token",
    tokenAcquisitionUrl: "https://example.com/token",
  },
}));

vi.mock("../../services/token-verification-service.js");
vi.mock("../../core/context.js");
vi.mock("../../core/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      get: vi.fn(),
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("authMiddleware", () => {
    it("should reject request without token in context", async () => {
      vi.mocked(runInContext).mockImplementation(async (_context, fn) => {
        // Simulate no context
        return fn();
      });

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should allow request with valid token", async () => {
      const mockContext = {
        requestId: "test-id",
        token: "valid-token",
        ip: "127.0.0.1",
      };

      vi.mocked(runInContext).mockImplementation(async (_context, fn) => {
        // Simulate context with token
        return fn();
      });

      vi.mocked(verifyToken).mockResolvedValue({
        valid: true,
        message: "Token is valid",
      });

      // Mock getContext to return context
      const { getContext } = await import("../../core/context.js");
      vi.mocked(getContext).mockReturnValue(mockContext as any);

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject request with invalid token", async () => {
      const mockContext = {
        requestId: "test-id",
        token: "invalid-token",
        ip: "127.0.0.1",
      };

      vi.mocked(verifyToken).mockResolvedValue({
        valid: false,
        message: "Invalid token",
      });

      const { getContext } = await import("../../core/context.js");
      vi.mocked(getContext).mockReturnValue(mockContext as any);

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle verification errors", async () => {
      const mockContext = {
        requestId: "test-id",
        token: "test-token",
        ip: "127.0.0.1",
      };

      vi.mocked(verifyToken).mockRejectedValue(new Error("Verification failed"));

      const { getContext } = await import("../../core/context.js");
      vi.mocked(getContext).mockReturnValue(mockContext as any);

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

