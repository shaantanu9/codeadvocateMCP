/**
 * List Repository Templates Tool
 *
 * Get a paginated list of code templates for a repository.
 * Templates are reusable code patterns (snippets with 'template' tag).
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

export interface ListRepositoryTemplatesParams {
  repositoryId: string;
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
}

class ListRepositoryTemplatesTool
  extends BaseToolHandler
  implements BaseToolDefinition<ListRepositoryTemplatesParams>
{
  name = "listRepositoryTemplates";
  description =
    "Get a paginated list of CODE TEMPLATES for a repository. Templates are reusable code patterns (snippets with 'template' tag) that provide quick-start code structures. Use this tool when you need to: list available templates, search for templates by keyword, filter templates by programming language, or browse templates for a specific repository. Templates are different from regular snippets - they are specifically designed as reusable code patterns. The search parameter searches in title, description, and code fields.";

  paramsSchema = z.object({
    repositoryId: z
      .string()
      .describe(
        "The ID of the repository to list templates from. Templates are repository-specific reusable code patterns."
      ),
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .default(1)
      .describe("Page number (1-based, default: 1)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .describe("Items per page (max: 100, default: 20)"),
    search: z
      .string()
      .optional()
      .describe(
        "Search query to filter templates. Searches in title, description, and code fields (case-insensitive). Examples: 'react', 'api client', 'hook'"
      ),
    language: z
      .string()
      .optional()
      .describe(
        "Filter templates by programming language. Examples: 'typescript', 'javascript', 'python', 'java', 'csharp', 'php', 'go', 'ruby', 'rust', 'swift'"
      ),
  });

  async execute(
    params: ListRepositoryTemplatesParams
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
        20,
        100
      );

      // Build query params
      const queryParams = buildQueryParams({
        page: pagination.page,
        limit: pagination.limit,
        search: params.search,
        language: params.language,
      });

      const result = await apiService.get(
        `/api/repositories/${params.repositoryId}/templates`,
        queryParams
      );

      this.logSuccess(
        this.name,
        params as unknown as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Retrieved templates for repository: ${params.repositoryId}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Retrieved templates for repository: ${params.repositoryId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to list repository templates",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const listRepositoryTemplatesTool = new ListRepositoryTemplatesTool();
