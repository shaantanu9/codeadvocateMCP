/**
 * Environment Configuration Schema
 * 
 * Validates and types environment variables using Zod
 */

import { z } from "zod";

/**
 * Environment variable schema with validation
 */
export const envSchema = z.object({
  // Server Configuration
  PORT: z
    .string()
    .regex(/^\d+$/, "PORT must be a number")
    .transform(Number)
    .pipe(z.number().min(1).max(65535)),
  
  NODE_ENV: z
    .enum(["development", "production", "test"], {
      errorMap: () => ({ message: "NODE_ENV must be development, production, or test" }),
    })
    .default("development"),
  
  // MCP Server Authentication
  MCP_SERVER_TOKEN: z.string().optional(),
  
  // External API Configuration
  EXTERNAL_API_URL: z.string().url().optional(),
  EXTERNAL_API_BASE_URL: z.string().url().optional(),
  
  // AI Provider API Keys (optional)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Default Models
  DEFAULT_OPENAI_MODEL: z.string().optional(),
  DEFAULT_ANTHROPIC_MODEL: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z
    .enum(["DEBUG", "INFO", "WARN", "ERROR"], {
      errorMap: () => ({ message: "LOG_LEVEL must be DEBUG, INFO, WARN, or ERROR" }),
    })
    .optional(),
  
  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: z
    .string()
    .regex(/^\d+$/, "MAX_REQUESTS_PER_MINUTE must be a number")
    .transform(Number)
    .pipe(z.number().min(1))
    .optional(),
  
  // Token Acquisition URL
  TOKEN_ACQUISITION_URL: z.string().url().optional(),
});

/**
 * Validated environment configuration type
 */
export type ValidatedEnv = z.infer<typeof envSchema>;



