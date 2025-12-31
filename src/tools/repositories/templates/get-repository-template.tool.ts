/**
 * Get Repository Template Tool
 *
 * Get a specific code template by ID.
 * Templates are reusable code patterns (snippets with 'template' tag).
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryTemplateParams {
  templateId: string;
}

class GetRepositoryTemplateTool
  extends BaseToolHandler
  implements BaseToolDefinition<GetRepositoryTemplateParams>
{
  name = "getRepositoryTemplate";
  description =
    "Get a specific CODE TEMPLATE by ID. Templates are reusable code patterns (snippets with 'template' tag) that provide quick-start code structures. Use this tool when you need to: retrieve a specific template by its ID, view template details, or get template code for use. Templates are different from regular snippets - they are specifically designed as reusable code patterns. This tool uses the snippets API endpoint since templates are stored as snippets with the 'template' tag.";

  paramsSchema = z.object({
    templateId: z
      .string()
      .describe(
        "The ID of the template to retrieve. This is the snippet ID since templates are snippets with 'template' tag."
      ),
  });

  async execute(
    params: GetRepositoryTemplateParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as unknown as Record<string, unknown>
    );

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(
        `/api/snippets/${params.templateId}`
      );

      this.logSuccess(
        this.name,
        params as unknown as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Retrieved template: ${params.templateId}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Retrieved template: ${params.templateId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to get repository template",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const getRepositoryTemplateTool = new GetRepositoryTemplateTool();
