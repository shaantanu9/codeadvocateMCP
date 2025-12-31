/**
 * Repository Analysis Cache
 *
 * Manages local caching of repository analysis data for use across MCP sessions
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import { logger } from "./logger.js";
import { join } from "node:path";
import { createHash } from "node:crypto";

export interface CachedRepositoryAnalysis {
  repositoryName: string;
  remoteUrl?: string;
  branch: string;
  branches: string[];
  branchPattern?: string;
  defaultBranch?: string;
  commit: string;
  rootPath: string;
  gitConfig: {
    user?: { name?: string; email?: string };
    core?: { editor?: string; autocrlf?: string };
    init?: { defaultBranch?: string };
  };
  documentation: string;
  structure: {
    files: Array<{
      path: string;
      type: "file" | "directory";
      size?: number;
      language?: string;
      codeDetails?: {
        imports: string[];
        exports: string[];
        functions: string[];
        classes: string[];
        interfaces: string[];
        types: string[];
        patterns: string[];
      };
    }>;
    structure: Record<string, unknown>;
    entryPoints: string[];
    dependencies: string[];
    configFiles: string[];
    codePatterns: string[];
    linting: Record<string, unknown>;
    architecture: {
      layers: string[];
      patterns: string[];
      conventions: string[];
    };
  };
  metadata: {
    repositoryId?: string;
    projectId?: string;
    savedToApi?: boolean;
    apiDocumentationId?: string;
    apiMarkdownId?: string;
    cachedAt: string;
    analyzedAt: string;
  };
  progress?: {
    checkpointId: string;
    status: "in_progress" | "completed" | "failed" | "paused";
    currentStep: string;
    steps: Record<string, unknown>;
    lastUpdated: string;
  };
}

class RepositoryCache {
  private cacheDir: string;

  constructor() {
    // Use .cache directory in project root
    this.cacheDir = join(process.cwd(), ".cache", "repository-analysis");

    // Ensure cache directory exists
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
      logger.debug(`Created cache directory: ${this.cacheDir}`);
    }
  }

  /**
   * Generate cache key from repository path
   */
  private getCacheKey(repoPath: string, commit?: string): string {
    const hash = createHash("sha256");
    hash.update(repoPath);
    if (commit) {
      hash.update(commit);
    }
    return hash.digest("hex").substring(0, 16);
  }

  /**
   * Get cache file path
   */
  private getCacheFilePath(repoPath: string, commit?: string): string {
    const key = this.getCacheKey(repoPath, commit);
    return join(this.cacheDir, `${key}.json`);
  }

  /**
   * Save repository analysis to cache
   */
  save(
    repoPath: string,
    analysis: Omit<CachedRepositoryAnalysis, "metadata">,
    metadata: {
      repositoryId?: string;
      projectId?: string;
      savedToApi?: boolean;
      apiDocumentationId?: string;
      apiMarkdownId?: string;
    }
  ): void {
    try {
      const cached: CachedRepositoryAnalysis = {
        ...analysis,
        metadata: {
          ...metadata,
          cachedAt: new Date().toISOString(),
          analyzedAt: new Date().toISOString(),
        },
      };

      const cacheFile = this.getCacheFilePath(repoPath, analysis.commit);
      writeFileSync(cacheFile, JSON.stringify(cached, null, 2), "utf-8");

      logger.info(`Cached repository analysis: ${analysis.repositoryName}`, {
        cacheFile,
        commit: analysis.commit.substring(0, 8),
      });
    } catch (error) {
      logger.error("Failed to save repository cache", error);
      throw error;
    }
  }

  /**
   * Load repository analysis from cache
   */
  load(repoPath: string, commit?: string): CachedRepositoryAnalysis | null {
    try {
      const cacheFile = this.getCacheFilePath(repoPath, commit);

      if (!existsSync(cacheFile)) {
        logger.debug(`Cache not found: ${cacheFile}`);
        return null;
      }

      const content = readFileSync(cacheFile, "utf-8");
      const cached = JSON.parse(content) as CachedRepositoryAnalysis;

      logger.info(
        `Loaded repository analysis from cache: ${cached.repositoryName}`,
        {
          cacheFile,
          cachedAt: cached.metadata.cachedAt,
        }
      );

      return cached;
    } catch (error) {
      logger.error("Failed to load repository cache", error);
      return null;
    }
  }

  /**
   * Find cache by repository name
   */
  findByRepositoryName(
    repositoryName: string
  ): CachedRepositoryAnalysis | null {
    try {
      if (!existsSync(this.cacheDir)) {
        return null;
      }

      const files = readdirSync(this.cacheDir);

      for (const file of files) {
        if (!file.endsWith(".json")) continue;

        try {
          const cacheFile = join(this.cacheDir, file);
          const content = readFileSync(cacheFile, "utf-8");
          const cached = JSON.parse(content) as CachedRepositoryAnalysis;

          if (cached.repositoryName === repositoryName) {
            logger.debug(`Found cache by repository name: ${repositoryName}`, {
              cacheFile,
            });
            return cached;
          }
        } catch {
          // Skip invalid cache files
          continue;
        }
      }

      return null;
    } catch (error) {
      logger.error("Failed to find repository cache by name", error);
      return null;
    }
  }

  /**
   * List all cached repositories
   */
  listAll(): Array<{
    repositoryName: string;
    branch: string;
    commit: string;
    cachedAt: string;
    rootPath: string;
  }> {
    try {
      if (!existsSync(this.cacheDir)) {
        return [];
      }

      const files = readdirSync(this.cacheDir);
      const cached: Array<{
        repositoryName: string;
        branch: string;
        commit: string;
        cachedAt: string;
        rootPath: string;
      }> = [];

      for (const file of files) {
        if (!file.endsWith(".json")) continue;

        try {
          const cacheFile = join(this.cacheDir, file);
          const content = readFileSync(cacheFile, "utf-8");
          const data = JSON.parse(content) as CachedRepositoryAnalysis;

          cached.push({
            repositoryName: data.repositoryName,
            branch: data.branch,
            commit: data.commit,
            cachedAt: data.metadata.cachedAt,
            rootPath: data.rootPath,
          });
        } catch {
          // Skip invalid cache files
          continue;
        }
      }

      return cached.sort(
        (a, b) =>
          new Date(b.cachedAt).getTime() - new Date(a.cachedAt).getTime()
      );
    } catch (error) {
      logger.error("Failed to list cached repositories", error);
      return [];
    }
  }

  /**
   * Check if cache exists and is valid
   */
  exists(repoPath: string, commit?: string): boolean {
    const cacheFile = this.getCacheFilePath(repoPath, commit);
    return existsSync(cacheFile);
  }

  /**
   * Clear cache for a specific repository
   */
  clear(repoPath: string, commit?: string): boolean {
    try {
      const cacheFile = this.getCacheFilePath(repoPath, commit);
      if (existsSync(cacheFile)) {
        unlinkSync(cacheFile);
        logger.info(`Cleared cache: ${cacheFile}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to clear repository cache", error);
      return false;
    }
  }

  /**
   * Clear all caches
   */
  clearAll(): number {
    try {
      if (!existsSync(this.cacheDir)) {
        return 0;
      }

      const files = readdirSync(this.cacheDir);
      let cleared = 0;

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            unlinkSync(join(this.cacheDir, file));
            cleared++;
          } catch {
            // Skip if can't delete
          }
        }
      }

      logger.info(`Cleared ${cleared} cache files`);
      return cleared;
    } catch (error) {
      logger.error("Failed to clear all caches", error);
      return 0;
    }
  }

  /**
   * Get progress checkpoint file path
   */
  private getProgressFilePath(checkpointId: string): string {
    return join(this.cacheDir, `progress_${checkpointId}.json`);
  }

  /**
   * Save analysis progress checkpoint
   */
  saveProgress(progress: {
    checkpointId: string;
    projectPath: string;
    status: "in_progress" | "completed" | "failed" | "paused";
    currentStep: string;
    steps: Record<string, unknown>;
    lastUpdated: string;
  }): void {
    try {
      const progressPath = this.getProgressFilePath(progress.checkpointId);
      writeFileSync(progressPath, JSON.stringify(progress, null, 2), "utf-8");
      logger.debug(`Saved progress checkpoint: ${progress.checkpointId}`);
    } catch (error) {
      logger.warn("Failed to save progress checkpoint", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Load analysis progress checkpoint
   */
  loadProgress(checkpointId: string): {
    checkpointId: string;
    projectPath: string;
    status: "in_progress" | "completed" | "failed" | "paused";
    currentStep: string;
    steps: Record<string, unknown>;
    lastUpdated: string;
  } | null {
    try {
      const progressPath = this.getProgressFilePath(checkpointId);
      if (!existsSync(progressPath)) {
        return null;
      }
      const content = readFileSync(progressPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      logger.warn("Failed to load progress checkpoint", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * List all progress checkpoints
   */
  listProgressCheckpoints(): Array<{
    checkpointId: string;
    projectPath: string;
    status: string;
    currentStep: string;
    lastUpdated: string;
  }> {
    try {
      const files = readdirSync(this.cacheDir);
      const checkpoints: Array<{
        checkpointId: string;
        projectPath: string;
        status: string;
        currentStep: string;
        lastUpdated: string;
      }> = [];

      for (const file of files) {
        if (file.startsWith("progress_") && file.endsWith(".json")) {
          try {
            const content = readFileSync(join(this.cacheDir, file), "utf-8");
            const progress = JSON.parse(content);
            checkpoints.push({
              checkpointId: progress.checkpointId,
              projectPath: progress.projectPath,
              status: progress.status,
              currentStep: progress.currentStep,
              lastUpdated: progress.lastUpdated,
            });
          } catch {
            // Skip invalid files
          }
        }
      }

      return checkpoints.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    } catch {
      return [];
    }
  }

  /**
   * Delete progress checkpoint
   */
  deleteProgress(checkpointId: string): void {
    try {
      const progressPath = this.getProgressFilePath(checkpointId);
      if (existsSync(progressPath)) {
        unlinkSync(progressPath);
        logger.debug(`Deleted progress checkpoint: ${checkpointId}`);
      }
    } catch (error) {
      logger.warn("Failed to delete progress checkpoint", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const repositoryCache = new RepositoryCache();
