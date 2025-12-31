import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerAllTools } from "./tool-registry.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// Mock MCP Server
const mockServer = {
  setRequestHandler: vi.fn(),
  connect: vi.fn(),
} as unknown as Server;

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

      // Verify that setRequestHandler was called
      // (exact number depends on number of tools)
      expect(mockServer.setRequestHandler).toHaveBeenCalled();
    });

    it("should handle tool registration errors gracefully", () => {
      vi.mocked(mockServer.setRequestHandler).mockImplementation(() => {
        throw new Error("Registration failed");
      });

      // Should not throw, but handle error
      expect(() => registerAllTools(mockServer)).not.toThrow();
    });
  });
});



