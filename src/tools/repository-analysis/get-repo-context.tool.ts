/**
 * Get Repository Context Tool
 *
 * Retrieves saved knowledge about a repository for use in code generation
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetRepoContextParams {
  repositoryName?: string;
  repositoryId?: string;
  projectId?: string;
  search?: string;
}

class GetRepoContextTool
  extends BaseToolHandler
  implements BaseToolDefinition<GetRepoContextParams>
{
  name = "getRepositoryContext";
  description =
    "Get saved repository knowledge and context for use in code generation with high precision";

  paramsSchema = z.object({
    repositoryName: z
      .string()
      .optional()
      .describe("Name of the repository to get context for"),
    repositoryId: z
      .string()
      .optional()
      .describe("Repository ID in external API"),
    projectId: z.string().optional().describe("Project ID to filter by"),
    search: z
      .string()
      .optional()
      .describe("Search term to find relevant knowledge"),
  });

  async execute(params: GetRepoContextParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();

      // First, try to get from local cache
      const { repositoryCache } = await import(
        "../../core/repository-cache.js"
      );
      let cachedAnalysis = null;

      if (params.repositoryName) {
        cachedAnalysis = repositoryCache.findByRepositoryName(
          params.repositoryName
        );
      }

      // Search for documentation/markdown documents about this repository
      const queryParams: Record<string, string> = {};
      if (params.search) {
        queryParams.search = params.search;
      }
      if (params.repositoryName) {
        queryParams.search = queryParams.search
          ? `${queryParams.search} ${params.repositoryName}`
          : params.repositoryName;
      }
      if (params.projectId) {
        queryParams.projectId = params.projectId;
      }

      // Search in documentations
      let docsResult;
      try {
        docsResult = await apiService.get("/api/documentations", {
          ...queryParams,
          type: "codebase-analysis",
          category: "repository",
        });
      } catch {
        docsResult = null;
      }

      // Search in markdown documents
      let markdownResult;
      try {
        markdownResult = await apiService.get("/api/markdown-documents", {
          ...queryParams,
          document_type: "codebase-analysis",
          category: "repository",
        });
      } catch {
        markdownResult = null;
      }

      return jsonResponse(
        {
          cached: cachedAnalysis
            ? {
                repositoryName: cachedAnalysis.repositoryName,
                branch: cachedAnalysis.branch,
                commit: cachedAnalysis.commit,
                cachedAt: cachedAnalysis.metadata.cachedAt,
                documentationPreview: cachedAnalysis.documentation.substring(
                  0,
                  500
                ),
                analysis: {
                  fileCount: cachedAnalysis.structure.files.length,
                  entryPoints: cachedAnalysis.structure.entryPoints,
                  dependencies: cachedAnalysis.structure.dependencies,
                  linting: cachedAnalysis.structure.linting,
                  architecture: cachedAnalysis.structure.architecture,
                },
              }
            : null,
          documentations: docsResult,
          markdownDocuments: markdownResult,
          context: {
            repositoryName: params.repositoryName,
            repositoryId: params.repositoryId,
            projectId: params.projectId,
          },
        },
        `✅ Retrieved repository context for code generation${
          cachedAnalysis ? " (with cached analysis)" : ""
        }`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to get repository context"
      );
    }
  }
}

export const getRepoContextTool = new GetRepoContextTool();
