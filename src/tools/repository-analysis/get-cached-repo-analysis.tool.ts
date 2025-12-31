/**
 * Get Cached Repository Analysis Tool
 * 
 * Retrieves cached repository analysis from local cache for use in code generation
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";
import { repositoryCache } from "../../core/repository-cache.js";

export interface GetCachedRepoAnalysisParams {
  repositoryName?: string;
  projectPath?: string;
  commit?: string;
}

class GetCachedRepoAnalysisTool extends BaseToolHandler implements BaseToolDefinition<GetCachedRepoAnalysisParams> {
  name = "getCachedRepositoryAnalysis";
  description = "Get cached repository analysis from local cache for use in code generation with high precision";
  
  paramsSchema = z.object({
    repositoryName: z.string().optional().describe("Name of the repository to get cached analysis for"),
    projectPath: z.string().optional().describe("Path to the project (defaults to current directory)"),
    commit: z.string().optional().describe("Specific commit hash to get analysis for"),
  });

  async execute(params: GetCachedRepoAnalysisParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as Record<string, unknown>);

    try {
      let cached;

      if (params.repositoryName) {
        // Find by repository name
        cached = repositoryCache.findByRepositoryName(params.repositoryName);
      } else {
        // Find by project path
        const projectPath = params.projectPath || process.cwd();
        cached = repositoryCache.load(projectPath, params.commit);
      }

      if (!cached) {
        return jsonResponse(
          {
            found: false,
            message: "No cached analysis found. Run analyzeAndSaveRepository first.",
          },
          `❌ No cached analysis found`
        );
      }

      return jsonResponse(
        {
          found: true,
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
            codePatterns: cached.structure.codePatterns,
          },
          documentation: {
            length: cached.documentation.length,
            preview: cached.documentation.substring(0, 500) + "...",
            fullContent: cached.documentation,
          },
          metadata: cached.metadata,
        },
        `✅ Retrieved cached analysis for repository "${cached.repositoryName}"`
      );
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get cached repository analysis");
    }
  }
}

export const getCachedRepoAnalysisTool = new GetCachedRepoAnalysisTool();




