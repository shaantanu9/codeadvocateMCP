/**
 * Query Parameter Utilities
 * 
 * Helper functions for building query parameters consistently across tools
 */

/**
 * Build query parameters from an object, handling camelCase to snake_case conversion
 * and filtering out undefined/null values
 */
export function buildQueryParams<T extends Record<string, unknown>>(
  params: T,
  mappings?: Record<string, string>
): Record<string, string | number | boolean> {
  const queryParams: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }

    // Use custom mapping if provided, otherwise convert camelCase to snake_case
    const paramKey = mappings?.[key] || camelToSnakeCase(key);
    queryParams[paramKey] = value as string | number | boolean;
  }

  return queryParams;
}

/**
 * Convert camelCase to snake_case
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Build query parameters with defaults for pagination
 */
export function buildPaginationParams(
  page?: number,
  limit?: number,
  defaultPage: number = 1,
  defaultLimit: number = 20,
  maxLimit: number = 100
): { page: number; limit: number } {
  const normalizedPage = Math.max(1, page ?? defaultPage);
  const normalizedLimit = Math.min(maxLimit, Math.max(1, limit ?? defaultLimit));
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}


