/**
 * Create Snippet Tool
 *
 * Creates a new code snippet
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";
import { processTags } from "../../utils/tag-filter.js";

export interface CreateSnippetParams {
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string[];
  projectId?: string;
  repositoryId?: string;
}

class CreateSnippetTool
  extends BaseToolHandler
  implements BaseToolDefinition<CreateSnippetParams>
{
  name = "createSnippet";
  description = "Create a new code snippet";

  paramsSchema = z.object({
    title: z.string().describe("Title of the snippet"),
    code: z.string().describe("The code content"),
    language: z.string().describe("Programming language"),
    description: z.string().optional().describe("Description of the snippet"),
    tags: z.array(z.string()).optional().describe("Tags for the snippet"),
    projectId: z.string().optional().describe("Associated project ID"),
    repositoryId: z.string().optional().describe("Associated repository ID"),
  });

  async execute(params: CreateSnippetParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as unknown as Record<string, unknown>
    );

    try {
      const apiService = this.getApiService();

      // Normalize title - remove repo prefix if present, ensure proper format
      let normalizedTitle = params.title.trim();

      // If title starts with "repoName - ", remove it for cleaner naming
      // But keep it if it's a descriptive format like "FunctionName - Category"
      if (
        normalizedTitle.includes(" - ") &&
        normalizedTitle.split(" - ").length === 2
      ) {
        const parts = normalizedTitle.split(" - ");
        // If first part looks like a repo name (lowercase, has dashes), it's probably "repo - title"
        // Otherwise, it's probably "FunctionName - Category" which is good
        if (!/^[a-z][a-z0-9-]*$/.test(parts[0])) {
          // First part is not a simple repo name, keep the format
          normalizedTitle = normalizedTitle;
        } else {
          // First part looks like repo name, use second part as title
          normalizedTitle = parts[1];
        }
      }

      // Ensure description is comprehensive
      let description = params.description || "";
      if (!description && params.title) {
        description = `Code snippet: ${normalizedTitle}\n\nLanguage: ${params.language}`;
      }

      // Normalize and enhance tags
      let tags = params.tags || [];
      if (tags.length === 0) {
        // Auto-generate tags from title and language
        tags = [
          normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          params.language,
          "code-snippet",
        ].filter(Boolean);
      }

      // Filter and process tags to remove IDs (repositoryId, projectId, etc.)
      tags = processTags(tags, params.repositoryId, params.projectId);

      const body: Record<string, unknown> = {
        title: normalizedTitle,
        code: params.code,
        language: params.language,
        description: description,
        tags: tags,
      };

      if (params.projectId) body.projectId = params.projectId;
      if (params.repositoryId) body.repositoryId = params.repositoryId;

      const result = await apiService.post("/api/snippets", body);

      this.logSuccess(
        this.name,
        params as unknown as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Created snippet: ${normalizedTitle}`,
        }
      );

      return jsonResponse(result, `✅ Created snippet: ${normalizedTitle}`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to create snippet",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const createSnippetTool = new CreateSnippetTool();
