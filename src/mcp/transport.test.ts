import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { handleMcpRequest } from "./transport.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// Mock MCP Server
const mockServer = {
  handleRequest: vi.fn().mockResolvedValue({
    jsonrpc: "2.0",
    id: 1,
    result: { tools: [] },
  }),
} as unknown as Server;

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
    };

    vi.clearAllMocks();
  });

  describe("handleMcpRequest", () => {
    it("should handle MCP request and return response", async () => {
      await handleMcpRequest(mockServer, mockRequest as Request, mockResponse as Response);

      expect(mockServer.handleRequest).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/event-stream"
      );
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(mockServer.handleRequest).mockRejectedValue(
        new Error("Test error")
      );

      await handleMcpRequest(mockServer, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should validate MCP protocol version", async () => {
      mockRequest.headers = {};

      await handleMcpRequest(mockServer, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});



