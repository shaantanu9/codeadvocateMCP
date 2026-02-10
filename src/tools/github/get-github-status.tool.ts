/**
 * Get GitHub Status Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetGithubStatusParams {}

class GetGithubStatusTool extends BaseToolHandler implements BaseToolDefinition<GetGithubStatusParams> {
  name = "getGithubStatus";
  description = "Check the current GitHub integration status — whether connected, the linked GitHub account, and sync state.";

  paramsSchema = z.object({});

  async execute(_params: GetGithubStatusParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/integrations/github/status");
      return jsonResponse(result, "✅ GitHub status retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get GitHub status");
    }
  }
}

export const getGithubStatusTool = new GetGithubStatusTool();
