/**
 * Error handling utilities for MCP tools
 */

export interface MCPError {
  message: string;
  code?: string | number;
  details?: unknown;
}

/**
 * Creates a user-friendly error message from an error
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose API keys or internal details
    let message = error.message;

    // Remove potential API key leaks
    message = message.replace(/sk-[a-zA-Z0-9-]+/g, "[API_KEY]");
    message = message.replace(/sk-ant-[a-zA-Z0-9-]+/g, "[API_KEY]");

    return message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Creates an MCP-compatible error response
 */
export function createErrorResponse(
  error: unknown,
  userMessage?: string
): { content: Array<{ type: string; text: string }> } {
  const message = userMessage || formatError(error);

  return {
    content: [
      {
        type: "text",
        text: `❌ Error: ${message}`,
      },
    ],
  };
}

/**
 * Logs error with context
 */
export function logError(context: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[Error] ${context}:`, errorMessage);
  if (errorStack && process.env.NODE_ENV === "development") {
    console.error("[Error] Stack:", errorStack);
  }
}




