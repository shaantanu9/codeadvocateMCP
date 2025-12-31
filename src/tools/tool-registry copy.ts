/**
 * Tool Registry
 *
 * Centralized registry for managing all MCP tools.
 * This allows for easy discovery, registration, and management of tools.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BaseToolDefinition } from "./base/base-tool.interface.js";

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
import * as GenericTools from "./generic/index.js";
import * as WellnessTools from "./wellness/index.js";
import { registerSessionTools } from "./session-tools.js";
import { getClientInfoTool } from "./client-info-tool.js";

/**
 * Registry of all available tools
 * Organized by category for better management
 */
const TOOLS: BaseToolDefinition[] = [
  // Snippets (11 tools)
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
  // Repository Mermaid Diagrams (5 tools)
  RepositoryTools.RepositoryMermaidTools.listRepositoryMermaidTool,
  RepositoryTools.RepositoryMermaidTools.getRepositoryMermaidTool,
  RepositoryTools.RepositoryMermaidTools.createRepositoryMermaidTool,
  RepositoryTools.RepositoryMermaidTools.updateRepositoryMermaidTool,
  RepositoryTools.RepositoryMermaidTools.deleteRepositoryMermaidTool,

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

  // Personal Knowledge (4 tools)
  PersonalTools.listPersonalLinksTool,
  PersonalTools.listPersonalNotesTool,
  PersonalTools.listPersonalFilesTool,
  PersonalTools.searchPersonalKnowledgeTool,

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

  // Generic (1 tool)
  GenericTools.callExternalApiTool,

  // Client Info (1 tool)
  getClientInfoTool,

  // Wellness (2 tools)
  WellnessTools.breakReminderTool,
  WellnessTools.recordBreakTool,
];

/**
 * Register all tools with the MCP server
 *
 * @param server - MCP server instance to register tools with
 */
export function registerAllTools(server: McpServer): void {
  // Register tools from registry
  for (const tool of TOOLS) {
    try {
      // Extract the shape from ZodObject to get ZodRawShape
      const schema = tool.paramsSchema as z.ZodObject<z.ZodRawShape>;
      server.tool(tool.name, tool.description, schema.shape, async (params) => {
        return await tool.execute(params);
      });
    } catch (error) {
      console.error(`Failed to register tool: ${tool.name}`, error);
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
