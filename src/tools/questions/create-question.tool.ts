/**
 * Create Question Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateQuestionParams {
  title: string;
  body: string;
  tags?: string[];
}

class CreateQuestionTool extends BaseToolHandler implements BaseToolDefinition<CreateQuestionParams> {
  name = "createQuestion";
  description = "Create a new Q&A question. Provide a title, body (supports markdown), and optional tags.";

  paramsSchema = z.object({
    title: z.string().describe("The question title"),
    body: z.string().describe("The question body (supports markdown)"),
    tags: z.array(z.string()).optional().describe("Tags for categorizing the question"),
  });

  async execute(params: CreateQuestionParams): Promise<FormattedResponse> {
    this.logStart(this.name, { title: params.title });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post("/api/questions", {
        title: params.title,
        body: params.body,
        tags: params.tags,
      });
      return jsonResponse(result, `✅ Question created: ${params.title}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create question");
    }
  }
}

export const createQuestionTool = new CreateQuestionTool();
