/**
 * Pagination Validation Middleware
 * 
 * Validates common query parameters (pagination, sorting) globally
 * to ensure consistent validation across all endpoints.
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Schema for pagination query parameters
 */
const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "page must be a positive number")
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit must be a positive number")
    .transform(Number)
    .pipe(z.number().positive().max(100))
    .optional(),
});

/**
 * Middleware to validate pagination query parameters
 * 
 * Validates and normalizes:
 * - page: Must be a positive number (defaults to 1 if not provided)
 * - limit: Must be a positive number, max 100 (defaults to 20 if not provided)
 * 
 * Attaches validated values to req.query for use in route handlers
 */
export function paginationValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Validate and parse pagination parameters
    const validated = paginationSchema.parse(req.query);

    // Normalize and attach to request
    req.query.page = String(validated.page ?? 1);
    req.query.limit = String(validated.limit ?? 20);

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid pagination parameters",
        details: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }
    next(error);
  }
}
