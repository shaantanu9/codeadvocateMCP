/**
 * List Questions Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListQuestionsParams {
  status?: string;
  userId?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

class ListQuestionsTool extends BaseToolHandler implements BaseToolDefinition<ListQuestionsParams> {
  name = "listQuestions";
  description = "List Q&A questions with optional filters. Can filter by status (open, closed, duplicate, on_hold), search by keyword, and sort results.";

  paramsSchema = z.object({
    status: z.string().optional().describe("Filter by status: open, closed, duplicate, on_hold"),
    userId: z.string().optional().describe("Filter by user ID"),
    search: z.string().optional().describe("Search keyword in title and body"),
    sortBy: z.string().optional().describe("Sort by: newest, oldest, score, views, unanswered (default: newest)"),
    page: z.number().optional().describe("Page number (default: 1)"),
    limit: z.number().optional().describe("Results per page (default: 20)"),
  });

  async execute(params: ListQuestionsParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.status) queryParams.status = params.status;
      if (params.userId) queryParams.userId = params.userId;
      if (params.search) queryParams.search = params.search;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      const result = await apiService.get("/api/questions", queryParams);
      return jsonResponse(result, "✅ Questions retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list questions");
    }
  }
}

export const listQuestionsTool = new ListQuestionsTool();
