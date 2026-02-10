/**
 * Follow User Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface FollowUserParams {
  userId: string;
}

class FollowUserTool extends BaseToolHandler implements BaseToolDefinition<FollowUserParams> {
  name = "followUser";
  description = "Follow another user to see their public snippets and activity in your feed.";

  paramsSchema = z.object({
    userId: z.string().describe("The ID of the user to follow"),
  });

  async execute(params: FollowUserParams): Promise<FormattedResponse> {
    this.logStart(this.name, { userId: params.userId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/users/by-id/${params.userId}/follow`, {});
      return jsonResponse(result, `✅ Now following user: ${params.userId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to follow user");
    }
  }
}

export const followUserTool = new FollowUserTool();
