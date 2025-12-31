/**
 * Repository Detector
 * 
 * Utility to automatically detect repository ID from workspace context.
 * This helps tools automatically select the correct repository when repositoryId is not provided.
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { logger } from "./logger.js";
import { detectWorkspacePath } from "./workspace-context.js";
import { repositoryCache } from "./repository-cache.js";
import type { ExternalApiService } from "../application/services/external-api.service.js";

export interface RepoDetectionInfo {
  name: string;
  remoteUrl?: string;
  workspacePath?: string;
}

/**
 * Extract repository name from remote URL
 */
function extractRepoNameFromUrl(url: string): string {
  // Remove .git suffix
  let cleanUrl = url.replace(/\.git$/, "");

  // Handle SSH format: git@github.com:user/repo.git
  if (cleanUrl.includes("@")) {
    cleanUrl = cleanUrl.split(":").pop() || cleanUrl;
  }

  // Handle HTTPS format: https://github.com/user/repo
  // Handle Git format: git://github.com/user/repo
  const parts = cleanUrl.split("/");
  const repoName = parts[parts.length - 1];

  return repoName || url;
}

/**
 * Normalize remote URL (convert SSH to HTTPS, remove .git suffix)
 */
function normalizeRemoteUrl(url: string): string {
  // Remove .git suffix
  let normalized = url.replace(/\.git$/, "");

  // Convert SSH to HTTPS format
  // git@github.com:user/repo -> https://github.com/user/repo
  if (normalized.includes("@") && normalized.includes(":")) {
    const match = normalized.match(/git@([^:]+):(.+)/);
    if (match) {
      const [, host, path] = match;
      normalized = `https://${host}/${path}`;
    }
  }

  return normalized;
}

/**
 * Get repository information from workspace
 */
function getRepoInfoFromWorkspace(workspacePath?: string): RepoDetectionInfo | null {
  const path = workspacePath || detectWorkspacePath();
  if (!path || !existsSync(path)) {
    return null;
  }

  const gitDir = join(path, ".git");
  if (!existsSync(gitDir)) {
    // No git repo, use workspace name as fallback
    const workspaceName = path.split(/[/\\]/).pop() || "unknown";
    return {
      name: workspaceName,
      workspacePath: path,
    };
  }

  // Get directory name as fallback
  let name: string;
  try {
    const dirName = execSync("basename $(git rev-parse --show-toplevel)", {
      cwd: path,
      shell: "/bin/bash",
      encoding: "utf-8",
    }).trim();
    name = dirName;
  } catch {
    name = path.split(/[/\\]/).pop() || "unknown";
  }

  // Get remote URL from git config
  let remoteUrl: string | undefined;
  try {
    const rawRemoteUrl = execSync("git config --get remote.origin.url", {
      cwd: path,
      encoding: "utf-8",
    }).trim();

    if (rawRemoteUrl) {
      // Normalize the URL (convert SSH to HTTPS, remove .git)
      remoteUrl = normalizeRemoteUrl(rawRemoteUrl);

      // Extract repo name from remote URL (more accurate than directory name)
      const extractedName = extractRepoNameFromUrl(rawRemoteUrl);
      if (extractedName && extractedName !== rawRemoteUrl) {
        name = extractedName;
      }
    }
  } catch {
    // No remote configured - use directory name
  }

  // Try to get repo name from git config if available
  try {
    const repoNameConfig = execSync("git config --get remote.origin.repo", {
      cwd: path,
      encoding: "utf-8",
    }).trim();
    if (repoNameConfig) {
      name = repoNameConfig;
    }
  } catch {
    // Not available, use name from URL or directory
  }

  return {
    name,
    remoteUrl,
    workspacePath: path,
  };
}

/**
 * Find repository ID from cache
 */
function findRepositoryIdFromCache(repoInfo: RepoDetectionInfo): string | undefined {
  try {
    // Try to find by workspace path in cache
    if (repoInfo.workspacePath) {
      const cached = repositoryCache.load(repoInfo.workspacePath);
      if (cached && cached.metadata && cached.metadata.repositoryId) {
        logger.debug(`Found repository ID from cache (by path): ${cached.metadata.repositoryId}`, {
          repositoryName: cached.repositoryName,
          workspacePath: repoInfo.workspacePath,
        });
        return cached.metadata.repositoryId;
      }
    }

    // Try to find by repository name
    const cached = repositoryCache.findByRepositoryName(repoInfo.name);
    if (cached && cached.metadata && cached.metadata.repositoryId) {
      logger.debug(`Found repository ID from cache (by name): ${cached.metadata.repositoryId}`, {
        repositoryName: cached.repositoryName,
        searchedName: repoInfo.name,
      });
      return cached.metadata.repositoryId;
    }

    // Also try to match by remote URL if available
    if (repoInfo.remoteUrl) {
      const allCached = repositoryCache.listAll();
      for (const cachedInfo of allCached) {
        // Load full cache to check remote URL
        const cached = repositoryCache.load(cachedInfo.rootPath);
        if (
          cached &&
          cached.metadata &&
          cached.metadata.repositoryId &&
          cached.remoteUrl === repoInfo.remoteUrl
        ) {
          logger.debug(`Found repository ID from cache (by remote URL): ${cached.metadata.repositoryId}`, {
            repositoryName: cached.repositoryName,
            remoteUrl: repoInfo.remoteUrl,
          });
          return cached.metadata.repositoryId;
        }
      }
    }
  } catch (error) {
    logger.debug("Error finding repository from cache", {
      error: error instanceof Error ? error.message : String(error),
      repoName: repoInfo.name,
      workspacePath: repoInfo.workspacePath,
    });
  }

  return undefined;
}

