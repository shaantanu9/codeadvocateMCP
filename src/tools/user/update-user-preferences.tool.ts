/**
 * Update User Preferences Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateUserPreferencesParams {
  theme?: string;
  editorFontSize?: number;
  defaultLanguage?: string;
  emailNotifications?: boolean;
}

class UpdateUserPreferencesTool extends BaseToolHandler implements BaseToolDefinition<UpdateUserPreferencesParams> {
  name = "updateUserPreferences";
  description = "Update user preferences like theme, editor font size, default language, and notification settings.";

  paramsSchema = z.object({
    theme: z.string().optional().describe("Theme preference: 'light', 'dark', or 'system'"),
    editorFontSize: z.number().optional().describe("Editor font size in pixels"),
    defaultLanguage: z.string().optional().describe("Default programming language for new snippets"),
    emailNotifications: z.boolean().optional().describe("Enable or disable email notifications"),
  });

  async execute(params: UpdateUserPreferencesParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.theme !== undefined) body.theme = params.theme;
      if (params.editorFontSize !== undefined) body.editorFontSize = params.editorFontSize;
      if (params.defaultLanguage !== undefined) body.defaultLanguage = params.defaultLanguage;
      if (params.emailNotifications !== undefined) body.emailNotifications = params.emailNotifications;
      const result = await apiService.put("/api/users/preferences", body);
      return jsonResponse(result, "✅ Preferences updated");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update preferences");
    }
  }
}

export const updateUserPreferencesTool = new UpdateUserPreferencesTool();
