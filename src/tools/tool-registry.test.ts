import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerAllTools } from "./tool-registry.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Mock MCP Server
const mockServer = {
  tool: vi.fn(),
  connect: vi.fn(),
} as unknown as McpServer;

// Mock tool modules
vi.mock("./snippets/index.js", () => ({
  snippetTools: [],
}));

vi.mock("./repository-analysis/index.js", () => ({
  repositoryAnalysisTools: [],
}));

describe("Tool Registry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerAllTools", () => {
    it("should register all tools with MCP server", () => {
      registerAllTools(mockServer);

      // Verify that tool() method was called for each tool
      // (exact number depends on number of tools)
      expect(mockServer.tool).toHaveBeenCalled();
    });

    it("should handle tool registration errors gracefully", () => {
      vi.mocked(mockServer.tool).mockImplementation(() => {
        throw new Error("Registration failed");
      });

      // Should not throw, but handle error
      expect(() => registerAllTools(mockServer)).not.toThrow();
    });
  });
});



