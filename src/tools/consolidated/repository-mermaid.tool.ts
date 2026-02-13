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
  diagramId?: string;
  title?: string;
  content?: string;
  description?: string;
  category?: string;
  explanation?: string;
  tags?: string[];
  fileName?: string;
  page?: number;
  limit?: number;
  search?: string;
}

class RepositoryMermaidTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryMermaid";

  description = `Manage repository mermaid diagrams. Use 'action' to specify operation:
- list: List all diagrams (requires: repositoryId; optional: page, limit, search, category)
- get: Get diagram by ID (requires: repositoryId, diagramId)
- create: Create new diagram (requires: title, content; repositoryId auto-detected if not provided; optional: description, category, explanation, tags, fileName)
- update: Update diagram (requires: repositoryId, diagramId; at least one field to update)
- delete: Remove diagram (requires: repositoryId, diagramId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Auto-detected if not provided for create."),
    diagramId: z.string().optional().describe("Diagram ID. Required for: get, update, delete"),
    title: z.string().optional().describe("Diagram title. Required for: create"),
    content: z.string().optional().describe("Mermaid diagram content. Required for: create"),
    description: z.string().optional().describe("Diagram description"),
    category: z.string().optional().describe("Diagram category (default: custom)"),
    explanation: z.string().optional().describe("Explanation of the diagram"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    fileName: z.string().optional().describe("Associated file name"),
    page: z.number().optional().describe("Page number for list"),
    limit: z.number().optional().describe("Items per page (default: 50)"),
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
          queryParams.limit = params.limit ?? 50;
          if (params.search) queryParams.search = params.search;
          if (params.category) queryParams.category = params.category;

          const result = await api.get(`/api/repositories/${repositoryId}/mermaid`, queryParams);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved mermaid diagrams for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list mermaid diagrams", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const diagramId = this.requireParam(params.diagramId, "diagramId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, diagramId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/mermaid/${diagramId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, diagramId }, startTime);
          return jsonResponse(result, `✅ Retrieved mermaid diagram ${diagramId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get mermaid diagram", { repositoryId, diagramId }, startTime);
        }
      }
      case "create": {
        const title = this.requireParam(params.title, "title", "create");
        const content = this.requireParam(params.content, "content", "create");
        const repositoryId = await this.resolveRepositoryId(params.repositoryId);
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, title });
        try {
          const body: Record<string, unknown> = { title, content };
          if (params.description !== undefined) body.description = params.description;
          if (params.category !== undefined) body.category = params.category;
          if (params.explanation !== undefined) body.explanation = params.explanation;
          if (params.fileName !== undefined) body.file_name = params.fileName;
          const filteredTags = processTags(params.tags, repositoryId);
          if (filteredTags.length > 0) body.tags = filteredTags;

          const result = await api.post(`/api/repositories/${repositoryId}/mermaid`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, title }, startTime);
          return jsonResponse(result, `✅ Created mermaid diagram for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create mermaid diagram", { repositoryId, title }, startTime);
        }
      }
      case "update": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "update");
        const diagramId = this.requireParam(params.diagramId, "diagramId", "update");
        const { startTime } = this.logStart(`${this.name}.update`, { repositoryId, diagramId });
        try {
          const body: Record<string, unknown> = {};
          if (params.title !== undefined) body.title = params.title;
          if (params.content !== undefined) body.content = params.content;
          if (params.description !== undefined) body.description = params.description;
          if (params.category !== undefined) body.category = params.category;
          if (params.explanation !== undefined) body.explanation = params.explanation;
          if (params.fileName !== undefined) body.file_name = params.fileName;
          if (params.tags !== undefined) body.tags = params.tags;

          const result = await api.put(`/api/repositories/${repositoryId}/mermaid/${diagramId}`, body);
          this.logSuccess(`${this.name}.update`, { repositoryId, diagramId }, startTime);
          return jsonResponse(result, `✅ Updated mermaid diagram ${diagramId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update mermaid diagram", { repositoryId, diagramId }, startTime);
        }
      }
      case "delete": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "delete");
        const diagramId = this.requireParam(params.diagramId, "diagramId", "delete");
        const { startTime } = this.logStart(`${this.name}.delete`, { repositoryId, diagramId });
        try {
          const result = await api.delete(`/api/repositories/${repositoryId}/mermaid/${diagramId}`);
          this.logSuccess(`${this.name}.delete`, { repositoryId, diagramId }, startTime);
          return jsonResponse(result, `✅ Deleted mermaid diagram ${diagramId} from repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.delete`, error, "Failed to delete mermaid diagram", { repositoryId, diagramId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryMermaidTool = new RepositoryMermaidTool();
