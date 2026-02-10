/**
 * Analyze Code Tool
 *
 * Analyze arbitrary code for quality, security, and performance issues
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface AnalyzeCodeParams {
  code: string;
  language?: string;
}

class AnalyzeCodeTool extends BaseToolHandler implements BaseToolDefinition<AnalyzeCodeParams> {
  name = "analyzeCode";
  description = "Analyze any code for quality, security vulnerabilities, performance issues, and best practices. Returns a quality score, complexity metrics, and actionable recommendations. Does not require saving the code as a snippet first.";

  paramsSchema = z.object({
    code: z.string().describe("The code to analyze"),
    language: z.string().optional().describe("Programming language of the code (auto-detected if not specified)"),
  });

  async execute(params: AnalyzeCodeParams): Promise<FormattedResponse> {
    this.logStart(this.name, { language: params.language, codeLength: params.code.length });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = { code: params.code };
      if (params.language) body.language = params.language;
      const result = await apiService.post("/api/code/analyze", body);
      return jsonResponse(result, "✅ Code analysis complete");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to analyze code");
    }
  }
}

export const analyzeCodeTool = new AnalyzeCodeTool();
