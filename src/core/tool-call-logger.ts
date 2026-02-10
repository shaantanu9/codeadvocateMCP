/**
 * Tool Call Logger
 * 
 * Maintains detailed logs of all tool calls including:
 * - Tool name and parameters
 * - Success/failure status
 * - Error details for failures
 * - Execution time
 * - Timestamp
 */

import {
  existsSync,
  mkdirSync,
} from "node:fs";
import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { logger } from "./logger.js";
import { getRequestId } from "./context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Tool call log entry
 */
export interface ToolCallLogEntry {
  timestamp: string;
  requestId?: string;
  toolName: string;
  status: "success" | "failure";
  params: Record<string, unknown>;
  executionTimeMs?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    details?: unknown;
  };
  result?: {
    success: boolean;
    message?: string;
    dataSize?: number;
  };
}

/**
 * Tool Call Logger class
 */
export class ToolCallLogger {
  private logsDir: string;
  private failedLogsDir: string;

  constructor() {
    // Create logs directory structure
    const baseDir = join(__dirname, "..", "..", "logs");
    this.logsDir = join(baseDir, "tool-calls");
    this.failedLogsDir = join(baseDir, "tool-calls-failed");

    // Ensure directories exist
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
    if (!existsSync(this.failedLogsDir)) {
      mkdirSync(this.failedLogsDir, { recursive: true });
    }
  }

  /**
   * Get log file path for today
   */
  private getLogFilePath(failed: boolean = false): string {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const dir = failed ? this.failedLogsDir : this.logsDir;
    return join(dir, `tool-calls-${today}.log`);
  }

  /**
   * Log a tool call
   */
  logToolCall(entry: ToolCallLogEntry): void {
    try {
      const requestId = getRequestId();
      const logEntry: ToolCallLogEntry = {
        ...entry,
        requestId: requestId || entry.requestId,
        timestamp: entry.timestamp || new Date().toISOString(),
      };

      // Enhanced logging: Add API request context for failures
      if (logEntry.status === "failure" && logEntry.error) {
        // Extract API error details if available
        const errorDetails = logEntry.error.details as Record<string, unknown> | undefined;
        if (errorDetails) {
          logEntry.error.details = {
            ...errorDetails,
            // Add validation hints for common errors
            validationHint: this.getValidationHint(logEntry.toolName, logEntry.error.message, logEntry.params),
          };
        }
      }

      // Format log entry as JSON (one line per entry for easy parsing)
      const logLine = JSON.stringify(logEntry) + "\n";

      // Write to main log file (async, fire-and-forget)
      const mainLogFile = this.getLogFilePath(false);
      appendFile(mainLogFile, logLine, "utf-8").catch((err) => {
        logger.error("Failed to write to main tool call log", err);
      });

      // Also write to failed log file if it's a failure
      if (entry.status === "failure") {
        const failedLogFile = this.getLogFilePath(true);
        appendFile(failedLogFile, logLine, "utf-8").catch((err) => {
          logger.error("Failed to write to failed tool call log", err);
        });
      }

      // Also log to console for immediate visibility
      if (entry.status === "failure") {
        logger.error(
          `Tool call failed: ${entry.toolName}`,
          entry.error,
          {
            params: entry.params,
            executionTimeMs: entry.executionTimeMs,
          }
        );
      } else {
        logger.info(`Tool call succeeded: ${entry.toolName}`, {
          params: entry.params,
          executionTimeMs: entry.executionTimeMs,
          result: entry.result,
        });
      }
    } catch (error) {
      // Don't let logging errors break the application
      logger.error("Failed to write tool call log", error);
    }
  }

  /**
   * Log tool call start
   */
  logToolStart(
    toolName: string,
    params: Record<string, unknown>
  ): { startTime: number } {
    const startTime = Date.now();
    
    // Log start (we'll complete it when we know the result)
    logger.debug(`Tool call started: ${toolName}`, { params });
    
    return { startTime };
  }

  /**
   * Log successful tool call
   */
  logToolSuccess(
    toolName: string,
    params: Record<string, unknown>,
    startTime: number,
    result?: { success: boolean; message?: string; dataSize?: number }
  ): void {
    const executionTime = Date.now() - startTime;
    
    this.logToolCall({
      timestamp: new Date().toISOString(),
      toolName,
      status: "success",
      params,
      executionTimeMs: executionTime,
      result: result || { success: true },
    });
  }

  /**
   * Log failed tool call
   */
  logToolFailure(
    toolName: string,
    params: Record<string, unknown>,
    startTime: number,
    error: unknown,
    defaultMessage?: string
  ): void {
    const executionTime = Date.now() - startTime;
    
    let errorDetails: ToolCallLogEntry["error"];
    let errorMessage = defaultMessage || "Unknown error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      
      // Extract API error details if it's an ExternalApiError
      // ExternalApiError extends AppError which has a details property
      if ("details" in error && error.details !== undefined) {
        errorDetails.details = error.details;
      }
      // Also check for apiResponse in ExternalApiError
      if ("apiResponse" in error && error.apiResponse !== undefined) {
        errorDetails.details = {
          ...(errorDetails.details as Record<string, unknown> || {}),
          apiResponse: error.apiResponse,
        };
      }
    } else if (typeof error === "object" && error !== null) {
      errorDetails = {
        name: "UnknownError",
        message: defaultMessage || "Unknown error occurred",
        details: error,
      };
    } else {
      errorMessage = String(error) || defaultMessage || "Unknown error occurred";
      errorDetails = {
        name: "UnknownError",
        message: errorMessage,
      };
    }

