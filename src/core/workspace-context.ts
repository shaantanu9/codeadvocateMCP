/**
 * Workspace Context
 * 
 * Utilities for detecting and managing workspace context from MCP clients.
 * Workspace information can come from:
 * 1. MCP client initialization params
 * 2. Request headers
 * 3. Environment variables
 * 4. Current working directory
 */

import { cwd } from "process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export interface WorkspaceContext {
  workspacePath: string;
  workspaceName: string;
  projectType?: string;
  packageManager?: "npm" | "yarn" | "pnpm";
  hasGit?: boolean;
  gitBranch?: string;
}

/**
 * Detect workspace path from various sources
 */
export function detectWorkspacePath(
  clientInfo?: {
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
  }
): string | undefined {
  // 1. Check MCP client params (if available)
  if (clientInfo?.params?.workspacePath) {
    return String(clientInfo.params.workspacePath);
  }

  // 2. Check headers (some clients send workspace info in headers)
  if (clientInfo?.headers) {
    const workspaceHeader =
      clientInfo.headers["x-workspace-path"] ||
      clientInfo.headers["x-cursor-workspace"] ||
      clientInfo.headers["workspace-path"];
    if (workspaceHeader) {
      return workspaceHeader;
    }
  }

  // 3. Check environment variable
  const envWorkspace =
    process.env.CURSOR_WORKSPACE ||
    process.env.WORKSPACE_PATH ||
    process.env.PROJECT_ROOT;
  if (envWorkspace && existsSync(envWorkspace)) {
    return envWorkspace;
  }

  // 4. Use current working directory as fallback
  // This is often the workspace root when running in Cursor
  const cwdPath = cwd();
  if (cwdPath && existsSync(cwdPath)) {
    return cwdPath;
  }

  return undefined;
}

/**
 * Get workspace context with additional metadata
 */
export function getWorkspaceContext(
  workspacePath?: string
): WorkspaceContext | null {
  const path = workspacePath || detectWorkspacePath();
  if (!path || !existsSync(path)) {
    return null;
  }

  const workspaceName = path.split(/[/\\]/).pop() || "unknown";

  // Detect project type
  const projectType = detectProjectType(path);

  // Detect package manager
  const packageManager = detectPackageManager(path);

  // Detect Git info
  const gitInfo = detectGitInfo(path);

  return {
    workspacePath: path,
    workspaceName,
    projectType,
    packageManager,
    hasGit: gitInfo.hasGit,
    gitBranch: gitInfo.branch,
  };
}

/**
 * Detect project type from workspace
 */
function detectProjectType(workspacePath: string): string | undefined {
  const indicators = [
    { file: "package.json", type: "node" },
    { file: "requirements.txt", type: "python" },
    { file: "Cargo.toml", type: "rust" },
    { file: "go.mod", type: "go" },
    { file: "pom.xml", type: "java" },
    { file: "build.gradle", type: "java" },
    { file: "tsconfig.json", type: "typescript" },
    { file: "next.config.js", type: "nextjs" },
    { file: "next.config.ts", type: "nextjs" },
    { file: "vue.config.js", type: "vue" },
    { file: "angular.json", type: "angular" },
    { file: "composer.json", type: "php" },
    { file: "Gemfile", type: "ruby" },
  ];

  for (const indicator of indicators) {
    if (existsSync(join(workspacePath, indicator.file))) {
      return indicator.type;
    }
  }

  return undefined;
}

/**
 * Detect package manager from workspace
 */
function detectPackageManager(
  workspacePath: string
): "npm" | "yarn" | "pnpm" | undefined {
  if (existsSync(join(workspacePath, "yarn.lock"))) {
    return "yarn";
  }
  if (existsSync(join(workspacePath, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (existsSync(join(workspacePath, "package-lock.json"))) {
    return "npm";
  }
  return undefined;
}

/**
 * Detect Git information
 */
function detectGitInfo(workspacePath: string): {
  hasGit: boolean;
  branch?: string;
} {
  const gitDir = join(workspacePath, ".git");
  if (!existsSync(gitDir)) {
    return { hasGit: false };
  }

  // Try to read current branch
  try {
    const headPath = join(gitDir, "HEAD");
    if (existsSync(headPath)) {
      const headContent = readFileSync(headPath, "utf-8").trim();
      if (headContent.startsWith("ref: refs/heads/")) {
        const branch = headContent.replace("ref: refs/heads/", "");
        return { hasGit: true, branch };
      }
    }
  } catch (error) {
    // Ignore errors
  }

  return { hasGit: true };
}

/**
 * Get workspace-specific file path
 */
export function getWorkspaceFilePath(
  workspacePath: string | undefined,
  relativePath: string
): string | null {
  if (!workspacePath) {
    return null;
  }

  const fullPath = join(workspacePath, relativePath);
  if (existsSync(fullPath)) {
    return fullPath;
  }

  return null;
}




