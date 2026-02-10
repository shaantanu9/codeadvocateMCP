/**
 * Get Question Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetQuestionParams {
  questionId: string;
  incrementView?: boolean;
}

class GetQuestionTool extends BaseToolHandler implements BaseToolDefinition<GetQuestionParams> {
  name = "getQuestion";
  description = "Get a specific Q&A question by ID, including its details, vote counts, and answer count.";

  paramsSchema = z.object({
    questionId: z.string().describe("The ID of the question to retrieve"),
    incrementView: z.boolean().optional().describe("Whether to increment the view count (default: false)"),
  });

  async execute(params: GetQuestionParams): Promise<FormattedResponse> {
    this.logStart(this.name, { questionId: params.questionId });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.incrementView) queryParams.incrementView = true;
      const result = await apiService.get(`/api/questions/${params.questionId}`, queryParams);
      return jsonResponse(result, `✅ Question retrieved: ${params.questionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get question");
    }
  }
}

export const getQuestionTool = new GetQuestionTool();
