/**
 * Update Repository Template Tool
 *
 * Update an existing code template.
 * Templates are reusable code patterns (snippets with 'template' tag).
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { processTags } from "../../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryTemplateParams {
  templateId: string;
  title?: string;
  code?: string;
  language?: string;
  description?: string;
  tags?: string[];
  repositoryId?: string;
  projectId?: string;
  collectionId?: string;
  isPublic?: boolean;
}

class UpdateRepositoryTemplateTool
  extends BaseToolHandler
  implements BaseToolDefinition<UpdateRepositoryTemplateParams>
{
  name = "updateRepositoryTemplate";
  description =
    "Update an existing CODE TEMPLATE. Templates are reusable code patterns (snippets with 'template' tag) that provide quick-start code structures. Use this tool when you need to: update template title, code, language, description, tags, or other properties. IMPORTANT: If updating tags, make sure to include 'template' in the tags array, otherwise it will no longer be recognized as a template. All fields are optional - only include fields you want to update. Templates are different from regular snippets - they are specifically designed as reusable code patterns. This tool uses the snippets API endpoint since templates are stored as snippets with the 'template' tag.";

  paramsSchema = z.object({
    templateId: z
      .string()
      .describe(
        "The ID of the template to update. This is the snippet ID since templates are snippets with 'template' tag."
      ),
    title: z
      .string()
      .optional()
      .describe("Updated template title"),
    code: z
      .string()
      .optional()
      .describe("Updated template code content"),
    language: z
      .string()
      .optional()
      .describe(
        "Updated programming language. Examples: 'typescript', 'javascript', 'python'"
      ),
    description: z
      .string()
      .optional()
      .describe("Updated template description"),
    tags: z
      .array(z.string())
      .optional()
      .describe(
        "Updated tags array. IMPORTANT: Must include 'template' in the array to remain a template, otherwise it will no longer be recognized as a template. Example: ['template', 'react', 'component']"
      ),
    repositoryId: z
      .string()
      .optional()
      .describe("Optional repository ID to associate with"),
    projectId: z
      .string()
      .optional()
      .describe("Optional project ID to associate with"),
    collectionId: z
      .string()
      .optional()
      .describe("Optional collection ID to associate with"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Whether template should be public (default: false)"),
  });

  async execute(
    params: UpdateRepositoryTemplateParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as unknown as Record<string, unknown>
    );

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};

      if (params.title) body.title = params.title;
      if (params.code) body.code = params.code;
      if (params.language) body.language = params.language;
      if (params.description) body.description = params.description;

      // Filter and process tags to remove IDs
      if (params.tags) {
        const filteredTags = processTags(
          params.tags,
          params.repositoryId || ""
        );
        if (filteredTags.length > 0) body.tags = filteredTags;
      }

      if (params.repositoryId) body.repositoryId = params.repositoryId;
      if (params.projectId) body.projectId = params.projectId;
      if (params.collectionId) body.collectionId = params.collectionId;
      if (params.isPublic !== undefined) body.isPublic = params.isPublic;

      const result = await apiService.put(
        `/api/snippets/${params.templateId}`,
        body
      );

      this.logSuccess(
        this.name,
        params as unknown as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Updated template: ${params.templateId}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Updated template: ${params.templateId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to update repository template",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const updateRepositoryTemplateTool = new UpdateRepositoryTemplateTool();
