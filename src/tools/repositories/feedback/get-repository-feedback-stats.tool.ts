/**
 * Get Repository Feedback Stats Tool
 * 
 * Get statistics about feedback in a repository.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryFeedbackStatsParams {
  repositoryId: string;
}

class GetRepositoryFeedbackStatsTool
  extends BaseToolHandler
  implements BaseToolDefinition<GetRepositoryFeedbackStatsParams>
{
  name = "getRepositoryFeedbackStats";
  description = "Get statistics about feedback in a repository";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
  });

  async execute(
    params: GetRepositoryFeedbackStatsParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(
        `/api/repositories/${params.repositoryId}/feedback/stats`
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved feedback stats for repository: ${params.repositoryId}`,
      });

      return jsonResponse(
        result,
        `✅ Retrieved feedback statistics for repository: ${params.repositoryId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to get repository feedback stats",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const getRepositoryFeedbackStatsTool = new GetRepositoryFeedbackStatsTool();


