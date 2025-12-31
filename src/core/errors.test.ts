import { describe, it, expect } from "vitest";
import {
  AppError,
  AuthenticationError,
  ServiceUnavailableError,
  ValidationError,
  ExternalApiError,
  NotFoundError,
} from "./errors.js";

describe("Core Errors", () => {
  describe("AppError", () => {
    it("should create an AppError with message and code", () => {
      const error = new AppError("Test error", "TEST_ERROR");
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.name).toBe("AppError");
    });

    it("should have default code if not provided", () => {
      const error = new AppError("Test error");
      expect(error.code).toBe("APP_ERROR");
    });
  });

  describe("AuthenticationError", () => {
    it("should create an AuthenticationError", () => {
      const error = new AuthenticationError("Invalid token");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Invalid token");
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.name).toBe("AuthenticationError");
    });
  });

  describe("ServiceUnavailableError", () => {
    it("should create a ServiceUnavailableError", () => {
      const error = new ServiceUnavailableError("Service down");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Service down");
      expect(error.code).toBe("SERVICE_UNAVAILABLE");
      expect(error.name).toBe("ServiceUnavailableError");
    });
  });

  describe("ValidationError", () => {
    it("should create a ValidationError", () => {
      const error = new ValidationError("Invalid input");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("ExternalApiError", () => {
    it("should create an ExternalApiError", () => {
      const error = new ExternalApiError("API failed");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("API failed");
      expect(error.code).toBe("EXTERNAL_API_ERROR");
      expect(error.name).toBe("ExternalApiError");
    });
  });

  describe("NotFoundError", () => {
    it("should create a NotFoundError", () => {
      const error = new NotFoundError("Resource not found");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Resource not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.name).toBe("NotFoundError");
    });
  });
});



