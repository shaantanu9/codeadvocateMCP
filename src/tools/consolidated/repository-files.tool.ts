import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["list", "get", "create", "update", "delete"] as const;

interface Params {
  action: (typeof ACTIONS)[number];
  repositoryId?: string;
  fileId?: string;
  file_name?: string;
  file_path?: string;
  content?: string;
  file_type?: string;
  project_id?: string;
  collection_id?: string;
  encoding?: string;
  metadata?: Record<string, unknown>;
  search?: string;
  page?: number;
  limit?: number;
}

class RepositoryFilesTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryFiles";

  description = `Manage repository files. Use 'action' to specify operation:
- list: List all files (requires: repositoryId; optional: search, file_type, project_id, collection_id, page, limit)
- get: Get file by ID (requires: repositoryId, fileId)
- create: Create new file (requires: repositoryId, file_name, file_path, content; optional: file_type, project_id, collection_id, encoding, metadata)
- update: Update file (requires: repositoryId, fileId; optional: file_name, file_path, file_type, content, project_id, collection_id, metadata)
- delete: Remove file (requires: repositoryId, fileId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Required for all actions."),
    fileId: z.string().optional().describe("File ID. Required for: get, update, delete"),
    file_name: z.string().optional().describe("File name. Required for: create"),
    file_path: z.string().optional().describe("File path. Required for: create"),
    content: z.string().optional().describe("File content. Required for: create"),
    file_type: z.enum(["markdown", "text", "json", "yaml", "xml"]).optional().describe("File type (default: text)"),
    project_id: z.string().optional().describe("Project ID"),
    collection_id: z.string().optional().describe("Collection ID"),
    encoding: z.string().optional().describe("File encoding (default: utf-8)"),
    metadata: z.record(z.unknown()).optional().describe("Additional metadata"),
    search: z.string().optional().describe("Search term for list"),
    page: z.number().optional().describe("Page number (default: 1)"),
    limit: z.number().optional().describe("Items per page (default: 50)"),
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
          if (params.file_type) queryParams.file_type = params.file_type;
          if (params.project_id) queryParams.project_id = params.project_id;
          if (params.collection_id) queryParams.collection_id = params.collection_id;

          const result = await api.get(`/api/repositories/${repositoryId}/files`, queryParams);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved files for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list files", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const fileId = this.requireParam(params.fileId, "fileId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, fileId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/files/${fileId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, fileId }, startTime);
          return jsonResponse(result, `✅ Retrieved file ${fileId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get file", { repositoryId, fileId }, startTime);
        }
      }
      case "create": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "create");
        const file_name = this.requireParam(params.file_name, "file_name", "create");
        const file_path = this.requireParam(params.file_path, "file_path", "create");
        const content = this.requireParam(params.content, "content", "create");
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, file_name });
        try {
          const body: Record<string, unknown> = { file_name, file_path, content };
          if (params.file_type !== undefined) body.file_type = params.file_type;
          if (params.project_id !== undefined) body.project_id = params.project_id;
          if (params.collection_id !== undefined) body.collection_id = params.collection_id;
          if (params.encoding !== undefined) body.encoding = params.encoding;
          if (params.metadata !== undefined) body.metadata = params.metadata;

          const result = await api.post(`/api/repositories/${repositoryId}/files`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, file_name }, startTime);
          return jsonResponse(result, `✅ Created file for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create file", { repositoryId, file_name }, startTime);
        }
      }
      case "update": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "update");
        const fileId = this.requireParam(params.fileId, "fileId", "update");
        const { startTime } = this.logStart(`${this.name}.update`, { repositoryId, fileId });
        try {
          const body: Record<string, unknown> = {};
          if (params.file_name !== undefined) body.file_name = params.file_name;
          if (params.file_path !== undefined) body.file_path = params.file_path;
          if (params.file_type !== undefined) body.file_type = params.file_type;
          if (params.content !== undefined) body.content = params.content;
          if (params.project_id !== undefined) body.project_id = params.project_id;
          if (params.collection_id !== undefined) body.collection_id = params.collection_id;
          if (params.metadata !== undefined) body.metadata = params.metadata;

          const result = await api.put(`/api/repositories/${repositoryId}/files/${fileId}`, body);
          this.logSuccess(`${this.name}.update`, { repositoryId, fileId }, startTime);
          return jsonResponse(result, `✅ Updated file ${fileId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update file", { repositoryId, fileId }, startTime);
        }
      }
      case "delete": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "delete");
        const fileId = this.requireParam(params.fileId, "fileId", "delete");
        const { startTime } = this.logStart(`${this.name}.delete`, { repositoryId, fileId });
        try {
          const result = await api.delete(`/api/repositories/${repositoryId}/files/${fileId}`);
          this.logSuccess(`${this.name}.delete`, { repositoryId, fileId }, startTime);
          return jsonResponse(result, `✅ Deleted file ${fileId} from repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.delete`, error, "Failed to delete file", { repositoryId, fileId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryFilesTool = new RepositoryFilesTool();
