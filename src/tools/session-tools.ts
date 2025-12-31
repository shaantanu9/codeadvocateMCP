/**
 * Session Management Tools
 *
 * MCP tools for managing session data and cache
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getCurrentSessionId,
  getCurrentWorkspace,
  getSessionData,
  setSessionData,
  getCache,
  setCache,
  getAllSessionData,
  clearSessionData,
} from "../core/session-helpers.js";

/**
 * Register session management tools
 */
export function registerSessionTools(server: McpServer): void {
  // Tool to get current workspace info
  server.tool(
    "getWorkspaceInfo",
    "Get information about the current workspace/folder where the chat is open",
    {},
    async () => {
      const workspace = getCurrentWorkspace();
      if (!workspace) {
        return {
          content: [
            {
              type: "text",
              text: "No workspace detected. The workspace path could not be determined from the MCP client.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `📁 **Workspace Information:**

- **Path:** ${workspace.workspacePath}
- **Name:** ${workspace.workspaceName}
${workspace.projectType ? `- **Project Type:** ${workspace.projectType}` : ""}
${
  workspace.packageManager
    ? `- **Package Manager:** ${workspace.packageManager}`
    : ""
}
${
  workspace.hasGit
    ? `- **Git:** ✅ (Branch: ${workspace.gitBranch || "unknown"})`
    : "- **Git:** ❌"
}`,
          },
        ],
      };
    }
  );

  // Tool to get current session ID
  server.tool(
    "getSessionId",
    "Get the current chat session ID",
    {},
    async () => {
      const sessionId = getCurrentSessionId();
      if (!sessionId) {
        return {
          content: [
            {
              type: "text",
              text: "No active session found.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Session ID: \`${sessionId}\``,
          },
        ],
      };
    }
  );

  // Tool to set session data
  server.tool(
    "setSessionData",
    "Store data in the current chat session (persists across tool calls)",
    {
      key: z.string().describe("The key to store the data under"),
      value: z
        .union([z.string(), z.number(), z.boolean(), z.record(z.unknown())])
        .describe("The value to store (string, number, boolean, or object)"),
    },
    async ({ key, value }) => {
      const success = setSessionData(key, value);
      if (!success) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Failed to set session data. No active session found.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Stored data under key: \`${key}\``,
          },
        ],
      };
    }
  );

  // Tool to get session data
  server.tool(
    "getSessionData",
    "Retrieve data from the current chat session",
    {
      key: z.string().describe("The key to retrieve data for"),
    },
    async ({ key }) => {
      const value = getSessionData(key);
      if (value === null) {
        return {
          content: [
            {
              type: "text",
              text: `No data found for key: \`${key}\``,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `**Key:** \`${key}\`\n**Value:**\n\`\`\`json\n${JSON.stringify(
              value,
              null,
              2
            )}\n\`\`\``,
          },
        ],
      };
    }
  );

  // Tool to get all session data
  server.tool(
    "getAllSessionData",
    "Get all data stored in the current chat session",
    {},
    async () => {
      const data = getAllSessionData();
      if (!data || Object.keys(data).length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No session data stored.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `**All Session Data:**\n\`\`\`json\n${JSON.stringify(
              data,
              null,
              2
            )}\n\`\`\``,
          },
        ],
      };
    }
  );

  // Tool to clear session data
  server.tool(
    "clearSessionData",
    "Clear all data from the current chat session",
    {},
    async () => {
      const success = clearSessionData();
      if (!success) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Failed to clear session data. No active session found.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "✅ Session data cleared.",
          },
        ],
      };
    }
  );

  // Tool to set cache
  server.tool(
    "setCache",
    "Store data in cache (workspace-aware, expires after TTL)",
    {
      key: z.string().describe("The cache key"),
      value: z
        .union([z.string(), z.number(), z.boolean(), z.record(z.unknown())])
        .describe("The value to cache"),
      ttlSeconds: z
        .number()
        .optional()
        .default(300)
        .describe("Time to live in seconds (default: 300)"),
    },
    async ({ key, value, ttlSeconds }) => {
      const success = setCache(key, value, ttlSeconds);
      if (!success) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Failed to set cache. No active session found.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Cached data under key: \`${key}\` (TTL: ${ttlSeconds}s)`,
          },
        ],
      };
    }
  );

  // Tool to get cache
  server.tool(
    "getCache",
    "Retrieve data from cache (workspace-aware)",
    {
      key: z.string().describe("The cache key"),
    },
    async ({ key }) => {
      const value = getCache(key);
      if (value === null) {
        return {
          content: [
            {
              type: "text",
              text: `No cache entry found for key: \`${key}\` (may have expired)`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `**Key:** \`${key}\`\n**Value:**\n\`\`\`json\n${JSON.stringify(
              value,
              null,
              2
            )}\n\`\`\``,
          },
        ],
      };
    }
  );
}



