/**
 * External API Service
 * 
 * Application service for interacting with external APIs
 * Uses dependency injection for HTTP client
 */

import { HttpClient } from "../../infrastructure/http-client.js";
import { getRequestToken } from "../../core/context.js";
import { envConfig } from "../../config/env.js";
import { AuthenticationError, ServiceUnavailableError } from "../../core/errors.js";
import { logger } from "../../core/logger.js";

export class ExternalApiService {
  private httpClient: HttpClient;

  constructor(httpClient?: HttpClient) {
    // Get token from request context
    const token = getRequestToken() || envConfig.externalApiKey;

    if (!token || token === "not-required" || token.trim() === "") {
      throw new AuthenticationError(
        "API key not available. Token must be provided in request header (Authorization: Bearer <token>)"
      );
    }

    // Create HTTP client with token in headers
    // Using improved defaults: 60s timeout, 5 retries with exponential backoff
    this.httpClient = httpClient || new HttpClient({
      baseUrl: envConfig.externalApiUrl,
      defaultHeaders: {
        "X-API-Key": token,
        "Content-Type": "application/json",
      },
      timeout: 60000, // Increased from 30s to 60s
      retries: 5, // Increased from 3 to 5
      retryDelay: 1000, // Base delay for exponential backoff
    });

    logger.debug("ExternalApiService initialized", {
      baseUrl: envConfig.externalApiUrl,
      tokenPrefix: token.substring(0, 8),
    });
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    const token = getRequestToken() || envConfig.externalApiKey;
    return !!(token && token !== "not-required" && envConfig.externalApiUrl);
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return envConfig.externalApiUrl;
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    if (!this.isAvailable()) {
      throw new ServiceUnavailableError("External API service is not available");
    }

    try {
      return await this.httpClient.get<T>(endpoint, queryParams);
    } catch (error) {
      logger.error("External API GET request failed", error, {
        endpoint,
        queryParams,
      });
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    if (!this.isAvailable()) {
      throw new ServiceUnavailableError("External API service is not available");
    }

    try {
      // Log request details before sending
      logger.debug("External API POST request", {
        endpoint,
        hasBody: !!body,
        bodyType: body ? typeof body : "none",
        bodyKeys: body && typeof body === "object" ? Object.keys(body as Record<string, unknown>) : undefined,
      });
      
      return await this.httpClient.post<T>(endpoint, body, queryParams);
    } catch (error) {
      // Enhanced error logging with request context
      const errorContext: Record<string, unknown> = {
        endpoint,
        hasBody: !!body,
      };
      
      if (body && typeof body === "object") {
        const bodyObj = body as Record<string, unknown>;
        errorContext.bodyKeys = Object.keys(bodyObj);
        errorContext.bodyPreview = Object.fromEntries(
          Object.entries(bodyObj).map(([key, value]) => [
            key,
            typeof value === "string" ? value.substring(0, 100) : value,
          ])
        );
      }
      
      logger.error("External API POST request failed", error, errorContext);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    if (!this.isAvailable()) {
      throw new ServiceUnavailableError("External API service is not available");
    }

    try {
      return await this.httpClient.put<T>(endpoint, body, queryParams);
    } catch (error) {
      logger.error("External API PUT request failed", error, {
        endpoint,
      });
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    if (!this.isAvailable()) {
      throw new ServiceUnavailableError("External API service is not available");
    }

    try {
      return await this.httpClient.patch<T>(endpoint, body, queryParams);
    } catch (error) {
      logger.error("External API PATCH request failed", error, {
        endpoint,
      });
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    if (!this.isAvailable()) {
      throw new ServiceUnavailableError("External API service is not available");
    }

    try {
      return await this.httpClient.delete<T>(endpoint, queryParams);
    } catch (error) {
      logger.error("External API DELETE request failed", error, {
        endpoint,
      });
      throw error;
    }
  }
}

/**
 * Factory function to create ExternalApiService instance
 * Uses request context for token
 */
export function createExternalApiService(): ExternalApiService {
  return new ExternalApiService();
}


