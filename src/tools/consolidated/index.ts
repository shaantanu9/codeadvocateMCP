/**
 * Consolidated Tools Index
 *
 * Exports all consolidated tools that combine multiple actions into single tools.
 * Each consolidated tool uses an `action` parameter to route operations.
 *
 * Usage: Enable via USE_CONSOLIDATED_TOOLS=true environment variable.
 * This reduces ~152 individual tools down to ~30 consolidated tools.
 */

export { snippetsTool } from "./snippets.tool.js";
export { collectionsTool } from "./collections.tool.js";
export { repositoriesTool } from "./repositories.tool.js";
export { repositoryRulesTool } from "./repository-rules.tool.js";
export { repositoryPromptsTool } from "./repository-prompts.tool.js";
export { repositoryPrRulesTool } from "./repository-pr-rules.tool.js";
export { repositoryFilesTool } from "./repository-files.tool.js";
export { repositoryPermissionsTool } from "./repository-permissions.tool.js";
export { repositoryFeedbackTool } from "./repository-feedback.tool.js";
export { repositoryErrorsTool } from "./repository-errors.tool.js";
export { repositoryLearningsTool } from "./repository-learnings.tool.js";
export { repositoryPatternsTool } from "./repository-patterns.tool.js";
export { repositoryMermaidTool } from "./repository-mermaid.tool.js";
export { repositoryTemplatesTool } from "./repository-templates.tool.js";
export { documentationsTool } from "./documentations.tool.js";
export { markdownTool } from "./markdown.tool.js";
export { codeSnippetsTool } from "./code-snippets.tool.js";
export { personalTool } from "./personal.tool.js";
export { archiveTool } from "./archive.tool.js";
export { analyticsTool } from "./analytics.tool.js";
export { accountsTool } from "./accounts.tool.js";
export { teamsTool } from "./teams.tool.js";
export { repoAnalysisTool } from "./repo-analysis.tool.js";
export { wellnessTool } from "./wellness.tool.js";
export { userTool } from "./user.tool.js";
export { notificationsTool } from "./notifications.tool.js";
export { questionsTool } from "./questions.tool.js";
export { githubTool } from "./github.tool.js";
export { contentTool } from "./content.tool.js";
export { feedTool } from "./feed.tool.js";
