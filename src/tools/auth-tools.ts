import { z } from "zod";
import { envConfig } from "../config/env.js";
import { textResponse, jsonResponse } from "../utils/response-formatter.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register authentication testing tools on the MCP server
 */
export function registerAuthTools(server: McpServer): void {
  // Tool: Validate token
  server.tool(
    "validateToken",
    "Validate if a provided token matches the MCP server's authentication token",
    {
      token: z
        .string()
        .describe("The token to validate against the MCP server"),
    },
    async ({ token }) => {
      try {
        console.log("[Tool] validateToken called");

        const isValid = token === envConfig.mcpServerToken;
        const tokenLength = token.length;
        const serverTokenLength = envConfig.mcpServerToken.length;

        // Show first and last few characters for verification (without exposing full token)
        const tokenPreview =
          token.length > 8
            ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
            : "***";

        // Server token preview for logging (not used but kept for potential future use)
        // const serverTokenPreview =
        //   envConfig.mcpServerToken.length > 8
        //     ? `${envConfig.mcpServerToken.substring(0, 4)}...${envConfig.mcpServerToken.substring(
        //         envConfig.mcpServerToken.length - 4
        //       )}`
        //     : "***";

        if (isValid) {
          return textResponse(
            `✅ **Token Validation: SUCCESS**

**Status:** Valid token ✅
**Token Preview:** ${tokenPreview}
**Token Length:** ${tokenLength} characters
**Server Token Length:** ${serverTokenLength} characters

🎉 The provided token matches the MCP server's authentication token!
You can use this token to access the MCP server.`
          );
        } else {
          return textResponse(
            `❌ **Token Validation: FAILED**

**Status:** Invalid token ❌
**Token Preview:** ${tokenPreview}
**Token Length:** ${tokenLength} characters
**Server Token Length:** ${serverTokenLength} characters

⚠️ The provided token does NOT match the MCP server's authentication token.
Please check your token and try again.

**Note:** Make sure you're using the exact token from your .env file's MCP_SERVER_TOKEN.`
          );
        }
      } catch (error) {
        return textResponse(
          `❌ Error validating token: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );

  // Tool: Get token info (without exposing the actual token)
  server.tool(
    "getTokenInfo",
    "Get information about the MCP server's authentication token (without exposing the actual token)",
    {},
    async () => {
      try {
        console.log("[Tool] getTokenInfo called");

        const token = envConfig.mcpServerToken;
        const tokenLength = token.length;
        const tokenPreview =
          token.length > 8
            ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
            : "***";

        // Check token strength
        let strength = "Weak";
        if (tokenLength >= 64) {
          strength = "Very Strong";
        } else if (tokenLength >= 32) {
          strength = "Strong";
        } else if (tokenLength >= 16) {
          strength = "Medium";
        }

        // Check if token contains various character types
        const hasLetters = /[a-zA-Z]/.test(token);
        const hasNumbers = /[0-9]/.test(token);
        const hasSpecial = /[^a-zA-Z0-9]/.test(token);

        return jsonResponse(
          {
            tokenConfigured: true,
            tokenLength: tokenLength,
            tokenPreview: tokenPreview,
            strength: strength,
            characterTypes: {
              hasLetters: hasLetters,
              hasNumbers: hasNumbers,
              hasSpecial: hasSpecial,
            },
            authenticationRequired: true,
            message:
              "Token is configured. Use validateToken tool to test a specific token.",
          },
          `🔐 **MCP Server Token Information**

**Token Status:** ✅ Configured
**Token Length:** ${tokenLength} characters
**Token Preview:** ${tokenPreview}
**Strength:** ${strength}
**Character Types:** Letters: ${hasLetters ? "Yes" : "No"}, Numbers: ${
            hasNumbers ? "Yes" : "No"
          }, Special: ${hasSpecial ? "Yes" : "No"}

**Authentication:** Required for all MCP requests

**Security:** Token is stored securely in .env file and never exposed in responses.`
        );
      } catch (error) {
        return textResponse(
          `❌ Error getting token info: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );

  // Tool: Test authentication (this will be called with the token from headers)
  server.tool(
    "testAuthentication",
    "Test if the current request is authenticated (uses token from request headers)",
    {},
    async () => {
      try {
        console.log("[Tool] testAuthentication called");

        // Note: This tool can't directly access request headers in the tool handler
        // But if this tool is called, it means the request passed authentication middleware
        // So we can confirm authentication is working

        return textResponse(
          `✅ **Authentication Test: SUCCESS**

**Status:** Authenticated ✅

🎉 If you can see this message, it means:
1. Your request included a valid token in the headers
2. The authentication middleware validated it successfully
3. The MCP server accepted your request

**How it works:**
- Token must be in \`Authorization: Bearer <token>\` header
- OR in \`X-MCP-Token: <token>\` header
- Token must match MCP_SERVER_TOKEN from .env file

**Your authentication is working correctly!** 🔐`
        );
      } catch (error) {
        return textResponse(
          `❌ Error testing authentication: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );
}
