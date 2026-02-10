/**
 * Vote on Q&A Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface VoteOnQAParams {
  votableType: string;
  votableId: string;
  voteType: string;
}

class VoteOnQATool extends BaseToolHandler implements BaseToolDefinition<VoteOnQAParams> {
  name = "voteOnQA";
  description = "Vote on a question or answer. Upvote, downvote, or remove your vote.";

  paramsSchema = z.object({
    votableType: z.string().describe("Type of item to vote on: 'question' or 'answer'"),
    votableId: z.string().describe("The ID of the question or answer to vote on"),
    voteType: z.string().describe("Vote type: 'up', 'down', or 'none' (to remove vote)"),
  });

  async execute(params: VoteOnQAParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/qa/${params.votableType}s/${params.votableId}/vote`, {
        voteType: params.voteType,
      });
      return jsonResponse(result, `✅ Vote recorded: ${params.voteType} on ${params.votableType} ${params.votableId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to vote");
    }
  }
}

export const voteOnQATool = new VoteOnQATool();
