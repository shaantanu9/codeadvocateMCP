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
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
    };
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

    // Retry logic
    let lastError: Error | null = null;
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
            });
            
            // Retry on 5xx errors
            if (response.status >= 500 && attempt < this.config.retries) {
              logger.warn(`Retrying after ${response.status} error`, {
                attempt: attempt + 1,
                maxRetries: this.config.retries,
                requestId,
                endpoint: options.endpoint,
              });
              await this.delay(this.config.retryDelay * (attempt + 1));
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
            });
            
            throw new ExternalApiError(errorMessage, { raw: errorText }, response.status);
          }
        }

        // Parse response
        const contentType = response.headers.get("content-type");
        const data = contentType?.includes("application/json")
          ? await response.json()
          : await response.text();

        logger.debug(`HTTP ${options.method} ${url.pathname} success`, {
          status: response.status,
          requestId,
        });

        return data as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) or if it's not a network error
        if (
          error instanceof ExternalApiError ||
          (error as Error).name === "AbortError"
        ) {
          if (error instanceof ExternalApiError && error.statusCode < 500) {
            throw error;
          }
          if (attempt < this.config.retries) {
            logger.warn(`Retrying after error`, {
              attempt: attempt + 1,
              maxRetries: this.config.retries,
              error: (error as Error).message,
              requestId,
            });
            await this.delay(this.config.retryDelay * (attempt + 1));
            continue;
          }
        }

        // If we've exhausted retries, throw the error
        if (attempt === this.config.retries) {
          break;
        }

        // Wait before retry
        await this.delay(this.config.retryDelay * (attempt + 1));
      }
    }

    // If we get here, all retries failed
    logger.error(`HTTP request failed after ${this.config.retries} retries`, lastError, {
      method: options.method,
      endpoint: options.endpoint,
      requestId,
    });

    throw new ServiceUnavailableError(
      `Request failed after ${this.config.retries} retries: ${lastError?.message}`,
      { originalError: lastError?.message }
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


