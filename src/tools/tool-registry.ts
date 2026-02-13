/**
 * Tool Registry
 *
 * Centralized registry for managing all MCP tools.
 * This allows for easy discovery, registration, and management of tools.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BaseToolDefinition } from "./base/base-tool.interface.js";
import { logger } from "../core/logger.js";
import { AppError } from "../core/errors.js";

// Import tools by category
import * as SnippetTools from "./snippets/index.js";
// import * as ProjectTools from "./projects/index.js"; // COMMENTED OUT FOR NOW
import * as CollectionTools from "./collections/index.js";
import * as RepositoryTools from "./repositories/index.js";
import * as DocumentationTools from "./documentations/index.js";
import * as MarkdownTools from "./markdown/index.js";
import * as CodeSnippetTools from "./code-snippets/index.js";
import * as PersonalTools from "./personal/index.js";
import * as ArchiveTools from "./archive/index.js";
import * as AnalyticsTools from "./analytics/index.js";
import * as ExploreTools from "./explore/index.js";
import * as AccountTools from "./accounts/index.js";
// import * as CompanyTools from "./companies/index.js"; // COMMENTED OUT FOR NOW
import * as TeamTools from "./teams/index.js";
import * as RepositoryAnalysisTools from "./repository-analysis/index.js";
import * as WellnessTools from "./wellness/index.js";
import * as SearchTools from "./search/index.js";
import * as DashboardTools from "./dashboard/index.js";
import * as UserTools from "./user/index.js";
import * as CodeAnalysisTools from "./code-analysis/index.js";
import * as NotificationTools from "./notifications/index.js";
import * as QuestionTools from "./questions/index.js";
import * as LeaderboardTools from "./leaderboards/index.js";
import * as GithubTools from "./github/index.js";
import * as ContentTools from "./content/index.js";
import * as FeedTools from "./feed/index.js";
import * as DiagnosticsTools from "./diagnostics/index.js";
import { registerSessionTools } from "./session-tools.js";
import { getClientInfoTool } from "./client-info-tool.js";
import { CONSOLIDATED_TOOLS, SINGLE_TOOLS } from "./consolidated-tool-registry.js";

/**
 * Registry of all available tools
 * Organized by category for better management
 */
