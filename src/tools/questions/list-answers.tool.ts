/**
 * List Answers Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListAnswersParams {
  questionId: string;
  sortBy?: string;
}

class ListAnswersTool extends BaseToolHandler implements BaseToolDefinition<ListAnswersParams> {
  name = "listAnswers";
  description = "List all answers for a specific question. Accepted answers appear first, then sorted by score.";

  paramsSchema = z.object({
    questionId: z.string().describe("The ID of the question to get answers for"),
    sortBy: z.string().optional().describe("Sort by: newest, oldest, score (default: score)"),
  });

  async execute(params: ListAnswersParams): Promise<FormattedResponse> {
    this.logStart(this.name, { questionId: params.questionId });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      const result = await apiService.get(`/api/questions/${params.questionId}/answers`, queryParams);
      return jsonResponse(result, `✅ Answers retrieved for question: ${params.questionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list answers");
    }
  }
}

export const listAnswersTool = new ListAnswersTool();
