/**
 * Create Repository Pattern Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { logger } from "../../../core/logger.js";
import { processTags } from "../../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryPatternParams {
  repositoryId: string;
  patternName: string;
  description: string;
  codeExample?: string;
  usageContext?: string;
  benefits?: string;
  tradeoffs?: string;
  relatedPatterns?: string[];
  tags?: string[];
  category?: "general" | "design" | "architecture" | "data_access" | "state_management" | "error_handling" | "testing" | "performance";
}

class CreateRepositoryPatternTool extends BaseToolHandler implements BaseToolDefinition<CreateRepositoryPatternParams> {
  name = "createRepositoryPattern";
  description = "Create a new coding pattern for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    patternName: z.string().describe("Name of the pattern"),
    description: z.string().describe("Description of the pattern"),
    codeExample: z.string().optional().describe("Code example showing the pattern"),
    usageContext: z.string().optional().describe("When/where to use this pattern"),
    benefits: z.string().optional().describe("Benefits of the pattern"),
    tradeoffs: z.string().optional().describe("Tradeoffs of the pattern"),
    relatedPatterns: z.array(z.string()).optional().default([]).describe("Array of related pattern names"),
    tags: z.array(z.string()).optional().default([]).describe("Array of tags"),
    category: z.enum(["general", "design", "architecture", "data_access", "state_management", "error_handling", "testing", "performance"]).optional().default("general").describe("Pattern category"),
  });

  async execute(params: CreateRepositoryPatternParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        pattern_name: params.patternName,
        description: params.description,
      };

      if (params.codeExample !== undefined) body.code_example = params.codeExample;
      if (params.usageContext !== undefined) body.usage_context = params.usageContext;
      if (params.benefits !== undefined) body.benefits = params.benefits;
      if (params.tradeoffs !== undefined) body.tradeoffs = params.tradeoffs;
      if (params.relatedPatterns !== undefined && params.relatedPatterns.length > 0) body.related_patterns = params.relatedPatterns;
      
      // Filter and process tags to remove IDs
      const filteredTags = processTags(params.tags, params.repositoryId);
      if (filteredTags.length > 0) body.tags = filteredTags;
      
      if (params.category !== undefined) body.category = params.category;

      logger.debug(`[${this.name}] Preparing API request`, {
        endpoint: `/api/repositories/${params.repositoryId}/patterns`,
        method: "POST",
        body: {
          pattern_name: body.pattern_name,
          description_length: typeof body.description === "string" ? body.description.length : 0,
          category: body.category || "general",
          code_example_length: typeof body.code_example === "string" ? body.code_example.length : 0,
          related_patterns_count: Array.isArray(body.related_patterns) ? body.related_patterns.length : 0,
          tags_count: Array.isArray(body.tags) ? body.tags.length : 0,
        },
        repositoryId: params.repositoryId,
      });

      const result = await apiService.post(`/api/repositories/${params.repositoryId}/patterns`, body);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Created pattern for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Created pattern for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create repository pattern", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const createRepositoryPatternTool = new CreateRepositoryPatternTool();

