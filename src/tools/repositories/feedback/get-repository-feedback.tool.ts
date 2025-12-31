/**
 * Get Repository Feedback Tool
 * 
 * Get details of a single feedback item.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryFeedbackParams {
  repositoryId: string;
  feedbackId: string;
}

class GetRepositoryFeedbackTool
  extends BaseToolHandler
  implements BaseToolDefinition<GetRepositoryFeedbackParams>
{
  name = "getRepositoryFeedback";
  description = "Get details of a single feedback item";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    feedbackId: z.string().describe("The ID of the feedback item"),
  });

  async execute(params: GetRepositoryFeedbackParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(
        `/api/repositories/${params.repositoryId}/feedback/${params.feedbackId}`
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved feedback: ${params.feedbackId}`,
      });

      return jsonResponse(
        result,
        `✅ Retrieved feedback: ${params.feedbackId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to get repository feedback",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const getRepositoryFeedbackTool = new GetRepositoryFeedbackTool();


