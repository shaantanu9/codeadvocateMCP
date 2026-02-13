/**
 * Consolidated Snippets Tool
 *
 * Combines all 19 snippet operations into a single tool with an action parameter.
 * Original tool files are preserved in src/tools/snippets/.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { processTags } from "../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";
import type { ExternalApiService } from "../../application/services/external-api.service.js";

const ACTIONS = [
  "list", "get", "create", "update", "delete",
  "archive", "unarchive", "trash", "restore", "toggleFavorite",
  "getCount", "analyze",
  "createAnnotation", "getAnnotations",
  "getArchived", "getRecent", "getRecentlyViewed", "getPublic", "getTrending",
] as const;

type SnippetsAction = (typeof ACTIONS)[number];

interface SnippetsParams {
  action: SnippetsAction;
  snippetId?: string;
  search?: string;
  language?: string;
  tags?: string | string[];
  projectId?: string;
  favorite?: boolean;
  context?: string;
  page?: number;
  limit?: number;
  title?: string;
  code?: string;
  description?: string;
  repositoryId?: string;
  content?: string;
  lineStart?: number;
  lineEnd?: number;
  type?: string;
}

class SnippetsTool extends BaseToolHandler implements BaseToolDefinition<SnippetsParams> {
  name = "snippets";

  description = `Manage code snippets. Use the 'action' parameter to specify the operation:
- list: Search/browse snippets (optional: search, language, tags, favorite, context, page, limit)
- get: Get snippet by ID (requires: snippetId)
- create: Save new snippet (requires: title, code, language; optional: description, tags, projectId, repositoryId)
- update: Modify snippet (requires: snippetId; optional: title, code, language, description, tags, projectId, repositoryId)
- delete: Permanently delete (requires: snippetId)
- archive/unarchive: Archive or restore from archive (requires: snippetId)
- trash/restore: Soft-delete or restore from trash (requires: snippetId)
- toggleFavorite: Toggle favorite status (requires: snippetId)
- getCount: Get total snippet count (optional: language)
- analyze: Run code quality analysis (requires: snippetId)
- createAnnotation: Add code review annotation (requires: snippetId, content; optional: lineStart, lineEnd, type)
- getAnnotations: List annotations on snippet (requires: snippetId; optional: type)
- getArchived: Browse archived snippets (optional: search, language, page, limit)
- getRecent/getRecentlyViewed/getTrending: Browse snippet categories (optional: page, limit)
- getPublic: Browse public snippets (optional: search, language, tags, page, limit)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    snippetId: z.string().optional().describe("Snippet ID. Required for: get, update, delete, archive, unarchive, trash, restore, toggleFavorite, analyze, createAnnotation, getAnnotations"),
    search: z.string().optional().describe("Search term. Used by: list, getArchived, getPublic"),
    language: z.string().optional().describe("Programming language. Used by: list, create, update, getCount, getArchived, getPublic"),
    tags: z.union([z.string(), z.array(z.string())]).optional().describe("Comma-separated string for filtering (list, getPublic) or string[] for create/update"),
    projectId: z.string().optional().describe("Project ID. Used by: list, create, update"),
    favorite: z.boolean().optional().describe("Filter by favorite status. Used by: list"),
    context: z.string().optional().describe("Filter context: all, personal, shared. Used by: list"),
    page: z.number().optional().describe("Page number (default: 1)"),
    limit: z.number().optional().describe("Items per page (default: 20)"),
    title: z.string().optional().describe("Snippet title. Required for: create"),
    code: z.string().optional().describe("Code content. Required for: create"),
    description: z.string().optional().describe("Snippet description. Used by: create, update"),
    repositoryId: z.string().optional().describe("Repository ID. Used by: create, update"),
    content: z.string().optional().describe("Annotation content. Required for: createAnnotation"),
    lineStart: z.number().optional().describe("Start line for annotations. Used by: createAnnotation"),
    lineEnd: z.number().optional().describe("End line for annotations. Used by: createAnnotation"),
    type: z.string().optional().describe("Annotation type (suggestion, issue, praise). Used by: createAnnotation, getAnnotations"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: SnippetsParams): Promise<FormattedResponse> {
    const api = this.getApiService();

    switch (params.action) {
      case "list":              return this.handleList(api, params);
      case "get":               return this.handleGet(api, params);
      case "create":            return this.handleCreate(api, params);
      case "update":            return this.handleUpdate(api, params);
      case "delete":            return this.handleDelete(api, params);
      case "archive":           return this.handleStateAction(api, params, "archive", "Archived");
      case "unarchive":         return this.handleStateAction(api, params, "unarchive", "Unarchived");
      case "trash":             return this.handleStateAction(api, params, "trash", "Moved to trash");
      case "restore":           return this.handleStateAction(api, params, "restore", "Restored from trash");
      case "toggleFavorite":    return this.handleStateAction(api, params, "favorite", "Toggled favorite for");
      case "getCount":          return this.handleGetCount(api, params);
      case "analyze":           return this.handleStateAction(api, params, "analyze", "Analysis complete for");
      case "createAnnotation":  return this.handleCreateAnnotation(api, params);
      case "getAnnotations":    return this.handleGetAnnotations(api, params);
      case "getArchived":       return this.handleCategoryList(api, params, "/api/snippets/archived", "archived");
      case "getRecent":         return this.handleCategoryList(api, params, "/api/snippets/recent", "recent");
      case "getRecentlyViewed": return this.handleCategoryList(api, params, "/api/snippets/recently-viewed", "recently viewed");
      case "getPublic":         return this.handleCategoryList(api, params, "/api/snippets/public", "public");
      case "getTrending":       return this.handleCategoryList(api, params, "/api/snippets/trending", "trending");
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action: ${params.action}`);
    }
  }

  private async handleList(api: ExternalApiService, params: SnippetsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(`${this.name}.list`, params as unknown as Record<string, unknown>);
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.search) queryParams.search = params.search;
      if (params.language) queryParams.language = params.language;
      if (typeof params.tags === "string" && params.tags) queryParams.tags = params.tags;
      if (params.projectId) queryParams.projectId = params.projectId;
      if (params.favorite !== undefined) queryParams.favorite = params.favorite;
      if (params.context) queryParams.context = params.context;
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;

      const result = await api.get("/api/snippets", queryParams);
      this.logSuccess(`${this.name}.list`, params as unknown as Record<string, unknown>, startTime);
      return jsonResponse(result, `✅ Retrieved snippets (Page ${queryParams.page}, Limit ${queryParams.limit})`);
    } catch (error) {
      return this.handleError(`${this.name}.list`, error, "Failed to list snippets", params as unknown as Record<string, unknown>, startTime);
    }
  }

  private async handleGet(api: ExternalApiService, params: SnippetsParams): Promise<FormattedResponse> {
    const snippetId = this.requireParam(params.snippetId, "snippetId", "get");
    const { startTime } = this.logStart(`${this.name}.get`, { snippetId });
    try {
      const result = await api.get(`/api/snippets/${snippetId}`);
      this.logSuccess(`${this.name}.get`, { snippetId }, startTime);
      return jsonResponse(result, `✅ Retrieved snippet: ${snippetId}`);
    } catch (error) {
      return this.handleError(`${this.name}.get`, error, "Failed to get snippet", { snippetId }, startTime);
    }
  }

  private async handleCreate(api: ExternalApiService, params: SnippetsParams): Promise<FormattedResponse> {
    const title = this.requireParam(params.title, "title", "create");
    const code = this.requireParam(params.code, "code", "create");
    const language = this.requireParam(params.language, "language", "create");
    const { startTime } = this.logStart(`${this.name}.create`, { title });
    try {
      // Title normalization: strip repo-name prefix like "my-repo - FunctionName"
      let normalizedTitle = title.trim();
      const titleParts = normalizedTitle.split(" - ");
      if (titleParts.length === 2) {
        const possibleRepoName = titleParts[0].trim();
        if (/^[a-z][a-z0-9-]*$/.test(possibleRepoName)) {
          normalizedTitle = titleParts[1].trim();
        }
      }

      // Auto-generate description if not provided
      const description = params.description || `Code snippet: ${normalizedTitle}\n\nLanguage: ${language}`;

      // Tag processing
      let tags: string[];
      if (Array.isArray(params.tags) && params.tags.length > 0) {
        tags = params.tags;
      } else {
        tags = [
          normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          language,
          "code-snippet",
        ].filter(Boolean);
      }
      tags = processTags(tags, params.repositoryId, params.projectId);

      const body: Record<string, unknown> = {
        title: normalizedTitle,
        code,
        language,
        description,
        tags,
      };
      if (params.projectId) body.projectId = params.projectId;
      if (params.repositoryId) body.repositoryId = params.repositoryId;

      const result = await api.post("/api/snippets", body);
      this.logSuccess(`${this.name}.create`, { title: normalizedTitle } as Record<string, unknown>, startTime, { success: true, message: `Created: ${normalizedTitle}` });
      return jsonResponse(result, `✅ Created snippet: ${normalizedTitle}`);
    } catch (error) {
      return this.handleError(`${this.name}.create`, error, "Failed to create snippet", { title } as Record<string, unknown>, startTime);
    }
  }

  private async handleUpdate(api: ExternalApiService, params: SnippetsParams): Promise<FormattedResponse> {
    const snippetId = this.requireParam(params.snippetId, "snippetId", "update");
    const { startTime } = this.logStart(`${this.name}.update`, { snippetId });
    try {
      const body: Record<string, unknown> = {};
      if (params.title) body.title = params.title;
      if (params.code) body.code = params.code;
      if (params.language) body.language = params.language;
      if (params.description) body.description = params.description;
      if (Array.isArray(params.tags)) body.tags = params.tags;
      if (params.projectId) body.projectId = params.projectId;
      if (params.repositoryId) body.repositoryId = params.repositoryId;

      const result = await api.put(`/api/snippets/${snippetId}`, body);
      this.logSuccess(`${this.name}.update`, { snippetId }, startTime);
      return jsonResponse(result, `✅ Updated snippet: ${snippetId}`);
    } catch (error) {
      return this.handleError(`${this.name}.update`, error, "Failed to update snippet", { snippetId }, startTime);
    }
  }

  private async handleDelete(api: ExternalApiService, params: SnippetsParams): Promise<FormattedResponse> {
    const snippetId = this.requireParam(params.snippetId, "snippetId", "delete");
    const { startTime } = this.logStart(`${this.name}.delete`, { snippetId });
    try {
      const result = await api.delete(`/api/snippets/${snippetId}`);
      this.logSuccess(`${this.name}.delete`, { snippetId }, startTime);
      return jsonResponse(result, `✅ Deleted snippet: ${snippetId}`);
    } catch (error) {
      return this.handleError(`${this.name}.delete`, error, "Failed to delete snippet", { snippetId }, startTime);
    }
  }

  /** Generic handler for POST /api/snippets/{id}/{action} operations (archive, unarchive, trash, restore, favorite, analyze) */
  private async handleStateAction(api: ExternalApiService, params: SnippetsParams, actionPath: string, successLabel: string): Promise<FormattedResponse> {
    const snippetId = this.requireParam(params.snippetId, "snippetId", params.action);
    const { startTime } = this.logStart(`${this.name}.${params.action}`, { snippetId });
    try {
      const result = await api.post(`/api/snippets/${snippetId}/${actionPath}`, {});
      this.logSuccess(`${this.name}.${params.action}`, { snippetId }, startTime);
      return jsonResponse(result, `✅ ${successLabel} snippet: ${snippetId}`);
    } catch (error) {
      return this.handleError(`${this.name}.${params.action}`, error, `Failed to ${params.action} snippet`, { snippetId }, startTime);
    }
  }

  private async handleGetCount(api: ExternalApiService, params: SnippetsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(`${this.name}.getCount`, {});
    try {
      const queryParams: Record<string, string> = {};
      if (params.language) queryParams.language = params.language;
      const result = await api.get("/api/snippets/count", queryParams);
      this.logSuccess(`${this.name}.getCount`, {}, startTime);
      return jsonResponse(result, "✅ Retrieved snippet count");
    } catch (error) {
      return this.handleError(`${this.name}.getCount`, error, "Failed to get snippet count", {}, startTime);
    }
  }

  private async handleCreateAnnotation(api: ExternalApiService, params: SnippetsParams): Promise<FormattedResponse> {
    const snippetId = this.requireParam(params.snippetId, "snippetId", "createAnnotation");
    const content = this.requireParam(params.content, "content", "createAnnotation");
    const { startTime } = this.logStart(`${this.name}.createAnnotation`, { snippetId });
    try {
      const body: Record<string, unknown> = { content };
      if (params.lineStart !== undefined) body.lineStart = params.lineStart;
      if (params.lineEnd !== undefined) body.lineEnd = params.lineEnd;
      if (params.type) body.type = params.type;

      const result = await api.post(`/api/snippets/${snippetId}/annotations`, body);
      this.logSuccess(`${this.name}.createAnnotation`, { snippetId }, startTime);
      return jsonResponse(result, `✅ Annotation created on snippet: ${snippetId}`);
    } catch (error) {
      return this.handleError(`${this.name}.createAnnotation`, error, "Failed to create annotation", { snippetId }, startTime);
    }
  }

  private async handleGetAnnotations(api: ExternalApiService, params: SnippetsParams): Promise<FormattedResponse> {
    const snippetId = this.requireParam(params.snippetId, "snippetId", "getAnnotations");
    const { startTime } = this.logStart(`${this.name}.getAnnotations`, { snippetId });
    try {
      const queryParams: Record<string, string> = {};
      if (params.type) queryParams.type = params.type;
      const result = await api.get(`/api/snippets/${snippetId}/annotations`, queryParams);
      this.logSuccess(`${this.name}.getAnnotations`, { snippetId }, startTime);
      return jsonResponse(result, `✅ Annotations for snippet: ${snippetId}`);
    } catch (error) {
      return this.handleError(`${this.name}.getAnnotations`, error, "Failed to get annotations", { snippetId }, startTime);
    }
  }

  /** Generic handler for category list endpoints (archived, recent, recently-viewed, public, trending) */
  private async handleCategoryList(api: ExternalApiService, params: SnippetsParams, endpoint: string, label: string): Promise<FormattedResponse> {
    const { startTime } = this.logStart(`${this.name}.${params.action}`, params as unknown as Record<string, unknown>);
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.search) queryParams.search = params.search;
      if (params.language) queryParams.language = params.language;
      if (typeof params.tags === "string" && params.tags) queryParams.tags = params.tags;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      const result = await api.get(endpoint, queryParams);
      this.logSuccess(`${this.name}.${params.action}`, params as unknown as Record<string, unknown>, startTime);
      return jsonResponse(result, `✅ Retrieved ${label} snippets`);
    } catch (error) {
      return this.handleError(`${this.name}.${params.action}`, error, `Failed to get ${label} snippets`, params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const snippetsTool = new SnippetsTool();
