/**
 * Questions Tool (Consolidated)
 *
 * Manages Q&A questions, answers, and voting.
 * Actions: list, get, create, listAnswers, createAnswer, acceptAnswer, vote
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

interface QuestionsParams {
  action: "list" | "get" | "create" | "listAnswers" | "createAnswer" | "acceptAnswer" | "vote";
  questionId?: string;
  answerId?: string;
  votableType?: string;
  votableId?: string;
  voteType?: string;
  title?: string;
  body?: string;
  tags?: string[];
  status?: string;
  userId?: string;
  search?: string;
  sortBy?: string;
  incrementView?: boolean;
  page?: number;
  limit?: number;
}

class QuestionsTool
  extends BaseToolHandler
  implements BaseToolDefinition<QuestionsParams>
{
  name = "questions";
  description =
    "Manage Q&A questions, answers, and voting. Supports listing, getting, creating questions, managing answers, accepting answers, and voting on questions or answers.";

  paramsSchema = z.object({
    action: z
      .enum(["list", "get", "create", "listAnswers", "createAnswer", "acceptAnswer", "vote"])
      .describe("The action to perform"),
    questionId: z.string().optional().describe("The question ID (required for get, listAnswers, createAnswer, acceptAnswer)"),
    answerId: z.string().optional().describe("The answer ID (required for acceptAnswer)"),
    votableType: z
      .enum(["question", "answer"])
      .optional()
      .describe("The type of entity to vote on (required for vote)"),
    votableId: z.string().optional().describe("The ID of the entity to vote on (required for vote)"),
    voteType: z
      .enum(["up", "down", "none"])
      .optional()
      .describe("The vote direction (required for vote)"),
    title: z.string().optional().describe("Question title (required for create)"),
    body: z.string().optional().describe("Question or answer body content (required for create, createAnswer)"),
    tags: z.array(z.string()).optional().describe("Tags for the question"),
    status: z
      .enum(["open", "closed", "duplicate", "on_hold"])
      .optional()
      .describe("Filter questions by status"),
    userId: z.string().optional().describe("Filter questions by user ID"),
    search: z.string().optional().describe("Search query for filtering questions"),
    sortBy: z
      .enum(["newest", "oldest", "score", "views", "unanswered"])
      .optional()
      .describe("Sort order for questions or answers"),
    incrementView: z.boolean().optional().describe("Whether to increment the view count when getting a question"),
    page: z.number().optional().describe("Page number for pagination"),
    limit: z.number().optional().describe("Number of items per page"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: QuestionsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      let result: unknown;

      switch (params.action) {
        case "list": {
          const query: Record<string, string | number | boolean> = {};
          if (params.status) query.status = params.status;
          if (params.userId) query.userId = params.userId;
          if (params.search) query.search = params.search;
          if (params.sortBy) query.sortBy = params.sortBy;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/questions", query);
          break;
        }

        case "get": {
          const questionId = this.requireParam(params.questionId, "questionId", "get");
          const query: Record<string, string | number | boolean> = {};
          if (params.incrementView !== undefined) query.incrementView = params.incrementView;
          result = await apiService.get(`/api/questions/${questionId}`, query);
          break;
        }

        case "create": {
          const title = this.requireParam(params.title, "title", "create");
          const body = this.requireParam(params.body, "body", "create");
          const requestBody: Record<string, unknown> = { title, body };
          if (params.tags) requestBody.tags = params.tags;
          result = await apiService.post("/api/questions", requestBody);
          break;
        }

        case "listAnswers": {
          const questionId = this.requireParam(params.questionId, "questionId", "listAnswers");
          const query: Record<string, string | number | boolean> = {};
          if (params.sortBy) query.sortBy = params.sortBy;
          result = await apiService.get(`/api/questions/${questionId}/answers`, query);
          break;
        }

        case "createAnswer": {
          const questionId = this.requireParam(params.questionId, "questionId", "createAnswer");
          const body = this.requireParam(params.body, "body", "createAnswer");
          result = await apiService.post(`/api/questions/${questionId}/answers`, { body });
          break;
        }

        case "acceptAnswer": {
          const questionId = this.requireParam(params.questionId, "questionId", "acceptAnswer");
          const answerId = this.requireParam(params.answerId, "answerId", "acceptAnswer");
          result = await apiService.post(`/api/questions/${questionId}/answers/${answerId}/accept`);
          break;
        }

        case "vote": {
          const votableType = this.requireParam(params.votableType, "votableType", "vote");
          const votableId = this.requireParam(params.votableId, "votableId", "vote");
          const voteType = this.requireParam(params.voteType, "voteType", "vote");
          result = await apiService.post(`/api/qa/${votableType}s/${votableId}/vote`, {
            voteType,
          });
          break;
        }
      }

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `questions.${params.action} completed`,
      });

      return jsonResponse(result, `questions.${params.action} completed successfully`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        `Failed to execute questions.${params.action}`,
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const questionsTool = new QuestionsTool();
