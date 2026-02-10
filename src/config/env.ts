import dotenv from "dotenv";
import { z } from "zod";
import { envSchema, type ValidatedEnv } from "./env.schema.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get the directory of the current file (dist/config or src/config)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve .env path relative to project root (go up from dist/config or src/config to root)
// This works whether running from src/ or dist/
const envPath = resolve(__dirname, "../../.env");

// Load environment variables from project root
dotenv.config({ path: envPath });

export interface EnvConfig {
  // AI Provider API Keys
  openaiApiKey?: string;
  anthropicApiKey?: string;

  // External API Configuration
  // Uses EXTERNAL_API_KEY (sk_... format) for API authentication, falls back to MCP_SERVER_TOKEN
  externalApiKey: string;
  externalApiUrl: string;
  externalApiBaseUrl: string; // Base URL for external API (e.g., http://localhost:5656/api/)

  // MCP Server Authentication (Required)
  mcpServerToken: string;

  // Default Models
  defaultOpenaiModel: string;
  defaultAnthropicModel: string;

  // Server Configuration
  port: number;
  nodeEnv: string;

  // Optional Settings
  maxRequestsPerMinute?: number;
  logLevel: string;

  // Token Acquisition URL (for MCP dashboard)
  tokenAcquisitionUrl?: string;

  // HTTP Client Configuration
  httpTimeout: number;
  httpRetries: number;
  httpMaxRetryDelay: number;

  // MCP Request Configuration
  mcpRequestTimeout: number;
  maxRequestSize: number;
}

/**
 * Validates and loads environment configuration
 *
 * @throws {Error} If environment variables are invalid
 */
export function loadEnvConfig(): EnvConfig {
  // Validate environment variables
  let validatedEnv: ValidatedEnv;
  try {
    validatedEnv = envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment configuration:");
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        console.error(`  - ${path}: ${err.message}`);
      });
      console.error("\nPlease fix the errors above and restart the server.");
      process.exit(1);
    }
    throw error;
  }

  // MCP Server Token - optional, not required
  const mcpServerToken = validatedEnv.MCP_SERVER_TOKEN || "not-required";

  if (validatedEnv.MCP_SERVER_TOKEN) {
    console.log("[Config] MCP_SERVER_TOKEN found (authentication is optional)");
  } else {
    console.log(
      "[Config] MCP_SERVER_TOKEN not set - authentication is disabled"
    );
  }

  const config: EnvConfig = {
    // AI Provider API Keys (optional - tools will check if needed)
    openaiApiKey: validatedEnv.OPENAI_API_KEY,
    anthropicApiKey: validatedEnv.ANTHROPIC_API_KEY,

    // External API Configuration
    // Uses EXTERNAL_API_KEY (sk_... format) for external API authentication
    // Falls back to MCP_SERVER_TOKEN if EXTERNAL_API_KEY is not set
    externalApiKey: validatedEnv.EXTERNAL_API_KEY || mcpServerToken,
    externalApiUrl: validatedEnv.EXTERNAL_API_URL || "http://localhost:5656",
    // Construct base URL: if EXTERNAL_API_BASE_URL is set, use it; otherwise derive from EXTERNAL_API_URL
    // ALL endpoints require /api/ prefix (both production and localhost)
    externalApiBaseUrl:
      validatedEnv.EXTERNAL_API_BASE_URL ||
      (validatedEnv.EXTERNAL_API_URL
        ? `${validatedEnv.EXTERNAL_API_URL}/api/` // Always use /api/ prefix for all environments
        : "http://localhost:5656/api/"),

    // MCP Server Authentication (Required)
    mcpServerToken: mcpServerToken,

    // Default Models
    defaultOpenaiModel: validatedEnv.DEFAULT_OPENAI_MODEL || "gpt-4",
    defaultAnthropicModel:
      validatedEnv.DEFAULT_ANTHROPIC_MODEL || "claude-3-sonnet-20240229",

    // Server Configuration
    port: validatedEnv.PORT,
    nodeEnv: validatedEnv.NODE_ENV,

    // Optional Settings
    maxRequestsPerMinute: validatedEnv.MAX_REQUESTS_PER_MINUTE,
    logLevel: validatedEnv.LOG_LEVEL || "info",

    // Token Acquisition URL (for MCP dashboard)
    tokenAcquisitionUrl:
      validatedEnv.TOKEN_ACQUISITION_URL ||
      (validatedEnv.EXTERNAL_API_URL
        ? `${validatedEnv.EXTERNAL_API_URL}/api-keys`
        : "http://localhost:5656/api-keys"),

    // HTTP Client Configuration
    httpTimeout: validatedEnv.HTTP_TIMEOUT || 60000,
    httpRetries: validatedEnv.HTTP_RETRIES || 5,
    httpMaxRetryDelay: validatedEnv.HTTP_MAX_RETRY_DELAY || 30000,

    // MCP Request Configuration
    mcpRequestTimeout: validatedEnv.MCP_REQUEST_TIMEOUT || 300000, // 5 minutes default
    maxRequestSize: validatedEnv.MAX_REQUEST_SIZE || 10485760, // 10MB default
  };

  // Log which AI providers are configured
  const availableProviders: string[] = [];
  if (config.openaiApiKey) availableProviders.push("OpenAI");
  if (config.anthropicApiKey) availableProviders.push("Anthropic");

  if (availableProviders.length > 0) {
    console.log(
      `[Config] AI Providers configured: ${availableProviders.join(", ")}`
    );
  } else {
    console.warn(
      "[Config] No AI provider API keys found. Some tools may not work."
    );
    console.warn(
      "[Config] Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env file"
    );
  }

  // Log external API configuration
  console.log(`[Config] External API URL: ${config.externalApiUrl}`);
  console.log(`[Config] External API Base URL: ${config.externalApiBaseUrl}`);
  console.log(
    `[Config] Token Verification Endpoint: ${config.externalApiBaseUrl}api-keys/verify`
  );
  console.log(`[Config] .env file loaded from: ${envPath}`);

  if (validatedEnv.EXTERNAL_API_KEY) {
    console.log(
      `[Config] External API key configured (using EXTERNAL_API_KEY: ${validatedEnv.EXTERNAL_API_KEY.substring(0, 8)}...)`
    );
  } else if (config.externalApiKey && config.externalApiKey !== "not-required") {
    console.log(
      `[Config] External API key configured (fallback to MCP_SERVER_TOKEN)`
    );
  } else {
    console.warn(
      "[Config] No external API key found. External API tools may not work."
    );
    console.warn("[Config] Set EXTERNAL_API_KEY (preferred) or MCP_SERVER_TOKEN in .env file");
  }

  // Log MCP server authentication status
  console.log(
    `[Config] ✅ MCP Server: Token verification enabled via external API`
  );
  console.log(
    `[Config] ✅ Health endpoint (/health) works without authentication`
  );
  console.log(`[Config] ✅ MCP endpoint (/mcp) requires valid token`);

  return config;
}

// Export singleton config instance
export const envConfig = loadEnvConfig();
