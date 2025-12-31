import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseToolHandler } from "./tool-handler.base.js";
import { createExternalApiService } from "../../application/services/external-api.service.js";
import { ServiceUnavailableError } from "../../core/errors.js";
import * as loggerModule from "../../core/logger.js";

// Mock dependencies
vi.mock("../../application/services/external-api.service.js");
vi.mock("../../core/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("BaseToolHandler", () => {
  class TestToolHandler extends BaseToolHandler {
    name = "testTool";
    description = "Test tool";
    paramsSchema = {} as any;
    execute = vi.fn();
  }

  let tool: TestToolHandler;

  beforeEach(() => {
    tool = new TestToolHandler();
    vi.clearAllMocks();
  });

  describe("getApiService", () => {
    it("should return ExternalApiService when available", () => {
      const mockService = { get: vi.fn(), post: vi.fn() };
      vi.mocked(createExternalApiService).mockReturnValue(mockService as any);

      const service = tool.getApiService();

      expect(service).toBe(mockService);
      expect(createExternalApiService).toHaveBeenCalled();
    });

    it("should throw ServiceUnavailableError when service creation fails", () => {
      vi.mocked(createExternalApiService).mockImplementation(() => {
        throw new Error("Service unavailable");
      });

      expect(() => tool.getApiService()).toThrow(ServiceUnavailableError);
      expect(loggerModule.logger.error).toHaveBeenCalled();
    });
  });

  describe("handleError", () => {
    it("should handle AppError correctly", () => {
      const error = new ServiceUnavailableError("Service down");
      const result = tool.handleError("testTool", error, "Default message");

      expect(result.content[0].text).toContain("Service down");
      expect(loggerModule.logger.error).toHaveBeenCalledWith(
        "testTool failed",
        error
      );
    });

    it("should handle generic Error correctly", () => {
      const error = new Error("Generic error");
      const result = tool.handleError("testTool", error, "Default message");

      expect(result.content[0].text).toContain("Generic error");
    });

    it("should handle unknown error types", () => {
      const error = "String error";
      const result = tool.handleError("testTool", error, "Default message");

      expect(result.content[0].text).toContain("Default message");
    });
  });

  describe("logStart", () => {
    it("should log tool execution start", () => {
      tool.logStart("testTool", { param1: "value1" });

      expect(loggerModule.logger.info).toHaveBeenCalledWith(
        "Executing tool: testTool",
        expect.objectContaining({
          params: { param1: "value1" },
        })
      );
    });
  });
});

