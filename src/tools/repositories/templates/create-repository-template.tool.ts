/**
 * Create Repository Template Tool
 *
 * Create a new code template for a repository or convert an existing snippet to a template.
 * Templates are reusable code patterns (snippets with 'template' tag).
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { processTags } from "../../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryTemplateParams {
  repositoryId: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string[];
  snippetId?: string;
}

class CreateRepositoryTemplateTool
  extends BaseToolHandler
  implements BaseToolDefinition<CreateRepositoryTemplateParams>
{
  name = "createRepositoryTemplate";
  description =
    "Create a new CODE TEMPLATE for a repository. Templates are reusable code patterns (snippets with 'template' tag) that provide quick-start code structures. Use this tool when you need to: create a new reusable code template, convert an existing snippet to a template, or save a code pattern for future use. The 'template' tag is automatically added. Templates are different from regular snippets - they are specifically designed as reusable code patterns. You can either create a new template from scratch (provide title, code, language) OR convert an existing snippet to a template (provide snippetId). Required: repositoryId, title, code, language. Optional: description, tags (additional tags beyond 'template'), snippetId (to convert existing snippet).";

  paramsSchema = z.object({
    repositoryId: z
      .string()
      .describe(
        "The ID of the repository where the template will be created. Templates are repository-specific."
      ),
    title: z
      .string()
      .describe(
        "Template title. Should be descriptive and searchable. Examples: 'React Functional Component', 'API Client Class', 'Custom React Hook'"
      ),
    code: z
      .string()
      .describe(
        "Template code content. This is the reusable code pattern that will be used as a template. Should include placeholders or comments indicating where customization is needed."
      ),
    language: z
      .string()
      .describe(
        "Programming language of the template. Examples: 'typescript', 'javascript', 'python', 'java', 'csharp', 'php', 'go', 'ruby', 'rust', 'swift'"
      ),
    description: z
      .string()
      .optional()
      .describe(
        "Optional description explaining when and how to use this template. Help users understand the template's purpose."
      ),
    tags: z
      .array(z.string())
      .optional()
      .describe(
        "Additional tags for categorizing the template (besides 'template' which is auto-added). Examples: ['react', 'component', 'hooks'], ['api', 'client', 'http'], ['python', 'class', 'decorator']"
      ),
    snippetId: z
      .string()
      .optional()
      .describe(
        "Optional ID of an existing snippet to convert to a template. If provided, the snippet will be copied and converted to a template. If not provided, a new template will be created from the provided data."
      ),
  });

  async execute(
    params: CreateRepositoryTemplateParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as unknown as Record<string, unknown>
    );

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        title: params.title,
        code: params.code,
        language: params.language,
      };

      if (params.description) body.description = params.description;

      // Filter and process tags to remove IDs
      const filteredTags = processTags(params.tags, params.repositoryId);
      if (filteredTags.length > 0) body.tags = filteredTags;

      // If snippetId is provided, convert existing snippet to template
      if (params.snippetId) {
        body.snippetId = params.snippetId;
      }

      const result = await apiService.post(
        `/api/repositories/${params.repositoryId}/templates`,
        body
      );

      this.logSuccess(
        this.name,
        params as unknown as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Created template: ${params.title}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Created template: ${params.title}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to create repository template",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const createRepositoryTemplateTool = new CreateRepositoryTemplateTool();
