import { envConfig } from "../config/env.js";
import { OpenAIService } from "./openai-service.js";
import { AnthropicService } from "./anthropic-service.js";
import type { AIService } from "./ai-service.interface.js";

/**
 * Factory for creating AI service instances
 */
export class AIServiceFactory {
  private static openaiService: OpenAIService | null = null;
  private static anthropicService: AnthropicService | null = null;

  /**
   * Get or create OpenAI service
   */
  static getOpenAIService(): OpenAIService | null {
    if (!envConfig.openaiApiKey) {
      return null;
    }

    if (!this.openaiService) {
      this.openaiService = new OpenAIService({
        apiKey: envConfig.openaiApiKey,
        defaultModel: envConfig.defaultOpenaiModel,
      });
    }

    return this.openaiService;
  }

  /**
   * Get or create Anthropic service
   */
  static getAnthropicService(): AnthropicService | null {
    if (!envConfig.anthropicApiKey) {
      return null;
    }

    if (!this.anthropicService) {
      this.anthropicService = new AnthropicService({
        apiKey: envConfig.anthropicApiKey,
        defaultModel: envConfig.defaultAnthropicModel,
      });
    }

    return this.anthropicService;
  }

  /**
   * Get the first available AI service
   */
  static getAvailableService(): AIService | null {
    const openai = this.getOpenAIService();
    if (openai?.isAvailable()) {
      return openai;
    }

    const anthropic = this.getAnthropicService();
    if (anthropic?.isAvailable()) {
      return anthropic;
    }

    return null;
  }

  /**
   * Get a specific service by provider name
   */
  static getService(provider: "openai" | "anthropic"): AIService | null {
    if (provider === "openai") {
      return this.getOpenAIService();
    }
    if (provider === "anthropic") {
      return this.getAnthropicService();
    }
    return null;
  }

  /**
   * List all available services
   */
  static getAvailableServices(): AIService[] {
    const services: AIService[] = [];

    const openai = this.getOpenAIService();
    if (openai?.isAvailable()) {
      services.push(openai);
    }

    const anthropic = this.getAnthropicService();
    if (anthropic?.isAvailable()) {
      services.push(anthropic);
    }

    return services;
  }
}



