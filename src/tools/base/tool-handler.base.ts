/**
 * Base Tool Handler
 * 
 * Provides common functionality for all external API tools:
 * - Service initialization
 * - Error handling
 * - Logging
 */

import { createExternalApiService } from "../../application/services/external-api.service.js";
import { textResponse } from "../../utils/response-formatter.js";
import { logger } from "../../core/logger.js";
import { AppError, ServiceUnavailableError } from "../../core/errors.js";
import { toolCallLogger } from "../../core/tool-call-logger.js";
import { detectRepositoryId } from "../../core/repository-detector.js";
import type { ExternalApiService } from "../../application/services/external-api.service.js";

/**
 * Base class for external API tools
 * Handles common patterns like service initialization and error handling
 */
export abstract class BaseToolHandler {
  /**
   * Get or create the external API service
   * @throws Error if service cannot be created
   */
  protected getApiService(): ExternalApiService {
    try {
      return createExternalApiService();
    } catch (error) {
      logger.error("Failed to create ExternalApiService", error);
      const message =
        error instanceof Error ? error.message : "Unknown error";
      throw new ServiceUnavailableError(
        `External API service is not available: ${message}`
      );
    }
  }

  /**
   * Handle errors consistently across all tools
   * Extracts structured error details from API responses and provides actionable suggestions
   */
  protected handleError(
    toolName: string,
    error: unknown,
    defaultMessage: string,
    params?: Record<string, unknown>,
    startTime?: number
  ): { content: Array<{ type: "text"; text: string }>; isError: true } {
    // Log failure to tool call logger
    if (startTime !== undefined && params) {
      toolCallLogger.logToolFailure(toolName, params, startTime, error, defaultMessage);
    }

    logger.error(`${toolName} failed`, error);

    let message: string;
    let statusCode: number | undefined;
    let suggestion: string | undefined;

    if (error instanceof AppError) {
      message = error.message;
      statusCode = error.statusCode;
    } else if (error instanceof Error) {
      message = error.message;
      // Extract HTTP status from error message pattern "API request failed: 401 ..."
      const statusMatch = message.match(/API request failed: (\d{3})/);
      if (statusMatch) {
        statusCode = parseInt(statusMatch[1], 10);
      }
    } else {
      message = defaultMessage;
    }

    // Provide actionable suggestions based on status code
    if (statusCode) {
      switch (statusCode) {
        case 401:
          suggestion = "Check that your API key is valid and not expired. You can verify it with the testConnection tool.";
          break;
        case 403:
          suggestion = "Your API key doesn't have the required permissions (scopes) for this action.";
          break;
        case 404:
          suggestion = "The requested resource was not found. Verify the ID or parameters are correct.";
          break;
        case 429:
          suggestion = "Rate limit exceeded. Wait a moment and try again.";
          break;
        case 502:
        case 503:
        case 504:
          suggestion = "The main app server is temporarily unavailable. Try again in a few seconds.";
          break;
      }
    }

    const parts: string[] = [`❌ Error: ${message}`];
    if (statusCode) {
      parts.push(`Status: ${statusCode}`);
    }
    if (suggestion) {
      parts.push(`💡 ${suggestion}`);
    }

    return {
      ...textResponse(parts.join("\n")),
      isError: true as const,
    };
  }

  /**
   * Log tool execution start
   * Returns start time for tracking execution duration
   */
  protected logStart(toolName: string, params?: Record<string, unknown>): { startTime: number } {
    logger.debug(`${toolName} called`, params);
    return toolCallLogger.logToolStart(toolName, params || {});
  }

  /**
   * Log successful tool execution
   */
  protected logSuccess(
    toolName: string,
    params: Record<string, unknown>,
    startTime: number,
    result?: { success: boolean; message?: string; dataSize?: number }
  ): void {
    toolCallLogger.logToolSuccess(toolName, params, startTime, result);
  }

  /**
   * Resolve repository ID - auto-detect if not provided
   * 
   * @param repositoryId - Optional repository ID from params
   * @param workspacePath - Optional workspace path for detection
   * @returns Repository ID (never undefined, throws if cannot be resolved)
   * @throws AppError if repository ID cannot be resolved
   */
  /**
   * Validate that a required parameter is present for a given action.
   * Throws a clear error if the parameter is missing.
   */
  protected requireParam<T>(value: T | undefined, paramName: string, actionName: string): T {
    if (value === undefined || value === null || value === "") {
      throw new AppError(
        `Parameter '${paramName}' is required for action '${actionName}'`,
        "MISSING_REQUIRED_PARAM"
      );
    }
    return value;
  }

  protected async resolveRepositoryId(
    repositoryId?: string,
    workspacePath?: string
  ): Promise<string> {
    // If provided, use it
    if (repositoryId) {
      return repositoryId;
    }

    // Auto-detect from workspace
    const apiService = this.getApiService();
    const detectedId = await detectRepositoryId(apiService, workspacePath);
    
    if (!detectedId) {
      throw new AppError(
        "Could not auto-detect repository ID. Please provide repositoryId parameter or ensure you're in a git repository with a remote URL configured. You can also use listRepositories tool to find the correct repository ID.",
        "REPOSITORY_NOT_FOUND"
      );
    }

    logger.info(`Auto-detected repository ID: ${detectedId}`);
    return detectedId;
  }
}


