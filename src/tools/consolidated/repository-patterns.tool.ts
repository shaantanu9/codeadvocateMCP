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
  patternId?: string;
  patternName?: string;
  description?: string;
  codeExample?: string;
  usageContext?: string;
  benefits?: string;
  tradeoffs?: string;
  relatedPatterns?: string[];
  tags?: string[];
  category?: string;
}

class RepositoryPatternsTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryPatterns";

  description = `Manage repository patterns. Use 'action' to specify operation:
- list: List all patterns (requires: repositoryId)
- get: Get pattern by ID (requires: repositoryId, patternId)
- create: Create new pattern (requires: repositoryId, patternName, description; optional: codeExample, usageContext, benefits, tradeoffs, relatedPatterns, tags, category)
- update: Update pattern (requires: repositoryId, patternId; at least one field to update)
- delete: Remove pattern (requires: repositoryId, patternId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Required for all actions."),
    patternId: z.string().optional().describe("Pattern ID. Required for: get, update, delete"),
    patternName: z.string().optional().describe("Pattern name. Required for: create"),
    description: z.string().optional().describe("Pattern description. Required for: create"),
    codeExample: z.string().optional().describe("Code example demonstrating the pattern"),
    usageContext: z.string().optional().describe("Context in which to use this pattern"),
    benefits: z.string().optional().describe("Benefits of using this pattern"),
    tradeoffs: z.string().optional().describe("Tradeoffs of using this pattern"),
    relatedPatterns: z.array(z.string()).optional().describe("Related pattern names or IDs"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    category: z.enum(["general", "design", "architecture", "data_access", "state_management", "error_handling", "testing", "performance"]).optional().describe("Category (default: general)"),
  });

  annotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

  async execute(params: Params): Promise<FormattedResponse> {
    const api = this.getApiService();
    switch (params.action) {
      case "list": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "list");
        const { startTime } = this.logStart(`${this.name}.list`, { repositoryId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/patterns`);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved patterns for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list patterns", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const patternId = this.requireParam(params.patternId, "patternId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, patternId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/patterns/${patternId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, patternId }, startTime);
          return jsonResponse(result, `✅ Retrieved pattern ${patternId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get pattern", { repositoryId, patternId }, startTime);
        }
      }
      case "create": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "create");
        const patternName = this.requireParam(params.patternName, "patternName", "create");
        const description = this.requireParam(params.description, "description", "create");
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, patternName });
        try {
          const body: Record<string, unknown> = { pattern_name: patternName, description };
          if (params.codeExample !== undefined) body.code_example = params.codeExample;
          if (params.usageContext !== undefined) body.usage_context = params.usageContext;
          if (params.benefits !== undefined) body.benefits = params.benefits;
          if (params.tradeoffs !== undefined) body.tradeoffs = params.tradeoffs;
          if (params.relatedPatterns && params.relatedPatterns.length > 0) body.related_patterns = params.relatedPatterns;
          if (params.category !== undefined) body.category = params.category;
          const filteredTags = processTags(params.tags, repositoryId);
          if (filteredTags.length > 0) body.tags = filteredTags;

          const result = await api.post(`/api/repositories/${repositoryId}/patterns`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, patternName }, startTime);
          return jsonResponse(result, `✅ Created pattern for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create pattern", { repositoryId, patternName }, startTime);
        }
      }
      case "update": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "update");
        const patternId = this.requireParam(params.patternId, "patternId", "update");
        const { startTime } = this.logStart(`${this.name}.update`, { repositoryId, patternId });
        try {
          const body: Record<string, unknown> = {};
          if (params.patternName !== undefined) body.pattern_name = params.patternName;
          if (params.description !== undefined) body.description = params.description;
          if (params.codeExample !== undefined) body.code_example = params.codeExample;
          if (params.usageContext !== undefined) body.usage_context = params.usageContext;
          if (params.benefits !== undefined) body.benefits = params.benefits;
          if (params.tradeoffs !== undefined) body.tradeoffs = params.tradeoffs;
          if (params.relatedPatterns !== undefined) body.related_patterns = params.relatedPatterns;
          if (params.category !== undefined) body.category = params.category;
          if (params.tags !== undefined) body.tags = params.tags;

          const result = await api.patch(`/api/repositories/${repositoryId}/patterns/${patternId}`, body);
          this.logSuccess(`${this.name}.update`, { repositoryId, patternId }, startTime);
          return jsonResponse(result, `✅ Updated pattern ${patternId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update pattern", { repositoryId, patternId }, startTime);
        }
      }
      case "delete": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "delete");
        const patternId = this.requireParam(params.patternId, "patternId", "delete");
        const { startTime } = this.logStart(`${this.name}.delete`, { repositoryId, patternId });
        try {
          const result = await api.delete(`/api/repositories/${repositoryId}/patterns/${patternId}`);
          this.logSuccess(`${this.name}.delete`, { repositoryId, patternId }, startTime);
          return jsonResponse(result, `✅ Deleted pattern ${patternId} from repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.delete`, error, "Failed to delete pattern", { repositoryId, patternId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryPatternsTool = new RepositoryPatternsTool();
