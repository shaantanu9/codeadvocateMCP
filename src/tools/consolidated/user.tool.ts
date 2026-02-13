/**
 * User Tool (Consolidated)
 *
 * Manages user profile, stats, preferences, and follow relationships.
 * Actions: whoAmI, getProfile, getStats, getPreferences, updatePreferences, follow, unfollow
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

interface UserParams {
  action: "whoAmI" | "getProfile" | "getStats" | "getPreferences" | "updatePreferences" | "follow" | "unfollow";
  userId?: string;
  theme?: string;
  editorFontSize?: number;
  defaultLanguage?: string;
  emailNotifications?: boolean;
}

class UserTool
  extends BaseToolHandler
  implements BaseToolDefinition<UserParams>
{
  name = "user";
  description =
    "Manage user account. Supports getting current user info, profile, stats, preferences, updating preferences, and following/unfollowing other users.";

  paramsSchema = z.object({
    action: z
      .enum(["whoAmI", "getProfile", "getStats", "getPreferences", "updatePreferences", "follow", "unfollow"])
      .describe("The action to perform"),
    userId: z.string().optional().describe("The user ID (required for follow, unfollow)"),
    theme: z
      .enum(["light", "dark", "system"])
      .optional()
      .describe("UI theme preference"),
    editorFontSize: z.number().optional().describe("Editor font size in pixels"),
    defaultLanguage: z.string().optional().describe("Default programming language"),
    emailNotifications: z.boolean().optional().describe("Whether to receive email notifications"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: UserParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      let result: unknown;

      switch (params.action) {
        case "whoAmI": {
          result = await apiService.get("/api/auth/me");
          break;
        }

        case "getProfile": {
          result = await apiService.get("/api/users/profile");
          break;
        }

        case "getStats": {
          result = await apiService.get("/api/users/profile/stats");
          break;
        }

        case "getPreferences": {
          result = await apiService.get("/api/users/preferences");
          break;
        }

        case "updatePreferences": {
          const body: Record<string, unknown> = {};
          if (params.theme) body.theme = params.theme;
          if (params.editorFontSize !== undefined) body.editorFontSize = params.editorFontSize;
          if (params.defaultLanguage) body.defaultLanguage = params.defaultLanguage;
          if (params.emailNotifications !== undefined) body.emailNotifications = params.emailNotifications;
          result = await apiService.put("/api/users/preferences", body);
          break;
        }

        case "follow": {
          const userId = this.requireParam(params.userId, "userId", "follow");
          result = await apiService.post(`/api/users/by-id/${userId}/follow`);
          break;
        }

        case "unfollow": {
          const userId = this.requireParam(params.userId, "userId", "unfollow");
          result = await apiService.delete(`/api/users/by-id/${userId}/follow`);
          break;
        }
      }

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `user.${params.action} completed`,
      });

      return jsonResponse(result, `user.${params.action} completed successfully`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        `Failed to execute user.${params.action}`,
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const userTool = new UserTool();
