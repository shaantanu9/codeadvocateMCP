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
  learningId?: string;
  title?: string;
  content?: string;
  category?: string;
  keyTakeaways?: string[];
  relatedFiles?: string[];
  tags?: string[];
  importance?: string;
}

class RepositoryLearningsTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryLearnings";

  description = `Manage repository learnings. Use 'action' to specify operation:
- list: List all learnings (requires: repositoryId)
- get: Get learning by ID (requires: repositoryId, learningId)
- create: Create new learning (requires: repositoryId, title, content; optional: category, keyTakeaways, relatedFiles, tags, importance)
- update: Update learning (requires: repositoryId, learningId; at least one field to update)
- delete: Remove learning (requires: repositoryId, learningId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Required for all actions."),
    learningId: z.string().optional().describe("Learning ID. Required for: get, update, delete"),
    title: z.string().optional().describe("Learning title. Required for: create"),
    content: z.string().optional().describe("Learning content. Required for: create"),
    category: z.enum(["general", "architecture", "patterns", "performance", "security", "testing", "deployment", "troubleshooting"]).optional().describe("Category (default: general)"),
    keyTakeaways: z.array(z.string()).optional().describe("Key takeaways from the learning"),
    relatedFiles: z.array(z.string()).optional().describe("Related file paths"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    importance: z.enum(["low", "medium", "high", "critical"]).optional().describe("Importance level (default: medium)"),
  });

  annotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

  async execute(params: Params): Promise<FormattedResponse> {
    const api = this.getApiService();
    switch (params.action) {
      case "list": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "list");
        const { startTime } = this.logStart(`${this.name}.list`, { repositoryId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/learnings`);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved learnings for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list learnings", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const learningId = this.requireParam(params.learningId, "learningId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, learningId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/learnings/${learningId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, learningId }, startTime);
          return jsonResponse(result, `✅ Retrieved learning ${learningId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get learning", { repositoryId, learningId }, startTime);
        }
      }
      case "create": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "create");
        const title = this.requireParam(params.title, "title", "create");
        const content = this.requireParam(params.content, "content", "create");
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, title });
        try {
          const body: Record<string, unknown> = { title, content };
          if (params.category !== undefined) body.category = params.category;
          if (params.importance !== undefined) body.importance = params.importance;
          if (params.keyTakeaways && params.keyTakeaways.length > 0) body.key_takeaways = params.keyTakeaways;
          if (params.relatedFiles && params.relatedFiles.length > 0) body.related_files = params.relatedFiles;
          const filteredTags = processTags(params.tags, repositoryId);
          if (filteredTags.length > 0) body.tags = filteredTags;

          const result = await api.post(`/api/repositories/${repositoryId}/learnings`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, title }, startTime);
          return jsonResponse(result, `✅ Created learning for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create learning", { repositoryId, title }, startTime);
        }
      }
      case "update": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "update");
        const learningId = this.requireParam(params.learningId, "learningId", "update");
        const { startTime } = this.logStart(`${this.name}.update`, { repositoryId, learningId });
        try {
          const body: Record<string, unknown> = {};
          if (params.title !== undefined) body.title = params.title;
          if (params.content !== undefined) body.content = params.content;
          if (params.category !== undefined) body.category = params.category;
          if (params.importance !== undefined) body.importance = params.importance;
          if (params.keyTakeaways !== undefined) body.key_takeaways = params.keyTakeaways;
          if (params.relatedFiles !== undefined) body.related_files = params.relatedFiles;
          if (params.tags !== undefined) body.tags = params.tags;

          const result = await api.patch(`/api/repositories/${repositoryId}/learnings/${learningId}`, body);
          this.logSuccess(`${this.name}.update`, { repositoryId, learningId }, startTime);
          return jsonResponse(result, `✅ Updated learning ${learningId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update learning", { repositoryId, learningId }, startTime);
        }
      }
      case "delete": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "delete");
        const learningId = this.requireParam(params.learningId, "learningId", "delete");
        const { startTime } = this.logStart(`${this.name}.delete`, { repositoryId, learningId });
        try {
          const result = await api.delete(`/api/repositories/${repositoryId}/learnings/${learningId}`);
          this.logSuccess(`${this.name}.delete`, { repositoryId, learningId }, startTime);
          return jsonResponse(result, `✅ Deleted learning ${learningId} from repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.delete`, error, "Failed to delete learning", { repositoryId, learningId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryLearningsTool = new RepositoryLearningsTool();
