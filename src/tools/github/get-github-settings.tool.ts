/**
 * Get GitHub Settings Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetGithubSettingsParams {}

class GetGithubSettingsTool extends BaseToolHandler implements BaseToolDefinition<GetGithubSettingsParams> {
  name = "getGithubSettings";
  description = "Get the current GitHub integration settings including sync preferences and import configuration.";

  paramsSchema = z.object({});

  async execute(_params: GetGithubSettingsParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/integrations/github/settings");
      return jsonResponse(result, "✅ GitHub settings retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get GitHub settings");
    }
  }
}

export const getGithubSettingsTool = new GetGithubSettingsTool();
