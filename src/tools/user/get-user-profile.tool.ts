/**
 * Get User Profile Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetUserProfileParams {}

class GetUserProfileTool extends BaseToolHandler implements BaseToolDefinition<GetUserProfileParams> {
  name = "getUserProfile";
  description = "Get the current user's full profile information including display name, bio, avatar, and account details.";

  paramsSchema = z.object({});

  async execute(_params: GetUserProfileParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/users/profile");
      return jsonResponse(result, "✅ User profile retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get user profile");
    }
  }
}

export const getUserProfileTool = new GetUserProfileTool();
