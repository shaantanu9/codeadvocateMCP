/**
 * Get User Preferences Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetUserPreferencesParams {}

class GetUserPreferencesTool extends BaseToolHandler implements BaseToolDefinition<GetUserPreferencesParams> {
  name = "getUserPreferences";
  description = "Get the current user's preferences including theme, editor settings, notification preferences, and display options.";

  paramsSchema = z.object({});

  async execute(_params: GetUserPreferencesParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/users/preferences");
      return jsonResponse(result, "✅ User preferences retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get user preferences");
    }
  }
}

export const getUserPreferencesTool = new GetUserPreferencesTool();
