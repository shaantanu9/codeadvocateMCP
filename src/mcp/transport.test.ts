import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { handleMcpRequest } from "./transport.js";

// Mock createMcpServer
vi.mock("./server.js", () => ({
  createMcpServer: vi.fn(),
}));

import { createMcpServer } from "./server.js";

describe("MCP Transport", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      method: "POST",
      body: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      },
      headers: {
        "mcp-protocol-version": "2024-11-05",
      },
    };

    mockResponse = {
      setHeader: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      on: vi.fn(),
      headersSent: false,
    };

    vi.clearAllMocks();
  });

  describe("handleMcpRequest", () => {
    it("should handle MCP request and return response", async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      };
      vi.mocked(createMcpServer).mockReturnValue(mockServer as any);

      // Mock StreamableHTTPServerTransport
      const mockTransport = {
        handleRequest: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
      };
      vi.doMock("@modelcontextprotocol/sdk/server/streamableHttp.js", () => ({
        StreamableHTTPServerTransport: vi.fn().mockImplementation(() => mockTransport),
      }));

      await handleMcpRequest(mockRequest as Request, mockResponse as Response, vi.fn());

      expect(createMcpServer).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(createMcpServer).mockImplementation(() => {
        throw new Error("Test error");
      });

      await handleMcpRequest(mockRequest as Request, mockResponse as Response, vi.fn());

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
