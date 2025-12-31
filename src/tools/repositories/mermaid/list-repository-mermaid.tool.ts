/**
 * List Repository Mermaid Diagrams Tool
 *
 * Get a paginated list of Mermaid diagrams for a repository with optional filters.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import {
  buildQueryParams,
  buildPaginationParams,
} from "../../../utils/query-params.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryMermaidParams {
  repositoryId: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

class ListRepositoryMermaidTool
  extends BaseToolHandler
  implements BaseToolDefinition<ListRepositoryMermaidParams>
{
  name = "listRepositoryMermaid";
  description =
    "Get a paginated list of Mermaid diagrams for a repository with optional search and category filters. The search parameter searches in title, description, content, and explanation fields.";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .default(1)
      .describe("Page number (1-based)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(50)
      .describe("Items per page (max: 100, default: 50)"),
    search: z
      .string()
      .optional()
      .describe("Search in title, description, content, and explanation fields"),
    category: z
      .string()
      .optional()
      .describe(
        "Filter by category (architecture, workflow, database, custom, etc.)"
      ),
  });

  async execute(
    params: ListRepositoryMermaidParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as unknown as Record<string, unknown>
    );

    try {
      const apiService = this.getApiService();

      // Build pagination params with validation
      const pagination = buildPaginationParams(
        params.page,
        params.limit,
        1,
        50,
        100
      );

      // Build query params
      const queryParams = buildQueryParams({
        page: pagination.page,
        limit: pagination.limit,
        search: params.search,
        category: params.category,
      });

      const result = await apiService.get(
        `/api/repositories/${params.repositoryId}/mermaid`,
        queryParams
      );

      this.logSuccess(
        this.name,
        params as unknown as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Retrieved Mermaid diagrams for repository: ${params.repositoryId}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Retrieved Mermaid diagrams for repository: ${params.repositoryId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to list repository Mermaid diagrams",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const listRepositoryMermaidTool = new ListRepositoryMermaidTool();
