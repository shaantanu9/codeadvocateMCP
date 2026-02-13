/**
 * Consolidated Accounts Tool
 *
 * Combines account context and permissions operations into a single tool with an action parameter.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["getContext", "getAccessibleRepositories"] as const;

type AccountsAction = (typeof ACTIONS)[number];

interface AccountsParams {
  action: AccountsAction;
}

class AccountsTool extends BaseToolHandler implements BaseToolDefinition<AccountsParams> {
  name = "accounts";

  description = `View account context and permissions. Use 'action' to specify operation:
- getContext: Get current account context (no params)
- getAccessibleRepositories: List repositories you have access to (no params)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
  });

  annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  };

  async execute(params: AccountsParams): Promise<FormattedResponse> {
    const api = this.getApiService();

    switch (params.action) {
      case "getContext": {
        const { startTime } = this.logStart(`${this.name}.getContext`, {});
        try {
          const result = await api.get("/api/accounts/context");
          this.logSuccess(`${this.name}.getContext`, {}, startTime);
          return jsonResponse(result, "✅ Retrieved account context");
        } catch (error) {
          return this.handleError(`${this.name}.getContext`, error, "Failed to get account context", {}, startTime);
        }
      }
      case "getAccessibleRepositories": {
        const { startTime } = this.logStart(`${this.name}.getAccessibleRepositories`, {});
        try {
          const result = await api.get("/api/permissions/repositories");
          this.logSuccess(`${this.name}.getAccessibleRepositories`, {}, startTime);
          return jsonResponse(result, "✅ Retrieved accessible repositories");
        } catch (error) {
          return this.handleError(`${this.name}.getAccessibleRepositories`, error, "Failed to get accessible repositories", {}, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const accountsTool = new AccountsTool();
