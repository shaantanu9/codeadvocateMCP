import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnalyzeAndSaveRepoTool } from "./analyze-and-save-repo.tool.js";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { repositoryCache } from "../../core/repository-cache.js";

// Mock dependencies
vi.mock("node:child_process");
vi.mock("node:fs");
vi.mock("../../core/repository-cache.js");
vi.mock("../../core/logger.js");
vi.mock("../../application/services/external-api.service.js");
vi.mock("../../services/ai-service-factory.js");

describe("AnalyzeAndSaveRepoTool", () => {
  let tool: AnalyzeAndSaveRepoTool;

  beforeEach(() => {
    tool = new AnalyzeAndSaveRepoTool();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("extractRepoNameFromUrl", () => {
    it("should extract repo name from HTTPS URL", () => {
      const url = "https://github.com/user/repo-name.git";
      const result = (tool as any).extractRepoNameFromUrl(url);
      expect(result).toBe("repo-name");
    });

    it("should extract repo name from SSH URL", () => {
      const url = "git@github.com:user/repo-name.git";
      const result = (tool as any).extractRepoNameFromUrl(url);
      expect(result).toBe("repo-name");
    });

    it("should handle URL without .git suffix", () => {
      const url = "https://github.com/user/repo-name";
      const result = (tool as any).extractRepoNameFromUrl(url);
      expect(result).toBe("repo-name");
    });
  });

  describe("normalizeRemoteUrl", () => {
    it("should convert SSH to HTTPS", () => {
      const url = "git@github.com:user/repo.git";
      const result = (tool as any).normalizeRemoteUrl(url);
      expect(result).toBe("https://github.com/user/repo");
    });

    it("should remove .git suffix", () => {
      const url = "https://github.com/user/repo.git";
      const result = (tool as any).normalizeRemoteUrl(url);
      expect(result).toBe("https://github.com/user/repo");
    });

    it("should handle HTTPS URL without .git", () => {
      const url = "https://github.com/user/repo";
      const result = (tool as any).normalizeRemoteUrl(url);
      expect(result).toBe("https://github.com/user/repo");
    });
  });

  describe("detectBranchPattern", () => {
    it("should detect feature branch pattern", () => {
      const branches = ["main", "feature/login", "feature/signup", "develop"];
      const result = (tool as any).detectBranchPattern(branches);
      expect(result).toBe("feature/*");
    });

    it("should detect main branch as pattern", () => {
      const branches = ["main", "develop", "staging"];
      const result = (tool as any).detectBranchPattern(branches);
      expect(result).toBe("main");
    });

    it("should return unknown for no clear pattern", () => {
      const branches = ["branch1", "branch2", "branch3"];
      const result = (tool as any).detectBranchPattern(branches);
      expect(result).toBe("unknown");
    });
  });

  describe("categorizeFunction", () => {
    it("should categorize utility functions", () => {
      const category = (tool as any).categorizeFunction(
        "getUserData",
        "src/utils/helpers.ts",
        ""
      );
      expect(category).toBe("utility");
    });

    it("should categorize service functions", () => {
      const category = (tool as any).categorizeFunction(
        "processData",
        "src/services/data.service.ts",
        ""
      );
      expect(category).toBe("service");
    });

    it("should categorize handler functions", () => {
      const category = (tool as any).categorizeFunction(
        "handleRequest",
        "src/handlers/api.handler.ts",
        ""
      );
      expect(category).toBe("handler");
    });

    it("should categorize middleware functions", () => {
      const category = (tool as any).categorizeFunction(
        "authMiddleware",
        "src/middleware/auth.ts",
        ""
      );
      expect(category).toBe("middleware");
    });
  });

  describe("extractRoutes", () => {
    it("should extract Express GET routes", () => {
      const content = `app.get('/api/users', getUserHandler);`;
      const routes = (tool as any).extractRoutes(
        "src/server/app.ts",
        content,
        "."
      );
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe("GET");
      expect(routes[0].path).toBe("/api/users");
    });

    it("should extract Express POST routes", () => {
      const content = `app.post('/api/users', createUserHandler);`;
      const routes = (tool as any).extractRoutes(
        "src/server/app.ts",
        content,
        "."
      );
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe("POST");
      expect(routes[0].path).toBe("/api/users");
    });

    it("should extract Next.js API routes", () => {
      const content = `export async function GET() { return Response.json({}); }`;
      const routes = (tool as any).extractRoutes(
        "src/app/api/users/route.ts",
        content,
        "."
      );
      expect(routes.length).toBeGreaterThan(0);
      expect(routes[0].method).toBe("GET");
    });
  });

  describe("extractFunctionBody", () => {
    it("should extract complete function body", () => {
      const content = `function testFunction() {
  const x = 1;
  return x;
}`;
      const result = (tool as any).extractFunctionBody(
        "test.ts",
        content,
        "testFunction",
        1
      );
      expect(result).toContain("testFunction");
      expect(result).toContain("const x = 1");
      expect(result).toContain("return x");
    });

    it("should handle nested functions", () => {
      const content = `function outer() {
  function inner() {
    return 1;
  }
  return inner();
}`;
      const result = (tool as any).extractFunctionBody(
        "test.ts",
        content,
        "outer",
        1
      );
      expect(result).toContain("outer");
      expect(result).toContain("inner");
    });
  });

  describe("extractIdFromResponse", () => {
    it("should extract ID from direct response", () => {
      const response = { id: "test-id-123" };
      const result = (tool as any).extractIdFromResponse(
        response,
        "snippet"
      );
      expect(result).toBe("test-id-123");
    });

    it("should extract ID from nested repository response", () => {
      const response = { repository: { id: "repo-123" } };
      const result = (tool as any).extractIdFromResponse(
        response,
        "repository"
      );
      expect(result).toBe("repo-123");
    });

    it("should extract ID from nested project response", () => {
      const response = { project: { id: "proj-456" } };
      const result = (tool as any).extractIdFromResponse(response, "project");
      expect(result).toBe("proj-456");
    });

    it("should return undefined for invalid response", () => {
      const response = { data: "invalid" };
      const result = (tool as any).extractIdFromResponse(
        response,
        "snippet"
      );
      expect(result).toBeUndefined();
    });
  });

  describe("extractArrayFromListResponse", () => {
    it("should extract array from resource-specific field", () => {
      const response = { repositories: [{ id: "1" }, { id: "2" }] };
      const result = (tool as any).extractArrayFromListResponse(
        response,
        "repositories"
      );
      expect(result).toHaveLength(2);
    });

    it("should extract array from data field", () => {
      const response = { data: [{ id: "1" }, { id: "2" }] };
      const result = (tool as any).extractArrayFromListResponse(
        response,
        "repositories"
      );
      expect(result).toHaveLength(2);
    });

    it("should handle direct array response", () => {
      const response = [{ id: "1" }, { id: "2" }];
      const result = (tool as any).extractArrayFromListResponse(
        response,
        "repositories"
      );
      expect(result).toHaveLength(2);
    });

    it("should return empty array for invalid response", () => {
      const response = { invalid: "data" };
      const result = (tool as any).extractArrayFromListResponse(
        response,
        "repositories"
      );
      expect(result).toHaveLength(0);
    });
  });
});



