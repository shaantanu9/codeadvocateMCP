/**
 * MCP Prompts Registration
 *
 * Prompts are reusable conversation templates that appear in the MCP client UI.
 * They standardize common workflows so developers can trigger them with one click.
 *
 * SDK signature: server.prompt(name, description, argsSchema, callback)
 * - argsSchema values must be z.string() or z.string().optional()
 * - callback receives (args, extra) where args has the parsed string values
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createExternalApiService } from "../application/services/external-api.service.js";
import { logger } from "../core/logger.js";

/**
 * Register all MCP prompts with the server
 */
export function registerPrompts(server: McpServer): void {
  // 1. Review a code snippet
  server.prompt(
    "review-code",
    "Analyze a code snippet for bugs, style issues, and improvements",
    { snippetId: z.string() },
    async ({ snippetId }) => {
      try {
        const api = createExternalApiService();
        const snippet = await api.get<{
          title?: string;
          language?: string;
          code?: string;
          description?: string;
        }>(`/api/snippets/${snippetId}`);

        const lang = snippet.language || "text";
        const title = snippet.title || "Untitled";

        return {
          messages: [{
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                `Review this ${lang} code snippet titled "${title}":`,
                "",
                `\`\`\`${lang}`,
                snippet.code || "",
                "```",
                "",
                snippet.description ? `Context: ${snippet.description}` : "",
                "",
                "Please provide:",
                "1. **Bugs & Risks** — potential issues or edge cases",
                "2. **Style & Readability** — improvements to make the code cleaner",
                "3. **Performance** — any optimization opportunities",
                "4. **Security** — potential vulnerabilities",
              ].filter(Boolean).join("\n"),
            },
          }],
        };
      } catch {
        return {
          messages: [{
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Review the code snippet with ID "${snippetId}". Use the getSnippet tool to fetch it first, then analyze for bugs, style, performance, and security.`,
            },
          }],
        };
      }
    }
  );

  // 2. Document a repository
  server.prompt(
    "document-repo",
    "Generate comprehensive documentation for a repository based on its context, patterns, and rules",
    { repositoryId: z.string() },
    async ({ repositoryId }) => {
      try {
        const api = createExternalApiService();
        const context = await api.get(`/api/repositories/${repositoryId}/mcp-context`);

        return {
          messages: [{
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                "Based on this repository context, generate comprehensive documentation:",
                "",
                "```json",
                JSON.stringify(context, null, 2),
                "```",
                "",
                "Include these sections:",
                "1. **Overview** — what this project does",
                "2. **Architecture** — how it's structured",
                "3. **Key Patterns** — coding patterns used",
                "4. **Setup Guide** — how to get started",
                "5. **API Reference** — key endpoints/functions",
              ].join("\n"),
            },
          }],
        };
      } catch {
        return {
          messages: [{
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Document repository ${repositoryId}. Use getMcpContext or getRepository to fetch its details first, then generate comprehensive documentation.`,
            },
          }],
        };
      }
    }
  );

  // 3. Save a learning
  server.prompt(
    "save-learning",
    "Capture and formalize something you just learned into the knowledge base",
    {
      topic: z.string(),
      repositoryId: z.string().optional(),
    },
    async ({ topic, repositoryId }) => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            `I just learned something about: "${topic}"`,
            "",
            "Help me formalize this as a structured learning. Ask me clarifying questions about:",
            "- What exactly happened or what I discovered",
            "- Why it matters or what problem it solves",
            "- How to apply this knowledge in the future",
            "",
            `Then use createRepositoryLearning to save it${repositoryId ? ` to repository ${repositoryId}` : " (ask me which repository if needed)"}.`,
          ].join("\n"),
        },
      }],
    })
  );

  // 4. Debug a repository error
  server.prompt(
    "debug-error",
    "Investigate and help resolve a tracked repository error",
    {
      repositoryId: z.string(),
      errorId: z.string().optional(),
    },
    async ({ repositoryId, errorId }) => {
      if (errorId) {
        try {
          const api = createExternalApiService();
          const error = await api.get(`/api/repositories/${repositoryId}/errors/${errorId}`);

          return {
            messages: [{
              role: "user" as const,
              content: {
                type: "text" as const,
                text: [
                  "Help me debug this tracked error:",
                  "",
                  "```json",
                  JSON.stringify(error, null, 2),
                  "```",
                  "",
                  "Please:",
                  "1. Analyze the root cause",
                  "2. Suggest a fix with code",
                  "3. Explain how to prevent it in the future",
                  "4. If resolved, use updateRepositoryError to mark it as fixed",
                ].join("\n"),
              },
            }],
          };
        } catch {
          // Fall through to generic prompt
        }
      }

      return {
        messages: [{
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Help me debug errors in repository ${repositoryId}.`,
              "",
              errorId
                ? `Fetch error ${errorId} using getRepositoryError and analyze it.`
                : "First, use listRepositoryErrors to see recent errors, then help me investigate the most critical one.",
            ].join("\n"),
          },
        }],
      };
    }
  );

  // 5. Weekly summary (no args)
  server.prompt(
    "weekly-summary",
    "Generate a summary of your coding activity and accomplishments this week",
    async () => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            "Generate my weekly coding summary. Use these tools to gather data:",
            "",
            "1. **whoAmI** — get my profile",
            "2. **getActivity** — get my recent activity",
            "3. **getRecentSnippets** — snippets I created/edited recently",
            "4. **getDashboardStats** — overall stats",
            "5. **listNotifications** — recent notifications",
            "",
            "Then create a summary covering:",
            "- Snippets created/updated",
            "- Key learnings captured",
            "- Repositories worked on",
            "- Activity trends",
            "- Suggestions for next week",
          ].join("\n"),
        },
      }],
    })
  );

  logger.info("Registered 5 MCP prompts");
}
