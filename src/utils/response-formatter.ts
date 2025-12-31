/**
 * Response formatting utilities for MCP tools
 */

export interface FormattedResponse {
  content: Array<{ type: "text"; text: string }>;
  [key: string]: unknown; // Allow index signature for MCP SDK compatibility
}

/**
 * Formats a simple text response
 */
export function textResponse(text: string): FormattedResponse {
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}

/**
 * Formats a response with code block
 */
export function codeResponse(
  text: string,
  code: string,
  language: string = "text"
): FormattedResponse {
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
      {
        type: "text" as const,
        text: `\`\`\`${language}\n${code}\n\`\`\``,
      },
    ],
  };
}

/**
 * Formats a JSON response
 */
export function jsonResponse(data: unknown, description?: string): FormattedResponse {
  const jsonText = JSON.stringify(data, null, 2);
  const descriptionText = description
    ? `${description}\n\n`
    : "";

  return {
    content: [
      {
        type: "text" as const,
        text: `${descriptionText}\`\`\`json\n${jsonText}\n\`\`\``,
      },
    ],
  };
}

/**
 * Formats a structured response with multiple parts
 */
export function structuredResponse(
  parts: Array<{ label: string; content: string; format?: "text" | "json" | "code" }>
): FormattedResponse {
  const formattedParts = parts.map((part) => {
    let formatted = `**${part.label}:**\n`;

    if (part.format === "json") {
      formatted += `\`\`\`json\n${part.content}\n\`\`\``;
    } else if (part.format === "code") {
      formatted += `\`\`\`\n${part.content}\n\`\`\``;
    } else {
      formatted += part.content;
    }

    return formatted;
  });

  return {
    content: [
      {
        type: "text" as const,
        text: formattedParts.join("\n\n"),
      },
    ],
  };
}