    // Add validation hint
    const validationHint = this.getValidationHint(toolName, errorMessage, params);
    if (validationHint && errorDetails.details) {
      errorDetails.details = {
        ...(errorDetails.details as Record<string, unknown>),
        validationHint,
      };
    } else if (validationHint) {
      errorDetails.details = { validationHint };
    }

    this.logToolCall({
      timestamp: new Date().toISOString(),
      toolName,
      status: "failure",
      params,
      executionTimeMs: executionTime,
      error: errorDetails,
    });
  }

  /**
   * Get failed tool calls from log file
   */
  async getFailedToolCalls(date?: string): Promise<ToolCallLogEntry[]> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const logFile = join(this.failedLogsDir, `tool-calls-${targetDate}.log`);

      const content = await readFile(logFile, "utf-8");
      const lines = content.trim().split("\n").filter((line) => line.trim());

      return lines.map((line) => {
        try {
          return JSON.parse(line) as ToolCallLogEntry;
        } catch {
          return null;
        }
      }).filter((entry): entry is ToolCallLogEntry => entry !== null);
    } catch {
      // File doesn't exist or read error
      return [];
    }
  }

  /**
   * Get all tool calls from log file
   */
  async getAllToolCalls(date?: string): Promise<ToolCallLogEntry[]> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const logFile = join(this.logsDir, `tool-calls-${targetDate}.log`);

      const content = await readFile(logFile, "utf-8");
      const lines = content.trim().split("\n").filter((line) => line.trim());

      return lines.map((line) => {
        try {
          return JSON.parse(line) as ToolCallLogEntry;
        } catch {
          return null;
        }
      }).filter((entry): entry is ToolCallLogEntry => entry !== null);
    } catch {
      // File doesn't exist or read error
      return [];
    }
  }

  /**
   * Get statistics for a date
   */
  async getStatistics(date?: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    averageExecutionTime: number;
    failedTools: Array<{ toolName: string; count: number }>;
  }> {
    const entries = await this.getAllToolCalls(date);
    
    const successful = entries.filter((e) => e.status === "success").length;
    const failed = entries.filter((e) => e.status === "failure").length;
    
    const executionTimes = entries
      .map((e) => e.executionTimeMs)
      .filter((t): t is number => t !== undefined);
    const avgExecutionTime =
      executionTimes.length > 0
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
        : 0;

    // Count failures by tool
    const failedToolsMap = new Map<string, number>();
    entries
      .filter((e) => e.status === "failure")
      .forEach((e) => {
        failedToolsMap.set(e.toolName, (failedToolsMap.get(e.toolName) || 0) + 1);
      });
    
    const failedTools = Array.from(failedToolsMap.entries())
      .map(([toolName, count]) => ({ toolName, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: entries.length,
      successful,
      failed,
      successRate: entries.length > 0 ? (successful / entries.length) * 100 : 0,
      averageExecutionTime: Math.round(avgExecutionTime),
      failedTools,
    };
  }

  /**
   * Get validation hint based on error message and tool
   */
  private getValidationHint(
    toolName: string,
    errorMessage: string,
    params: Record<string, unknown>
  ): string | undefined {
    // Rule type validation hints
    if (errorMessage.includes("Invalid rule_type")) {
      if (toolName === "createRepositoryRule") {
        const providedType = params.ruleType as string | undefined;
        const suggestion = providedType === "code-quality" 
          ? "Use 'coding_standard' instead"
          : providedType === "database"
          ? "Use 'other' instead"
          : "Use one of: coding_standard, naming_convention, architecture, security, performance, testing, documentation, git_workflow, other";
        return `Invalid rule_type '${providedType}'. ${suggestion}`;
      }
      if (toolName === "createRepositoryPrRule") {
        const providedType = params.ruleType as string | undefined;
        const suggestion = providedType === "code-quality" || providedType === "testing" || providedType === "documentation"
          ? "Use 'review_checklist' instead"
          : "Use one of: review_checklist, approval_requirement, merge_condition, automated_check, comment_template, other";
        return `Invalid rule_type '${providedType}'. ${suggestion}`;
      }
    }

    // Field name validation hints
    if (errorMessage.includes("prompt_text") && toolName === "createRepositoryPrompt") {
      return "API requires 'prompt_text' field (not 'prompt_content'). This has been fixed in the code.";
    }

    // Missing required fields
    if (errorMessage.includes("required") && toolName === "createRepositoryPrompt") {
      return "Ensure 'title' and 'prompt_text' fields are provided.";
    }

    return undefined;
  }
}

// Singleton instance
export const toolCallLogger = new ToolCallLogger();

