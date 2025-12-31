/**
 * Setup MCP Guidance Rules Tool
 * 
 * Creates default repository rules that help guide MCP when it's installed.
 * These rules provide context about the repository structure, conventions, and best practices.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { logger } from "../../../core/logger.js";
import { detectRepositoryId } from "../../../core/repository-detector.js";
import { createExternalApiService } from "../../../application/services/external-api.service.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";
import type { ExternalApiService } from "../../../application/services/external-api.service.js";

export interface SetupMcpGuidanceRulesParams {
  repositoryId?: string;
  overwrite?: boolean;
}

/**
 * Default MCP guidance rules to create
 */
const DEFAULT_MCP_RULES = [
  {
    title: "MCP Tool Usage - Repository ID Auto-Detection",
    ruleContent: `When using MCP tools, the repositoryId parameter is optional. The MCP will automatically detect the repository ID from:
1. Local cache (if repository was previously analyzed)
2. Git remote URL (searches API by remote URL)
3. Workspace name (searches API by repository name)

Always prefer auto-detection unless you need to target a specific repository. The cache is stored in .cache/repository-analysis/ and persists across sessions.`,
    ruleType: "documentation",
    severity: "info",
  },
  {
    title: "MCP Architecture - Stateless Design Pattern",
    ruleContent: `This MCP server uses a stateless architecture:
- Each request creates a new server and transport instance
- No session management or connection pooling
- Suitable for HTTP-based deployments
- Prevents request ID collisions

When implementing new tools, ensure they don't rely on shared state between requests. All state should be stored in cache or external API.`,
    ruleType: "architecture",
    severity: "info",
  },
  {
    title: "MCP Tool Structure - BaseToolHandler Pattern",
    ruleContent: `All MCP tools should extend BaseToolHandler which provides:
- Automatic API service initialization
- Consistent error handling
- Tool execution logging
- Repository ID auto-detection via resolveRepositoryId()

Tool structure:
1. Extend BaseToolHandler
2. Define paramsSchema with Zod
3. Implement execute() method
4. Use getApiService() for API calls
5. Use handleError() for error responses
6. Use logStart() and logSuccess() for logging`,
    ruleType: "coding_standard",
    severity: "info",
  },
  {
    title: "MCP Error Handling - Consistent Error Responses",
    ruleContent: `All tools should use consistent error handling:
- Use handleError() from BaseToolHandler
- Errors are logged to logs/tool-calls-failed/
- Tool call logger tracks success/failure rates
- ExternalApiError provides detailed API error context

Error responses follow format:
{
  "content": [{
    "type": "text",
    "text": "❌ Error: [error message]"
  }]
}`,
    ruleType: "coding_standard",
    severity: "warning",
  },
  {
    title: "MCP API Integration - Field Mapping and Validation",
    ruleContent: `When creating API tools, be aware of field mappings:
- User-friendly values (e.g., "code-quality") map to API enums (e.g., "coding_standard")
- PR rules use "priority" not "severity"
- Prompts use "prompt_text" not "prompt_content"

Always validate enum values using Zod schemas. Use mapping functions to convert user-friendly input to API-compatible values.`,
    ruleType: "coding_standard",
    severity: "warning",
  },
  {
    title: "MCP Cache System - Repository Analysis Cache",
    ruleContent: `The repository cache system stores analyzed repository data:
- Location: .cache/repository-analysis/{hash}.json
- Cache key: Based on repository path and commit hash
- Persists across MCP sessions
- Contains: repositoryId, projectId, structure, documentation, metadata

Tools should check cache before making API calls when possible. Use repositoryCache.load() to retrieve cached data.`,
    ruleType: "architecture",
    severity: "info",
  },
  {
    title: "MCP Logging - Structured Logging Pattern",
    ruleContent: `All tools use structured logging:
- logger.debug() for detailed debugging info
- logger.info() for important events
- logger.warn() for warnings
- logger.error() for errors

Tool calls are logged to:
- logs/tool-calls/tool-calls-{date}.log (successful)
- logs/tool-calls-failed/tool-calls-{date}.log (failed)

Include context in logs: tool name, params, execution time, error details.`,
    ruleType: "coding_standard",
    severity: "info",
  },
  {
    title: "MCP File Organization - Layer Separation",
    ruleContent: `Code is organized in clear layers:
- src/server/ - HTTP server layer (Express)
- src/mcp/ - MCP protocol layer
- src/tools/ - MCP tool definitions
- src/application/ - Business logic services
- src/core/ - Core utilities (logger, errors, cache)
- src/infrastructure/ - Infrastructure (HTTP client)

Follow single responsibility principle. Each layer has a clear purpose.`,
    ruleType: "architecture",
    severity: "info",
  },
  {
    title: "MCP Type Safety - Zod Schema Validation",
    ruleContent: `All tool parameters must use Zod schemas:
- Define paramsSchema with z.object()
- Use z.enum() for enum values
- Use z.string(), z.number(), etc. for types
- Add .describe() for documentation
- Use .optional() for optional params

Example:
paramsSchema = z.object({
  repositoryId: z.string().describe("Repository ID"),
  ruleType: z.enum(["coding_standard", "testing"]).optional()
})`,
    ruleType: "coding_standard",
    severity: "error",
  },
  {
    title: "MCP Testing - Tool Testing Best Practices",
    ruleContent: `When testing MCP tools:
- Use test fixtures for API responses
- Mock external API service
- Test error handling paths
- Test parameter validation
- Test auto-detection logic

Test files should be in same directory as tool with .test.ts suffix.`,
    ruleType: "testing",
    severity: "info",
  },
];

