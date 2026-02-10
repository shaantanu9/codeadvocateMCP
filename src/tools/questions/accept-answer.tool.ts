/**
 * Accept Answer Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface AcceptAnswerParams {
  questionId: string;
  answerId: string;
}

class AcceptAnswerTool extends BaseToolHandler implements BaseToolDefinition<AcceptAnswerParams> {
  name = "acceptAnswer";
  description = "Accept an answer as the solution to a question. Only the question author can accept answers.";

  paramsSchema = z.object({
    questionId: z.string().describe("The ID of the question"),
    answerId: z.string().describe("The ID of the answer to accept"),
  });

  async execute(params: AcceptAnswerParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/questions/${params.questionId}/answers/${params.answerId}/accept`, {});
      return jsonResponse(result, `✅ Answer ${params.answerId} accepted for question ${params.questionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to accept answer");
    }
  }
}

export const acceptAnswerTool = new AcceptAnswerTool();