/**
 * Find repository ID from API by name or remote URL
 */
async function findRepositoryIdFromApi(
  apiService: ExternalApiService,
  repoInfo: RepoDetectionInfo
): Promise<string | undefined> {
  try {
    // Try to find by repository name
    const repos = await apiService.get("/api/repositories", {
      search: repoInfo.name,
    });

    // Extract repositories array from response
    const reposArray = Array.isArray(repos)
      ? repos
      : repos && typeof repos === "object" && "repositories" in repos
      ? (repos as { repositories: unknown[] }).repositories
      : [];

    // Find exact match by name
    const exactMatch = reposArray.find(
      (r) =>
        r &&
        typeof r === "object" &&
        "name" in r &&
        (r as { name: string }).name === repoInfo.name
    ) as { id: string; name: string; description?: string } | undefined;

    if (exactMatch) {
      logger.info(`Found repository by name: ${exactMatch.id} (${repoInfo.name})`);
      return exactMatch.id;
    }

    // If we have a remote URL, try to find by matching it in description
    if (repoInfo.remoteUrl) {
      const matchByUrl = reposArray.find(
        (r) =>
          r &&
          typeof r === "object" &&
          "description" in r &&
          typeof (r as { description?: string }).description === "string" &&
          repoInfo.remoteUrl &&
          (r as { description: string }).description.includes(repoInfo.remoteUrl)
      ) as { id: string; name: string } | undefined;

      if (matchByUrl) {
        logger.info(
          `Found repository by remote URL: ${matchByUrl.id} (${repoInfo.name})`
        );
        return matchByUrl.id;
      }
    }

    // If multiple matches, prefer the one that matches workspace name
    if (reposArray.length > 0) {
      const workspaceName = repoInfo.workspacePath
        ?.split(/[/\\]/)
        .pop()
        ?.toLowerCase();
      const workspaceMatch = reposArray.find(
        (r) =>
          r &&
          typeof r === "object" &&
          "name" in r &&
          (r as { name: string }).name.toLowerCase() === workspaceName
      ) as { id: string; name: string } | undefined;

      if (workspaceMatch) {
        logger.info(
          `Found repository by workspace name: ${workspaceMatch.id} (${repoInfo.name})`
        );
        return workspaceMatch.id;
      }

      // Return first match if only one
      if (reposArray.length === 1) {
        const first = reposArray[0] as { id: string; name: string } | undefined;
        if (first && "id" in first) {
          logger.info(
            `Found single repository match: ${first.id} (${repoInfo.name})`
          );
          return first.id;
        }
      }
    }
  } catch (error) {
    logger.debug("Error finding repository from API", {
      error: error instanceof Error ? error.message : String(error),
      repoName: repoInfo.name,
    });
  }

  return undefined;
}

/**
 * Auto-detect repository ID from workspace context
 * 
 * Priority:
 * 1. Check cache (by workspace path or repository name)
 * 2. Get repo info from workspace (git remote, workspace name)
 * 3. Search API by repository name
 * 4. Search API by remote URL (if available)
 * 
 * @param apiService - External API service instance
 * @param workspacePath - Optional workspace path (will be auto-detected if not provided)
 * @returns Repository ID if found, undefined otherwise
 */
export async function detectRepositoryId(
  apiService: ExternalApiService,
  workspacePath?: string
): Promise<string | undefined> {
  // Get repository info from workspace
  const repoInfo = getRepoInfoFromWorkspace(workspacePath);
  if (!repoInfo) {
    logger.debug("Could not detect repository info from workspace");
    return undefined;
  }

  logger.debug("Detecting repository ID", {
    name: repoInfo.name,
    remoteUrl: repoInfo.remoteUrl,
    workspacePath: repoInfo.workspacePath,
  });

  // Priority 1: Check cache
  const cachedId = findRepositoryIdFromCache(repoInfo);
  if (cachedId) {
    // Verify it still exists
    try {
      await apiService.get(`/api/repositories/${cachedId}`);
      logger.info(`Using cached repository ID: ${cachedId} (${repoInfo.name})`);
      return cachedId;
    } catch {
      logger.debug("Cached repository ID no longer exists, searching API");
    }
  }

  // Priority 2: Search API
  const apiId = await findRepositoryIdFromApi(apiService, repoInfo);
  if (apiId) {
    return apiId;
  }

  logger.warn("Could not auto-detect repository ID", {
    name: repoInfo.name,
    remoteUrl: repoInfo.remoteUrl,
  });

  return undefined;
}

/**
 * Get repository detection info (for display/debugging)
 */
export function getRepositoryDetectionInfo(
  workspacePath?: string
): RepoDetectionInfo | null {
  return getRepoInfoFromWorkspace(workspacePath);
}

