/**
 * Analyze and Save Repository Tool
 *
 * Comprehensive tool that:
 * 1. Detects current git repository
 * 2. Analyzes codebase structure and flow
 * 3. Extracts knowledge from README and code
 * 4. Generates comprehensive documentation
 * 5. Saves knowledge to external API for use in other tools
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { repositoryCache } from "../../core/repository-cache.js";
import { logger } from "../../core/logger.js";
import { AIServiceFactory } from "../../services/ai-service-factory.js";
import { randomBytes } from "node:crypto";

export interface AnalyzeAndSaveRepoParams {
  projectPath?: string;
  repositoryId?: string;
  projectId?: string;
  deepAnalysis?: boolean;
  includeNodeModules?: boolean;
  useCache?: boolean;
  forceRefresh?: boolean;
  useLLM?: boolean;
  llmPrompt?: string;
  llmProvider?: "openai" | "anthropic" | "auto";
  resume?: boolean;
  checkpointId?: string;
}

interface AnalysisProgress {
  checkpointId: string;
  projectPath: string;
  startedAt: string;
  lastUpdated: string;
  status: "in_progress" | "completed" | "failed" | "paused";
  currentStep: string;
  steps: {
    repoInfo?: { completed: boolean; data?: RepoInfo };
    documentation?: {
      completed: boolean;
      filesRead: string[];
      totalFiles: number;
    };
    codeStructure?: {
      completed: boolean;
      filesCrawled: string[];
      totalFiles: number;
    };
    comprehensiveAnalysis?: { completed: boolean };
    mermaidDiagrams?: { completed: boolean; diagramsGenerated: string[] };
    codingStandards?: { completed: boolean; saved: boolean };
    routes?: { completed: boolean; routesExtracted: number; saved: boolean };
    folderStructure?: { completed: boolean; saved: boolean };
    analysis?: { completed: boolean; saved: boolean; analysisId?: string };
    mainDocumentation?: { completed: boolean; saved: boolean; docId?: string };
    markdownDocument?: {
      completed: boolean;
      saved: boolean;
      markdownId?: string;
    };
    summary?: { completed: boolean; saved: boolean };
    snippets?: {
      completed: boolean;
      utilityFunctions: { saved: number; total: number; savedIds: string[] };
      importantFunctions: { saved: number; total: number; savedIds: string[] };
      routes: { saved: boolean; snippetId?: string };
      keyFiles: { saved: number; total: number; savedIds: string[] };
      totalSaved: number;
    };
  };
  errors?: Array<{ step: string; error: string; timestamp: string }>;
  repositoryId?: string;
  projectId?: string;
}

interface RepoInfo {
  name: string;
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
}

interface LintingConfig {
  eslint?: {
    configFile?: string;
    config?: Record<string, unknown>;
    version?: string;
  };
  prettier?: {
    configFile?: string;
    config?: Record<string, unknown>;
    version?: string;
  };
  tslint?: {
    configFile?: string;
    config?: Record<string, unknown>;
    version?: string;
  };
  stylelint?: {
    configFile?: string;
    config?: Record<string, unknown>;
    version?: string;
  };
  biome?: {
    configFile?: string;
    config?: Record<string, unknown>;
    version?: string;
  };
  husky?: {
    hooks?: string[];
    version?: string;
  };
  lintStaged?: {
    config?: Record<string, unknown>;
    version?: string;
  };
}

interface FunctionDetail {
  name: string;
  filePath: string;
  lineNumber: number;
  signature: string;
  parameters: Array<{ name: string; type: string; optional: boolean }>;
  returnType: string;
  isAsync: boolean;
  isExported: boolean;
  visibility: "public" | "private" | "protected";
  documentation?: string;
  category:
    | "utility"
    | "helper"
    | "service"
    | "component"
    | "handler"
    | "middleware"
    | "other";
}

interface CodingStandards {
  namingConventions: {
    variables:
      | "camelCase"
      | "snake_case"
      | "PascalCase"
      | "UPPER_SNAKE_CASE"
      | "mixed";
    functions: "camelCase" | "PascalCase" | "mixed";
    classes: "PascalCase" | "mixed";
    constants: "UPPER_SNAKE_CASE" | "camelCase" | "mixed";
    files: string; // e.g., "kebab-case", "PascalCase"
  };
  fileOrganization: {
    structure: string; // e.g., "feature-based", "layer-based", "flat"
    patterns: string[];
  };
  importPatterns: {
    style: "named" | "default" | "namespace" | "mixed";
    ordering: "alphabetical" | "grouped" | "custom" | "mixed";
    groups: string[];
  };
  errorHandling: {
    pattern: "try-catch" | "result-type" | "custom" | "mixed";
    errorClasses: string[];
  };
  testing: {
    framework?: string;
    patterns: string[];
    utilities: string[];
  };
}

interface FolderNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  language?: string;
  children?: FolderNode[];
}

interface RouteInfo {
  method: string; // GET, POST, PUT, DELETE, PATCH, etc.
  path: string;
  handler?: string;
  middleware?: string[];
  filePath: string;
  lineNumber: number;
  description?: string;
}

interface ComprehensiveAnalysis {
  repository: RepoInfo;
  folderStructure: FolderNode;
  utilityFunctions: FunctionDetail[];
  allFunctions: FunctionDetail[];
  routes: RouteInfo[];
  codingStandards: CodingStandards;
  architecture: {
    layers: Array<{
      name: string;
      path: string;
      description: string;
      files: string[];
    }>;
    patterns: Array<{
      name: string;
      description: string;
      files: string[];
    }>;
  };
  linting: LintingConfig;
  dependencies: {
    production: Array<{ name: string; version: string }>;
    development: Array<{ name: string; version: string }>;
    peer: Array<{ name: string; version: string }>;
  };
  entryPoints: Array<{
    path: string;
    type: "main" | "module" | "browser" | "types";
    description: string;
  }>;
  documentation: Array<{
    filename: string;
    content: string;
    type: "readme" | "changelog" | "license" | "contributing" | "other";
  }>;
  llmInsights?: {
    strengths?: string[];
    improvements?: string[];
    recommendations?: string[];
    patterns?: string[];
    decisions?: string[];
    llmAnalysis?: string;
    provider?: string;
    enhanced?: boolean;
  };
}

interface CodeStructure {
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
  linting: LintingConfig;
  architecture: {
    layers: string[];
    patterns: string[];
    conventions: string[];
  };
}

class AnalyzeAndSaveRepoTool
  extends BaseToolHandler
  implements BaseToolDefinition<AnalyzeAndSaveRepoParams>
{
  name = "analyzeAndSaveRepository";
  description =
    "Analyze git repository, extract codebase structure and knowledge, generate documentation, and save to project knowledge base for use in code generation";

  paramsSchema = z.object({
    projectPath: z
      .string()
      .optional()
      .describe("Path to the project (defaults to current directory)"),
    repositoryId: z
      .string()
      .optional()
      .describe("Repository ID in external API to save knowledge to"),
    projectId: z
      .string()
      .optional()
      .describe("Project ID in external API to associate with"),
    deepAnalysis: z
      .boolean()
      .optional()
      .default(true)
      .describe("Perform deep code analysis (slower but more thorough)"),
    includeNodeModules: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include node_modules in analysis"),
    useCache: z
      .boolean()
      .optional()
      .default(true)
      .describe("Use cached analysis if available (skip re-analysis)"),
    forceRefresh: z
      .boolean()
      .optional()
      .default(false)
      .describe("Force refresh even if cache exists"),
    useLLM: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Use LLM (OpenAI/Anthropic) to enhance analysis with natural language understanding"
      ),
    llmPrompt: z
      .string()
      .optional()
      .describe(
        "Custom prompt for LLM analysis (e.g., 'Analyze this repository and extract all utility functions, coding patterns, and architectural decisions')"
      ),
    llmProvider: z
      .enum(["openai", "anthropic", "auto"])
      .optional()
      .default("auto")
      .describe("LLM provider to use (auto selects first available)"),
    resume: z
      .boolean()
      .optional()
      .default(false)
      .describe("Resume from last checkpoint if available"),
    checkpointId: z
      .string()
      .optional()
      .describe(
        "Specific checkpoint ID to resume from (if not provided, uses latest)"
      ),
  });

  /**
   * Extract ID from API response (handles different response formats)
   */
  private extractIdFromResponse(
    response: unknown,
    resourceType:
      | "repository"
      | "project"
      | "snippet"
      | "documentation"
      | "file"
      | "rule"
      | "prompt"
      | "pr_rule"
      | "analysis"
  ): string | undefined {
    if (!response || typeof response !== "object") {
      return undefined;
    }

    const resp = response as Record<string, unknown>;

    // Direct ID (snippets, documentation)
    if ("id" in resp && typeof resp.id === "string") {
      return resp.id;
    }

    // Nested object formats
    if (resourceType === "repository" && "repository" in resp) {
      const repo = resp.repository as Record<string, unknown>;
      if (repo && typeof repo === "object" && "id" in repo) {
        return String(repo.id);
      }
    }

    if (resourceType === "project" && "project" in resp) {
      const project = resp.project as Record<string, unknown>;
      if (project && typeof project === "object" && "id" in project) {
        return String(project.id);
      }
    }

    if (resourceType === "file" && "file" in resp) {
      const file = resp.file as Record<string, unknown>;
      if (file && typeof file === "object" && "id" in file) {
        return String(file.id);
      }
    }

    if (resourceType === "rule" && "rule" in resp) {
      const rule = resp.rule as Record<string, unknown>;
      if (rule && typeof rule === "object" && "id" in rule) {
        return String(rule.id);
      }
    }

    if (resourceType === "prompt" && "prompt" in resp) {
      const prompt = resp.prompt as Record<string, unknown>;
      if (prompt && typeof prompt === "object" && "id" in prompt) {
        return String(prompt.id);
      }
    }

    if (resourceType === "pr_rule" && "pr_rule" in resp) {
      const prRule = resp.pr_rule as Record<string, unknown>;
      if (prRule && typeof prRule === "object" && "id" in prRule) {
        return String(prRule.id);
      }
    }

    if (resourceType === "analysis" && "id" in resp) {
      return String(resp.id);
    }

    return undefined;
  }

  /**
   * Extract array from list response (handles different response formats)
   */
  private extractArrayFromListResponse(
    response: unknown,
    resourceType:
      | "repositories"
      | "projects"
      | "snippets"
      | "documentations"
      | "files"
      | "rules"
      | "prompts"
      | "pr_rules"
  ): unknown[] {
    if (!response || typeof response !== "object") {
      return [];
    }

    const resp = response as Record<string, unknown>;

    // Check for resource-specific array field
    if (resourceType in resp && Array.isArray(resp[resourceType])) {
      return resp[resourceType] as unknown[];
    }

    // Fallback: check for "data" field
    if ("data" in resp && Array.isArray(resp.data)) {
      return resp.data;
    }

    // Fallback: if response is already an array
    if (Array.isArray(response)) {
      return response;
    }

    return [];
  }

  /**
   * Generate a unique checkpoint ID
   */
  private generateCheckpointId(): string {
    return `checkpoint_${Date.now()}_${randomBytes(4).toString("hex")}`;
  }

  /**
   * Create or update progress checkpoint
   */
  private saveCheckpoint(
    checkpointId: string,
    projectPath: string,
    currentStep: string,
    status: "in_progress" | "completed" | "failed" | "paused",
    steps: AnalysisProgress["steps"],
    repositoryId?: string,
    projectId?: string,
    errors?: Array<{ step: string; error: string; timestamp: string }>
  ): void {
    const progress: AnalysisProgress = {
      checkpointId,
      projectPath,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status,
      currentStep,
      steps,
      repositoryId,
      projectId,
      errors,
    };

    repositoryCache.saveProgress({
      checkpointId: progress.checkpointId,
      projectPath: progress.projectPath,
      status: progress.status,
      currentStep: progress.currentStep,
      steps: progress.steps as Record<string, unknown>,
      lastUpdated: progress.lastUpdated,
    });

    logger.debug(`Checkpoint saved: ${checkpointId} - Step: ${currentStep}`);
  }

  /**
   * Load progress checkpoint
   */
  private loadCheckpoint(checkpointId?: string): AnalysisProgress | null {
    if (!checkpointId) {
      // Try to find latest checkpoint for current project
      const checkpoints = repositoryCache.listProgressCheckpoints();
      if (checkpoints.length > 0) {
        const latest = checkpoints[0];
        const loaded = repositoryCache.loadProgress(latest.checkpointId);
        if (loaded) {
          return {
            checkpointId: loaded.checkpointId,
            projectPath: loaded.projectPath,
            startedAt: new Date().toISOString(),
            lastUpdated: loaded.lastUpdated,
            status: loaded.status as AnalysisProgress["status"],
            currentStep: loaded.currentStep,
            steps: loaded.steps as AnalysisProgress["steps"],
          };
        }
      }
      return null;
    }

    const loaded = repositoryCache.loadProgress(checkpointId);
    if (!loaded) {
      return null;
    }

    return {
      checkpointId: loaded.checkpointId,
      projectPath: loaded.projectPath,
      startedAt: new Date().toISOString(),
      lastUpdated: loaded.lastUpdated,
      status: loaded.status as AnalysisProgress["status"],
      currentStep: loaded.currentStep,
      steps: loaded.steps as AnalysisProgress["steps"],
    };
  }

  /**
   * Get progress summary for display
   */
  private getProgressSummary(progress: AnalysisProgress): string {
    const steps = progress.steps;
    let summary = `📊 Progress Summary (Checkpoint: ${progress.checkpointId.substring(
      0,
      16
    )}...)\n\n`;
    summary += `**Status:** ${progress.status}\n`;
    summary += `**Current Step:** ${progress.currentStep}\n`;
    summary += `**Last Updated:** ${new Date(
      progress.lastUpdated
    ).toLocaleString()}\n\n`;

    summary += `**Completed Steps:**\n`;
    if (steps.repoInfo?.completed) summary += `  ✅ Repository Info\n`;
    if (steps.documentation?.completed) {
      summary += `  ✅ Documentation (${steps.documentation.filesRead.length}/${steps.documentation.totalFiles} files)\n`;
    }
    if (steps.codeStructure?.completed) {
      summary += `  ✅ Code Structure (${steps.codeStructure.filesCrawled.length}/${steps.codeStructure.totalFiles} files crawled)\n`;
    }
    if (steps.comprehensiveAnalysis?.completed)
      summary += `  ✅ Comprehensive Analysis\n`;
    if (steps.mermaidDiagrams?.completed) {
      summary += `  ✅ Mermaid Diagrams (${steps.mermaidDiagrams.diagramsGenerated.length} generated)\n`;
    }
    if (steps.codingStandards?.completed) summary += `  ✅ Coding Standards\n`;
    if (steps.routes?.completed) {
      summary += `  ✅ Routes (${steps.routes.routesExtracted} extracted)\n`;
    }
    if (steps.folderStructure?.completed) summary += `  ✅ Folder Structure\n`;
    if (steps.analysis?.completed) summary += `  ✅ Analysis Saved\n`;
    if (steps.mainDocumentation?.completed)
      summary += `  ✅ Main Documentation\n`;
    if (steps.markdownDocument?.completed)
      summary += `  ✅ Markdown Document\n`;
    if (steps.summary?.completed) summary += `  ✅ Summary\n`;
    if (steps.snippets?.completed) {
      summary += `  ✅ Snippets (${steps.snippets.totalSaved} saved)\n`;
      summary += `    - Utility Functions: ${steps.snippets.utilityFunctions.saved}/${steps.snippets.utilityFunctions.total}\n`;
      summary += `    - Important Functions: ${steps.snippets.importantFunctions.saved}/${steps.snippets.importantFunctions.total}\n`;
      summary += `    - Key Files: ${steps.snippets.keyFiles.saved}/${steps.snippets.keyFiles.total}\n`;
    }

    summary += `\n**Remaining Steps:**\n`;
    if (!steps.repoInfo?.completed) summary += `  ⏳ Repository Info\n`;
    if (!steps.documentation?.completed) summary += `  ⏳ Documentation\n`;
    if (!steps.codeStructure?.completed) summary += `  ⏳ Code Structure\n`;
    if (!steps.comprehensiveAnalysis?.completed)
      summary += `  ⏳ Comprehensive Analysis\n`;
    if (!steps.mermaidDiagrams?.completed) summary += `  ⏳ Mermaid Diagrams\n`;
    if (!steps.codingStandards?.completed) summary += `  ⏳ Coding Standards\n`;
    if (!steps.routes?.completed) summary += `  ⏳ Routes\n`;
    if (!steps.folderStructure?.completed) summary += `  ⏳ Folder Structure\n`;
    if (!steps.analysis?.completed) summary += `  ⏳ Analysis\n`;
    if (!steps.mainDocumentation?.completed)
      summary += `  ⏳ Main Documentation\n`;
    if (!steps.markdownDocument?.completed)
      summary += `  ⏳ Markdown Document\n`;
    if (!steps.summary?.completed) summary += `  ⏳ Summary\n`;
    if (!steps.snippets?.completed) summary += `  ⏳ Snippets\n`;

    if (progress.errors && progress.errors.length > 0) {
      summary += `\n**Errors:**\n`;
      for (const err of progress.errors) {
        summary += `  ❌ ${err.step}: ${err.error}\n`;
      }
    }

    return summary;
  }

  /**
   * Extract repository name from remote URL
   */
  private extractRepoNameFromUrl(url: string): string {
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
  private normalizeRemoteUrl(url: string): string {
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
   * Get git repository information
   */
  private getRepoInfo(projectPath: string): RepoInfo {
    try {
      const repoName = execSync("git rev-parse --show-toplevel", {
        cwd: projectPath,
        encoding: "utf-8",
      }).trim();

      // Get directory name as fallback
      const dirName = execSync("basename $(git rev-parse --show-toplevel)", {
        cwd: projectPath,
        shell: "/bin/bash",
        encoding: "utf-8",
      }).trim();

      // Get remote URL from git config
      let remoteUrl: string | undefined;
      let name = dirName; // Default to directory name

      try {
        const rawRemoteUrl = execSync("git config --get remote.origin.url", {
          cwd: projectPath,
          encoding: "utf-8",
        }).trim();

        if (rawRemoteUrl) {
          // Normalize the URL (convert SSH to HTTPS, remove .git)
          remoteUrl = this.normalizeRemoteUrl(rawRemoteUrl);

          // Extract repo name from remote URL (more accurate than directory name)
          const extractedName = this.extractRepoNameFromUrl(rawRemoteUrl);
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
          cwd: projectPath,
          encoding: "utf-8",
        }).trim();
        if (repoNameConfig) {
          name = repoNameConfig;
        }
      } catch {
        // Not available, use name from URL or directory
      }

      const branch = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd: projectPath,
        encoding: "utf-8",
      }).trim();

      // Get all branches
      const branches = execSync("git branch -a", {
        cwd: projectPath,
        encoding: "utf-8",
      })
        .split("\n")
        .map((b) =>
          b
            .trim()
            .replace(/^\*\s*/, "")
            .replace(/^remotes\/origin\//, "")
        )
        .filter((b) => b && !b.includes("HEAD"))
        .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

      // Get default branch
      let defaultBranch: string | undefined;
      try {
        defaultBranch = execSync(
          "git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || git rev-parse --abbrev-ref origin/HEAD 2>/dev/null",
          {
            cwd: projectPath,
            shell: "/bin/bash",
            encoding: "utf-8",
          }
        )
          .trim()
          .replace(/^refs\/remotes\/origin\//, "")
          .replace(/^origin\//, "");
      } catch {
        // Try alternative method
        try {
          defaultBranch = execSync(
            "git branch -r | grep 'HEAD' | sed 's/.*\\///'",
            {
              cwd: projectPath,
              shell: "/bin/bash",
              encoding: "utf-8",
            }
          ).trim();
        } catch {
          defaultBranch =
            branches.find((b) => b === "main" || b === "master") || branches[0];
        }
      }

      // Detect branch pattern (common patterns: main, master, develop, feature/*, etc.)
      const branchPattern = this.detectBranchPattern(branches);

      // Get git config
      const gitConfig: RepoInfo["gitConfig"] = {};
      try {
        const userName = execSync("git config user.name", {
          cwd: projectPath,
          encoding: "utf-8",
        }).trim();
        const userEmail = execSync("git config user.email", {
          cwd: projectPath,
          encoding: "utf-8",
        }).trim();
        if (userName) gitConfig.user = { name: userName };
        if (userEmail) gitConfig.user = { ...gitConfig.user, email: userEmail };
      } catch {
        // No user config
      }

      try {
        const defaultBranchConfig = execSync("git config init.defaultBranch", {
          cwd: projectPath,
          encoding: "utf-8",
        }).trim();
        if (defaultBranchConfig) {
          gitConfig.init = { defaultBranch: defaultBranchConfig };
        }
      } catch {
        // No init config
      }

      const commit = execSync("git rev-parse HEAD", {
        cwd: projectPath,
        encoding: "utf-8",
      }).trim();

      return {
        name,
        remoteUrl,
        branch,
        branches,
        branchPattern,
        defaultBranch,
        commit,
        rootPath: repoName,
        gitConfig,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to get repository information", {
        error: errorMessage,
        stack: errorStack,
        projectPath,
        context: "getRepoInfo",
      });
      throw new Error(
        `Not a git repository or git not available: ${errorMessage}`
      );
    }
  }

  /**
   * Read README and other documentation files
   */
  private readDocumentationFiles(rootPath: string): Record<string, string> {
    const docs: Record<string, string> = {};
    const docFiles = [
      "README.md",
      "README.txt",
      "README",
      "CONTRIBUTING.md",
      "CHANGELOG.md",
      "LICENSE",
    ];

    for (const docFile of docFiles) {
      const docPath = join(rootPath, docFile);
      if (existsSync(docPath)) {
        try {
          docs[docFile] = readFileSync(docPath, "utf-8");
        } catch (error) {
          // Skip if can't read
        }
      }
    }

    return docs;
  }

  /**
   * Detect branch naming pattern
   */
  private detectBranchPattern(branches: string[]): string {
    const patterns: Record<string, number> = {};

    for (const branch of branches) {
      if (branch.includes("/")) {
        const prefix = branch.split("/")[0];
        patterns[prefix] = (patterns[prefix] || 0) + 1;
      } else if (
        [
          "main",
          "master",
          "develop",
          "dev",
          "staging",
          "production",
          "prod",
        ].includes(branch)
      ) {
        patterns[branch] = (patterns[branch] || 0) + 1;
      }
    }

    const sorted = Object.entries(patterns).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const topPattern = sorted[0][0];
      if (topPattern.includes("/")) {
        return `${topPattern}/*`;
      }
      return topPattern;
    }

    return "unknown";
  }

  /**
   * Extract linting configuration
   */
  private extractLintingConfig(rootPath: string): LintingConfig {
    const linting: LintingConfig = {};

    // ESLint
    const eslintConfigs = [
      ".eslintrc",
      ".eslintrc.js",
      ".eslintrc.json",
      ".eslintrc.yml",
      ".eslintrc.yaml",
      "eslint.config.js",
      "eslint.config.mjs",
      "eslint.config.cjs",
    ];

    for (const configFile of eslintConfigs) {
      const configPath = join(rootPath, configFile);
      if (existsSync(configPath)) {
        try {
          const content = readFileSync(configPath, "utf-8");
          let config: Record<string, unknown> = {};

          if (configFile.endsWith(".json")) {
            config = JSON.parse(content);
          } else if (
            configFile.endsWith(".js") ||
            configFile.endsWith(".mjs") ||
            configFile.endsWith(".cjs")
          ) {
            // For JS configs, we'll just note they exist
            config = { type: "javascript", file: configFile };
          } else if (
            configFile.endsWith(".yml") ||
            configFile.endsWith(".yaml")
          ) {
            // Would need yaml parser, but we'll note it exists
            config = { type: "yaml", file: configFile };
          } else {
            // .eslintrc (JSON format)
            try {
              config = JSON.parse(content);
            } catch {
              config = { type: "legacy", file: configFile };
            }
          }

          linting.eslint = {
            configFile,
            config,
          };
          break;
        } catch {
          // Skip if can't read
        }
      }
    }

    // Check package.json for ESLint version
    const packageJsonPath = join(rootPath, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        if (
          packageJson.devDependencies?.eslint ||
          packageJson.dependencies?.eslint
        ) {
          linting.eslint = {
            ...linting.eslint,
            version:
              packageJson.devDependencies?.eslint ||
              packageJson.dependencies?.eslint,
          };
        }
      } catch {
        // Skip
      }
    }

    // Prettier
    const prettierConfigs = [
      ".prettierrc",
      ".prettierrc.js",
      ".prettierrc.json",
      ".prettierrc.yml",
      ".prettierrc.yaml",
      ".prettierrc.toml",
      "prettier.config.js",
      "prettier.config.mjs",
      "prettier.config.cjs",
      ".prettierrc.json5",
    ];

    for (const configFile of prettierConfigs) {
      const configPath = join(rootPath, configFile);
      if (existsSync(configPath)) {
        try {
          const content = readFileSync(configPath, "utf-8");
          let config: Record<string, unknown> = {};

          if (configFile.endsWith(".json") || configFile.endsWith(".json5")) {
            config = JSON.parse(content);
          } else if (
            configFile.endsWith(".js") ||
            configFile.endsWith(".mjs") ||
            configFile.endsWith(".cjs")
          ) {
            config = { type: "javascript", file: configFile };
          } else if (
            configFile.endsWith(".yml") ||
            configFile.endsWith(".yaml")
          ) {
            config = { type: "yaml", file: configFile };
          } else if (configFile.endsWith(".toml")) {
            config = { type: "toml", file: configFile };
          } else {
            try {
              config = JSON.parse(content);
            } catch {
              config = { type: "legacy", file: configFile };
            }
          }

          linting.prettier = {
            configFile,
            config,
          };
          break;
        } catch {
          // Skip
        }
      }
    }

    // Check package.json for Prettier version
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        if (
          packageJson.devDependencies?.prettier ||
          packageJson.dependencies?.prettier
        ) {
          linting.prettier = {
            ...linting.prettier,
            version:
              packageJson.devDependencies?.prettier ||
              packageJson.dependencies?.prettier,
          };
        }
      } catch {
        // Skip
      }
    }

    // TSLint (deprecated but still used)
    const tslintConfigs = ["tslint.json"];
    for (const configFile of tslintConfigs) {
      const configPath = join(rootPath, configFile);
      if (existsSync(configPath)) {
        try {
          const content = readFileSync(configPath, "utf-8");
          const config = JSON.parse(content);
          linting.tslint = {
            configFile,
            config,
          };
        } catch {
          // Skip
        }
      }
    }

    // Stylelint
    const stylelintConfigs = [
      ".stylelintrc",
      ".stylelintrc.js",
      ".stylelintrc.json",
      ".stylelintrc.yml",
      ".stylelintrc.yaml",
      "stylelint.config.js",
    ];
    for (const configFile of stylelintConfigs) {
      const configPath = join(rootPath, configFile);
      if (existsSync(configPath)) {
        try {
          const content = readFileSync(configPath, "utf-8");
          let config: Record<string, unknown> = {};
          if (configFile.endsWith(".json")) {
            config = JSON.parse(content);
          } else {
            config = { type: "other", file: configFile };
          }
          linting.stylelint = {
            configFile,
            config,
          };
        } catch {
          // Skip
        }
      }
    }

    // Biome
    const biomeConfigs = ["biome.json", "biome.jsonc"];
    for (const configFile of biomeConfigs) {
      const configPath = join(rootPath, configFile);
      if (existsSync(configPath)) {
        try {
          const content = readFileSync(configPath, "utf-8");
          const config = JSON.parse(content);
          linting.biome = {
            configFile,
            config,
          };
        } catch {
          // Skip
        }
      }
    }

    // Husky (git hooks)
    const huskyPath = join(rootPath, ".husky");
    if (existsSync(huskyPath)) {
      try {
        const hooks = readdirSync(huskyPath)
          .filter((f) => !f.startsWith("."))
          .map((f) => f);
        linting.husky = {
          hooks,
        };
      } catch {
        // Skip
      }
    }

    // lint-staged
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        if (packageJson["lint-staged"]) {
          linting.lintStaged = {
            config: packageJson["lint-staged"],
          };
        }
      } catch {
        // Skip
      }
    }

    return linting;
  }

  /**
   * Extract routes/API endpoints from code
   */
  private extractRoutes(
    filePath: string,
    content: string,
    rootPath: string
  ): RouteInfo[] {
    const routes: RouteInfo[] = [];
    const lines = content.split("\n");

    // Express.js route patterns
    const expressRoutePatterns = [
      // app.get('/path', handler)
      /(?:app|router|express)\.(get|post|put|delete|patch|options|head|all)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // app.use('/path', middleware)
      /(?:app|router)\.use\s*\(\s*['"`]([^'"`]+)['"`]/g,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Express routes
      for (const pattern of expressRoutePatterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const method = match[1]?.toUpperCase() || "USE";
          const path = match[2] || match[1]; // For use(), path is in match[1]

          // Try to find handler function name
          let handler: string | undefined;
          const handlerMatch = line.match(/(?:,\s*)(\w+)(?:\s*[,)])/);
          if (handlerMatch) {
            handler = handlerMatch[1];
          }

          // Check for middleware array
          const middleware: string[] = [];
          const middlewareMatch = line.match(/\[([^\]]+)\]/);
          if (middlewareMatch) {
            middleware.push(
              ...middlewareMatch[1]
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean)
            );
          }

          routes.push({
            method,
            path: path || "/",
            handler,
            middleware: middleware.length > 0 ? middleware : undefined,
            filePath: relative(rootPath, filePath),
            lineNumber: i + 1,
          });
        }
      }

      // Next.js API routes (app/api/.../route.ts)
      if (filePath.includes("/api/") && filePath.includes("/route")) {
        const apiPath = filePath
          .split("/api/")[1]
          ?.split("/route")[0]
          ?.replace(/\[([^\]]+)\]/g, ":$1");

        // Check for HTTP method exports
        if (line.includes("export async function GET")) {
          routes.push({
            method: "GET",
            path: `/api/${apiPath || ""}`,
            handler: "GET",
            filePath: relative(rootPath, filePath),
            lineNumber: i + 1,
          });
        }
        if (line.includes("export async function POST")) {
          routes.push({
            method: "POST",
            path: `/api/${apiPath || ""}`,
            handler: "POST",
            filePath: relative(rootPath, filePath),
            lineNumber: i + 1,
          });
        }
      }
    }

    return routes;
  }

  /**
   * Extract code patterns and details from files
   */
  private extractCodeDetails(
    _filePath: string,
    content: string
  ): {
    imports: string[];
    exports: string[];
    functions: string[];
    classes: string[];
    interfaces: string[];
    types: string[];
    patterns: string[];
  } {
    const details = {
      imports: [] as string[],
      exports: [] as string[],
      functions: [] as string[],
      classes: [] as string[],
      interfaces: [] as string[],
      types: [] as string[],
      patterns: [] as string[],
    };

    // Extract imports
    const importRegex =
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) details.imports.push(match[1]);
    }

    // Extract exports
    const exportRegex =
      /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      details.exports.push(match[1]);
    }

    // Extract functions
    const functionRegex =
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(/g;
    while ((match = functionRegex.exec(content)) !== null) {
      details.functions.push(match[1] || match[2]);
    }

    // Extract classes
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      details.classes.push(match[1]);
    }

    // Extract interfaces
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      details.interfaces.push(match[1]);
    }

    // Extract types
    const typeRegex = /(?:export\s+)?type\s+(\w+)/g;
    while ((match = typeRegex.exec(content)) !== null) {
      details.types.push(match[1]);
    }

    // Detect patterns
    if (content.includes("extends BaseToolHandler")) {
      details.patterns.push("MCP Tool Pattern");
    }
    if (content.includes("server.tool(")) {
      details.patterns.push("MCP Server Registration");
    }
    if (content.includes("async execute")) {
      details.patterns.push("Async Tool Execution");
    }
    if (content.includes("BaseToolHandler")) {
      details.patterns.push("Inheritance Pattern");
    }

    return details;
  }

  /**
   * Extract detailed function information including signatures, parameters, and documentation
   */
  private extractDetailedFunctions(
    filePath: string,
    content: string,
    rootPath: string
  ): FunctionDetail[] {
    const functions: FunctionDetail[] = [];
    const lines = content.split("\n");

    // Enhanced function regex patterns
    const functionPatterns = [
      // function name(...) or async function name(...)
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{=]+))?/g,
      // const name = (...) => or const name = async (...) =>
      /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*([^{=]+))?\s*=>/g,
      // class methods: methodName(...) { or async methodName(...) {
      /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*{/g,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of functionPatterns) {
        pattern.lastIndex = 0; // Reset regex
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const name = match[1];
          const paramsStr = match[2] || "";
          const returnType = match[3]?.trim() || "void";
          const isAsync = line.includes("async");
          const isExported = line.includes("export");

          // Extract parameters
          const parameters: Array<{
            name: string;
            type: string;
            optional: boolean;
          }> = [];
          if (paramsStr.trim()) {
            const paramParts = paramsStr.split(",").map((p) => p.trim());
            for (const param of paramParts) {
              if (param) {
                const optional = param.includes("?");
                const parts = param
                  .replace("?", "")
                  .split(":")
                  .map((p) => p.trim());
                const paramName = parts[0];
                const paramType = parts[1] || "any";
                parameters.push({
                  name: paramName,
                  type: paramType,
                  optional,
                });
              }
            }
          }

          // Extract JSDoc/TSDoc documentation (look backwards from function)
          let documentation: string | undefined;
          let docStart = i - 1;
          while (
            docStart >= 0 &&
            (lines[docStart].trim().startsWith("*") ||
              lines[docStart].trim().startsWith("/**") ||
              lines[docStart].trim() === "")
          ) {
            if (lines[docStart].trim().startsWith("/**")) {
              // Found start of JSDoc
              let docLines: string[] = [];
              let docLine = docStart;
              while (docLine <= i && docLine < lines.length) {
                const docLineContent = lines[docLine].trim();
                if (
                  docLineContent.startsWith("/**") ||
                  docLineContent.startsWith("*")
                ) {
                  docLines.push(docLineContent.replace(/^\s*\/?\*+\/?\s*/, ""));
                }
                docLine++;
              }
              documentation = docLines.join("\n").replace(/\*\//g, "").trim();
              break;
            }
            docStart--;
          }

          // Determine visibility
          let visibility: "public" | "private" | "protected" = "public";
          if (line.includes("private")) visibility = "private";
          else if (line.includes("protected")) visibility = "protected";

          // Categorize function
          const category = this.categorizeFunction(name, filePath, content);

          // Build signature
          const signature = `${
            isAsync ? "async " : ""
          }${name}(${paramsStr}): ${returnType}`;

          functions.push({
            name,
            filePath: relative(rootPath, filePath),
            lineNumber: i + 1,
            signature,
            parameters,
            returnType,
            isAsync,
            isExported,
            visibility,
            documentation,
            category,
          });
        }
      }
    }

    return functions;
  }

  /**
   * Extract full function body code from file content
   */
  private extractFunctionBody(
    _filePath: string,
    content: string,
    functionName: string,
    lineNumber: number
  ): string {
    try {
      const lines = content.split("\n");
      const startLine = lineNumber - 1; // Convert to 0-based index

      if (startLine < 0 || startLine >= lines.length) {
        return `// Function ${functionName} at line ${lineNumber}\n// Could not extract function body`;
      }

      // Find the function start (look for function declaration)
      let funcStart = startLine;
      let braceCount = 0;
      let foundStart = false;

      // Look backwards to find function declaration start
      for (let i = startLine; i >= Math.max(0, startLine - 10); i--) {
        const line = lines[i];
        if (
          line.includes(`function ${functionName}`) ||
          line.includes(`${functionName}(`) ||
          line.includes(`${functionName} =`) ||
          line.includes(`${functionName}:`)
        ) {
          funcStart = i;
          foundStart = true;
          break;
        }
      }

      if (!foundStart) {
        // Fallback: use the line number provided
        funcStart = startLine;
      }

      // Find the opening brace
      let openingBraceLine = funcStart;
      for (let i = funcStart; i < Math.min(lines.length, funcStart + 10); i++) {
        if (lines[i].includes("{")) {
          openingBraceLine = i;
          braceCount =
            (lines[i].match(/{/g) || []).length -
            (lines[i].match(/}/g) || []).length;
          break;
        }
      }

      // Extract function body by matching braces
      let endLine = openingBraceLine + 1;
      for (
        let i = openingBraceLine + 1;
        i < lines.length && braceCount > 0;
        i++
      ) {
        const line = lines[i];
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceCount += openBraces - closeBraces;
        endLine = i;
        if (braceCount === 0) break;
      }

      // Extract the function code
      const functionLines = lines.slice(funcStart, endLine + 1);
      return functionLines.join("\n");
    } catch (error) {
      logger.debug(`Failed to extract function body for ${functionName}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return `// Function ${functionName} at line ${lineNumber}\n// Error extracting function body`;
    }
  }

  /**
   * Categorize function based on name, path, and context
   */
  private categorizeFunction(
    name: string,
    filePath: string,
    _content: string
  ): FunctionDetail["category"] {
    const lowerName = name.toLowerCase();
    const lowerPath = filePath.toLowerCase();

    // Utility functions
    if (
      lowerName.includes("util") ||
      lowerName.includes("helper") ||
      lowerName.startsWith("get") ||
      lowerName.startsWith("set") ||
      lowerName.startsWith("is") ||
      lowerName.startsWith("has") ||
      lowerName.startsWith("can") ||
      lowerPath.includes("/utils/") ||
      lowerPath.includes("/helpers/") ||
      lowerPath.includes("/utility/")
    ) {
      return "utility";
    }

    // Service functions
    if (
      lowerPath.includes("/services/") ||
      lowerPath.includes("/service") ||
      lowerName.includes("service")
    ) {
      return "service";
    }

    // Component functions
    if (
      lowerPath.includes("/components/") ||
      lowerPath.includes("/component") ||
      lowerName.includes("component")
    ) {
      return "component";
    }

    // Handler functions
    if (
      lowerPath.includes("/handlers/") ||
      lowerPath.includes("/handler") ||
      lowerName.includes("handle") ||
      lowerName === "execute"
    ) {
      return "handler";
    }

    // Middleware functions
    if (
      lowerPath.includes("/middleware/") ||
      lowerName.includes("middleware")
    ) {
      return "middleware";
    }

    // Helper functions (fallback for helper-like patterns)
    if (
      lowerName.includes("format") ||
      lowerName.includes("parse") ||
      lowerName.includes("transform") ||
      lowerName.includes("validate")
    ) {
      return "helper";
    }

    return "other";
  }

  /**
   * Extract comprehensive coding standards
   */
  private extractCodingStandards(
    structure: CodeStructure,
    files: CodeStructure["files"]
  ): CodingStandards {
    const standards: CodingStandards = {
      namingConventions: {
        variables: "mixed",
        functions: "mixed",
        classes: "mixed",
        constants: "mixed",
        files: "mixed",
      },
      fileOrganization: {
        structure: "unknown",
        patterns: [],
      },
      importPatterns: {
        style: "mixed",
        ordering: "mixed",
        groups: [],
      },
      errorHandling: {
        pattern: "mixed",
        errorClasses: [],
      },
      testing: {
        patterns: [],
        utilities: [],
      },
    };

    // Analyze naming conventions from file names and code
    const fileNames = files.map((f) => f.path.split("/").pop() || "");
    const camelCaseFiles = fileNames.filter((f) =>
      /^[a-z][a-zA-Z0-9]*\./.test(f)
    ).length;
    const kebabCaseFiles = fileNames.filter((f) =>
      /^[a-z][a-z0-9-]*\./.test(f)
    ).length;
    const pascalCaseFiles = fileNames.filter((f) =>
      /^[A-Z][a-zA-Z0-9]*\./.test(f)
    ).length;

    if (camelCaseFiles > kebabCaseFiles && camelCaseFiles > pascalCaseFiles) {
      standards.namingConventions.files = "camelCase";
    } else if (kebabCaseFiles > pascalCaseFiles) {
      standards.namingConventions.files = "kebab-case";
    } else if (pascalCaseFiles > 0) {
      standards.namingConventions.files = "PascalCase";
    }

    // Analyze file organization
    const hasLayers = structure.architecture.layers.length > 0;
    const hasFeatures = files.some((f) => f.path.match(/\/[^/]+\/[^/]+\//));

    if (hasLayers) {
      standards.fileOrganization.structure = "layer-based";
      standards.fileOrganization.patterns = structure.architecture.layers;
    } else if (hasFeatures) {
      standards.fileOrganization.structure = "feature-based";
    } else {
      standards.fileOrganization.structure = "flat";
    }

    // Analyze import patterns from code details
    const allImports = files
      .filter((f) => f.codeDetails?.imports)
      .flatMap((f) => f.codeDetails!.imports);

    const namedImports = allImports.filter((imp) => imp.includes("{")).length;
    const defaultImports = allImports.length - namedImports;

    if (namedImports > defaultImports * 2) {
      standards.importPatterns.style = "named";
    } else if (defaultImports > namedImports * 2) {
      standards.importPatterns.style = "default";
    }

    // Detect error handling patterns
    const errorFiles = files.filter(
      (f) =>
        f.path.toLowerCase().includes("error") ||
        f.codeDetails?.classes.some((c) => c.toLowerCase().includes("error"))
    );

    if (errorFiles.length > 0) {
      standards.errorHandling.pattern = "custom";
      errorFiles.forEach((f) => {
        f.codeDetails?.classes.forEach((c) => {
          if (c.toLowerCase().includes("error")) {
            standards.errorHandling.errorClasses.push(c);
          }
        });
      });
    }

    // Detect testing framework
    const testFiles = files.filter(
      (f) =>
        f.path.includes(".test.") ||
        f.path.includes(".spec.") ||
        f.path.includes("/test/") ||
        f.path.includes("/tests/")
    );

    if (testFiles.length > 0) {
      if (structure.dependencies.some((d) => d.includes("jest"))) {
        standards.testing.framework = "jest";
      } else if (structure.dependencies.some((d) => d.includes("mocha"))) {
        standards.testing.framework = "mocha";
      } else if (structure.dependencies.some((d) => d.includes("vitest"))) {
        standards.testing.framework = "vitest";
      }
    }

    return standards;
  }

  /**
   * Generate markdown representation of folder structure
   */
  private generateFolderStructureMarkdown(
    folderNode: FolderNode,
    indent: number = 0
  ): string {
    let markdown = "";
    const prefix = "  ".repeat(indent);
    const icon = folderNode.type === "directory" ? "📁" : "📄";

    markdown += `${prefix}${icon} ${folderNode.name}`;

    if (folderNode.type === "file") {
      if (folderNode.language) {
        markdown += ` (${folderNode.language})`;
      }
      if (folderNode.size) {
        const sizeKB = (folderNode.size / 1024).toFixed(2);
        markdown += ` - ${sizeKB} KB`;
      }
    }

    markdown += "\n";

    if (folderNode.children && folderNode.children.length > 0) {
      for (const child of folderNode.children) {
        markdown += this.generateFolderStructureMarkdown(child, indent + 1);
      }
    }

    return markdown;
  }

  /**
   * Generate Mermaid diagram for folder structure (tree)
   */
  private generateFolderStructureMermaid(
    folderNode: FolderNode,
    parentId: string = "root"
  ): string {
    let mermaid = "";
    const nodeId =
      parentId === "root"
        ? "root"
        : `${parentId}_${folderNode.name.replace(/[^a-zA-Z0-9]/g, "_")}`;

    if (parentId !== "root") {
      const nodeLabel =
        folderNode.type === "directory"
          ? `📁 ${folderNode.name}`
          : `📄 ${folderNode.name}${
              folderNode.language ? ` (${folderNode.language})` : ""
            }`;
      mermaid += `    ${parentId} --> ${nodeId}["${nodeLabel}"]\n`;
    }

    if (folderNode.children && folderNode.children.length > 0) {
      for (const child of folderNode.children) {
        mermaid += this.generateFolderStructureMermaid(child, nodeId);
      }
    }

    return mermaid;
  }

  /**
   * Generate Mermaid diagram for file dependencies (imports/exports)
   */
  private generateDependencyMermaid(
    structure: CodeStructure,
    _rootPath: string
  ): string {
    let mermaid = "graph TD\n";
    const fileMap = new Map<string, string>();
    let nodeCounter = 0;

    // Create nodes for files with imports/exports
    for (const file of structure.files) {
      if (
        file.codeDetails &&
        (file.codeDetails.imports.length > 0 ||
          file.codeDetails.exports.length > 0)
      ) {
        const nodeId = `file_${nodeCounter++}`;
        fileMap.set(file.path, nodeId);
        const fileName = file.path.split("/").pop() || file.path;
        const fileType = file.language || "file";
        mermaid += `    ${nodeId}["${fileName}<br/>(${fileType})"]\n`;
      }
    }

    // Create edges for imports
    for (const file of structure.files) {
      const sourceId = fileMap.get(file.path);
      if (sourceId && file.codeDetails) {
        for (const imp of file.codeDetails.imports) {
          // Try to find the target file
          const targetFile = structure.files.find(
            (f) =>
              f.path.includes(imp.replace(/\./g, "/")) ||
              f.path.endsWith(imp.replace(/\./g, "/") + ".ts") ||
              f.path.endsWith(imp.replace(/\./g, "/") + ".js")
          );

          if (targetFile) {
            const targetId = fileMap.get(targetFile.path);
            if (targetId && targetId !== sourceId) {
              mermaid += `    ${sourceId} -->|imports| ${targetId}\n`;
            }
          }
        }
      }
    }

    return mermaid;
  }

  /**
   * Generate Mermaid diagram for architecture layers
   */
  private generateArchitectureMermaid(
    comprehensiveAnalysis: ComprehensiveAnalysis
  ): string {
    let mermaid = "graph TB\n";
    mermaid += `    subgraph "Architecture Layers"\n`;

    // Create nodes for each layer
    for (const layer of comprehensiveAnalysis.architecture.layers) {
      const layerId = layer.name.replace(/[^a-zA-Z0-9]/g, "_");
      mermaid += `        ${layerId}["${layer.name}<br/>${layer.files.length} files"]\n`;
    }

    // Create relationships between layers (based on typical flow)
    const layerNames = comprehensiveAnalysis.architecture.layers.map(
      (l) => l.name
    );
    if (
      layerNames.includes("presentation") &&
      layerNames.includes("application")
    ) {
      mermaid += `        presentation --> application\n`;
    }
    if (
      layerNames.includes("application") &&
      layerNames.includes("infrastructure")
    ) {
      mermaid += `        application --> infrastructure\n`;
    }
    if (layerNames.includes("application") && layerNames.includes("core")) {
      mermaid += `        application --> core\n`;
    }
    if (layerNames.includes("infrastructure") && layerNames.includes("core")) {
      mermaid += `        infrastructure --> core\n`;
    }

    mermaid += `    end\n`;

    // Add patterns
    if (comprehensiveAnalysis.architecture.patterns.length > 0) {
      mermaid += `    subgraph "Architecture Patterns"\n`;
      for (const pattern of comprehensiveAnalysis.architecture.patterns.slice(
        0,
        10
      )) {
        const patternId = pattern.name.replace(/[^a-zA-Z0-9]/g, "_");
        mermaid += `        ${patternId}["${pattern.name}"]\n`;
      }
      mermaid += `    end\n`;
    }

    return mermaid;
  }

  /**
   * Generate Mermaid diagram for module dependencies (simplified)
   */
  private generateModuleDependencyMermaid(
    comprehensiveAnalysis: ComprehensiveAnalysis
  ): string {
    let mermaid = "graph LR\n";

    // Group files by directory
    const modules = new Map<string, string[]>();
    for (const file of comprehensiveAnalysis.allFunctions.map(
      (f) => f.filePath
    )) {
      const dir = file.split("/").slice(0, -1).join("/") || "root";
      if (!modules.has(dir)) {
        modules.set(dir, []);
      }
      modules.get(dir)!.push(file);
    }

    // Create nodes for major modules
    const majorModules = Array.from(modules.entries())
      .filter(([_, files]) => files.length >= 3)
      .slice(0, 15); // Limit to top 15 modules

    for (const [modulePath, files] of majorModules) {
      const moduleId = modulePath.replace(/[^a-zA-Z0-9]/g, "_") || "root";
      const moduleName = modulePath.split("/").pop() || "root";
      mermaid += `    ${moduleId}["${moduleName}<br/>${files.length} files"]\n`;
    }

    // Create relationships (simplified - based on path hierarchy)
    for (let i = 0; i < majorModules.length; i++) {
      for (let j = i + 1; j < majorModules.length; j++) {
        const [path1] = majorModules[i];
        const [path2] = majorModules[j];
        if (path1.includes(path2) || path2.includes(path1)) {
          const id1 = path1.replace(/[^a-zA-Z0-9]/g, "_") || "root";
          const id2 = path2.replace(/[^a-zA-Z0-9]/g, "_") || "root";
          if (path1.includes(path2)) {
            mermaid += `    ${id2} --> ${id1}\n`;
          } else {
            mermaid += `    ${id1} --> ${id2}\n`;
          }
        }
      }
    }

    return mermaid;
  }

  /**
   * Generate all Mermaid diagrams for the repository
   */
  private generateAllMermaidDiagrams(
    repoInfo: RepoInfo,
    structure: CodeStructure,
    comprehensiveAnalysis: ComprehensiveAnalysis,
    rootPath: string
  ): Array<{ title: string; type: string; content: string }> {
    const diagrams: Array<{ title: string; type: string; content: string }> =
      [];

    // 1. Folder Structure Diagram
    try {
      const folderMermaid = `graph TD\n    root["📁 ${
        repoInfo.name
      }"]\n${this.generateFolderStructureMermaid(
        comprehensiveAnalysis.folderStructure,
        "root"
      )}`;
      diagrams.push({
        title: `${repoInfo.name} - Folder Structure`,
        type: "folder-structure",
        content: `# ${repoInfo.name} - Folder Structure Diagram\n\n\`\`\`mermaid\n${folderMermaid}\n\`\`\``,
      });
    } catch (error) {
      logger.warn("Failed to generate folder structure Mermaid diagram", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 2. File Dependency Diagram
    try {
      const dependencyMermaid = this.generateDependencyMermaid(
        structure,
        rootPath
      );
      if (dependencyMermaid.includes("graph TD")) {
        diagrams.push({
          title: `${repoInfo.name} - File Dependencies`,
          type: "dependencies",
          content: `# ${repoInfo.name} - File Dependency Graph\n\n\`\`\`mermaid\n${dependencyMermaid}\n\`\`\``,
        });
      }
    } catch (error) {
      logger.warn("Failed to generate dependency Mermaid diagram", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 3. Architecture Layers Diagram
    try {
      if (comprehensiveAnalysis.architecture.layers.length > 0) {
        const archMermaid = this.generateArchitectureMermaid(
          comprehensiveAnalysis
        );
        diagrams.push({
          title: `${repoInfo.name} - Architecture Layers`,
          type: "architecture",
          content: `# ${repoInfo.name} - Architecture Layers Diagram\n\n\`\`\`mermaid\n${archMermaid}\n\`\`\``,
        });
      }
    } catch (error) {
      logger.warn("Failed to generate architecture Mermaid diagram", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 4. Module Dependency Diagram
    try {
      const moduleMermaid = this.generateModuleDependencyMermaid(
        comprehensiveAnalysis
      );
      if (moduleMermaid.includes("graph LR")) {
        diagrams.push({
          title: `${repoInfo.name} - Module Dependencies`,
          type: "modules",
          content: `# ${repoInfo.name} - Module Dependency Diagram\n\n\`\`\`mermaid\n${moduleMermaid}\n\`\`\``,
        });
      }
    } catch (error) {
      logger.warn("Failed to generate module dependency Mermaid diagram", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return diagrams;
  }

  /**
   * Build structured folder tree
   */
  private buildFolderTree(
    files: CodeStructure["files"],
    _rootPath: string
  ): FolderNode {
    const tree: FolderNode = {
      name: "root",
      path: "",
      type: "directory",
      children: [],
    };

    for (const file of files) {
      const parts = file.path.split("/").filter((p) => p);
      let current = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        if (!current.children) {
          current.children = [];
        }

        let child = current.children.find((c) => c.name === part);

        if (!child) {
          child = {
            name: part,
            path: parts.slice(0, i + 1).join("/"),
            type: isLast ? "file" : "directory",
            size: isLast ? file.size : undefined,
            language: isLast ? file.language : undefined,
            children: isLast ? undefined : [],
          };
          current.children.push(child);
        }

        current = child;
      }
    }

    return tree;
  }

  /**
   * Analyze codebase structure with deep code analysis
   * Supports resuming from checkpoint by skipping already crawled files
   */
  private analyzeCodeStructure(
    rootPath: string,
    includeNodeModules: boolean,
    deepAnalysis: boolean,
    alreadyCrawledFiles?: string[]
  ): CodeStructure {
    const files: CodeStructure["files"] = [];
    const entryPoints: string[] = [];
    const dependencies: string[] = [];
    const configFiles: string[] = [];
    const structure: Record<string, unknown> = {};
    const allPatterns = new Set<string>();
    const layers = new Set<string>();
    const conventions = new Set<string>();

    // Extract linting configuration
    const linting = this.extractLintingConfig(rootPath);

    const ignoreDirs = includeNodeModules
      ? [".git", ".vscode", ".idea", "dist", "build", ".next", "coverage"]
      : [
          ".git",
          ".vscode",
          ".idea",
          "dist",
          "build",
          ".next",
          "coverage",
          "node_modules",
        ];

    const ignoreFiles = [".DS_Store", "Thumbs.db"];

    const getFileExtension = (filename: string): string => {
      const parts = filename.split(".");
      return parts.length > 1 ? parts[parts.length - 1] : "";
    };

    const getLanguage = (extension: string): string | undefined => {
      const langMap: Record<string, string> = {
        ts: "typescript",
        js: "javascript",
        tsx: "typescript",
        jsx: "javascript",
        py: "python",
        java: "java",
        go: "go",
        rs: "rust",
        rb: "ruby",
        php: "php",
        md: "markdown",
        json: "json",
        yml: "yaml",
        yaml: "yaml",
      };
      return langMap[extension.toLowerCase()];
    };

    const crawlDirectory = (
      dir: string,
      depth: number = 0,
      maxDepth: number = 10
    ): void => {
      if (depth > maxDepth) return;

      try {
        const items = readdirSync(dir);

        for (const item of items) {
          const fullPath = join(dir, item);
          const relativePath = relative(rootPath, fullPath);

          // Skip ignored directories and files
          if (ignoreDirs.some((ignore) => relativePath.includes(ignore)))
            continue;
          if (ignoreFiles.includes(item)) continue;

          try {
            const stats = statSync(fullPath);

            if (stats.isDirectory()) {
              if (deepAnalysis || depth < 3) {
                crawlDirectory(fullPath, depth + 1, maxDepth);
              }
            } else if (stats.isFile()) {
              // Skip if already crawled (when resuming)
              if (
                alreadyCrawledFiles &&
                alreadyCrawledFiles.includes(relativePath)
              ) {
                continue;
              }

              const extension = getFileExtension(item);
              const language = getLanguage(extension);
              const size = stats.size;

              let codeDetails;
              // Deep analysis: read and analyze code files
              if (
                deepAnalysis &&
                language &&
                ["typescript", "javascript", "python", "java", "go"].includes(
                  language
                )
              ) {
                try {
                  const content = readFileSync(fullPath, "utf-8");
                  codeDetails = this.extractCodeDetails(relativePath, content);

                  // Collect patterns
                  codeDetails.patterns.forEach((p) => allPatterns.add(p));

                  // Detect route patterns
                  if (
                    relativePath.includes("route") ||
                    relativePath.includes("api") ||
                    relativePath.includes("server") ||
                    relativePath.includes("app.ts") ||
                    relativePath.includes("app.js")
                  ) {
                    allPatterns.add("Route/API Pattern");
                  }

                  // Detect architecture layers from path
                  if (relativePath.includes("/tools/")) layers.add("tools");
                  if (relativePath.includes("/services/"))
                    layers.add("services");
                  if (relativePath.includes("/middleware/"))
                    layers.add("middleware");
                  if (relativePath.includes("/config/")) layers.add("config");
                  if (relativePath.includes("/core/")) layers.add("core");
                  if (relativePath.includes("/infrastructure/"))
                    layers.add("infrastructure");
                  if (relativePath.includes("/application/"))
                    layers.add("application");
                  if (relativePath.includes("/presentation/"))
                    layers.add("presentation");

                  // Detect conventions
                  if (relativePath.endsWith(".tool.ts"))
                    conventions.add("Tool naming: *.tool.ts");
                  if (relativePath.endsWith(".service.ts"))
                    conventions.add("Service naming: *.service.ts");
                  if (relativePath.includes("/base/"))
                    conventions.add("Base classes in /base/");
                  if (relativePath.includes("/index.ts"))
                    conventions.add("Barrel exports with index.ts");
                } catch {
                  // Skip if can't read
                }
              }

              files.push({
                path: relativePath,
                type: "file",
                size,
                language,
                codeDetails,
              });

              // Identify entry points
              if (
                item === "index.ts" ||
                item === "index.js" ||
                item === "main.ts" ||
                item === "main.js" ||
                item === "app.ts" ||
                item === "app.js"
              ) {
                entryPoints.push(relativePath);
              }

              // Identify config files
              if (
                item.includes("package.json") ||
                item.includes("tsconfig.json") ||
                item.includes("config") ||
                item.includes(".env")
              ) {
                configFiles.push(relativePath);
              }
            }
          } catch {
            // Skip if can't access
          }
        }
      } catch {
        // Skip if can't read directory
      }
    };

    // Read package.json for dependencies
    const packageJsonPath = join(rootPath, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        if (packageJson.dependencies) {
          dependencies.push(...Object.keys(packageJson.dependencies));
        }
        if (packageJson.devDependencies) {
          dependencies.push(...Object.keys(packageJson.devDependencies));
        }
      } catch {
        // Skip if can't parse
      }
    }

    // Crawl codebase
    crawlDirectory(rootPath, 0, deepAnalysis ? 10 : 5);

    // Build structure tree
    for (const file of files) {
      const parts = file.path.split("/");
      let current = structure;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }

      current[parts[parts.length - 1]] = {
        type: file.type,
        language: file.language,
        size: file.size,
      };
    }

    return {
      files,
      structure,
      entryPoints,
      dependencies: [...new Set(dependencies)],
      configFiles,
      codePatterns: Array.from(allPatterns),
      linting,
      architecture: {
        layers: Array.from(layers),
        patterns: Array.from(allPatterns),
        conventions: Array.from(conventions),
      },
    };
  }

  /**
   * Generate comprehensive documentation
   */
  private generateDocumentation(
    repoInfo: RepoInfo,
    docs: Record<string, string>,
    structure: CodeStructure
  ): string {
    let markdown = `# ${repoInfo.name} - Codebase Analysis\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n\n`;

    if (repoInfo.remoteUrl) {
      markdown += `**Repository:** ${repoInfo.remoteUrl}\n`;
    }
    markdown += `**Branch:** ${repoInfo.branch}\n`;
    markdown += `**Default Branch:** ${repoInfo.defaultBranch || "unknown"}\n`;
    markdown += `**Branch Pattern:** ${repoInfo.branchPattern || "unknown"}\n`;
    markdown += `**All Branches:** ${repoInfo.branches
      .slice(0, 10)
      .join(", ")}${
      repoInfo.branches.length > 10
        ? ` ... (+${repoInfo.branches.length - 10} more)`
        : ""
    }\n`;
    markdown += `**Commit:** ${repoInfo.commit.substring(0, 8)}\n\n`;

    if (Object.keys(repoInfo.gitConfig).length > 0) {
      markdown += `### Git Configuration\n\n`;
      if (repoInfo.gitConfig.user) {
        markdown += `- **User:** ${
          repoInfo.gitConfig.user.name || "unknown"
        } <${repoInfo.gitConfig.user.email || "unknown"}>\n`;
      }
      if (repoInfo.gitConfig.init?.defaultBranch) {
        markdown += `- **Default Branch (init):** ${repoInfo.gitConfig.init.defaultBranch}\n`;
      }
      markdown += `\n`;
    }

    markdown += `## 📚 Documentation Files\n\n`;
    for (const [filename, content] of Object.entries(docs)) {
      markdown += `### ${filename}\n\n`;
      markdown += `\`\`\`\n${content.substring(0, 2000)}${
        content.length > 2000 ? "...\n[Truncated]" : ""
      }\n\`\`\`\n\n`;
    }

    markdown += `## 📁 Codebase Structure\n\n`;
    markdown += `**Total Files:** ${structure.files.length}\n\n`;
    markdown += `**Entry Points:**\n`;
    for (const entry of structure.entryPoints) {
      markdown += `- \`${entry}\`\n`;
    }
    markdown += `\n`;

    markdown += `**Dependencies:**\n`;
    for (const dep of structure.dependencies.slice(0, 20)) {
      markdown += `- \`${dep}\`\n`;
    }
    if (structure.dependencies.length > 20) {
      markdown += `- ... and ${structure.dependencies.length - 20} more\n`;
    }
    markdown += `\n`;

    markdown += `**Configuration Files:**\n`;
    for (const config of structure.configFiles) {
      markdown += `- \`${config}\`\n`;
    }
    markdown += `\n`;

    markdown += `## 📂 File Structure\n\n`;
    markdown += `\`\`\`\n${JSON.stringify(
      structure.structure,
      null,
      2
    )}\n\`\`\`\n\n`;

    markdown += `## 📄 Files by Language\n\n`;
    const filesByLang: Record<string, number> = {};
    for (const file of structure.files) {
      if (file.language) {
        filesByLang[file.language] = (filesByLang[file.language] || 0) + 1;
      }
    }
    for (const [lang, count] of Object.entries(filesByLang)) {
      markdown += `- **${lang}**: ${count} files\n`;
    }

    markdown += `\n## 🏗️ Architecture & Patterns\n\n`;
    markdown += `**Layers:**\n`;
    for (const layer of structure.architecture.layers) {
      markdown += `- ${layer}\n`;
    }
    markdown += `\n**Code Patterns:**\n`;
    for (const pattern of structure.architecture.patterns) {
      markdown += `- ${pattern}\n`;
    }
    markdown += `\n**Conventions:**\n`;
    for (const convention of structure.architecture.conventions) {
      markdown += `- ${convention}\n`;
    }

    markdown += `\n## 🔧 Linting & Code Quality\n\n`;

    if (structure.linting.eslint) {
      markdown += `### ESLint\n`;
      markdown += `- **Config File:** \`${structure.linting.eslint.configFile}\`\n`;
      if (structure.linting.eslint.version) {
        markdown += `- **Version:** ${structure.linting.eslint.version}\n`;
      }
      markdown += `\n`;
    }

    if (structure.linting.prettier) {
      markdown += `### Prettier\n`;
      markdown += `- **Config File:** \`${structure.linting.prettier.configFile}\`\n`;
      if (structure.linting.prettier.version) {
        markdown += `- **Version:** ${structure.linting.prettier.version}\n`;
      }
      markdown += `\n`;
    }

    if (structure.linting.tslint) {
      markdown += `### TSLint (Deprecated)\n`;
      markdown += `- **Config File:** \`${structure.linting.tslint.configFile}\`\n`;
      markdown += `\n`;
    }

    if (structure.linting.stylelint) {
      markdown += `### Stylelint\n`;
      markdown += `- **Config File:** \`${structure.linting.stylelint.configFile}\`\n`;
      markdown += `\n`;
    }

    if (structure.linting.biome) {
      markdown += `### Biome\n`;
      markdown += `- **Config File:** \`${structure.linting.biome.configFile}\`\n`;
      markdown += `\n`;
    }

    if (structure.linting.husky) {
      markdown += `### Husky (Git Hooks)\n`;
      markdown += `- **Hooks:** ${
        structure.linting.husky.hooks?.join(", ") || "none"
      }\n`;
      markdown += `\n`;
    }

    if (structure.linting.lintStaged) {
      markdown += `### lint-staged\n`;
      markdown += `- **Configured:** Yes\n`;
      markdown += `\n`;
    }

    markdown += `\n## 🔍 Code Flow & Structure\n\n`;
    markdown += `### Entry Points Flow\n`;
    for (const entry of structure.entryPoints) {
      markdown += `1. **${entry}** - Main entry point\n`;
    }

    markdown += `\n### Key Components\n`;
    const keyFiles = structure.files
      .filter(
        (f) =>
          f.codeDetails &&
          (f.codeDetails.classes.length > 0 ||
            f.codeDetails.functions.length > 0)
      )
      .slice(0, 20);

    for (const file of keyFiles) {
      markdown += `\n#### \`${file.path}\`\n`;
      if (file.codeDetails) {
        if (file.codeDetails.classes.length > 0) {
          markdown += `- **Classes:** ${file.codeDetails.classes.join(", ")}\n`;
        }
        if (file.codeDetails.functions.length > 0) {
          markdown += `- **Functions:** ${file.codeDetails.functions
            .slice(0, 5)
            .join(", ")}${
            file.codeDetails.functions.length > 5
              ? ` ... (+${file.codeDetails.functions.length - 5} more)`
              : ""
          }\n`;
        }
        if (file.codeDetails.interfaces.length > 0) {
          markdown += `- **Interfaces:** ${file.codeDetails.interfaces.join(
            ", "
          )}\n`;
        }
        if (file.codeDetails.imports.length > 0) {
          markdown += `- **Key Imports:** ${file.codeDetails.imports
            .slice(0, 3)
            .join(", ")}\n`;
        }
      }
    }

    return markdown;
  }

  /**
   * Ensure repository exists, create if not
   * Checks cache first to avoid unnecessary API calls
   */
  private async ensureRepositoryExists(
    apiService: ReturnType<typeof this.getApiService>,
    repoInfo: RepoInfo,
    repositoryId?: string,
    cachedRepositoryId?: string
  ): Promise<string> {
    // Priority 1: Use provided repositoryId if valid
    if (repositoryId) {
      try {
        await apiService.get(`/api/repositories/${repositoryId}`);
        logger.info(`Repository ${repositoryId} exists (from params)`);
        return repositoryId;
      } catch (error) {
        logger.warn(
          `Repository ${repositoryId} not found, will check cache or create new one`
        );
      }
    }

    // Priority 2: Check cache for repositoryId (avoid API call if cached)
    if (cachedRepositoryId) {
      try {
        // Optionally verify cached ID still exists (lightweight check)
        await apiService.get(`/api/repositories/${cachedRepositoryId}`);
        logger.info(`Repository ${cachedRepositoryId} exists (from cache)`);
        return cachedRepositoryId;
      } catch (error) {
        logger.debug(
          `Cached repository ${cachedRepositoryId} not found, will search API`
        );
        // Cache might be stale, continue to search
      }
    }

    // Priority 3: Try to find existing repository by name via API
    let existingRepoId: string | undefined;
    try {
      const repos = await apiService.get("/api/repositories", {
        search: repoInfo.name,
      });
      const reposArray = this.extractArrayFromListResponse(
        repos,
        "repositories"
      );
      const existing = reposArray.find(
        (r) =>
          r &&
          typeof r === "object" &&
          "name" in r &&
          (r as { name: string }).name === repoInfo.name
      ) as { id: string; name: string } | undefined;
      if (existing) {
        existingRepoId = existing.id;
        logger.info(`Found existing repository: ${existingRepoId}`);

        // Update existing repository with remote URL if available and not in description
        if (repoInfo.remoteUrl) {
          try {
            const existingRepoResponse = await apiService.get(
              `/api/repositories/${existingRepoId}`
            );
            // Handle nested repository response format
            const existingRepo =
              existingRepoResponse &&
              typeof existingRepoResponse === "object" &&
              "repository" in existingRepoResponse
                ? (
                    existingRepoResponse as {
                      repository: Record<string, unknown>;
                    }
                  ).repository
                : existingRepoResponse;
            if (
              existingRepo &&
              typeof existingRepo === "object" &&
              "description" in existingRepo
            ) {
              const currentDesc = String(
                (existingRepo as { description?: string }).description || ""
              );
              // Update if description doesn't contain the remote URL
              if (!currentDesc.includes(repoInfo.remoteUrl)) {
                const updatedDesc = currentDesc
                  ? `${currentDesc}\n\nRemote URL: ${repoInfo.remoteUrl}`
                  : `Repository: ${repoInfo.name}\nRemote URL: ${repoInfo.remoteUrl}`;

                await apiService.patch(`/api/repositories/${existingRepoId}`, {
                  description: updatedDesc,
                });
                logger.info(
                  `Updated existing repository ${existingRepoId} with remote URL`
                );
              }
            }
          } catch (error) {
            logger.debug("Could not update repository with remote URL", {
              error: error instanceof Error ? error.message : String(error),
            });
            // Continue even if update fails
          }
        }

        return existingRepoId;
      }
    } catch (error) {
      logger.debug("Could not search for existing repository", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Create new repository with proper name and remote URL
    try {
      const repoDescription = repoInfo.remoteUrl
        ? `Repository: ${repoInfo.name}\nRemote URL: ${repoInfo.remoteUrl}`
        : `Repository: ${repoInfo.name}`;

      const repoBody: Record<string, unknown> = {
        name: repoInfo.name,
        description: repoDescription,
        type: "individual",
      };

      const result = await apiService.post("/api/repositories", repoBody);
      const newRepoId = this.extractIdFromResponse(result, "repository");
      if (newRepoId) {
        logger.info(
          `Created new repository: ${newRepoId} (${
            repoInfo.name
          }) with remote URL: ${repoInfo.remoteUrl || "none"}`
        );
        return newRepoId;
      }
      throw new Error("Failed to create repository: no ID returned");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to create repository", {
        error: errorMsg,
        stack: errorStack,
        repositoryName: repoInfo.name,
        remoteUrl: repoInfo.remoteUrl,
        context: "ensureRepositoryExists",
      });
      throw new Error(`Failed to create repository: ${errorMsg}`);
    }
  }

  /**
   * Ensure project exists, create if not (using repo name)
   * Checks cache first to avoid unnecessary API calls
   */
  private async ensureProjectExists(
    apiService: ReturnType<typeof this.getApiService>,
    repoInfo: RepoInfo,
    repositoryId: string,
    projectId?: string,
    cachedProjectId?: string
  ): Promise<string> {
    // Priority 1: Use provided projectId if valid
    if (projectId) {
      try {
        await apiService.get(`/api/projects/${projectId}`);
        logger.info(`Project ${projectId} exists (from params)`);
        return projectId;
      } catch (error) {
        logger.warn(
          `Project ${projectId} not found, will check cache or create new one`
        );
      }
    }

    // Priority 2: Check cache for projectId (avoid API call if cached)
    if (cachedProjectId) {
      try {
        // Optionally verify cached ID still exists (lightweight check)
        await apiService.get(`/api/projects/${cachedProjectId}`);
        logger.info(`Project ${cachedProjectId} exists (from cache)`);
        return cachedProjectId;
      } catch (error) {
        logger.debug(
          `Cached project ${cachedProjectId} not found, will search API`
        );
        // Cache might be stale, continue to search
      }
    }

    // Priority 3: Try to find existing project by name (using repo name) via API
    try {
      const projects = await apiService.get("/api/projects", {
        search: repoInfo.name,
      });
      // Projects might use "data" or "projects" array
      const projectsArray = this.extractArrayFromListResponse(
        projects,
        "projects"
      );
      const existing = projectsArray.find(
        (p) =>
          p &&
          typeof p === "object" &&
          "name" in p &&
          (p as { name: string }).name === repoInfo.name
      ) as { id: string; name: string } | undefined;
      if (existing) {
        logger.info(`Found existing project: ${existing.id}`);
        return existing.id;
      }
    } catch (error) {
      logger.debug("Could not search for existing project", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Create new project with repo name and link
    try {
      const projectDescription = repoInfo.remoteUrl
        ? `Project for ${repoInfo.name} repository\nRepository URL: ${repoInfo.remoteUrl}`
        : `Project for ${repoInfo.name} repository`;

      const projectBody: Record<string, unknown> = {
        name: repoInfo.name,
        description: projectDescription,
        repositoryId: repositoryId,
      };

      const result = await apiService.post("/api/projects", projectBody);
      const newProjectId = this.extractIdFromResponse(result, "project");
      if (newProjectId) {
        logger.info(
          `Created new project: ${newProjectId} for repository ${repositoryId}`
        );
        return newProjectId;
      }
      throw new Error("Failed to create project: no ID returned");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to create project", {
        error: errorMsg,
        stack: errorStack,
        repositoryId,
        projectName: repoInfo.name,
        context: "ensureProjectExists",
      });
      throw new Error(`Failed to create project: ${errorMsg}`);
    }
  }

  /**
   * Use LLM to enhance analysis with natural language understanding
   */
  private async enhanceAnalysisWithLLM(
    repoInfo: RepoInfo,
    structure: CodeStructure,
    docs: Record<string, string>,
    comprehensiveAnalysis: ComprehensiveAnalysis,
    customPrompt?: string,
    provider: "openai" | "anthropic" | "auto" = "auto"
  ): Promise<Partial<ComprehensiveAnalysis>> {
    try {
      // Get LLM service
      let aiService;
      if (provider === "auto") {
        aiService = AIServiceFactory.getAvailableService();
      } else {
        aiService = AIServiceFactory.getService(provider);
      }

      if (!aiService || !aiService.isAvailable()) {
        logger.debug("LLM service not available, skipping LLM enhancement");
        return {};
      }

      logger.info(`Using ${aiService.getProviderName()} for LLM analysis`);

      // Prepare context for LLM
      const repoContext = {
        name: repoInfo.name,
        branch: repoInfo.branch,
        remoteUrl: repoInfo.remoteUrl,
        fileCount: structure.files.length,
        languages: Array.from(
          new Set(structure.files.map((f) => f.language).filter(Boolean))
        ),
        entryPoints: structure.entryPoints,
        dependencies: structure.dependencies.slice(0, 20), // Limit for context
        architecture: structure.architecture,
        readme: docs.README?.substring(0, 2000) || "No README found",
      };

      // Build system prompt
      const systemPrompt = `You are an expert codebase analyst. Analyze the repository and extract structured information including:
- Utility functions and their purposes
- Coding standards and patterns
- Architectural decisions
- Key design patterns
- Best practices used
- Areas for improvement

Return your analysis as a JSON object matching this structure:
{
  "utilityFunctions": [{"name": "...", "description": "...", "category": "utility|helper|service", "filePath": "..."}],
  "codingStandards": {"namingConventions": {...}, "patterns": [...], "bestPractices": [...]},
  "architecture": {"patterns": [...], "decisions": [...], "layers": [...]},
  "insights": {"strengths": [...], "improvements": [...], "recommendations": [...]}
}`;

      // Build user prompt
      const userPrompt =
        customPrompt ||
        `Analyze this repository and extract:
1. All utility functions with their purposes and categories
2. Coding standards (naming conventions, patterns, best practices)
3. Architectural patterns and design decisions
4. Key insights about the codebase structure

Repository Context:
${JSON.stringify(repoContext, null, 2)}

Codebase Structure:
- Files: ${structure.files.length} files
- Languages: ${repoContext.languages.join(", ")}
- Architecture Layers: ${structure.architecture.layers.join(", ")}
- Patterns: ${structure.architecture.patterns.join(", ")}

${docs.README ? `README Content:\n${docs.README.substring(0, 3000)}` : ""}

Provide a comprehensive analysis in JSON format.`;

      // Call LLM
      const llmResponse = await aiService.generateText(userPrompt, {
        systemPrompt,
        maxTokens: 4000,
        temperature: 0.3, // Lower temperature for more consistent structured output
      });

      // Parse LLM response (try to extract JSON)
      let llmAnalysis: Partial<ComprehensiveAnalysis> = {};
      try {
        // Try to extract JSON from response
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          llmAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON, try to parse the whole response
          llmAnalysis = JSON.parse(llmResponse);
        }
      } catch (parseError) {
        logger.warn("Failed to parse LLM response as JSON, using as insights", {
          error:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        });
        // Store raw response as insights
        llmAnalysis = {
          insights: {
            llmAnalysis: llmResponse,
            provider: aiService.getProviderName(),
          },
        } as Partial<ComprehensiveAnalysis>;
      }

      // Merge LLM insights with existing analysis
      if (llmAnalysis && typeof llmAnalysis === "object") {
        const analysis = llmAnalysis as Record<string, unknown>;

        if (Array.isArray(analysis.utilityFunctions)) {
          // Enhance existing utility functions with LLM descriptions
          for (const func of comprehensiveAnalysis.utilityFunctions) {
            const llmFunc = (
              analysis.utilityFunctions as Array<{
                name?: string;
                description?: string;
              }>
            ).find((f) => f.name === func.name);
            if (llmFunc?.description) {
              func.documentation = llmFunc.description;
            }
          }
        }

        if (
          analysis.codingStandards &&
          typeof analysis.codingStandards === "object"
        ) {
          // Merge coding standards
          comprehensiveAnalysis.codingStandards = {
            ...comprehensiveAnalysis.codingStandards,
            ...(analysis.codingStandards as Partial<CodingStandards>),
          };
        }

        if (
          analysis.architecture &&
          typeof analysis.architecture === "object"
        ) {
          // Enhance architecture with LLM insights
          const arch = analysis.architecture as {
            patterns?: Array<{
              name: string;
              description: string;
              files: string[];
            }>;
            decisions?: string[];
            layers?: Array<{ name: string; description: string }>;
          };

          if (arch.patterns) {
            comprehensiveAnalysis.architecture.patterns.push(...arch.patterns);
          }
        }

        // Extract insights
        const insights: ComprehensiveAnalysis["llmInsights"] = {
          provider: aiService.getProviderName(),
          enhanced: true,
        };

        if (analysis.insights && typeof analysis.insights === "object") {
          const ins = analysis.insights as {
            strengths?: string[];
            improvements?: string[];
            recommendations?: string[];
          };
          if (ins.strengths) insights.strengths = ins.strengths;
          if (ins.improvements) insights.improvements = ins.improvements;
          if (ins.recommendations)
            insights.recommendations = ins.recommendations;
        }

        if (analysis.patterns && Array.isArray(analysis.patterns)) {
          insights.patterns = analysis.patterns as string[];
        }

        if (analysis.decisions && Array.isArray(analysis.decisions)) {
          insights.decisions = analysis.decisions as string[];
        }

        return {
          llmInsights: insights,
        };
      }

      // If parsing failed, return raw analysis as insights
      return {
        llmInsights: {
          llmAnalysis: llmResponse,
          provider: aiService.getProviderName(),
          enhanced: true,
        },
      };
    } catch (error) {
      logger.warn("LLM enhancement failed, continuing with standard analysis", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {};
    }
  }

  /**
   * Build comprehensive analysis structure with all detailed data
   */
  private buildComprehensiveAnalysis(
    repoInfo: RepoInfo,
    structure: CodeStructure,
    docs: Record<string, string>,
    rootPath: string
  ): ComprehensiveAnalysis {
    // Extract detailed functions from all code files
    const allFunctions: FunctionDetail[] = [];
    const allRoutes: RouteInfo[] = [];

    for (const file of structure.files) {
      if (
        file.language &&
        ["typescript", "javascript"].includes(file.language)
      ) {
        try {
          const filePath = join(rootPath, file.path);
          if (existsSync(filePath)) {
            const content = readFileSync(filePath, "utf-8");

            // Extract functions
            const functions = this.extractDetailedFunctions(
              filePath,
              content,
              rootPath
            );
            allFunctions.push(...functions);

            // Extract routes (for API/server files)
            if (
              file.path.includes("route") ||
              file.path.includes("api") ||
              file.path.includes("server") ||
              file.path.includes("app.ts") ||
              file.path.includes("app.js") ||
              file.path.includes("routes") ||
              file.path.includes("endpoints")
            ) {
              const routes = this.extractRoutes(filePath, content, rootPath);
              allRoutes.push(...routes);
            }
          }
        } catch {
          // Skip if can't read
        }
      }
    }

    // Categorize utility functions
    const utilityFunctions = allFunctions.filter(
      (f) => f.category === "utility" || f.category === "helper"
    );

    // Extract coding standards
    const codingStandards = this.extractCodingStandards(
      structure,
      structure.files
    );

    // Build folder structure tree
    const folderStructure = this.buildFolderTree(structure.files, rootPath);

    // Build architecture layers with descriptions
    const architectureLayers = structure.architecture.layers.map((layer) => ({
      name: layer,
      path:
        structure.files
          .filter((f) => f.path.toLowerCase().includes(`/${layer}/`))
          .map((f) => f.path.split("/").slice(0, -1).join("/"))
          .filter((v, i, a) => a.indexOf(v) === i)[0] || `/${layer}/`,
      description: `Layer containing ${layer}-related code`,
      files: structure.files
        .filter((f) => f.path.toLowerCase().includes(`/${layer}/`))
        .map((f) => f.path),
    }));

    // Build architecture patterns
    const architecturePatterns = structure.architecture.patterns.map(
      (pattern) => ({
        name: pattern,
        description: `Code pattern: ${pattern}`,
        files: structure.files
          .filter((f) => f.codeDetails?.patterns.includes(pattern))
          .map((f) => f.path),
      })
    );

    // Parse dependencies from package.json
    const packageJsonPath = join(rootPath, "package.json");
    const dependencies = {
      production: [] as Array<{ name: string; version: string }>,
      development: [] as Array<{ name: string; version: string }>,
      peer: [] as Array<{ name: string; version: string }>,
    };

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        if (packageJson.dependencies) {
          dependencies.production = Object.entries(
            packageJson.dependencies
          ).map(([name, version]) => ({ name, version: String(version) }));
        }
        if (packageJson.devDependencies) {
          dependencies.development = Object.entries(
            packageJson.devDependencies
          ).map(([name, version]) => ({ name, version: String(version) }));
        }
        if (packageJson.peerDependencies) {
          dependencies.peer = Object.entries(packageJson.peerDependencies).map(
            ([name, version]) => ({ name, version: String(version) })
          );
        }
      } catch {
        // Skip if can't parse
      }
    }

    // Build entry points with descriptions
    const entryPoints: Array<{
      path: string;
      type: "main" | "module" | "browser" | "types";
      description: string;
    }> = structure.entryPoints.map((ep) => {
      let type: "main" | "module" | "browser" | "types" = "main";
      if (ep.includes("module")) type = "module";
      else if (ep.includes("browser")) type = "browser";
      else if (ep.includes("types")) type = "types";

      return {
        path: ep,
        type,
        description: `Entry point: ${ep}`,
      };
    });

    // Build documentation array
    const documentation: Array<{
      filename: string;
      content: string;
      type: "readme" | "changelog" | "license" | "contributing" | "other";
    }> = Object.entries(docs).map(([filename, content]) => {
      const lowerFilename = filename.toLowerCase();
      let type: "readme" | "changelog" | "license" | "contributing" | "other" =
        "other";
      if (lowerFilename.includes("readme")) type = "readme";
      else if (lowerFilename.includes("changelog")) type = "changelog";
      else if (lowerFilename.includes("license")) type = "license";
      else if (lowerFilename.includes("contributing")) type = "contributing";

      return {
        filename,
        content,
        type,
      };
    });

    return {
      repository: repoInfo,
      folderStructure,
      utilityFunctions,
      allFunctions,
      routes: allRoutes,
      codingStandards,
      architecture: {
        layers: architectureLayers,
        patterns: architecturePatterns,
      },
      linting: structure.linting,
      dependencies,
      entryPoints,
      documentation,
    };
  }

  /**
   * Save knowledge to external API with comprehensive project initialization
   * Supports checkpoint/resume by tracking progress and skipping completed steps
   */
  private async saveKnowledgeToAPI(
    apiService: ReturnType<typeof this.getApiService>,
    repoInfo: RepoInfo,
    documentation: string,
    structure: CodeStructure,
    comprehensiveAnalysis: ComprehensiveAnalysis,
    repositoryId?: string,
    projectId?: string,
    progress?: AnalysisProgress | null,
    checkpointId?: string,
    cachedRepositoryId?: string,
    cachedProjectId?: string
  ): Promise<{
    repositoryId: string;
    projectId: string;
    documentationId?: string;
    markdownId?: string;
    analysisId?: string;
    codeSnippetsSaved: number;
  }> {
    // Step 1: Ensure repository exists (create if not)
    // Check cache first to avoid unnecessary API calls
    const finalRepositoryId = await this.ensureRepositoryExists(
      apiService,
      repoInfo,
      repositoryId,
      cachedRepositoryId
    );

    // Step 2: Ensure project exists (create if not, using repo name)
    // Check cache first to avoid unnecessary API calls
    const finalProjectId = await this.ensureProjectExists(
      apiService,
      repoInfo,
      finalRepositoryId,
      projectId,
      cachedProjectId
    );

    const savedItems: {
      documentationId?: string;
      markdownId?: string;
      analysisId?: string;
      codeSnippetsSaved: number;
    } = {
      codeSnippetsSaved: 0,
    };

    // Update progress with repository/project IDs
    if (progress) {
      progress.repositoryId = finalRepositoryId;
      progress.projectId = finalProjectId;
    }

    // Step 3: Save README and documentation files separately as markdown documents
    // Skip if already completed when resuming
    if (
      progress?.steps.documentation?.completed &&
      progress.steps.documentation.filesRead.length ===
        comprehensiveAnalysis.documentation.length
    ) {
      logger.info("⏭️  Skipping documentation save (already completed)");
    } else {
      for (const doc of comprehensiveAnalysis.documentation) {
        try {
          const docMarkdownBody = {
            title: `${repoInfo.name} - ${doc.filename}`,
            document_type:
              doc.type === "readme"
                ? "readme"
                : doc.type === "changelog"
                ? "changelog"
                : doc.type === "license"
                ? "license"
                : doc.type === "contributing"
                ? "contributing"
                : "documentation",
            category: "repository",
            content: doc.content,
            file_path: `/repositories/${repoInfo.name}/${doc.filename}`,
            tags: [
              repoInfo.name,
              doc.type,
              "repository-documentation",
            ],
          };

          const result = await apiService.post(
            "/api/markdown-documents",
            docMarkdownBody
          );
          const docId = this.extractIdFromResponse(result, "documentation");
          if (docId) {
            logger.info(
              `✅ Saved ${doc.filename} as markdown document (ID: ${docId})`
            );
          } else {
            logger.info(`✅ Saved ${doc.filename} as markdown document`);
          }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error(`Failed to save documentation file: ${doc.filename}`, {
          error: errorMsg,
          stack: errorStack,
          filename: doc.filename,
          docType: doc.type,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.documentation",
        });
        // Continue with other docs
      }
      }
      // Update progress
      if (progress && checkpointId) {
        progress.steps.documentation = {
          ...progress.steps.documentation,
          completed: true,
          filesRead: comprehensiveAnalysis.documentation.map((d) => d.filename),
          totalFiles: comprehensiveAnalysis.documentation.length,
        };
        progress.currentStep = "documentation_saved";
        this.saveCheckpoint(
          checkpointId,
          repoInfo.rootPath,
          "documentation_saved",
          "in_progress",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }
    }

    // Step 3.5: Generate and save Mermaid diagrams (early in the process)
    // Skip if already completed when resuming
    if (progress?.steps.mermaidDiagrams?.completed) {
      logger.info(
        `⏭️  Skipping Mermaid diagrams (${progress.steps.mermaidDiagrams.diagramsGenerated.length} already generated)`
      );
    } else {
      let mermaidDiagrams: Array<{
        title: string;
        type: string;
        content: string;
      }> = [];
      try {
        mermaidDiagrams = this.generateAllMermaidDiagrams(
          repoInfo,
          structure,
          comprehensiveAnalysis,
          repoInfo.rootPath
        );

        for (const diagram of mermaidDiagrams) {
          try {
            const diagramDoc = {
              title: diagram.title,
              document_type: "mermaid-diagram",
              category: "repository",
              content: diagram.content,
              file_path: `/repositories/${repoInfo.name}/diagrams/${diagram.type}.md`,
              tags: [
                repoInfo.name,
                "mermaid",
                "diagram",
                diagram.type,
              ],
            };

            await apiService.post("/api/markdown-documents", diagramDoc);
            logger.info(`✅ Saved Mermaid diagram: ${diagram.type}`);
          } catch (error) {
            logger.warn(`❌ Failed to save Mermaid diagram: ${diagram.type}`, {
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error("Failed to generate Mermaid diagrams", {
          error: errorMsg,
          stack: errorStack,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.mermaidDiagrams",
        });
      }
      // Update progress
      if (progress && checkpointId) {
        const diagramsGenerated = mermaidDiagrams.map((d) => d.type);
        progress.steps.mermaidDiagrams = {
          completed: true,
          diagramsGenerated,
        };
        progress.currentStep = "mermaidDiagrams";
        this.saveCheckpoint(
          checkpointId,
          repoInfo.rootPath,
          "mermaidDiagrams",
          "in_progress",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }
    }

    // Step 4: Save coding standards as separate documentation
    // Skip if already completed when resuming
    if (progress?.steps.codingStandards?.completed) {
      logger.info("⏭️  Skipping coding standards (already saved)");
    } else {
      try {
        const codingStandardsDoc = {
          title: `${repoInfo.name} - Coding Standards`,
          type: "overview",
          category: "repository",
          content: `# Coding Standards for ${repoInfo.name}

## Naming Conventions
- Variables: ${
            comprehensiveAnalysis.codingStandards.namingConventions.variables
          }
- Functions: ${
            comprehensiveAnalysis.codingStandards.namingConventions.functions
          }
- Classes: ${comprehensiveAnalysis.codingStandards.namingConventions.classes}
- Constants: ${
            comprehensiveAnalysis.codingStandards.namingConventions.constants
          }
- Files: ${comprehensiveAnalysis.codingStandards.namingConventions.files}

## File Organization
- Structure: ${comprehensiveAnalysis.codingStandards.fileOrganization.structure}
- Patterns: ${comprehensiveAnalysis.codingStandards.fileOrganization.patterns.join(
            ", "
          )}

## Import Patterns
- Style: ${comprehensiveAnalysis.codingStandards.importPatterns.style}
- Ordering: ${comprehensiveAnalysis.codingStandards.importPatterns.ordering}

## Error Handling
- Pattern: ${comprehensiveAnalysis.codingStandards.errorHandling.pattern}
- Error Classes: ${comprehensiveAnalysis.codingStandards.errorHandling.errorClasses.join(
            ", "
          )}

## Testing
- Framework: ${
            comprehensiveAnalysis.codingStandards.testing.framework ||
            "Not detected"
          }
- Patterns: ${comprehensiveAnalysis.codingStandards.testing.patterns.join(", ")}
`,
          metadata: {
            repositoryId: finalRepositoryId,
            projectId: finalProjectId,
            codingStandards: comprehensiveAnalysis.codingStandards,
          },
        };

        const result = await apiService.post(
          "/api/documentations",
          codingStandardsDoc
        );
        const docId = this.extractIdFromResponse(result, "documentation");
        if (docId) {
          logger.info(
            `✅ Saved coding standards as documentation (ID: ${docId})`
          );
        } else {
          logger.info("✅ Saved coding standards as documentation");
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error("Failed to save coding standards", {
          error: errorMsg,
          stack: errorStack,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.codingStandards",
        });
      }
      // Update progress
      if (progress && checkpointId) {
        progress.steps.codingStandards = { completed: true, saved: true };
        progress.currentStep = "codingStandards";
        this.saveCheckpoint(
          checkpointId,
          repoInfo.rootPath,
          "codingStandards",
          "in_progress",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }
    }

    // Step 5: Save routes/API endpoints as documentation (moved before snippets)
    // Skip if already completed when resuming
    if (
      progress?.steps.routes?.completed &&
      progress.steps.routes.routesExtracted ===
        comprehensiveAnalysis.routes.length
    ) {
      logger.info("⏭️  Skipping routes (already saved)");
    } else if (comprehensiveAnalysis.routes.length > 0) {
      try {
        const routesMarkdown = `# API Routes for ${
          repoInfo.name
        }\n\n## Routes\n\n${comprehensiveAnalysis.routes
          .map(
            (route) =>
              `### ${route.method} ${route.path}\n- **File:** \`${
                route.filePath
              }:${route.lineNumber}\`\n${
                route.handler ? `- **Handler:** \`${route.handler}\`\n` : ""
              }${
                route.middleware
                  ? `- **Middleware:** ${route.middleware.join(", ")}\n`
                  : ""
              }${
                route.description
                  ? `- **Description:** ${route.description}\n`
                  : ""
              }`
          )
          .join("\n")}`;

        const routesDoc = {
          title: `${repoInfo.name} - API Routes`,
          document_type: "api-routes",
          category: "repository",
          content: routesMarkdown,
          file_path: `/repositories/${repoInfo.name}/routes.md`,
          tags: [
            repoInfo.name,
            "routes",
            "api-endpoints",
            "api",
          ],
        };

        await apiService.post("/api/markdown-documents", routesDoc);
        logger.info(
          `✅ Saved ${comprehensiveAnalysis.routes.length} routes as markdown document`
        );

        // Update progress
        if (progress && checkpointId) {
          progress.steps.routes = {
            completed: true,
            routesExtracted: comprehensiveAnalysis.routes.length,
            saved: true,
          };
          progress.currentStep = "routes";
          this.saveCheckpoint(
            checkpointId,
            repoInfo.rootPath,
            "routes",
            "in_progress",
            progress.steps,
            progress.repositoryId,
            progress.projectId,
            progress.errors
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error("Failed to save routes", {
          error: errorMsg,
          stack: errorStack,
          routesCount: comprehensiveAnalysis.routes.length,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.routes",
        });
      }
    } else {
      // No routes to save
      logger.info("⏭️  No routes found to save");
    }

    // NOTE: All snippet creation moved to Step 11 (at the very end)
    // Continue with other steps, then handle snippets last

    // Step 6: Save folder structure as separate markdown document (for easy viewing)
    // Skip if already completed when resuming
    if (progress?.steps.folderStructure?.completed) {
      logger.info("⏭️  Skipping folder structure (already saved)");
    } else {
      try {
        const folderStructureMarkdown = this.generateFolderStructureMarkdown(
          comprehensiveAnalysis.folderStructure
        );
        const folderStructureDoc = {
          title: `${repoInfo.name} - Folder Structure`,
          document_type: "folder-structure",
          category: "repository",
          content: folderStructureMarkdown,
          file_path: `/repositories/${repoInfo.name}/folder-structure.md`,
          tags: [
            repoInfo.name,
            "folder-structure",
            "repository-structure",
          ],
        };

        await apiService.post("/api/markdown-documents", folderStructureDoc);
        logger.info("✅ Saved folder structure as markdown document");
        if (progress && checkpointId) {
          progress.steps.folderStructure = { completed: true, saved: true };
          progress.currentStep = "folderStructure";
          this.saveCheckpoint(
            checkpointId,
            repoInfo.rootPath,
            "folderStructure",
            "in_progress",
            progress.steps,
            progress.repositoryId,
            progress.projectId,
            progress.errors
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error("Failed to save folder structure", {
          error: errorMsg,
          stack: errorStack,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.folderStructure",
        });
      }
    }

    // Step 6.5: Try to save comprehensive analysis to dedicated endpoint
    // Skip if already completed when resuming
    if (
      progress?.steps.analysis?.completed &&
      progress.steps.analysis.analysisId
    ) {
      logger.info(
        `⏭️  Skipping analysis save (already saved: ${progress.steps.analysis.analysisId})`
      );
      savedItems.analysisId = progress.steps.analysis.analysisId;
    } else {
      try {
        const analysisBody = {
          ...comprehensiveAnalysis,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          analyzedAt: new Date().toISOString(),
        };

        const result = await apiService.post(
          `/api/repositories/${finalRepositoryId}/analysis`,
          analysisBody
        );
        const analysisId = this.extractIdFromResponse(result, "analysis");
        if (analysisId) {
          savedItems.analysisId = analysisId;
          logger.info(
            `✅ Saved comprehensive analysis: ${savedItems.analysisId}`
          );
          if (progress && checkpointId) {
            progress.steps.analysis = {
              completed: true,
              saved: true,
              analysisId,
            };
            progress.currentStep = "analysis";
            this.saveCheckpoint(
              checkpointId,
              repoInfo.rootPath,
              "analysis",
              "in_progress",
              progress.steps,
              progress.repositoryId,
              progress.projectId,
              progress.errors
            );
          }
        }
      } catch (error) {
        logger.debug(
          "Comprehensive analysis endpoint not available, trying alternative methods",
          {
            error: error instanceof Error ? error.message : String(error),
          }
        );

        // Alternative 1: Try saving as a file using /api/repositories/{id}/files
        try {
          const fileBody = {
            file_name: "repository-analysis.json",
            file_path: `/repositories/${repoInfo.name}/repository-analysis.json`,
            file_type: "json" as const,
            content: JSON.stringify({
              ...comprehensiveAnalysis,
              repositoryId: finalRepositoryId,
              projectId: finalProjectId,
              analyzedAt: new Date().toISOString(),
            }),
            metadata: {
              description: `Complete repository analysis for ${repoInfo.name} including folder structure, functions, coding standards, architecture, linting, dependencies, entry points, and documentation`,
              repositoryName: repoInfo.name,
              analyzedAt: new Date().toISOString(),
            },
          };

          const fileResult = await apiService.post(
            `/api/repositories/${finalRepositoryId}/files`,
            fileBody
          );
          const fileId = this.extractIdFromResponse(fileResult, "file");
          if (fileId) {
            logger.info(`Saved comprehensive analysis as file: ${fileId}`);
            // Note: We don't set analysisId here since it's saved as a file, not analysis
          }
        } catch (fileError) {
          logger.debug(
            "Failed to save analysis as file, will include in metadata",
            {
              error:
                fileError instanceof Error
                  ? fileError.message
                  : String(fileError),
            }
          );
          // Continue - we'll include it in metadata instead
        }
      }
    }

    // Step 7: Save as documentation (main overview) with comprehensive analysis in metadata
    // Skip if already completed when resuming
    if (
      progress?.steps.mainDocumentation?.completed &&
      progress.steps.mainDocumentation.docId
    ) {
      logger.info(
        `⏭️  Skipping main documentation (already saved: ${progress.steps.mainDocumentation.docId})`
      );
      savedItems.documentationId = progress.steps.mainDocumentation.docId;
    } else {
      try {
        const docBody: Record<string, unknown> = {
          title: `${repoInfo.name} - Codebase Analysis`,
          type: "overview",
          category: "repository",
          content: documentation,
          metadata: {
            repositoryName: repoInfo.name,
            remoteUrl: repoInfo.remoteUrl,
            branch: repoInfo.branch,
            defaultBranch: repoInfo.defaultBranch,
            branchPattern: repoInfo.branchPattern,
            branches: repoInfo.branches,
            commit: repoInfo.commit,
            fileCount: structure.files.length,
            dependencies: structure.dependencies,
            entryPoints: structure.entryPoints,
            linting: structure.linting,
            architecture: structure.architecture,
            repositoryId: finalRepositoryId,
            projectId: finalProjectId,
            // Include comprehensive analysis if endpoint doesn't exist
            comprehensiveAnalysis: savedItems.analysisId
              ? undefined
              : comprehensiveAnalysis,
            // Include folder structure in metadata for easy access
            folderStructure: comprehensiveAnalysis.folderStructure,
            // Include summary of utility functions
            utilityFunctionsCount:
              comprehensiveAnalysis.utilityFunctions.length,
            totalFunctionsCount: comprehensiveAnalysis.allFunctions.length,
            routesCount: comprehensiveAnalysis.routes.length,
            routes: comprehensiveAnalysis.routes,
          },
        };

        const result = await apiService.post("/api/documentations", docBody);
        const docId = this.extractIdFromResponse(result, "documentation");
        if (docId) {
          savedItems.documentationId = docId;
          logger.info(
            `✅ Saved main documentation: ${savedItems.documentationId}`
          );
          if (progress && checkpointId) {
            progress.steps.mainDocumentation = {
              completed: true,
              saved: true,
              docId,
            };
            progress.currentStep = "mainDocumentation";
            this.saveCheckpoint(
              checkpointId,
              repoInfo.rootPath,
              "mainDocumentation",
              "in_progress",
              progress.steps,
              progress.repositoryId,
              progress.projectId,
              progress.errors
            );
          }
        } else {
          logger.warn("⚠️ Documentation saved but no ID returned");
        }
      } catch (error) {
        logger.error("❌ Failed to save as documentation", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    // Step 8: Save as markdown document (for better searchability)
    // Skip if already completed when resuming
    if (
      progress?.steps.markdownDocument?.completed &&
      progress.steps.markdownDocument.markdownId
    ) {
      logger.info(
        `⏭️  Skipping markdown document (already saved: ${progress.steps.markdownDocument.markdownId})`
      );
      savedItems.markdownId = progress.steps.markdownDocument.markdownId;
    } else {
      try {
        const markdownBody = {
          title: `${repoInfo.name} - Codebase Analysis`,
          document_type: "codebase-analysis",
          category: "repository",
          content: documentation,
          file_path: `/repositories/${repoInfo.name}`,
          tags: [
            "codebase-analysis",
            "repository",
            repoInfo.name,
          ],
        };

        const result = await apiService.post(
          "/api/markdown-documents",
          markdownBody
        );
        const markdownId = this.extractIdFromResponse(result, "documentation");
        if (markdownId) {
          savedItems.markdownId = markdownId;
          logger.info(`✅ Saved markdown document: ${savedItems.markdownId}`);
          if (progress && checkpointId) {
            progress.steps.markdownDocument = {
              completed: true,
              saved: true,
              markdownId,
            };
            progress.currentStep = "markdownDocument";
            this.saveCheckpoint(
              checkpointId,
              repoInfo.rootPath,
              "markdownDocument",
              "in_progress",
              progress.steps,
              progress.repositoryId,
              progress.projectId,
              progress.errors
            );
          }
        } else {
          logger.warn("⚠️ Markdown document saved but no ID returned");
        }
      } catch (error) {
        logger.error("❌ Failed to save as markdown document", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    // Step 9: Removed - key files are now saved in Step 11 (snippets section)

    // Step 10: Save comprehensive summary document
    // Skip if already completed when resuming
    if (progress?.steps.summary?.completed) {
      logger.info("⏭️  Skipping summary (already saved)");
    } else {
      try {
        const summaryMarkdown = `# ${
          repoInfo.name
        } - Complete Repository Analysis Summary

**Generated:** ${new Date().toISOString()}
**Repository ID:** ${finalRepositoryId}
**Project ID:** ${finalProjectId}

## 📊 Analysis Summary

### Repository Information
- **Name:** ${repoInfo.name}
- **Remote URL:** ${repoInfo.remoteUrl || "Not configured"}
- **Branch:** ${repoInfo.branch}
- **Default Branch:** ${repoInfo.defaultBranch || "Unknown"}
- **Commit:** ${repoInfo.commit.substring(0, 8)}
- **Total Branches:** ${repoInfo.branches.length}

### Code Analysis
- **Total Files:** ${structure.files.length}
- **Entry Points:** ${structure.entryPoints.length}
- **Total Functions:** ${comprehensiveAnalysis.allFunctions.length}
- **Utility Functions:** ${comprehensiveAnalysis.utilityFunctions.length}
- **Routes/API Endpoints:** ${comprehensiveAnalysis.routes.length}
- **Architecture Layers:** ${comprehensiveAnalysis.architecture.layers.length}
- **Architecture Patterns:** ${
          comprehensiveAnalysis.architecture.patterns.length
        }

### Dependencies
- **Production:** ${comprehensiveAnalysis.dependencies.production.length}
- **Development:** ${comprehensiveAnalysis.dependencies.development.length}
- **Peer:** ${comprehensiveAnalysis.dependencies.peer.length}

### Documentation
- **Files:** ${comprehensiveAnalysis.documentation.length}
  ${comprehensiveAnalysis.documentation
    .map((d) => `  - ${d.filename} (${d.type})`)
    .join("\n")}

### Saved Items
- **Documentation:** ${savedItems.documentationId ? "✅" : "❌"}
- **Markdown Documents:** ${savedItems.markdownId ? "✅" : "❌"}
- **Comprehensive Analysis:** ${
          savedItems.analysisId ? "✅" : "⚠️ (in metadata)"
        }
- **Code Snippets:** ${savedItems.codeSnippetsSaved} saved
- **Routes Document:** ${comprehensiveAnalysis.routes.length > 0 ? "✅" : "N/A"}

## 🔍 Quick Access

### Functions
- **Utility Functions:** ${
          comprehensiveAnalysis.utilityFunctions.length
        } functions
- **All Functions:** ${
          comprehensiveAnalysis.allFunctions.length
        } total functions
- **Categories:** ${Array.from(
          new Set(comprehensiveAnalysis.allFunctions.map((f) => f.category))
        ).join(", ")}

### Routes
${
  comprehensiveAnalysis.routes.length > 0
    ? comprehensiveAnalysis.routes
        .map(
          (r) => `- **${r.method}** ${r.path} (${r.filePath}:${r.lineNumber})`
        )
        .join("\n")
    : "No routes detected"
}

### Architecture
**Layers:**
${comprehensiveAnalysis.architecture.layers
  .map((l) => `- ${l.name}: ${l.files.length} files`)
  .join("\n")}

**Patterns:**
${comprehensiveAnalysis.architecture.patterns
  .map((p) => `- ${p.name}: ${p.files.length} files`)
  .join("\n")}

---

*This summary was automatically generated by the analyzeAndSaveRepository tool.*`;

        const summaryDoc = {
          title: `${repoInfo.name} - Analysis Summary`,
          document_type: "analysis-summary",
          category: "repository",
          content: summaryMarkdown,
          file_path: `/repositories/${repoInfo.name}/analysis-summary.md`,
          tags: [
            repoInfo.name,
            "summary",
            "analysis",
            "repository-analysis",
          ],
        };

        await apiService.post("/api/markdown-documents", summaryDoc);
        logger.info("✅ Saved analysis summary document");
        if (progress && checkpointId) {
          progress.steps.summary = { completed: true, saved: true };
          progress.currentStep = "summary";
          this.saveCheckpoint(
            checkpointId,
            repoInfo.rootPath,
            "summary",
            "in_progress",
            progress.steps,
            progress.repositoryId,
            progress.projectId,
            progress.errors
          );
        }
      } catch (error) {
        logger.warn("❌ Failed to save analysis summary", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Step 11: Save ALL code snippets LAST (after all other tasks are complete)
    // This ensures critical data is saved first, even if snippet creation takes a long time
    logger.info(
      "Starting snippet creation (this may take a while for large codebases)..."
    );

    // Initialize snippets progress tracking if not already initialized
    if (progress && !progress.steps.snippets) {
      progress.steps.snippets = {
        completed: false,
        utilityFunctions: { saved: 0, total: 0, savedIds: [] },
        importantFunctions: { saved: 0, total: 0, savedIds: [] },
        routes: { saved: false },
        keyFiles: { saved: 0, total: 0, savedIds: [] },
        totalSaved: 0,
      };
    }

    // 11.1: Save utility functions as snippets
    for (const func of comprehensiveAnalysis.utilityFunctions) {
      try {
        // Read full function code from file
        const filePath = join(repoInfo.rootPath, func.filePath);
        let functionCode = `// ${func.filePath}:${func.lineNumber}\n${func.signature}`;

        if (existsSync(filePath)) {
          try {
            const fileContent = readFileSync(filePath, "utf-8");
            // Extract complete function body
            const fullFunctionCode = this.extractFunctionBody(
              filePath,
              fileContent,
              func.name,
              func.lineNumber
            );
            functionCode = fullFunctionCode;
          } catch (error) {
            logger.debug(`Failed to read function code for ${func.name}`, {
              error: error instanceof Error ? error.message : String(error),
            });
            // Use signature if can't read file
          }
        }

        // Create proper title: FunctionName - Category (Repository)
        const functionTitle = `${func.name} - ${func.category.charAt(0).toUpperCase() + func.category.slice(1)} Function`;
        
        // Create comprehensive description
        const functionDescription = `${func.category === "utility" ? "Utility" : func.category.charAt(0).toUpperCase() + func.category.slice(1)} function from ${repoInfo.name}

**Function:** ${func.name}
**Category:** ${func.category}
**Signature:** ${func.signature}
**Return Type:** ${func.returnType || "void"}
**Parameters:** ${func.parameters.length > 0 
  ? func.parameters.map((p) => `\n  - ${p.name}: ${p.type}${p.optional ? " (optional)" : ""}`).join("")
  : "None"}
**Location:** ${func.filePath}:${func.lineNumber}
${func.documentation ? `\n**Documentation:**\n${func.documentation}` : ""}
${repoInfo.remoteUrl ? `\n**Repository:** ${repoInfo.remoteUrl}` : ""}`;

        // Create organized tags
        const functionTags = [
          func.name.toLowerCase(), // Function name for direct search
          func.category, // Category tag
          "function", // Type tag
          "utility-function", // Specific type
          repoInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "-"), // Repo name (sanitized)
          ...(func.filePath.split("/").pop()?.replace(/\.[^.]*$/, "") || []), // File name without extension
        ].filter(Boolean);

        const snippetBody = {
          title: functionTitle,
          code: functionCode,
          language: func.filePath.endsWith(".ts")
            ? "typescript"
            : func.filePath.endsWith(".js")
            ? "javascript"
            : "text",
          description: functionDescription,
          tags: functionTags,
          projectId: finalProjectId,
          repositoryId: finalRepositoryId,
        };

        const result = await apiService.post("/api/snippets", snippetBody);
        savedItems.codeSnippetsSaved++;
        const snippetId = this.extractIdFromResponse(result, "snippet");
        if (snippetId) {
          if (progress?.steps.snippets) {
            progress.steps.snippets.utilityFunctions.savedIds.push(func.name);
            progress.steps.snippets.utilityFunctions.saved++;
            progress.steps.snippets.totalSaved++;
          }
          // Save checkpoint every 50 snippets
          if (
            savedItems.codeSnippetsSaved % 50 === 0 &&
            progress &&
            checkpointId
          ) {
            logger.info(
              `✅ Saved ${savedItems.codeSnippetsSaved} snippets so far... (checkpoint saved)`
            );
            progress.currentStep = "snippets_utility";
            this.saveCheckpoint(
              checkpointId,
              repoInfo.rootPath,
              "snippets_utility",
              "in_progress",
              progress.steps,
              progress.repositoryId,
              progress.projectId,
              progress.errors
            );
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error(`Failed to save utility function: ${func.name}`, {
          error: errorMsg,
          stack: errorStack,
          functionName: func.name,
          functionCategory: func.category,
          filePath: func.filePath,
          lineNumber: func.lineNumber,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.snippets.utilityFunctions",
        });
        // Continue with other functions
      }
    }

    // 11.2: Save other important functions (handlers, services, components)
    const importantFunctions = comprehensiveAnalysis.allFunctions.filter(
      (f) =>
        !comprehensiveAnalysis.utilityFunctions.some(
          (uf) => uf.name === f.name
        ) &&
        (f.category === "handler" ||
          f.category === "service" ||
          f.category === "component" ||
          f.isExported)
    );

    // Track already saved important functions from progress
    const alreadySavedImportantIds = new Set<string>(
      progress?.steps.snippets?.importantFunctions.savedIds || []
    );

    const importantFunctionsToSave = importantFunctions.filter(
      (f) => !alreadySavedImportantIds.has(f.name)
    );
    logger.info(
      `Saving important functions: ${importantFunctionsToSave.length} remaining (${alreadySavedImportantIds.size} already saved)`
    );

    for (const func of importantFunctionsToSave) {
      // No limit - save all important functions
      try {
        const filePath = join(repoInfo.rootPath, func.filePath);
        let functionCode = `// ${func.filePath}:${func.lineNumber}\n${func.signature}`;

        if (existsSync(filePath)) {
          try {
            const fileContent = readFileSync(filePath, "utf-8");
            // Extract complete function body
            const fullFunctionCode = this.extractFunctionBody(
              filePath,
              fileContent,
              func.name,
              func.lineNumber
            );
            functionCode = fullFunctionCode;
          } catch (error) {
            logger.debug(`Failed to read function code for ${func.name}`, {
              error: error instanceof Error ? error.message : String(error),
            });
            // Use signature if can't read file
          }
        }

        // Create proper title: FunctionName - Category (Repository)
        const functionTitle = `${func.name} - ${func.category.charAt(0).toUpperCase() + func.category.slice(1)} Function`;
        
        // Create comprehensive description
        const functionDescription = `${func.category.charAt(0).toUpperCase() + func.category.slice(1)} function from ${repoInfo.name}

**Function:** ${func.name}
**Category:** ${func.category}
**Signature:** ${func.signature}
**Return Type:** ${func.returnType || "void"}
**Parameters:** ${func.parameters.length > 0 
  ? func.parameters.map((p) => `\n  - ${p.name}: ${p.type}${p.optional ? " (optional)" : ""}`).join("")
  : "None"}
**Location:** ${func.filePath}:${func.lineNumber}
${func.documentation ? `\n**Documentation:**\n${func.documentation}` : ""}
${repoInfo.remoteUrl ? `\n**Repository:** ${repoInfo.remoteUrl}` : ""}`;

        // Create organized tags
        const functionTags = [
          func.name.toLowerCase(), // Function name for direct search
          func.category, // Category tag
          "function", // Type tag
          `${func.category}-function`, // Specific type
          repoInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "-"), // Repo name (sanitized)
          ...(func.filePath.split("/").pop()?.replace(/\.[^.]*$/, "").split("-") || []), // File name without extension
        ].filter(Boolean);

        const snippetBody = {
          title: functionTitle,
          code: functionCode,
          language: func.filePath.endsWith(".ts")
            ? "typescript"
            : func.filePath.endsWith(".js")
            ? "javascript"
            : "text",
          description: functionDescription,
          tags: functionTags,
          projectId: finalProjectId,
          repositoryId: finalRepositoryId,
        };

        const result = await apiService.post("/api/snippets", snippetBody);
        savedItems.codeSnippetsSaved++;
        const snippetId = this.extractIdFromResponse(result, "snippet");
        if (snippetId) {
          if (progress?.steps.snippets) {
            progress.steps.snippets.importantFunctions.savedIds.push(func.name);
            progress.steps.snippets.importantFunctions.saved++;
            progress.steps.snippets.totalSaved++;
          }
          // Save checkpoint every 50 snippets
          if (
            savedItems.codeSnippetsSaved % 50 === 0 &&
            progress &&
            checkpointId
          ) {
            logger.info(
              `✅ Saved ${savedItems.codeSnippetsSaved} snippets so far... (checkpoint saved)`
            );
            progress.currentStep = "snippets_important";
            this.saveCheckpoint(
              checkpointId,
              repoInfo.rootPath,
              "snippets_important",
              "in_progress",
              progress.steps,
              progress.repositoryId,
              progress.projectId,
              progress.errors
            );
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error(`Failed to save important function: ${func.name}`, {
          error: errorMsg,
          stack: errorStack,
          functionName: func.name,
          functionCategory: func.category,
          filePath: func.filePath,
          lineNumber: func.lineNumber,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.snippets.importantFunctions",
        });
        // Continue with other functions
      }
    }

    // 11.3: Save routes as a code snippet for easy reference
    if (
      !progress?.steps.snippets?.routes.saved &&
      comprehensiveAnalysis.routes.length > 0
    ) {
      try {
        // Create proper title for routes
        const routesTitle = `API Routes Configuration - ${repoInfo.name}`;
        
        // Create comprehensive routes description
        const routesDescription = `Complete API routes configuration extracted from ${repoInfo.name}

**Total Routes:** ${comprehensiveAnalysis.routes.length}
**Repository:** ${repoInfo.name}
${repoInfo.remoteUrl ? `**Repository URL:** ${repoInfo.remoteUrl}` : ""}

This configuration includes all detected API endpoints, their methods, paths, and handlers.`;

        // Create organized tags for routes
        const routesTags = [
          "api-routes",
          "routes",
          "api-configuration",
          "endpoints",
          repoInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "-"), // Repo name (sanitized)
        ].filter(Boolean);

        const routesSnippet = {
          title: routesTitle,
          code: JSON.stringify(comprehensiveAnalysis.routes, null, 2),
          language: "json",
          description: routesDescription,
          tags: routesTags,
          projectId: finalProjectId,
          repositoryId: finalRepositoryId,
        };

        const result = await apiService.post("/api/snippets", routesSnippet);
        savedItems.codeSnippetsSaved++;
        const snippetId = this.extractIdFromResponse(result, "snippet");
        if (snippetId && progress?.steps.snippets) {
          progress.steps.snippets.routes = { saved: true, snippetId };
          progress.steps.snippets.totalSaved++;
        }
        logger.debug("✅ Saved routes as code snippet");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error("Failed to save routes snippet", {
          error: errorMsg,
          stack: errorStack,
          routesCount: comprehensiveAnalysis.routes.length,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.snippets.routes",
        });
      }
    } else if (progress?.steps.snippets?.routes.saved) {
      logger.info("⏭️  Skipping routes snippet (already saved)");
      savedItems.codeSnippetsSaved++;
    }

    // 11.4: Save key code files as snippets
    if (
      progress?.steps.snippets?.keyFiles.saved ===
        progress?.steps.snippets?.keyFiles.total &&
      (progress?.steps.snippets?.keyFiles.total ?? 0) > 0
    ) {
      logger.info(
        `⏭️  Skipping key files (${progress?.steps.snippets?.keyFiles.saved ?? 0} already saved)`
      );
    } else {
      try {
        const keyFiles = structure.files
          .filter(
            (f) =>
              f.codeDetails &&
              (f.codeDetails.classes.length > 0 ||
                f.codeDetails.functions.length > 0 ||
                f.codeDetails.interfaces.length > 0)
          )
          .slice(0, 20); // Limit to top 20 files

        for (const file of keyFiles) {
          try {
            // Read file content for snippet
            const filePath = join(repoInfo.rootPath, file.path);
            if (existsSync(filePath) && file.language) {
              const fileContent = readFileSync(filePath, "utf-8");
              // Create proper title: FileName - Key File
              const fileName = file.path.split("/").pop() || file.path;
              const snippetTitle = `${fileName} - Key File`;
              
              // Create comprehensive file description
              const snippetDescription = `Key code file from ${repoInfo.name}

**File Path:** ${file.path}
**Language:** ${file.language || "unknown"}
${file.codeDetails?.classes.length 
  ? `**Classes:** ${file.codeDetails.classes.join(", ")}` 
  : ""}
${file.codeDetails?.functions.length 
  ? `**Functions:** ${file.codeDetails.functions.slice(0, 10).join(", ")}${file.codeDetails.functions.length > 10 ? ` (+${file.codeDetails.functions.length - 10} more)` : ""}` 
  : ""}
${file.codeDetails?.interfaces.length 
  ? `**Interfaces:** ${file.codeDetails.interfaces.join(", ")}` 
  : ""}
${repoInfo.remoteUrl ? `\n**Repository:** ${repoInfo.remoteUrl}` : ""}`;

              // Create organized tags for file
              const fileTags = [
                fileName.replace(/\.[^.]*$/, "").toLowerCase(), // File name without extension
                "key-file",
                "source-file",
                file.language || "code", // Language tag
                repoInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "-"), // Repo name (sanitized)
                ...(file.path.split("/").slice(0, -1).filter(Boolean) || []), // Directory path components
              ].filter(Boolean);

              const snippetBody = {
                title: snippetTitle,
                code: fileContent.substring(0, 50000), // Limit size
                language: file.language || "text",
                description: snippetDescription,
                tags: fileTags,
                projectId: finalProjectId,
                repositoryId: finalRepositoryId,
              };

              const result = await apiService.post(
                "/api/snippets",
                snippetBody
              );
              savedItems.codeSnippetsSaved++;
              const snippetId = this.extractIdFromResponse(result, "snippet");
              if (snippetId) {
                if (progress?.steps.snippets) {
                  progress.steps.snippets.keyFiles.savedIds.push(file.path);
                  progress.steps.snippets.keyFiles.saved++;
                  progress.steps.snippets.totalSaved++;
                }
                logger.debug(
                  `✅ Saved snippet for ${file.path} (ID: ${snippetId})`
                );
              }
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            logger.error(`Failed to save key file snippet: ${file.path}`, {
              error: errorMsg,
              stack: errorStack,
              filePath: file.path,
              language: file.language,
              repositoryId: finalRepositoryId,
              projectId: finalProjectId,
              context: "saveKnowledgeToAPI.snippets.keyFiles",
            });
            // Continue with other files
          }
        }

        // Update progress for key files
        if (progress?.steps.snippets) {
          progress.steps.snippets.keyFiles.total = keyFiles.length;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error("Failed to save code file snippets", {
          error: errorMsg,
          stack: errorStack,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          context: "saveKnowledgeToAPI.snippets.keyFiles",
        });
      }
    }

    // Mark snippets as completed
    if (progress?.steps.snippets) {
      progress.steps.snippets.completed = true;
      if (progress && checkpointId) {
        progress.currentStep = "snippets_completed";
        progress.status = "completed";
        this.saveCheckpoint(
          checkpointId,
          repoInfo.rootPath,
          "snippets_completed",
          "completed",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }
    }

    logger.info(
      `✅ Completed snippet creation: ${savedItems.codeSnippetsSaved} total snippets saved`
    );

    // Log final summary
    const summary = `\n📊 SAVE SUMMARY:
  ✅ Repository: ${finalRepositoryId}
  ✅ Project: ${finalProjectId}
  ✅ Documentation: ${
    savedItems.documentationId ? savedItems.documentationId : "Failed"
  }
  ✅ Markdown: ${savedItems.markdownId ? savedItems.markdownId : "Failed"}
  ✅ Analysis: ${savedItems.analysisId ? savedItems.analysisId : "In metadata"}
  ✅ Code Snippets: ${savedItems.codeSnippetsSaved} saved
  ✅ Routes: ${comprehensiveAnalysis.routes.length} extracted and saved
  ✅ Functions: ${comprehensiveAnalysis.allFunctions.length} total, ${
      comprehensiveAnalysis.utilityFunctions.length
    } utility
  ✅ Docs: ${comprehensiveAnalysis.documentation.length} files saved`;
    logger.info(summary);

    return {
      repositoryId: finalRepositoryId,
      projectId: finalProjectId,
      ...savedItems,
    };
  }

  async execute(params: AnalyzeAndSaveRepoParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as unknown as Record<string, unknown>
    );

    // Declare checkpointId outside try block to ensure it's in scope for catch block
    let checkpointId: string | undefined = params.checkpointId;
    let progress: AnalysisProgress | null = null;

    try {
      const apiService = this.getApiService();
      const projectPath = params.projectPath || process.cwd();

      // Initialize or load progress checkpoint

      if (params.resume) {
        // Try to load existing checkpoint
        progress = this.loadCheckpoint(params.checkpointId);
        if (progress) {
          checkpointId = progress.checkpointId;
          logger.info(
            `🔄 Resuming from checkpoint: ${checkpointId.substring(0, 16)}...`
          );
          logger.info(this.getProgressSummary(progress));
        } else {
          logger.warn(
            "No checkpoint found to resume from. Starting fresh analysis."
          );
          checkpointId = this.generateCheckpointId();
        }
      } else {
        // Start new analysis with fresh checkpoint
        checkpointId = this.generateCheckpointId();
        logger.info(
          `📝 Starting new analysis with checkpoint: ${checkpointId.substring(
            0,
            16
          )}...`
        );
      }

      // Initialize progress if starting fresh
      if (!progress) {
        progress = {
          checkpointId: checkpointId!,
          projectPath,
          startedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          status: "in_progress",
          currentStep: "initializing",
          steps: {},
        };
      } else {
        // Update status to in_progress if resuming
        progress.status = "in_progress";
        progress.lastUpdated = new Date().toISOString();
      }

      // Check cache first (unless force refresh or resuming)
      if (params.useCache !== false && !params.forceRefresh && !params.resume) {
        const cached = repositoryCache.load(projectPath);
        if (cached) {
          logger.info(`Using cached analysis for: ${cached.repositoryName}`);

          // Update API if repositoryId/projectId provided but not saved
          let savedKnowledge: { id?: string } | null = cached.metadata
            .savedToApi
            ? {
                id:
                  cached.metadata.apiDocumentationId ||
                  cached.metadata.apiMarkdownId,
              }
            : null;

          if (
            !cached.metadata.savedToApi &&
            (params.repositoryId || params.projectId)
          ) {
            try {
              // Rebuild comprehensive analysis from cached data
              const repoInfo: RepoInfo = {
                name: cached.repositoryName,
                remoteUrl: cached.remoteUrl,
                branch: cached.branch,
                branches: cached.branches,
                branchPattern: cached.branchPattern,
                defaultBranch: cached.defaultBranch,
                commit: cached.commit,
                rootPath: cached.rootPath,
                gitConfig: cached.gitConfig,
              };

              // Read docs from cache or rebuild
              const docs = this.readDocumentationFiles(cached.rootPath);

              const comprehensiveAnalysis = this.buildComprehensiveAnalysis(
                repoInfo,
                cached.structure as CodeStructure,
                docs,
                cached.rootPath
              );

              const saved = await this.saveKnowledgeToAPI(
                apiService,
                repoInfo,
                cached.documentation,
                cached.structure as CodeStructure,
                comprehensiveAnalysis,
                params.repositoryId || cached.metadata.repositoryId,
                params.projectId || cached.metadata.projectId,
                undefined, // progress
                undefined, // checkpointId
                cached.metadata.repositoryId, // cachedRepositoryId - use cache to avoid API call
                cached.metadata.projectId // cachedProjectId - use cache to avoid API call
              );

              // Extract ID from saved result
              if (saved && typeof saved === "object" && "id" in saved) {
                savedKnowledge = { id: String(saved.id) };
              }

              // Update cache with API save info
              repositoryCache.save(
                projectPath,
                {
                  repositoryName: cached.repositoryName,
                  remoteUrl: cached.remoteUrl,
                  branch: cached.branch,
                  branches: cached.branches,
                  branchPattern: cached.branchPattern,
                  defaultBranch: cached.defaultBranch,
                  commit: cached.commit,
                  rootPath: cached.rootPath,
                  gitConfig: cached.gitConfig,
                  documentation: cached.documentation,
                  structure: cached.structure,
                },
                {
                  repositoryId:
                    params.repositoryId || cached.metadata.repositoryId,
                  projectId: params.projectId || cached.metadata.projectId,
                  savedToApi: true,
                  apiDocumentationId: savedKnowledge?.id,
                  apiMarkdownId: savedKnowledge?.id,
                }
              );
            } catch (error) {
              logger.warn("Failed to save cached analysis to API", {
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          return jsonResponse(
            {
              repository: {
                name: cached.repositoryName,
                remoteUrl: cached.remoteUrl,
                branch: cached.branch,
                branches: cached.branches,
                branchPattern: cached.branchPattern,
                defaultBranch: cached.defaultBranch,
                commit: cached.commit,
                rootPath: cached.rootPath,
                gitConfig: cached.gitConfig,
              },
              analysis: {
                fileCount: cached.structure.files.length,
                entryPoints: cached.structure.entryPoints,
                dependencies: cached.structure.dependencies,
                configFiles: cached.structure.configFiles,
                languages: Object.keys(
                  cached.structure.files.reduce((acc, f) => {
                    if (f.language) acc[f.language] = true;
                    return acc;
                  }, {} as Record<string, boolean>)
                ),
                linting: cached.structure.linting,
                architecture: cached.structure.architecture,
              },
              documentation: {
                length: cached.documentation.length,
                saved: cached.metadata.savedToApi || !!savedKnowledge,
                savedKnowledge: savedKnowledge || undefined,
                cached: true,
                cachedAt: cached.metadata.cachedAt,
              },
            },
            `✅ Retrieved cached analysis for repository "${cached.repositoryName}"`
          );
        }
      }

      // Step 1: Get repository information
      let repoInfo: RepoInfo;
      if (progress?.steps.repoInfo?.completed && progress.steps.repoInfo.data) {
        logger.info("⏭️  Skipping repo info (already completed)");
        repoInfo = progress.steps.repoInfo.data;
      } else {
        this.logStart("Getting repository info");
        repoInfo = this.getRepoInfo(projectPath);
        progress.steps.repoInfo = { completed: true, data: repoInfo };
        progress.currentStep = "repoInfo";
        this.saveCheckpoint(
          checkpointId!,
          projectPath,
          "repoInfo",
          "in_progress",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }

      // Step 2: Read documentation files
      let docs: Record<string, string>;
      if (progress.steps.documentation?.completed) {
        logger.info(
          `⏭️  Skipping documentation (${progress.steps.documentation.filesRead.length} files already read)`
        );
        docs = {};
        // Re-read only missing files if needed
        const allDocs = this.readDocumentationFiles(repoInfo.rootPath);
        const docFiles = Object.keys(allDocs);
        const missingFiles = docFiles.filter(
          (f) => !progress?.steps.documentation?.filesRead.includes(f)
        );
        if (missingFiles.length > 0) {
          for (const file of missingFiles) {
            docs[file] = allDocs[file];
            progress.steps.documentation!.filesRead.push(file);
          }
        } else {
          docs = allDocs;
        }
      } else {
        this.logStart("Reading documentation files");
        docs = this.readDocumentationFiles(repoInfo.rootPath);
        const docFiles = Object.keys(docs);
        progress.steps.documentation = {
          completed: true,
          filesRead: docFiles,
          totalFiles: docFiles.length,
        };
        progress.currentStep = "documentation";
        this.saveCheckpoint(
          checkpointId!,
          projectPath,
          "documentation",
          "in_progress",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }

      // Step 3: Analyze codebase structure
      let structure: CodeStructure;
      if (
        progress.steps.codeStructure?.completed &&
        progress.steps.codeStructure.filesCrawled.length > 0
      ) {
        logger.info(
          `⏭️  Resuming code structure analysis (${progress.steps.codeStructure.filesCrawled.length} files already crawled)`
        );
        // Resume crawling - skip already crawled files
        structure = this.analyzeCodeStructure(
          repoInfo.rootPath,
          params.includeNodeModules || false,
          params.deepAnalysis !== false,
          progress.steps.codeStructure.filesCrawled
        );
        // Update with newly crawled files
        const newFiles = structure.files.map((f) => f.path);
        progress.steps.codeStructure.filesCrawled = [
          ...new Set([
            ...progress.steps.codeStructure.filesCrawled,
            ...newFiles,
          ]),
        ];
        progress.steps.codeStructure.totalFiles =
          progress.steps.codeStructure.filesCrawled.length;
      } else {
        this.logStart("Analyzing codebase structure");
        structure = this.analyzeCodeStructure(
          repoInfo.rootPath,
          params.includeNodeModules || false,
          params.deepAnalysis !== false
        );
        progress.steps.codeStructure = {
          completed: true,
          filesCrawled: structure.files.map((f) => f.path),
          totalFiles: structure.files.length,
        };
        progress.currentStep = "codeStructure";
        this.saveCheckpoint(
          checkpointId!,
          projectPath,
          "codeStructure",
          "in_progress",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }

      // Step 4: Generate comprehensive documentation
      this.logStart("Generating documentation");
      const documentation = this.generateDocumentation(
        repoInfo,
        docs,
        structure
      );

      // Step 4.5: Build comprehensive analysis with all detailed data
      let comprehensiveAnalysis: ComprehensiveAnalysis;
      if (progress.steps.comprehensiveAnalysis?.completed) {
        logger.info("⏭️  Skipping comprehensive analysis (already completed)");
        // Would need to load from cache or rebuild - for now, rebuild
        comprehensiveAnalysis = this.buildComprehensiveAnalysis(
          repoInfo,
          structure,
          docs,
          repoInfo.rootPath
        );
      } else {
        this.logStart("Building comprehensive analysis");
        comprehensiveAnalysis = this.buildComprehensiveAnalysis(
          repoInfo,
          structure,
          docs,
          repoInfo.rootPath
        );
        progress.steps.comprehensiveAnalysis = { completed: true };
        progress.currentStep = "comprehensiveAnalysis";
        this.saveCheckpoint(
          checkpointId!,
          projectPath,
          "comprehensiveAnalysis",
          "in_progress",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }

      // Step 4.6: Enhance with LLM if requested
      if (params.useLLM) {
        this.logStart("Enhancing analysis with LLM");
        try {
          const llmEnhancement = await this.enhanceAnalysisWithLLM(
            repoInfo,
            structure,
            docs,
            comprehensiveAnalysis,
            params.llmPrompt,
            params.llmProvider || "auto"
          );

          // Merge LLM insights into comprehensive analysis
          const llmProvider =
            (llmEnhancement.llmInsights?.provider as string) || "unknown";
          comprehensiveAnalysis = {
            ...comprehensiveAnalysis,
            ...llmEnhancement,
            llmInsights: {
              ...comprehensiveAnalysis.llmInsights,
              ...(llmEnhancement.llmInsights || {}),
              enhanced: true,
              provider: llmProvider,
            },
          };

          logger.info("LLM enhancement completed successfully");
        } catch (error) {
          logger.warn(
            "LLM enhancement failed, continuing with standard analysis",
            {
              error: error instanceof Error ? error.message : String(error),
            }
          );
        }
      }

      // Step 5: Save to external API (auto-creates repository and project if needed)
      // Use existing IDs from checkpoint if resuming
      const finalRepositoryId = progress.repositoryId || params.repositoryId;
      const finalProjectId = progress.projectId || params.projectId;

      // Check cache for repository/project IDs to avoid unnecessary API calls
      const cached = repositoryCache.load(projectPath);
      const cachedRepositoryId = cached?.metadata.repositoryId;
      const cachedProjectId = cached?.metadata.projectId;

      let savedKnowledge: {
        repositoryId: string;
        projectId: string;
        documentationId?: string;
        markdownId?: string;
        analysisId?: string;
        codeSnippetsSaved: number;
      } | null = null;
      let apiDocumentationId: string | undefined;
      let apiMarkdownId: string | undefined;

      try {
        this.logStart(
          "Saving knowledge to API (auto-creating repository/project if needed)"
        );
        savedKnowledge = await this.saveKnowledgeToAPI(
          apiService,
          repoInfo,
          documentation,
          structure,
          comprehensiveAnalysis,
          finalRepositoryId,
          finalProjectId,
          progress,
          checkpointId!,
          cachedRepositoryId, // Pass cached repository ID to avoid API lookup
          cachedProjectId // Pass cached project ID to avoid API lookup
        );

        // Update progress with saved IDs
        progress.repositoryId = savedKnowledge.repositoryId;
        progress.projectId = savedKnowledge.projectId;
        apiDocumentationId = savedKnowledge.documentationId;
        apiMarkdownId = savedKnowledge.markdownId;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error("Failed to save knowledge to API", {
          error: errorMsg,
          stack: errorStack,
          repositoryName: repoInfo.name,
          repositoryId: finalRepositoryId,
          projectId: finalProjectId,
          checkpointId: checkpointId,
          context: "execute.saveKnowledgeToAPI",
        });
        // Record error in progress
        if (!progress.errors) progress.errors = [];
        progress.errors.push({
          step: "saveKnowledgeToAPI",
          error: errorMsg,
          timestamp: new Date().toISOString(),
        });
        progress.status = "failed";
        this.saveCheckpoint(
          checkpointId!,
          projectPath,
          "saveKnowledgeToAPI",
          "failed",
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }

      // Step 6: Save to local cache
      this.logStart("Saving to local cache");
      repositoryCache.save(
        projectPath,
        {
          repositoryName: repoInfo.name,
          remoteUrl: repoInfo.remoteUrl,
          branch: repoInfo.branch,
          branches: repoInfo.branches,
          branchPattern: repoInfo.branchPattern,
          defaultBranch: repoInfo.defaultBranch,
          commit: repoInfo.commit,
          rootPath: repoInfo.rootPath,
          gitConfig: repoInfo.gitConfig,
          documentation,
          structure: {
            files: structure.files,
            structure: structure.structure,
            entryPoints: structure.entryPoints,
            dependencies: structure.dependencies,
            configFiles: structure.configFiles,
            codePatterns: structure.codePatterns,
            linting: structure.linting as Record<string, unknown>,
            architecture: structure.architecture,
          },
        },
        {
          repositoryId: finalRepositoryId || params.repositoryId,
          projectId: finalProjectId || params.projectId,
          savedToApi: !!savedKnowledge,
          apiDocumentationId,
          apiMarkdownId,
        }
      );

      const llmInfo = comprehensiveAnalysis.llmInsights
        ? `\n- LLM Enhanced: ✅ (Provider: ${
            comprehensiveAnalysis.llmInsights.provider || "unknown"
          })
- LLM Insights: ✅ (${
            comprehensiveAnalysis.llmInsights.strengths?.length || 0
          } strengths, ${
            comprehensiveAnalysis.llmInsights.improvements?.length || 0
          } improvements, ${
            comprehensiveAnalysis.llmInsights.recommendations?.length || 0
          } recommendations)`
        : params.useLLM
        ? "\n- LLM Enhancement: ⚠️ (Failed or not available)"
        : "";

      const successMessage = savedKnowledge
        ? `✅ Analyzed repository "${repoInfo.name}" and initialized project:
- Repository ID: ${savedKnowledge.repositoryId}${
            params.repositoryId ? " (existing)" : " (created)"
          }
- Project ID: ${savedKnowledge.projectId}${
            params.projectId ? " (existing)" : " (created)"
          }
- Comprehensive Analysis saved: ${
            savedKnowledge.analysisId
              ? `✅ (ID: ${savedKnowledge.analysisId})`
              : "⚠️ (included in metadata)"
          }
- Documentation saved: ${savedKnowledge.documentationId ? "✅" : "❌"}
- Markdown saved: ${savedKnowledge.markdownId ? "✅" : "❌"}
- README & Docs saved: ✅ (${comprehensiveAnalysis.documentation.length} files)
- Coding Standards saved: ✅
- Folder Structure saved: ✅
- Routes/API Endpoints saved: ✅ (${comprehensiveAnalysis.routes.length} routes)
- Utility Functions saved: ✅ (${
            comprehensiveAnalysis.utilityFunctions.length
          } as snippets)
- All Functions saved: ✅ (${savedKnowledge.codeSnippetsSaved} total snippets)
- Code Files saved: ✅ (key files as snippets)
- Utility functions extracted: ${comprehensiveAnalysis.utilityFunctions.length}
- Total functions extracted: ${comprehensiveAnalysis.allFunctions.length}
- Routes extracted: ${comprehensiveAnalysis.routes.length}
- Architecture layers: ${comprehensiveAnalysis.architecture.layers.length}
- Architecture patterns: ${
            comprehensiveAnalysis.architecture.patterns.length
          }${llmInfo}`
        : `✅ Analyzed repository "${repoInfo.name}" and saved to local cache (API save failed)${llmInfo}`;

      // Final checkpoint save
      if (progress && checkpointId) {
        progress.status = savedKnowledge ? "completed" : "in_progress";
        progress.lastUpdated = new Date().toISOString();
        this.saveCheckpoint(
          checkpointId,
          projectPath,
          "completed",
          progress.status,
          progress.steps,
          progress.repositoryId,
          progress.projectId,
          progress.errors
        );
      }

      // Log success with comprehensive result summary
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Analyzed ${structure.files.length} files, extracted ${
          comprehensiveAnalysis.allFunctions.length
        } functions, saved ${savedKnowledge?.codeSnippetsSaved || 0} snippets`,
        dataSize: structure.files.length,
      });

      return jsonResponse(
        {
          repository: repoInfo,
          project: savedKnowledge
            ? {
                repositoryId: savedKnowledge.repositoryId,
                projectId: savedKnowledge.projectId,
                repositoryCreated: !params.repositoryId,
                projectCreated: !params.projectId,
              }
            : undefined,
          analysis: {
            fileCount: structure.files.length,
            entryPoints: structure.entryPoints,
            dependencies: structure.dependencies,
            configFiles: structure.configFiles,
            languages: Object.keys(
              structure.files.reduce((acc, f) => {
                if (f.language) acc[f.language] = true;
                return acc;
              }, {} as Record<string, boolean>)
            ),
            linting: structure.linting,
            architecture: structure.architecture,
          },
          documentation: {
            length: documentation.length,
            saved: !!savedKnowledge,
            savedKnowledge: savedKnowledge || undefined,
            cached: true,
          },
          progress: progress
            ? {
                checkpointId: progress.checkpointId,
                status: progress.status,
                currentStep: progress.currentStep,
                stepsCompleted: Object.keys(progress.steps).filter(
                  (k) =>
                    progress?.steps[k as keyof typeof progress.steps]?.completed
                ).length,
                totalSteps: Object.keys(progress.steps).length,
                summary: this.getProgressSummary(progress),
              }
            : undefined,
        },
        successMessage
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error("Critical error in analyzeAndSaveRepository", {
        error: errorMsg,
        stack: errorStack,
        projectPath: params.projectPath || process.cwd(),
        checkpointId: checkpointId || params.checkpointId || "unknown",
        resume: params.resume,
        context: "execute",
      });
      return this.handleError(
        this.name,
        error,
        "Failed to analyze and save repository"
      );
    }
  }
}

export const analyzeAndSaveRepoTool = new AnalyzeAndSaveRepoTool();
