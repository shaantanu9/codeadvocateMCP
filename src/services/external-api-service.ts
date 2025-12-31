import { envConfig } from "../config/env.js";
import { logError } from "../utils/error-handler.js";
import { getRequestToken } from "../utils/request-context.js";

/**
 * Service for calling external API with API key authentication
 */
export class ExternalAPIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    // Use provided token, or fall back to envConfig
    // Priority: provided token > envConfig > error
    const token = apiKey || envConfig.externalApiKey;

    // Check if we have a valid token (not "not-required" or empty)
    if (!token || token === "not-required" || token.trim() === "") {
      throw new Error(
        "External API key not configured. Token must be provided in request header (Authorization: Bearer <token>) or set MCP_SERVER_TOKEN in .env file."
      );
    }

    this.apiKey = token;
    this.baseUrl = envConfig.externalApiUrl;
    console.log(
      `[ExternalAPI] Using API key: ${token.substring(
        0,
        8
      )}... (from request header)`
    );
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey && !!this.baseUrl;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Make authenticated API request
   */
  async request<T = unknown>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    options?: {
      body?: unknown;
      queryParams?: Record<string, string | number | boolean>;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    if (!this.isAvailable()) {
      throw new Error("External API service is not available");
    }

    try {
      // Build URL with query parameters
      const url = new URL(endpoint, this.baseUrl);
      if (options?.queryParams) {
        Object.entries(options.queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      // Prepare headers
      const headers: Record<string, string> = {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
        ...options?.headers,
      };

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers,
      };

      // Add body for POST, PUT, PATCH
      if (options?.body && ["POST", "PUT", "PATCH"].includes(method)) {
        requestOptions.body = JSON.stringify(options.body);
      }

      console.log(
        `[ExternalAPI] ${method} ${url.pathname}${url.search ? url.search : ""}`
      );

      // Make request
      const response = await fetch(url.toString(), requestOptions);

      // Handle errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // If not JSON, use the text as is
          if (errorText) {
            errorMessage = `${errorMessage} - ${errorText}`;
          }
        }

        throw new Error(errorMessage);
      }

      // Parse response
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return (await response.json()) as T;
      } else {
        return (await response.text()) as unknown as T;
      }
    } catch (error) {
      logError(`ExternalAPI ${method} ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>("GET", endpoint, { queryParams });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>("POST", endpoint, { body, queryParams });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, { body, queryParams });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, { body, queryParams });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>("DELETE", endpoint, { queryParams });
  }
}

/**
 * Get external API service instance for current request
 * Uses token from request headers (Authorization: Bearer <token>)
 */
export function getExternalAPIService(): ExternalAPIService | null {
  // Get token from request context (set by auth middleware)
  const requestToken = getRequestToken();

  // Use token from request, or fall back to envConfig
  const apiKey = requestToken || envConfig.externalApiKey;

  if (!apiKey || apiKey === "not-required" || apiKey.trim() === "") {
    console.warn(
      "[ExternalAPI] No API key available - token not found in request headers and MCP_SERVER_TOKEN not configured"
    );
    return null;
  }

  try {
    // Create new instance per request with the token from headers
    // This ensures each request uses its own token
    return new ExternalAPIService(apiKey);
  } catch (error) {
    console.error("[ExternalAPI] Failed to initialize:", error);
    return null;
  }
}
