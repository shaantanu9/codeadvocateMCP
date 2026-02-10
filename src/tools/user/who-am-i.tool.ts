/**
 * Who Am I Tool
 *
 * Returns information about the current authenticated user
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WhoAmIParams {}

class WhoAmITool extends BaseToolHandler implements BaseToolDefinition<WhoAmIParams> {
  name = "whoAmI";
  description = "Get the current authenticated user's identity: name, email, role, and account type. Call this first when you need to personalize responses or verify who you're helping. Prefer the codeadvocate://user/profile resource for passive context.";

  paramsSchema = z.object({});

  async execute(_params: WhoAmIParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/auth/me");
      return jsonResponse(result, "✅ Current user info retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get current user info");
    }
  }
}

export const whoAmITool = new WhoAmITool();
