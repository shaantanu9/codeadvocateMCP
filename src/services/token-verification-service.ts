/**
 * Token Verification Service
 *
 * Verifies tokens via external API endpoint
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
  // Construct URL properly - baseUrl already includes /api/, so just append the endpoint
  const baseUrl = envConfig.externalApiBaseUrl.endsWith("/")
    ? envConfig.externalApiBaseUrl
    : `${envConfig.externalApiBaseUrl}/`;
  const verifyUrl = new URL("api-keys/verify", baseUrl).toString();

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

    const data = await response.json();

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
    // Handle connection errors gracefully
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // If the external API is not available, allow requests in development mode
      if (
        errorMessage.includes("econnrefused") ||
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("networkerror")
      ) {
        console.warn(
          `[Token Verification] ⚠️  External API not available (${error.message}). ` +
          `In development mode, allowing request. For production, ensure the external API is running.`
        );
        
        // In development, allow the request if API is not available
        // In production, this should fail
        const isDevelopment = process.env.NODE_ENV !== "production";
        if (isDevelopment) {
          console.warn(
            `[Token Verification] ⚠️  Development mode: Allowing request without API verification`
          );
          return { valid: true };
        }
      }
      
      console.error(`[Token Verification] ❌ Error verifying token:`, error);
      return {
        valid: false,
        message: error.message,
      };
    }
    
    return {
      valid: false,
      message: "Unknown error during token verification",
    };
  }
}
