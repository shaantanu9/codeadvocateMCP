/**
 * Base interface for AI service implementations
 */
export interface AIService {
  /**
   * Generate text completion
   */
  generateText(
    prompt: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<string>;

  /**
   * Check if the service is available (has API key)
   */
  isAvailable(): boolean;

  /**
   * Get the provider name
   */
  getProviderName(): string;
}

export interface AIServiceOptions {
  apiKey: string;
  defaultModel?: string;
}




