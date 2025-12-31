/**
 * List Repository Feedback Saved Filters Tool
 * 
 * Get all saved filters for the current user in a repository.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryFeedbackSavedFiltersParams {
  repositoryId: string;
}

class ListRepositoryFeedbackSavedFiltersTool
  extends BaseToolHandler
  implements BaseToolDefinition<ListRepositoryFeedbackSavedFiltersParams>
{
  name = "listRepositoryFeedbackSavedFilters";
  description = "Get all saved filters for the current user in a repository";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
  });

  async execute(
    params: ListRepositoryFeedbackSavedFiltersParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(
        `/api/repositories/${params.repositoryId}/feedback/saved-filters`
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved saved filters for repository: ${params.repositoryId}`,
      });

      return jsonResponse(
        result,
        `✅ Retrieved saved filters for repository: ${params.repositoryId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to list repository feedback saved filters",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const listRepositoryFeedbackSavedFiltersTool = new ListRepositoryFeedbackSavedFiltersTool();


