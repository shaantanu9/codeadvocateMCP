/**
 * Update Repository Pattern Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { AppError } from "../../../core/errors.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryPatternParams {
  repositoryId: string;
  patternId: string;
  patternName?: string;
  description?: string;
  codeExample?: string;
  usageContext?: string;
  benefits?: string;
  tradeoffs?: string;
  relatedPatterns?: string[];
  tags?: string[];
  category?: "general" | "design" | "architecture" | "data_access" | "state_management" | "error_handling" | "testing" | "performance";
}

class UpdateRepositoryPatternTool extends BaseToolHandler implements BaseToolDefinition<UpdateRepositoryPatternParams> {
  name = "updateRepositoryPattern";
  description = "Update a coding pattern for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    patternId: z.string().describe("The ID of the pattern"),
    patternName: z.string().optional().describe("Name of the pattern"),
    description: z.string().optional().describe("Description of the pattern"),
    codeExample: z.string().optional().describe("Code example"),
    usageContext: z.string().optional().describe("When/where to use"),
    benefits: z.string().optional().describe("Benefits of the pattern"),
    tradeoffs: z.string().optional().describe("Tradeoffs of the pattern"),
    relatedPatterns: z.array(z.string()).optional().describe("Array of related pattern names"),
    tags: z.array(z.string()).optional().describe("Array of tags"),
    category: z.enum(["general", "design", "architecture", "data_access", "state_management", "error_handling", "testing", "performance"]).optional().describe("Pattern category"),
  });

  async execute(params: UpdateRepositoryPatternParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};

      if (params.patternName !== undefined) body.pattern_name = params.patternName;
      if (params.description !== undefined) body.description = params.description;
      if (params.codeExample !== undefined) body.code_example = params.codeExample;
      if (params.usageContext !== undefined) body.usage_context = params.usageContext;
      if (params.benefits !== undefined) body.benefits = params.benefits;
      if (params.tradeoffs !== undefined) body.tradeoffs = params.tradeoffs;
      if (params.relatedPatterns !== undefined) body.related_patterns = params.relatedPatterns;
      if (params.tags !== undefined) body.tags = params.tags;
      if (params.category !== undefined) body.category = params.category;

      // Ensure at least one field is provided
      if (Object.keys(body).length === 0) {
        throw new AppError("At least one field must be provided for update", "NO_FIELDS");
      }

      const result = await apiService.patch(`/api/repositories/${params.repositoryId}/patterns/${params.patternId}`, body);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated pattern ${params.patternId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Updated pattern ${params.patternId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update repository pattern", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const updateRepositoryPatternTool = new UpdateRepositoryPatternTool();

