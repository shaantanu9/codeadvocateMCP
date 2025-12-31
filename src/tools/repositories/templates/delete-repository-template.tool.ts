/**
 * Delete Repository Template Tool
 *
 * Delete a code template permanently.
 * Templates are reusable code patterns (snippets with 'template' tag).
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface DeleteRepositoryTemplateParams {
  templateId: string;
}

class DeleteRepositoryTemplateTool
  extends BaseToolHandler
  implements BaseToolDefinition<DeleteRepositoryTemplateParams>
{
  name = "deleteRepositoryTemplate";
  description =
    "Delete a CODE TEMPLATE permanently. Templates are reusable code patterns (snippets with 'template' tag) that provide quick-start code structures. Use this tool when you need to: permanently remove a template, delete an outdated template, or clean up unused templates. WARNING: This is a permanent deletion and cannot be undone. The template will be immediately removed from the repository. Templates are different from regular snippets - they are specifically designed as reusable code patterns. This tool uses the snippets API endpoint since templates are stored as snippets with the 'template' tag.";

  paramsSchema = z.object({
    templateId: z
      .string()
      .describe(
        "The ID of the template to delete. This is the snippet ID since templates are snippets with 'template' tag. WARNING: This action is permanent and cannot be undone."
      ),
  });

  async execute(
    params: DeleteRepositoryTemplateParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as unknown as Record<string, unknown>
    );

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(
        `/api/snippets/${params.templateId}`
      );

      this.logSuccess(
        this.name,
        params as unknown as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Deleted template: ${params.templateId}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Deleted template: ${params.templateId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to delete repository template",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const deleteRepositoryTemplateTool = new DeleteRepositoryTemplateTool();
