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
  errorId?: string;
  errorName?: string;
  errorMessage?: string;
  context?: string;
  rootCause?: string;
  solution?: string;
  learning?: string;
  prevention?: string;
  severity?: string;
  status?: string;
  tags?: string[];
}

class RepositoryErrorsTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryErrors";

  description = `Manage repository error logs. Use 'action' to specify operation:
- list: List all errors (requires: repositoryId)
- get: Get error by ID (requires: repositoryId, errorId)
- create: Log new error (requires: errorName, errorMessage; repositoryId auto-detected if not provided)
- update: Update error (requires: repositoryId, errorId; at least one field to update)
- delete: Remove error (requires: repositoryId, errorId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Auto-detected if not provided for create."),
    errorId: z.string().optional().describe("Error ID. Required for: get, update, delete"),
    errorName: z.string().optional().describe("Error name/title. Required for: create"),
    errorMessage: z.string().optional().describe("The actual error message. Required for: create"),
    context: z.string().optional().describe("Where/when error occurred"),
    rootCause: z.string().optional().describe("Why the error happened"),
    solution: z.string().optional().describe("How it was fixed"),
    learning: z.string().optional().describe("What was learned"),
    prevention: z.string().optional().describe("How to prevent it"),
    severity: z.enum(["low", "medium", "high", "critical"]).optional().describe("Error severity (default: medium)"),
    status: z.enum(["new", "investigating", "resolved", "recurring"]).optional().describe("Error status (default: resolved)"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
  });

  annotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

  async execute(params: Params): Promise<FormattedResponse> {
    const api = this.getApiService();
    switch (params.action) {
      case "list": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "list");
        const { startTime } = this.logStart(`${this.name}.list`, { repositoryId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/errors`);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved errors for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list errors", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const errorId = this.requireParam(params.errorId, "errorId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, errorId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/errors/${errorId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, errorId }, startTime);
          return jsonResponse(result, `✅ Retrieved error ${errorId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get error", { repositoryId, errorId }, startTime);
        }
      }
      case "create": {
        const errorName = this.requireParam(params.errorName, "errorName", "create");
        const errorMessage = this.requireParam(params.errorMessage, "errorMessage", "create");
        const repositoryId = await this.resolveRepositoryId(params.repositoryId);
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, errorName });
        try {
          const body: Record<string, unknown> = { error_name: errorName, error_message: errorMessage };
          if (params.context !== undefined) body.context = params.context;
          if (params.rootCause !== undefined) body.root_cause = params.rootCause;
          if (params.solution !== undefined) body.solution = params.solution;
          if (params.learning !== undefined) body.learning = params.learning;
          if (params.prevention !== undefined) body.prevention = params.prevention;
          if (params.severity !== undefined) body.severity = params.severity;
          if (params.status !== undefined) body.status = params.status;
          const filteredTags = processTags(params.tags, repositoryId);
          if (filteredTags.length > 0) body.tags = filteredTags;

          const result = await api.post(`/api/repositories/${repositoryId}/errors`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, errorName }, startTime);
          return jsonResponse(result, `✅ Created error log for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create error", { repositoryId, errorName }, startTime);
        }
      }
      case "update": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "update");
        const errorId = this.requireParam(params.errorId, "errorId", "update");
        const { startTime } = this.logStart(`${this.name}.update`, { repositoryId, errorId });
        try {
          const body: Record<string, unknown> = {};
          if (params.errorName !== undefined) body.error_name = params.errorName;
          if (params.errorMessage !== undefined) body.error_message = params.errorMessage;
          if (params.context !== undefined) body.context = params.context;
          if (params.rootCause !== undefined) body.root_cause = params.rootCause;
          if (params.solution !== undefined) body.solution = params.solution;
          if (params.learning !== undefined) body.learning = params.learning;
          if (params.prevention !== undefined) body.prevention = params.prevention;
          if (params.severity !== undefined) body.severity = params.severity;
          if (params.status !== undefined) body.status = params.status;
          if (params.tags !== undefined) body.tags = params.tags;

          const result = await api.patch(`/api/repositories/${repositoryId}/errors/${errorId}`, body);
          this.logSuccess(`${this.name}.update`, { repositoryId, errorId }, startTime);
          return jsonResponse(result, `✅ Updated error ${errorId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update error", { repositoryId, errorId }, startTime);
        }
      }
      case "delete": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "delete");
        const errorId = this.requireParam(params.errorId, "errorId", "delete");
        const { startTime } = this.logStart(`${this.name}.delete`, { repositoryId, errorId });
        try {
          const result = await api.delete(`/api/repositories/${repositoryId}/errors/${errorId}`);
          this.logSuccess(`${this.name}.delete`, { repositoryId, errorId }, startTime);
          return jsonResponse(result, `✅ Deleted error ${errorId} from repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.delete`, error, "Failed to delete error", { repositoryId, errorId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryErrorsTool = new RepositoryErrorsTool();
