/**
 * Delete Personal Link Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface DeleteLinkParams {
  linkId: string;
}

class DeleteLinkTool extends BaseToolHandler implements BaseToolDefinition<DeleteLinkParams> {
  name = "deletePersonalLink";
  description = "Delete a saved link from your personal knowledge base.";

  paramsSchema = z.object({
    linkId: z.string().describe("The ID of the link to delete"),
  });

  async execute(params: DeleteLinkParams): Promise<FormattedResponse> {
    this.logStart(this.name, { linkId: params.linkId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/personal/links/${params.linkId}`);
      return jsonResponse(result, `✅ Link deleted: ${params.linkId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to delete link");
    }
  }
}

export const deleteLinkTool = new DeleteLinkTool();