const TOOLS: BaseToolDefinition[] = [
  // Snippets (19 tools)
  SnippetTools.listSnippetsTool,
  SnippetTools.getSnippetTool,
  SnippetTools.createSnippetTool,
  SnippetTools.updateSnippetTool,
  SnippetTools.toggleFavoriteSnippetTool,
  SnippetTools.archiveSnippetTool,
  SnippetTools.getRecentSnippetsTool,
  SnippetTools.getRecentlyViewedSnippetsTool,
  SnippetTools.getTrendingSnippetsTool,
  SnippetTools.getPublicSnippetsTool,
  SnippetTools.getArchivedSnippetsTool,
  SnippetTools.deleteSnippetTool,
  SnippetTools.unarchiveSnippetTool,
  SnippetTools.trashSnippetTool,
  SnippetTools.restoreSnippetTool,
  SnippetTools.getSnippetCountTool,
  SnippetTools.analyzeSnippetTool,
  SnippetTools.getSnippetAnnotationsTool,
  SnippetTools.createAnnotationTool,

  // Projects (5 tools) - COMMENTED OUT FOR NOW
  // ProjectTools.listProjectsTool,
  // ProjectTools.getProjectTool,
  // ProjectTools.createProjectTool,
  // ProjectTools.updateProjectTool,
  // ProjectTools.getProjectSnippetsTool,

  // Collections (8 tools)
  CollectionTools.listCollectionsTool,
  CollectionTools.createCollectionTool,
  CollectionTools.getCollectionTool,
  CollectionTools.updateCollectionTool,
  CollectionTools.deleteCollectionTool,
  CollectionTools.listCollectionSnippetsTool,
  CollectionTools.addSnippetToCollectionTool,
  CollectionTools.removeSnippetFromCollectionTool,

  // Repositories (34 tools)
  RepositoryTools.listRepositoriesTool,
  RepositoryTools.getRepositoryTool,
  RepositoryTools.createRepositoryTool,
  RepositoryTools.updateRepositoryTool,
  // Repository Rules (5 tools)
  RepositoryTools.RepositoryRulesTools.listRepositoryRulesTool,
  RepositoryTools.RepositoryRulesTools.createRepositoryRuleTool,
  RepositoryTools.RepositoryRulesTools.getRepositoryRuleTool,
  RepositoryTools.RepositoryRulesTools.updateRepositoryRuleTool,
  RepositoryTools.RepositoryRulesTools.setupMcpGuidanceRulesTool,
  // Repository Prompts (4 tools)
  RepositoryTools.RepositoryPromptsTools.listRepositoryPromptsTool,
  RepositoryTools.RepositoryPromptsTools.createRepositoryPromptTool,
  RepositoryTools.RepositoryPromptsTools.getRepositoryPromptTool,
  RepositoryTools.RepositoryPromptsTools.updateRepositoryPromptTool,
  // Repository PR Rules (4 tools)
  RepositoryTools.RepositoryPrRulesTools.listRepositoryPrRulesTool,
  RepositoryTools.RepositoryPrRulesTools.createRepositoryPrRuleTool,
  RepositoryTools.RepositoryPrRulesTools.getRepositoryPrRuleTool,
  RepositoryTools.RepositoryPrRulesTools.updateRepositoryPrRuleTool,
  // Repository Files (5 tools)
  RepositoryTools.RepositoryFilesTools.listRepositoryFilesTool,
  RepositoryTools.RepositoryFilesTools.createRepositoryFileTool,
  RepositoryTools.RepositoryFilesTools.getRepositoryFileTool,
  RepositoryTools.RepositoryFilesTools.updateRepositoryFileTool,
  RepositoryTools.RepositoryFilesTools.deleteRepositoryFileTool,
  // Repository Permissions (3 tools)
  RepositoryTools.RepositoryPermissionsTools.getRepositoryPermissionsTool,
  RepositoryTools.RepositoryPermissionsTools.grantRepositoryPermissionTool,
  RepositoryTools.RepositoryPermissionsTools.revokeRepositoryPermissionTool,
  // Repository Links (1 tool)
  RepositoryTools.RepositoryLinksTools.getRepositoryLinksTool,
  // Repository Analysis (1 tool)
  RepositoryTools.RepositoryAnalysisTools.getRepositoryAnalysisTool,
  // Repository Feedback (7 tools)
  RepositoryTools.RepositoryFeedbackTools.listRepositoryFeedbackTool,
  RepositoryTools.RepositoryFeedbackTools.getRepositoryFeedbackStatsTool,
  RepositoryTools.RepositoryFeedbackTools.createRepositoryFeedbackTool,
  RepositoryTools.RepositoryFeedbackTools.getRepositoryFeedbackTool,
  RepositoryTools.RepositoryFeedbackTools
    .getRepositoryFeedbackNotificationsTool,
  RepositoryTools.RepositoryFeedbackTools
    .listRepositoryFeedbackSavedFiltersTool,
  RepositoryTools.RepositoryFeedbackTools
    .createRepositoryFeedbackSavedFilterTool,
  // Repository Errors (5 tools)
  RepositoryTools.RepositoryErrorsTools.listRepositoryErrorsTool,
  RepositoryTools.RepositoryErrorsTools.createRepositoryErrorTool,
  RepositoryTools.RepositoryErrorsTools.getRepositoryErrorTool,
  RepositoryTools.RepositoryErrorsTools.updateRepositoryErrorTool,
  RepositoryTools.RepositoryErrorsTools.deleteRepositoryErrorTool,
  // Repository Learnings (5 tools)
  RepositoryTools.RepositoryLearningsTools.listRepositoryLearningsTool,
  RepositoryTools.RepositoryLearningsTools.createRepositoryLearningTool,
  RepositoryTools.RepositoryLearningsTools.getRepositoryLearningTool,
  RepositoryTools.RepositoryLearningsTools.updateRepositoryLearningTool,
  RepositoryTools.RepositoryLearningsTools.deleteRepositoryLearningTool,
  // Repository Patterns (5 tools)
  RepositoryTools.RepositoryPatternsTools.listRepositoryPatternsTool,
  RepositoryTools.RepositoryPatternsTools.createRepositoryPatternTool,
  RepositoryTools.RepositoryPatternsTools.getRepositoryPatternTool,
  RepositoryTools.RepositoryPatternsTools.updateRepositoryPatternTool,
  RepositoryTools.RepositoryPatternsTools.deleteRepositoryPatternTool,
  // // Repository Mermaid Diagrams (5 tools)
  RepositoryTools.RepositoryMermaidTools.listRepositoryMermaidTool,
  RepositoryTools.RepositoryMermaidTools.getRepositoryMermaidTool,
  RepositoryTools.RepositoryMermaidTools.createRepositoryMermaidTool,
  RepositoryTools.RepositoryMermaidTools.updateRepositoryMermaidTool,
  RepositoryTools.RepositoryMermaidTools.deleteRepositoryMermaidTool,
  // Repository Templates (5 tools)
  RepositoryTools.RepositoryTemplatesTools.listRepositoryTemplatesTool,
  RepositoryTools.RepositoryTemplatesTools.createRepositoryTemplateTool,
  RepositoryTools.RepositoryTemplatesTools.getRepositoryTemplateTool,
  RepositoryTools.RepositoryTemplatesTools.updateRepositoryTemplateTool,
  RepositoryTools.RepositoryTemplatesTools.deleteRepositoryTemplateTool,

  // Documentations (5 tools)
  DocumentationTools.listDocumentationsTool,
  DocumentationTools.getDocumentationTool,
  DocumentationTools.createDocumentationTool,
  DocumentationTools.updateDocumentationTool,
  DocumentationTools.getMcpContextTool,

  // Markdown Documents (4 tools)
  MarkdownTools.listMarkdownDocumentsTool,
  MarkdownTools.getMarkdownDocumentTool,
  MarkdownTools.createMarkdownDocumentTool,
  MarkdownTools.updateMarkdownDocumentTool,

  // Code Snippets (4 tools)
  CodeSnippetTools.listCodeSnippetsTool,
  CodeSnippetTools.getCodeSnippetTool,
  CodeSnippetTools.createCodeSnippetTool,
  CodeSnippetTools.getCodeSnippetsByTagsTool,

  // Personal Knowledge (13 tools)
  PersonalTools.listPersonalLinksTool,
  PersonalTools.listPersonalNotesTool,
  PersonalTools.listPersonalFilesTool,
  PersonalTools.searchPersonalKnowledgeTool,
  PersonalTools.createNoteTool,
  PersonalTools.getNoteTool,
  PersonalTools.updateNoteTool,
  PersonalTools.deleteNoteTool,
  PersonalTools.createLinkTool,
  PersonalTools.deleteLinkTool,
  PersonalTools.createFileTool,
  PersonalTools.deleteFileTool,
  PersonalTools.listTagsTool,

  // Archive & Trash (2 tools)
  ArchiveTools.listArchiveTool,
  ArchiveTools.listTrashTool,

  // Analytics (3 tools)
  AnalyticsTools.getActivityTool,
  AnalyticsTools.getAnalyticsTool,
  AnalyticsTools.getPopularItemsTool,

  // Explore (1 tool)
  ExploreTools.explorePublicContentTool,

  // Accounts & Permissions (2 tools)
  AccountTools.getAccountContextTool,
  AccountTools.getAccessibleRepositoriesTool,

  // Companies (4 tools) - COMMENTED OUT FOR NOW
  // CompanyTools.listCompaniesTool,
  // CompanyTools.getCompanyTool,
  // CompanyTools.createCompanyTool,
  // CompanyTools.updateCompanyTool,
  // Company Members (5 tools) - COMMENTED OUT FOR NOW
  // CompanyTools.CompanyMembersTools.listCompanyMembersTool,
  // CompanyTools.CompanyMembersTools.addCompanyMemberTool,
  // CompanyTools.CompanyMembersTools.updateCompanyMemberTool,
  // CompanyTools.CompanyMembersTools.removeCompanyMemberTool,
  // CompanyTools.CompanyMembersTools.inviteCompanyMemberTool,
  // Company Repositories (3 tools) - COMMENTED OUT FOR NOW (depends on CompanyTools)
  // CompanyTools.CompanyRepositoriesTools.listCompanyRepositoriesTool,
  // CompanyTools.CompanyRepositoriesTools.createCompanyRepositoryTool,
  // CompanyTools.CompanyRepositoriesTools.unlinkCompanyRepositoryTool,

  // Teams (3 tools)
  TeamTools.listTeamsTool,
  TeamTools.getTeamMembersTool,
  TeamTools.getTeamProjectsTool,

  // Repository Analysis (5 tools)
  RepositoryAnalysisTools.analyzeAndSaveRepoTool,
  RepositoryAnalysisTools.getRepoContextTool,
  RepositoryAnalysisTools.getCachedRepoAnalysisTool,
  RepositoryAnalysisTools.listCachedRepositoriesTool,
  RepositoryAnalysisTools.listCheckpointsTool,

  // // Generic (1 tool)
  // GenericTools.callExternalApiTool,

  // Client Info (1 tool)
  getClientInfoTool,

  // Wellness (2 tools)
  WellnessTools.breakReminderTool,
  WellnessTools.recordBreakTool,

  // Search (1 tool)
  SearchTools.searchTool,

  // Dashboard (1 tool)
  DashboardTools.getDashboardStatsTool,

  // User (7 tools)
  UserTools.whoAmITool,
  UserTools.getUserProfileTool,
  UserTools.getProfileStatsTool,
  UserTools.getUserPreferencesTool,
  UserTools.updateUserPreferencesTool,
  UserTools.followUserTool,
  UserTools.unfollowUserTool,

  // Code Analysis (1 tool)
  CodeAnalysisTools.analyzeCodeTool,

  // Notifications (3 tools)
  NotificationTools.listNotificationsTool,
  NotificationTools.getUnreadCountTool,
  NotificationTools.markNotificationReadTool,

  // Q&A (7 tools)
  QuestionTools.listQuestionsTool,
  QuestionTools.createQuestionTool,
  QuestionTools.getQuestionTool,
  QuestionTools.listAnswersTool,
  QuestionTools.createAnswerTool,
  QuestionTools.acceptAnswerTool,
  QuestionTools.voteOnQATool,

  // Leaderboards (1 tool)
  LeaderboardTools.getLeaderboardTool,

  // GitHub Integration (4 tools)
  GithubTools.getGithubStatusTool,
  GithubTools.syncGithubTool,
  GithubTools.getGithubSettingsTool,
  GithubTools.importFromGithubTool,

  // Content Interactions (3 tools)
  ContentTools.upvoteContentTool,
  ContentTools.starContentTool,
  ContentTools.addCommentTool,

  // Feed & Recommendations (2 tools)
  FeedTools.getFeedTool,
  FeedTools.getRecommendationsTool,

  // Diagnostics (1 tool)
  DiagnosticsTools.testConnectionTool,
];