/**
 * Map user-friendly rule type to API enum value
 */
function mapRuleType(userType: string | undefined): string {
  if (!userType) return "other";

  const mapping: Record<string, string> = {
    "code-quality": "coding_standard",
    testing: "testing",
    documentation: "documentation",
    security: "security",
    performance: "performance",
    architecture: "architecture",
    naming: "naming_convention",
    git: "git_workflow",
    coding_standard: "coding_standard",
    naming_convention: "naming_convention",
    git_workflow: "git_workflow",
  };

  return mapping[userType.toLowerCase()] || "other";
}

class SetupMcpGuidanceRulesTool
  extends BaseToolHandler
  implements BaseToolDefinition<SetupMcpGuidanceRulesParams>
{
  name = "setupMcpGuidanceRules";
  description =
    "Set up default MCP guidance rules for a repository. These rules help guide MCP when it's installed by providing context about repository structure, conventions, and best practices.";

  paramsSchema = z.object({
    repositoryId: z
      .string()
      .optional()
      .describe(
        "Repository ID. If not provided, will be auto-detected from workspace."
      ),
    overwrite: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "If true, overwrites existing rules with same titles. Default: false"
      ),
  });

  async execute(
    params: SetupMcpGuidanceRulesParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, {
      ...params,
    } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();

      // Auto-detect repository ID if not provided
      let repositoryId = params.repositoryId;
      if (!repositoryId) {
        repositoryId = await detectRepositoryId(apiService);
        if (!repositoryId) {
          throw new Error(
            "Repository ID could not be determined. Please provide 'repositoryId' or ensure the tool is run within a recognized Git repository."
          );
        }
      }

      logger.info(`Setting up MCP guidance rules for repository: ${repositoryId}`);

      const results: Array<{
        title: string;
        success: boolean;
        message: string;
        ruleId?: string;
      }> = [];

      // Check existing rules if overwrite is false
      let existingRules: Array<{ id: string; title: string }> = [];
      if (!params.overwrite) {
        try {
          const existing = await apiService.get(
            `/api/repositories/${repositoryId}/rules`
          );
          const rulesArray = Array.isArray(existing)
            ? existing
            : existing && typeof existing === "object" && "rules" in existing
            ? (existing as { rules: unknown[] }).rules
            : existing && typeof existing === "object" && "data" in existing
            ? (existing as { data: unknown[] }).data
            : [];

          existingRules = rulesArray
            .filter(
              (r: unknown): r is { id: string; title: string } =>
                r !== null &&
                typeof r === "object" &&
                "id" in r &&
                "title" in r &&
                typeof (r as { id: unknown }).id === "string" &&
                typeof (r as { title: unknown }).title === "string"
            )
            .map((r) => ({
              id: r.id,
              title: r.title,
            }));
        } catch (error) {
          logger.debug("Could not fetch existing rules, will create all", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Create each rule
      for (const rule of DEFAULT_MCP_RULES) {
        try {
          // Check if rule already exists
          const existingRule = existingRules.find(
            (r) => r.title === rule.title
          );

          if (existingRule && !params.overwrite) {
            results.push({
              title: rule.title,
              success: false,
              message: `Rule already exists (ID: ${existingRule.id}). Use overwrite=true to replace.`,
            });
            continue;
          }

          // If overwriting, delete existing rule first
          if (existingRule && params.overwrite) {
            try {
              await apiService.delete(
                `/api/repositories/${repositoryId}/rules/${existingRule.id}`
              );
              logger.debug(`Deleted existing rule: ${rule.title}`);
            } catch (error) {
              logger.warn(`Failed to delete existing rule before overwrite`, {
                ruleId: existingRule.id,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          // Create the rule
          const body: Record<string, unknown> = {
            title: rule.title,
            rule_content: rule.ruleContent,
            rule_type: mapRuleType(rule.ruleType),
            severity: rule.severity,
          };

          const result = await apiService.post(
            `/api/repositories/${repositoryId}/rules`,
            body
          );

          const ruleId =
            result && typeof result === "object" && "id" in result
              ? String(result.id)
              : undefined;

          results.push({
            title: rule.title,
            success: true,
            message: existingRule
              ? `Updated existing rule`
              : `Created new rule`,
            ruleId,
          });

          logger.debug(`Created/updated rule: ${rule.title}`, { ruleId });
        } catch (error) {
          logger.error(`Failed to create rule: ${rule.title}`, error);
          results.push({
            title: rule.title,
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Unknown error occurred",
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      this.logSuccess(
        this.name,
        { ...params, repositoryId } as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Setup complete: ${successCount} rules created/updated, ${failureCount} failed`,
        }
      );

      return jsonResponse(
        {
          repositoryId,
          totalRules: DEFAULT_MCP_RULES.length,
          successCount,
          failureCount,
          results,
        },
        `✅ Setup MCP guidance rules: ${successCount} created/updated, ${failureCount} failed`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to setup MCP guidance rules",
        { ...params } as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const setupMcpGuidanceRulesTool = new SetupMcpGuidanceRulesTool();
