/**
 * Analyze Snippet Tool
 *
 * Triggers code analysis for a snippet (quality, security, performance)
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface AnalyzeSnippetParams {
  snippetId: string;
}

class AnalyzeSnippetTool extends BaseToolHandler implements BaseToolDefinition<AnalyzeSnippetParams> {
  name = "analyzeSnippet";
  description = "Analyze a snippet's code for quality, security issues, performance problems, and best practices. Returns a detailed analysis report with scores and recommendations.";

  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet to analyze"),
  });

  async execute(params: AnalyzeSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/snippets/${params.snippetId}/analyze`, {});
      return jsonResponse(result, `✅ Analysis complete for snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to analyze snippet");
    }
  }
}

export const analyzeSnippetTool = new AnalyzeSnippetTool();
