import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMcpServer } from "./server.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// Mock the MCP SDK
vi.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  Server: vi.fn().mockImplementation(() => ({
    setRequestHandler: vi.fn(),
    connect: vi.fn(),
  })),
}));

// Mock tool registry
vi.mock("../../tools/tool-registry.js", () => ({
  registerAllTools: vi.fn(),
}));

describe("MCP Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createMcpServer", () => {
    it("should create an MCP server instance", () => {
      const server = createMcpServer();

      expect(server).toBeDefined();
      expect(Server).toHaveBeenCalled();
    });

    it("should configure server with correct capabilities", () => {
      createMcpServer();

      expect(Server).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.any(String),
          version: expect.any(String),
        }),
        expect.objectContaining({
          capabilities: expect.objectContaining({
            tools: expect.any(Object),
          }),
        })
      );
    });
  });
});



