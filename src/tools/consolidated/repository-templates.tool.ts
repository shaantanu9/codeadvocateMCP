import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { processTags } from "../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["list", "get", "create", "update", "delete"] as const;

interface Params {
  action: (typeof ACTIONS)[number];
  repositoryId?: string;
  templateId?: string;
  title?: string;
  code?: string;
  language?: string;
  description?: string;
  tags?: string[];
  snippetId?: string;
  projectId?: string;
  collectionId?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

class RepositoryTemplatesTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryTemplates";

  description = `Manage repository templates. Use 'action' to specify operation:
- list: List all templates (requires: repositoryId; optional: page, limit, search, language)
- get: Get template by ID (requires: templateId)
- create: Create new template (requires: repositoryId, title, code, language; optional: description, tags, snippetId)
- update: Update template (requires: templateId; optional: title, code, language, description, tags, repositoryId, projectId, collectionId, isPublic)
- delete: Remove template (requires: templateId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Required for: list, create"),
    templateId: z.string().optional().describe("Template ID. Required for: get, update, delete"),
    title: z.string().optional().describe("Template title. Required for: create"),
    code: z.string().optional().describe("Template code content. Required for: create"),
    language: z.string().optional().describe("Programming language. Required for: create; optional for: list, update"),
    description: z.string().optional().describe("Template description"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    snippetId: z.string().optional().describe("Associated snippet ID for create"),
    projectId: z.string().optional().describe("Project ID for update"),
    collectionId: z.string().optional().describe("Collection ID for update"),
    isPublic: z.boolean().optional().describe("Public visibility for update"),
    page: z.number().optional().describe("Page number for list"),
    limit: z.number().optional().describe("Items per page (default: 20)"),
    search: z.string().optional().describe("Search term for list"),
  });

  annotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

  async execute(params: Params): Promise<FormattedResponse> {
    const api = this.getApiService();
    switch (params.action) {
      case "list": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "list");
        const { startTime } = this.logStart(`${this.name}.list`, { repositoryId });
        try {
          const queryParams: Record<string, string | number> = {};
          queryParams.page = params.page ?? 1;
          queryParams.limit = params.limit ?? 20;
          if (params.search) queryParams.search = params.search;
          if (params.language) queryParams.language = params.language;

          const result = await api.get(`/api/repositories/${repositoryId}/templates`, queryParams);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved templates for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list templates", { repositoryId }, startTime);
        }
      }
      case "get": {
        const templateId = this.requireParam(params.templateId, "templateId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { templateId });
        try {
          const result = await api.get(`/api/snippets/${templateId}`);
          this.logSuccess(`${this.name}.get`, { templateId }, startTime);
          return jsonResponse(result, `✅ Retrieved template: ${templateId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get template", { templateId }, startTime);
        }
      }
      case "create": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "create");
        const title = this.requireParam(params.title, "title", "create");
        const code = this.requireParam(params.code, "code", "create");
        const language = this.requireParam(params.language, "language", "create");
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, title });
        try {
          const body: Record<string, unknown> = { title, code, language };
          if (params.description !== undefined) body.description = params.description;
          if (params.snippetId !== undefined) body.snippetId = params.snippetId;
          const filteredTags = processTags(params.tags, repositoryId);
          if (filteredTags.length > 0) body.tags = filteredTags;

          const result = await api.post(`/api/repositories/${repositoryId}/templates`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, title }, startTime);
          return jsonResponse(result, `✅ Created template for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create template", { repositoryId, title }, startTime);
        }
      }
      case "update": {
        const templateId = this.requireParam(params.templateId, "templateId", "update");
        const { startTime } = this.logStart(`${this.name}.update`, { templateId });
        try {
          const body: Record<string, unknown> = {};
          if (params.title !== undefined) body.title = params.title;
          if (params.code !== undefined) body.code = params.code;
          if (params.language !== undefined) body.language = params.language;
          if (params.description !== undefined) body.description = params.description;
          if (params.repositoryId !== undefined) body.repositoryId = params.repositoryId;
          if (params.projectId !== undefined) body.projectId = params.projectId;
          if (params.collectionId !== undefined) body.collectionId = params.collectionId;
          if (params.isPublic !== undefined) body.isPublic = params.isPublic;
          if (params.tags !== undefined) {
            const filteredTags = processTags(params.tags, params.repositoryId);
            body.tags = filteredTags;
          }

          const result = await api.put(`/api/snippets/${templateId}`, body);
          this.logSuccess(`${this.name}.update`, { templateId }, startTime);
          return jsonResponse(result, `✅ Updated template: ${templateId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update template", { templateId }, startTime);
        }
      }
      case "delete": {
        const templateId = this.requireParam(params.templateId, "templateId", "delete");
        const { startTime } = this.logStart(`${this.name}.delete`, { templateId });
        try {
          const result = await api.delete(`/api/snippets/${templateId}`);
          this.logSuccess(`${this.name}.delete`, { templateId }, startTime);
          return jsonResponse(result, `✅ Deleted template: ${templateId}`);
        } catch (error) {
          return this.handleError(`${this.name}.delete`, error, "Failed to delete template", { templateId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryTemplatesTool = new RepositoryTemplatesTool();
