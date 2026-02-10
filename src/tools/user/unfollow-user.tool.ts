/**
 * Unfollow User Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UnfollowUserParams {
  userId: string;
}

class UnfollowUserTool extends BaseToolHandler implements BaseToolDefinition<UnfollowUserParams> {
  name = "unfollowUser";
  description = "Unfollow a user to stop seeing their activity in your feed.";

  paramsSchema = z.object({
    userId: z.string().describe("The ID of the user to unfollow"),
  });

  async execute(params: UnfollowUserParams): Promise<FormattedResponse> {
    this.logStart(this.name, { userId: params.userId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/users/by-id/${params.userId}/follow`);
      return jsonResponse(result, `✅ Unfollowed user: ${params.userId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to unfollow user");
    }
  }
}

export const unfollowUserTool = new UnfollowUserTool();
