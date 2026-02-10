/**
 * Create Answer Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateAnswerParams {
  questionId: string;
  body: string;
}

class CreateAnswerTool extends BaseToolHandler implements BaseToolDefinition<CreateAnswerParams> {
  name = "createAnswer";
  description = "Post an answer to a Q&A question. The answer body supports markdown formatting.";

  paramsSchema = z.object({
    questionId: z.string().describe("The ID of the question to answer"),
    body: z.string().describe("The answer body (supports markdown)"),
  });

  async execute(params: CreateAnswerParams): Promise<FormattedResponse> {
    this.logStart(this.name, { questionId: params.questionId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/questions/${params.questionId}/answers`, {
        body: params.body,
      });
      return jsonResponse(result, `✅ Answer posted to question: ${params.questionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create answer");
    }
  }
}

export const createAnswerTool = new CreateAnswerTool();
