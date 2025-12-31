import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIServiceFactory } from "./ai-service-factory.js";
import { OpenAIService } from "./openai-service.js";
import { AnthropicService } from "./anthropic-service.js";

// Mock the services
vi.mock("./openai-service.js");
vi.mock("./anthropic-service.js");

describe("AIServiceFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getService", () => {
    it("should return OpenAI service when requested", () => {
      const mockService = { isAvailable: () => true, getProviderName: () => "OpenAI" };
      vi.mocked(OpenAIService).mockImplementation(() => mockService as any);

      const service = AIServiceFactory.getService("openai");

      expect(service).toBe(mockService);
      expect(OpenAIService).toHaveBeenCalled();
    });

    it("should return Anthropic service when requested", () => {
      const mockService = { isAvailable: () => true, getProviderName: () => "Anthropic" };
      vi.mocked(AnthropicService).mockImplementation(() => mockService as any);

      const service = AIServiceFactory.getService("anthropic");

      expect(service).toBe(mockService);
      expect(AnthropicService).toHaveBeenCalled();
    });
  });

  describe("getAvailableService", () => {
    it("should return first available service", () => {
      const mockOpenAI = { isAvailable: () => true, getProviderName: () => "OpenAI" };
      const mockAnthropic = { isAvailable: () => false, getProviderName: () => "Anthropic" };
      
      vi.mocked(OpenAIService).mockImplementation(() => mockOpenAI as any);
      vi.mocked(AnthropicService).mockImplementation(() => mockAnthropic as any);

      const service = AIServiceFactory.getAvailableService();

      expect(service).toBe(mockOpenAI);
    });

    it("should return Anthropic if OpenAI is not available", () => {
      const mockOpenAI = { isAvailable: () => false, getProviderName: () => "OpenAI" };
      const mockAnthropic = { isAvailable: () => true, getProviderName: () => "Anthropic" };
      
      vi.mocked(OpenAIService).mockImplementation(() => mockOpenAI as any);
      vi.mocked(AnthropicService).mockImplementation(() => mockAnthropic as any);

      const service = AIServiceFactory.getAvailableService();

      expect(service).toBe(mockAnthropic);
    });

    it("should return null if no service is available", () => {
      const mockOpenAI = { isAvailable: () => false, getProviderName: () => "OpenAI" };
      const mockAnthropic = { isAvailable: () => false, getProviderName: () => "Anthropic" };
      
      vi.mocked(OpenAIService).mockImplementation(() => mockOpenAI as any);
      vi.mocked(AnthropicService).mockImplementation(() => mockAnthropic as any);

      const service = AIServiceFactory.getAvailableService();

      expect(service).toBeNull();
    });
  });
});



