/**
 * HTTP Client
 * 
 * Centralized HTTP client with retry logic, error handling, and request/response logging
 */

import type { HttpRequestOptions } from "../core/types.js";
import { ExternalApiError, ServiceUnavailableError } from "../core/errors.js";
import { logger } from "../core/logger.js";
import { getRequestId } from "../core/context.js";

export interface HttpClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private config: Required<Omit<HttpClientConfig, "defaultHeaders">> & {
    defaultHeaders: Record<string, string>;
  };

  constructor(config: HttpClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      defaultHeaders: config.defaultHeaders || {},
      timeout: config.timeout || 60000, // Increased from 30s to 60s
      retries: config.retries || 5, // Increased from 3 to 5
      retryDelay: config.retryDelay || 1000,
    };
  }

  /**
   * Check if error is a retryable network error
   */
  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const errorName = error.name;
    const errorMessage = error.message.toLowerCase();

    // Network errors that should be retried
    const retryableErrors = [
      "TypeError", // fetch failed, network errors
      "AbortError", // timeout errors
      "NetworkError",
      "ECONNRESET",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ENOTFOUND",
    ];

    // Check error name
    if (retryableErrors.includes(errorName)) {
      return true;
    }

    // Check error message for network-related errors
    const networkErrorPatterns = [
      "fetch failed",
      "network error",
      "connection",
      "timeout",
      "econnreset",
      "econnrefused",
      "etimedout",
      "enotfound",
      "dns",
    ];

    return networkErrorPatterns.some((pattern) => errorMessage.includes(pattern));
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    // Exponential backoff: 2^attempt * baseDelay
    // Cap at 30 seconds max delay
    const maxDelay = 30000;
    const delay = Math.pow(2, attempt) * this.config.retryDelay;
    return Math.min(delay, maxDelay);
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request<T = unknown>(options: HttpRequestOptions): Promise<T> {
    const requestId = getRequestId();
    const url = new URL(options.endpoint, this.config.baseUrl);
    
    // Add query parameters
    if (options.queryParams) {
      Object.entries(options.queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Prepare headers
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...options.headers,
    };

    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    // Add body for POST, PUT, PATCH
    if (options.body && ["POST", "PUT", "PATCH"].includes(options.method)) {
      requestOptions.body = JSON.stringify(options.body);
    }

    // Log request details (sanitize sensitive data)
    const sanitizedBody = options.body ? this.sanitizeRequestBody(options.body) : undefined;
    logger.debug(`HTTP ${options.method} ${url.pathname}`, {
      url: url.toString(),
      endpoint: options.endpoint,
      method: options.method,
      requestId,
      hasBody: !!options.body,
      bodyPreview: sanitizedBody ? JSON.stringify(sanitizedBody).substring(0, 200) : undefined,
      queryParams: options.queryParams,
    });

    // Retry logic with exponential backoff
    let lastError: Error | null = null;
    const startTime = Date.now();
    
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url.toString(), requestOptions);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
            
            // Enhanced error logging for debugging
            logger.error(`HTTP ${options.method} ${url.pathname} failed`, {
              status: response.status,
              statusText: response.statusText,
              endpoint: options.endpoint,
              method: options.method,
              requestId,
              errorMessage,
              errorDetails: errorJson,
              requestBody: sanitizedBody,
              url: url.toString(),
              attempt: attempt + 1,
              maxRetries: this.config.retries,
            });
            
            // Don't retry on client errors (4xx)
            if (response.status < 500) {
              throw new ExternalApiError(errorMessage, errorJson, response.status);
            }
            
            // Retry on 5xx errors
            if (response.status >= 500 && attempt < this.config.retries) {
              const backoffDelay = this.calculateBackoffDelay(attempt);
              logger.warn(`Retrying after ${response.status} error`, {
                attempt: attempt + 1,
                maxRetries: this.config.retries,
                requestId,
                endpoint: options.endpoint,
                backoffDelayMs: backoffDelay,
                elapsedTime: Date.now() - startTime,
              });
              await this.delay(backoffDelay);
              continue;
            }

            throw new ExternalApiError(errorMessage, errorJson, response.status);
          } catch (parseError) {
            if (parseError instanceof ExternalApiError) {
              throw parseError;
            }
            
            // Log parse error
            logger.error(`HTTP ${options.method} ${url.pathname} failed (parse error)`, {
              status: response.status,
              statusText: response.statusText,
              endpoint: options.endpoint,
              method: options.method,
              requestId,
              errorMessage,
              rawError: errorText.substring(0, 500),
              requestBody: sanitizedBody,
              attempt: attempt + 1,
            });
            
            // Don't retry on client errors (4xx)
            if (response.status < 500) {
              throw new ExternalApiError(errorMessage, { raw: errorText }, response.status);
            }
            
            // Retry on 5xx errors
            if (response.status >= 500 && attempt < this.config.retries) {
              const backoffDelay = this.calculateBackoffDelay(attempt);
              logger.warn(`Retrying after ${response.status} parse error`, {
                attempt: attempt + 1,
                maxRetries: this.config.retries,
                requestId,
                endpoint: options.endpoint,
                backoffDelayMs: backoffDelay,
              });
              await this.delay(backoffDelay);
              continue;
            }
            
            throw new ExternalApiError(errorMessage, { raw: errorText }, response.status);
          }
        }

        // Parse response
        const contentType = response.headers.get("content-type");
        const data = contentType?.includes("application/json")
          ? await response.json()
          : await response.text();

        const elapsedTime = Date.now() - startTime;
        logger.debug(`HTTP ${options.method} ${url.pathname} success`, {
          status: response.status,
          requestId,
          attempt: attempt + 1,
          elapsedTime,
        });

        return data as T;
      } catch (error) {
        lastError = error as Error;
        const elapsedTime = Date.now() - startTime;

        // Handle ExternalApiError (HTTP errors)
        if (error instanceof ExternalApiError) {
          // Don't retry on client errors (4xx)
          if (error.statusCode < 500) {
            throw error;
          }
          
          // Retry on 5xx errors
          if (error.statusCode >= 500 && attempt < this.config.retries) {
            const backoffDelay = this.calculateBackoffDelay(attempt);
            logger.warn(`Retrying after ${error.statusCode} error`, {
              attempt: attempt + 1,
              maxRetries: this.config.retries,
              error: error.message,
              requestId,
              endpoint: options.endpoint,
              backoffDelayMs: backoffDelay,
              elapsedTime,
            });
            await this.delay(backoffDelay);
            continue;
          }
          
          // Exhausted retries on 5xx error
          throw error;
        }

        // Handle network errors (fetch failures, timeouts, DNS errors, etc.)
        if (this.isRetryableError(error) && attempt < this.config.retries) {
          const backoffDelay = this.calculateBackoffDelay(attempt);
          const errorDetails = {
            name: (error as Error).name,
            message: (error as Error).message,
            stack: (error as Error).stack?.substring(0, 500),
          };
          
          logger.warn(`Retrying after network error`, {
            attempt: attempt + 1,
            maxRetries: this.config.retries,
            requestId,
            endpoint: options.endpoint,
            method: options.method,
            url: url.toString(),
            backoffDelayMs: backoffDelay,
            elapsedTime,
            errorDetails,
          });
          
          await this.delay(backoffDelay);
          continue;
        }

        // If we've exhausted retries or it's not retryable, break
        if (attempt === this.config.retries || !this.isRetryableError(error)) {
          break;
        }
      }
    }

    // If we get here, all retries failed
    const totalElapsedTime = Date.now() - startTime;
    const errorDetails = lastError ? {
      name: lastError.name,
      message: lastError.message,
      stack: lastError.stack?.substring(0, 1000),
    } : {};

    logger.error(`HTTP request failed after ${this.config.retries} retries`, {
      method: options.method,
      endpoint: options.endpoint,
      url: url.toString(),
      requestId,
      totalRetries: this.config.retries,
      totalElapsedTime,
      errorDetails,
      requestBody: sanitizedBody,
    });

    throw new ServiceUnavailableError(
      `Request failed after ${this.config.retries} retries: ${lastError?.message || "Unknown error"}`,
      {
        originalError: lastError?.message,
        errorName: lastError?.name,
        endpoint: options.endpoint,
        method: options.method,
        totalElapsedTime,
      }
    );
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>({
      method: "GET",
      endpoint,
      queryParams,
    });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>({
      method: "POST",
      endpoint,
      body,
      queryParams,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>({
      method: "PUT",
      endpoint,
      body,
      queryParams,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>({
      method: "PATCH",
      endpoint,
      body,
      queryParams,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>({
      method: "DELETE",
      endpoint,
      queryParams,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sanitize request body for logging (remove sensitive data)
   */
  private sanitizeRequestBody(body: unknown): unknown {
    if (!body || typeof body !== "object") {
      return body;
    }

    const sanitized = { ...(body as Record<string, unknown>) };
    const sensitiveFields = ["password", "token", "api_key", "apiKey", "secret", "authorization", "auth"];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = "[REDACTED]";
      }
    }

    return sanitized;
  }
}


