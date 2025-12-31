import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { repositoryCache } from "./repository-cache.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Mock fs operations
vi.mock("node:fs");
vi.mock("node:path");
vi.mock("node:os");

describe("Repository Cache", () => {
  const testCacheDir = "/tmp/test-cache";
  const testProjectPath = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tmpdir).mockReturnValue("/tmp");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("save", () => {
    it("should save repository analysis to cache", () => {
      const analysisData = {
        repositoryName: "test-repo",
        remoteUrl: "https://github.com/user/repo",
        branch: "main",
        branches: ["main", "develop"],
        branchPattern: "main",
        defaultBranch: "main",
        commit: "abc123",
        rootPath: "/test/project",
        gitConfig: {},
        documentation: "# Test",
        structure: {
          files: [],
          structure: {},
          entryPoints: [],
          dependencies: [],
          configFiles: [],
          codePatterns: [],
          linting: {},
          architecture: {
            layers: [],
            patterns: [],
            conventions: [],
          },
        },
      };

      const metadata = {
        repositoryId: "repo-123",
        projectId: "proj-456",
        savedToApi: true,
        cachedAt: new Date().toISOString(),
      };

      // Mock directory doesn't exist, then exists after creation
      vi.mocked(existsSync)
        .mockReturnValueOnce(false) // Directory doesn't exist
        .mockReturnValueOnce(true); // File exists after creation
      vi.mocked(join).mockReturnValue(testCacheDir);

      repositoryCache.save(testProjectPath, analysisData, metadata);

      // mkdirSync should be called if directory doesn't exist
      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();
    });
  });

  describe("load", () => {
    it("should load cached repository analysis", () => {
      const cachedData = {
        repositoryName: "test-repo",
        remoteUrl: "https://github.com/user/repo",
        branch: "main",
        branches: ["main"],
        branchPattern: "main",
        defaultBranch: "main",
        commit: "abc123",
        rootPath: "/test/project",
        gitConfig: {},
        documentation: "# Test",
        structure: { files: [] },
        metadata: {
          cachedAt: new Date().toISOString(),
        },
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(cachedData));
      vi.mocked(join).mockReturnValue(testCacheDir);

      const result = repositoryCache.load(testProjectPath);

      expect(result).toBeDefined();
      expect(result?.repositoryName).toBe("test-repo");
    });

    it("should return null if cache does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = repositoryCache.load(testProjectPath);

      expect(result).toBeNull();
    });

    it("should return null if cache file is invalid JSON", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue("invalid json");
      vi.mocked(join).mockReturnValue(testCacheDir);

      const result = repositoryCache.load(testProjectPath);

      expect(result).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear cache for a project", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(join).mockReturnValue(testCacheDir);

      repositoryCache.clear(testProjectPath);

      expect(existsSync).toHaveBeenCalled();
    });
  });
});

