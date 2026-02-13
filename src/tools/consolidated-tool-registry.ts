/**
 * Consolidated Tool Registry
 *
 * Registry for consolidated tools that combine multiple actions into single tools.
 * Each tool uses an `action` parameter to route to specific operations.
 *
 * Enable via USE_CONSOLIDATED_TOOLS=true environment variable.
 */

import type { BaseToolDefinition } from "./base/base-tool.interface.js";
import * as ConsolidatedTools from "./consolidated/index.js";

// Single-tool categories that don't need consolidation (kept as-is)
import * as ExploreTools from "./explore/index.js";
import * as SearchTools from "./search/index.js";
import * as DashboardTools from "./dashboard/index.js";
import * as CodeAnalysisTools from "./code-analysis/index.js";
import * as LeaderboardTools from "./leaderboards/index.js";
import * as DiagnosticsTools from "./diagnostics/index.js";
import * as RepositoryTools from "./repositories/index.js";
import { getClientInfoTool } from "./client-info-tool.js";

/**
 * All 30 consolidated tools
 */
export const CONSOLIDATED_TOOLS: BaseToolDefinition[] = [
  ConsolidatedTools.snippetsTool,
  ConsolidatedTools.collectionsTool,
  ConsolidatedTools.repositoriesTool,
  ConsolidatedTools.repositoryRulesTool,
  ConsolidatedTools.repositoryPromptsTool,
  ConsolidatedTools.repositoryPrRulesTool,
  ConsolidatedTools.repositoryFilesTool,
  ConsolidatedTools.repositoryPermissionsTool,
  ConsolidatedTools.repositoryFeedbackTool,
  ConsolidatedTools.repositoryErrorsTool,
  ConsolidatedTools.repositoryLearningsTool,
  ConsolidatedTools.repositoryPatternsTool,
  ConsolidatedTools.repositoryMermaidTool,
  ConsolidatedTools.repositoryTemplatesTool,
  ConsolidatedTools.documentationsTool,
  ConsolidatedTools.markdownTool,
  ConsolidatedTools.codeSnippetsTool,
  ConsolidatedTools.personalTool,
  ConsolidatedTools.archiveTool,
  ConsolidatedTools.analyticsTool,
  ConsolidatedTools.accountsTool,
  ConsolidatedTools.teamsTool,
  ConsolidatedTools.repoAnalysisTool,
  ConsolidatedTools.wellnessTool,
  ConsolidatedTools.userTool,
  ConsolidatedTools.notificationsTool,
  ConsolidatedTools.questionsTool,
  ConsolidatedTools.githubTool,
  ConsolidatedTools.contentTool,
  ConsolidatedTools.feedTool,
];

/**
 * Single-tool categories that stay unchanged (9 tools)
 */
export const SINGLE_TOOLS: BaseToolDefinition[] = [
  ExploreTools.explorePublicContentTool,
  SearchTools.searchTool,
  DashboardTools.getDashboardStatsTool,
  CodeAnalysisTools.analyzeCodeTool,
  LeaderboardTools.getLeaderboardTool,
  DiagnosticsTools.testConnectionTool,
  getClientInfoTool,
  RepositoryTools.RepositoryLinksTools.getRepositoryLinksTool,
  RepositoryTools.RepositoryAnalysisTools.getRepositoryAnalysisTool,
];
