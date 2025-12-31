/**
 * Custom Error Classes
 * 
 * Domain-specific error classes for better error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed", details?: unknown) {
    super(message, "AUTH_ERROR", 401, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class ExternalApiError extends AppError {
  constructor(
    message: string,
    public readonly apiResponse?: unknown,
    statusCode: number = 502
  ) {
    super(message, "EXTERNAL_API_ERROR", statusCode, apiResponse);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super(message, "NOT_FOUND", 404, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service unavailable", details?: unknown) {
    super(message, "SERVICE_UNAVAILABLE", 503, details);
  }
}




