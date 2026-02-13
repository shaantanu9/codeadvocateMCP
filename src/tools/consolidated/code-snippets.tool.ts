/**
 * Code Snippets Tool (Consolidated)
 *
 * Manages code snippets.
 * Actions: list, get, create, getByTags
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { processTags } from "../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

interface CodeSnippetsParams {
  action: "list" | "get" | "create" | "getByTags";
  snippetId?: string;
  title?: string;
  code?: string;
  language?: string;
  description?: string;
  tags?: string[] | string;
  search?: string;
  page?: number;
  limit?: number;
}

class CodeSnippetsTool
  extends BaseToolHandler
  implements BaseToolDefinition<CodeSnippetsParams>
{
  name = "codeSnippets";
  description =
    "Manage code snippets. Supports listing, getting, creating code snippets, and retrieving snippets by tags.";

  paramsSchema = z.object({
    action: z
      .enum(["list", "get", "create", "getByTags"])
      .describe("The action to perform"),
    snippetId: z.string().optional().describe("The snippet ID (required for get)"),
    title: z.string().optional().describe("Snippet title (required for create)"),
    code: z.string().optional().describe("The code content (required for create)"),
    language: z.string().optional().describe("Programming language (required for create)"),
    description: z.string().optional().describe("Description of the snippet"),
    tags: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .describe("Tags (comma-separated string for list/getByTags filtering, string[] for create)"),
    search: z.string().optional().describe("Search query for filtering snippets"),
    page: z.number().optional().describe("Page number for pagination"),
    limit: z.number().optional().describe("Number of items per page"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: CodeSnippetsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      let result: unknown;

      switch (params.action) {
        case "list": {
          const query: Record<string, string | number | boolean> = {};
          if (params.search) query.search = params.search;
          if (params.language) query.language = params.language;
          if (params.tags) query.tags = typeof params.tags === "string" ? params.tags : params.tags.join(",");
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/code-snippets", query);
          break;
        }

        case "get": {
          const snippetId = this.requireParam(params.snippetId, "snippetId", "get");
          result = await apiService.get(`/api/code-snippets/${snippetId}`);
          break;
        }

        case "create": {
          const title = this.requireParam(params.title, "title", "create");
          const code = this.requireParam(params.code, "code", "create");
          const language = this.requireParam(params.language, "language", "create");
          const body: Record<string, unknown> = { title, code, language };
          if (params.description) body.description = params.description;
          if (params.tags) {
            const tagsArray = Array.isArray(params.tags) ? params.tags : [params.tags];
            body.tags = processTags(tagsArray);
          }
          result = await apiService.post("/api/code-snippets", body);
          break;
        }

        case "getByTags": {
          const tags = this.requireParam(params.tags, "tags", "getByTags");
          const tagsString = typeof tags === "string" ? tags : tags.join(",");
          result = await apiService.get("/api/code-snippets/by-tags", { tags: tagsString });
          break;
        }
      }

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `codeSnippets.${params.action} completed`,
      });

      return jsonResponse(result, `codeSnippets.${params.action} completed successfully`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        `Failed to execute codeSnippets.${params.action}`,
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const codeSnippetsTool = new CodeSnippetsTool();
