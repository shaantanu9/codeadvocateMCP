/**
 * Consolidated Repository Analysis Tool
 *
 * Combines repository analysis operations into a single tool with an action parameter.
 * Delegates to existing repository-analysis tool implementations.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";
import {
  analyzeAndSaveRepoTool,
  getRepoContextTool,
  getCachedRepoAnalysisTool,
  listCachedRepositoriesTool,
  listCheckpointsTool,
} from "../repository-analysis/index.js";

const ACTIONS = ["analyzeAndSave", "getContext", "getCachedAnalysis", "listCached", "listCheckpoints"] as const;

type RepoAnalysisAction = (typeof ACTIONS)[number];

interface RepoAnalysisParams {
  action: RepoAnalysisAction;
  projectPath?: string;
  repositoryId?: string;
  projectId?: string;
  repositoryName?: string;
  search?: string;
  commit?: string;
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

class RepoAnalysisTool extends BaseToolHandler implements BaseToolDefinition<RepoAnalysisParams> {
  name = "repoAnalysis";

  description = `Analyze repositories and manage cached analyses. Use 'action' to specify operation:
- analyzeAndSave: Analyze a repository codebase and save results (optional: projectPath, repositoryId, projectId, deepAnalysis, includeNodeModules, useCache, forceRefresh, useLLM, llmPrompt, llmProvider, resume, checkpointId)
- getContext: Get saved repository knowledge for code generation (optional: repositoryName, repositoryId, projectId, search)
- getCachedAnalysis: Get cached analysis from local storage (optional: repositoryName, projectPath, commit)
- listCached: List all cached repository analyses (no params)
- listCheckpoints: List progress checkpoints for analysis (optional: projectPath)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    projectPath: z.string().optional().describe("Path to the project directory. Used by: analyzeAndSave, getCachedAnalysis, listCheckpoints"),
    repositoryId: z.string().optional().describe("Repository ID in external API. Used by: analyzeAndSave, getContext"),
    projectId: z.string().optional().describe("Project ID. Used by: analyzeAndSave, getContext"),
    repositoryName: z.string().optional().describe("Repository name. Used by: getContext, getCachedAnalysis"),
    search: z.string().optional().describe("Search term to find relevant knowledge. Used by: getContext"),
    commit: z.string().optional().describe("Specific commit hash. Used by: getCachedAnalysis"),
    deepAnalysis: z.boolean().optional().describe("Enable deep analysis mode. Used by: analyzeAndSave"),
    includeNodeModules: z.boolean().optional().describe("Include node_modules in analysis. Used by: analyzeAndSave"),
    useCache: z.boolean().optional().describe("Use cached results if available. Used by: analyzeAndSave"),
    forceRefresh: z.boolean().optional().describe("Force refresh cached results. Used by: analyzeAndSave"),
    useLLM: z.boolean().optional().describe("Use LLM for enhanced analysis. Used by: analyzeAndSave"),
    llmPrompt: z.string().optional().describe("Custom prompt for LLM analysis. Used by: analyzeAndSave"),
    llmProvider: z.enum(["openai", "anthropic", "auto"]).optional().describe("LLM provider to use. Used by: analyzeAndSave"),
    resume: z.boolean().optional().describe("Resume from a previous checkpoint. Used by: analyzeAndSave"),
    checkpointId: z.string().optional().describe("Checkpoint ID to resume from. Used by: analyzeAndSave"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  };

  async execute(params: RepoAnalysisParams): Promise<FormattedResponse> {
    switch (params.action) {
      case "analyzeAndSave": {
        const { startTime } = this.logStart(`${this.name}.analyzeAndSave`, params as unknown as Record<string, unknown>);
        try {
          const result = await analyzeAndSaveRepoTool.execute({
            projectPath: params.projectPath,
            repositoryId: params.repositoryId,
            projectId: params.projectId,
            deepAnalysis: params.deepAnalysis,
            includeNodeModules: params.includeNodeModules,
            useCache: params.useCache,
            forceRefresh: params.forceRefresh,
            useLLM: params.useLLM,
            llmPrompt: params.llmPrompt,
            llmProvider: params.llmProvider,
            resume: params.resume,
            checkpointId: params.checkpointId,
          });
          this.logSuccess(`${this.name}.analyzeAndSave`, params as unknown as Record<string, unknown>, startTime);
          return result;
        } catch (error) {
          return this.handleError(`${this.name}.analyzeAndSave`, error, "Failed to analyze and save repository", params as unknown as Record<string, unknown>, startTime);
        }
      }
      case "getContext": {
        const { startTime } = this.logStart(`${this.name}.getContext`, params as unknown as Record<string, unknown>);
        try {
          const result = await getRepoContextTool.execute({
            repositoryName: params.repositoryName,
            repositoryId: params.repositoryId,
            projectId: params.projectId,
            search: params.search,
          });
          this.logSuccess(`${this.name}.getContext`, params as unknown as Record<string, unknown>, startTime);
          return result;
        } catch (error) {
          return this.handleError(`${this.name}.getContext`, error, "Failed to get repository context", params as unknown as Record<string, unknown>, startTime);
        }
      }
      case "getCachedAnalysis": {
        const { startTime } = this.logStart(`${this.name}.getCachedAnalysis`, params as unknown as Record<string, unknown>);
        try {
          const result = await getCachedRepoAnalysisTool.execute({
            repositoryName: params.repositoryName,
            projectPath: params.projectPath,
            commit: params.commit,
          });
          this.logSuccess(`${this.name}.getCachedAnalysis`, params as unknown as Record<string, unknown>, startTime);
          return result;
        } catch (error) {
          return this.handleError(`${this.name}.getCachedAnalysis`, error, "Failed to get cached analysis", params as unknown as Record<string, unknown>, startTime);
        }
      }
      case "listCached": {
        const { startTime } = this.logStart(`${this.name}.listCached`, {});
        try {
          const result = await listCachedRepositoriesTool.execute({});
          this.logSuccess(`${this.name}.listCached`, {}, startTime);
          return result;
        } catch (error) {
          return this.handleError(`${this.name}.listCached`, error, "Failed to list cached repositories", {}, startTime);
        }
      }
      case "listCheckpoints": {
        const { startTime } = this.logStart(`${this.name}.listCheckpoints`, params as unknown as Record<string, unknown>);
        try {
          const result = await listCheckpointsTool.execute({
            projectPath: params.projectPath,
          });
          this.logSuccess(`${this.name}.listCheckpoints`, params as unknown as Record<string, unknown>, startTime);
          return result;
        } catch (error) {
          return this.handleError(`${this.name}.listCheckpoints`, error, "Failed to list checkpoints", params as unknown as Record<string, unknown>, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repoAnalysisTool = new RepoAnalysisTool();
