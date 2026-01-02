/**
 * Token Verification Service
 *
 * Verifies tokens via external API endpoint
 *
 * SECURITY: API key verification is ALWAYS required.
 * NO BYPASSES - All requests must have valid token verification.
 * This applies to ALL environments (development, production, test).
 */

import { envConfig } from "../config/env.js";

export interface TokenVerificationResult {
  valid: boolean;
  message?: string;
}

/**
 * Verifies a token by calling the external API verification endpoint
 *
 * @param token - The token to verify
 * @returns Promise with verification result
 */
export async function verifyToken(
  token: string
): Promise<TokenVerificationResult> {
  // Construct URL properly
  // externalApiBaseUrl format: Always includes /api/ prefix
  // - Production: https://codeadvocate.vercel.app/api/
  // - Localhost: http://localhost:5656/api/
  // Final URL: baseUrl + api-keys/verify
  // Example: https://codeadvocate.vercel.app/api/api-keys/verify
  let baseUrl = envConfig.externalApiBaseUrl;

  // Ensure baseUrl ends with /
  if (!baseUrl.endsWith("/")) {
    baseUrl = `${baseUrl}/`;
  }

  // Construct full URL: baseUrl + api-keys/verify
  const verifyUrl = `${baseUrl}api-keys/verify`;

  // Log for debugging
  console.log(`[Token Verification] Verifying token at: ${verifyUrl}`);

  try {
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      // If the API returns an error, token is invalid
      let errorMessage = `Token verification failed: ${response.status}`;

      try {
        const errorData = await response.json();
        // Extract detailed error message from API response
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If JSON parsing fails, try text
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            // Not JSON, use as-is
            if (errorText.length < 200) {
              errorMessage = errorText;
            }
          }
        }
      }

      console.warn(
        `[Token Verification] API returned error: ${response.status} - ${errorMessage}`
      );

      return {
        valid: false,
        message: errorMessage,
      };
    }

    // Parse response - check content type first
    const contentType = response.headers.get("content-type") || "";
    let data: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      data = (await response.json()) as Record<string, unknown>;
    } else {
      // If not JSON, try to parse as text first to see what we got
      const textResponse = await response.text();
      console.error(
        `[Token Verification] Unexpected content type: ${contentType}`,
        {
          url: verifyUrl,
          status: response.status,
          responsePreview: textResponse.substring(0, 200),
        }
      );

      // Try to parse as JSON anyway (in case content-type is wrong)
      try {
        data = JSON.parse(textResponse) as Record<string, unknown>;
      } catch {
        // If it's HTML or other non-JSON, return error
        throw new Error(
          `API returned non-JSON response (${contentType}). Response preview: ${textResponse.substring(
            0,
            100
          )}`
        );
      }
    }

    // Check if the response indicates the token is valid
    // Adjust this based on your actual API response format
    const isValid =
      response.status === 200 &&
      (data.valid === true || data.status === "valid" || data.success === true);

    if (isValid) {
      console.log(`[Token Verification] ✅ Token verified successfully`);
      return { valid: true };
    } else {
      console.warn(
        `[Token Verification] ❌ Token verification failed: ${JSON.stringify(
          data
        )}`
      );
      return {
        valid: false,
        message: "Token verification failed",
      };
    }
  } catch (error) {
    // SECURITY: ALWAYS require valid API key verification
    // NO BYPASSES - No development mode, no network error bypasses
    // All requests must have valid token verification, regardless of:
    // - Environment (development/production/test)
    // - Network errors (API unavailable, timeout, etc.)
    // - Any other conditions
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Check if it's a network/connection error
      const isNetworkError =
        errorMessage.includes("econnrefused") ||
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("networkerror") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("enotfound") ||
        errorMessage.includes("econnreset");

      if (isNetworkError) {
        console.error(
          `[Token Verification] ❌ External API not available (${error.message}). ` +
            `Token verification failed - API key verification is required. ` +
            `Ensure the external API is running and accessible.`
        );

        return {
          valid: false,
          message: `Token verification service unavailable: ${error.message}. API key verification is required.`,
        };
      }

      console.error(`[Token Verification] ❌ Error verifying token:`, error);
      return {
        valid: false,
        message: `Token verification failed: ${error.message}`,
      };
    }

    return {
      valid: false,
      message:
        "Unknown error during token verification. API key verification is required.",
    };
  }
}