/**
 * Register all tools with the MCP server
 *
 * @param server - MCP server instance to register tools with
 */
/**
 * Format error response for consistent error handling
 */
function formatErrorResponse(error: unknown): {
  error: string;
  message: string;
  details?: unknown;
} {
  if (error instanceof AppError) {
    return {
      error: error.name,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.name || "Error",
      message: error.message,
    };
  }

  return {
    error: "UnknownError",
    message: String(error),
  };
}

/**
 * Infer tool annotations from tool name when not explicitly set.
 * Uses naming conventions: list/get/search → readOnly, delete → destructive, etc.
 */
function inferAnnotations(toolName: string): {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
} {
  const name = toolName.toLowerCase();

  // Read-only tools: list, get, search, explore, who, count
  if (/^(list|get|search|explore|who|count)/.test(name) ||
      name.includes("stats") || name.includes("context") || name.includes("status")) {
    return { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
  }

  // Destructive tools: delete, remove, revoke, unlink, trash
  if (/^(delete|remove|revoke|unlink|trash)/.test(name)) {
    return { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true };
  }

  // Update/patch tools: idempotent writes
  if (/^(update|mark|accept|setup)/.test(name)) {
    return { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true };
  }

  // Toggle/archive/restore: idempotent state changes
  if (/^(toggle|archive|unarchive|restore|follow|unfollow|star|upvote)/.test(name)) {
    return { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true };
  }

  // Create tools: not idempotent (each call creates a new item)
  if (/^(create|add|import|sync|analyze|vote|record)/.test(name)) {
    return { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
  }

  // Diagnostics: read-only
  if (name === "testconnection" || name === "getclientinfo" || name === "breakreminder") {
    return { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
  }

  // Default: write, non-destructive, external
  return { readOnlyHint: false, destructiveHint: false, openWorldHint: true };
}

export function registerAllTools(server: McpServer): void {
  // Choose tool set based on feature flag
  const useConsolidated = process.env.USE_CONSOLIDATED_TOOLS === "true";
  const toolsToRegister = useConsolidated
    ? [...CONSOLIDATED_TOOLS, ...SINGLE_TOOLS]
    : TOOLS;

  logger.info(`Registering ${toolsToRegister.length} tools (consolidated: ${useConsolidated})`);

  // Register tools from registry with consistent error handling
  for (const tool of toolsToRegister) {
    try {
      // Extract the shape from ZodObject to get ZodRawShape
      const schema = tool.paramsSchema as z.ZodObject<z.ZodRawShape>;
      // Use explicit annotations if provided, otherwise infer from tool name
      const annotations = tool.annotations ?? inferAnnotations(tool.name);
      server.tool(tool.name, tool.description, schema.shape, annotations, async (params) => {
        try {
          return await tool.execute(params);
        } catch (error) {
          logger.error(`Tool ${tool.name} failed`, {
            error,
            toolName: tool.name,
            params: params ? JSON.stringify(params).substring(0, 200) : undefined,
          });
          
          // Format error response for consistent error handling
          const errorResponse = formatErrorResponse(error);
          throw new AppError(
            `Tool execution failed: ${errorResponse.message}`,
            errorResponse.error,
            500, // statusCode
            errorResponse.details
          );
        }
      });
    } catch (error) {
      logger.error(`Failed to register tool: ${tool.name}`, error);
      throw error;
    }
  }

  // Register session management tools
  registerSessionTools(server);
}

/**
 * Get all registered tool names
 */
export function getToolNames(): string[] {
  return TOOLS.map((tool) => tool.name);
}

/**
 * Get tool by name
 */
export function getTool(name: string): BaseToolDefinition | undefined {
  return TOOLS.find((tool) => tool.name === name);
}

/**
 * Get all tools
 */
export function getAllTools(): BaseToolDefinition[] {
  return [...TOOLS];
}
