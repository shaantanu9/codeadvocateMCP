import Anthropic from "@anthropic-ai/sdk";
import type { AIService, AIServiceOptions } from "./ai-service.interface.js";

/**
 * Anthropic (Claude) service implementation
 */
export class AnthropicService implements AIService {
  private client: Anthropic | null = null;
  private defaultModel: string = "claude-3-sonnet-20240229";

  constructor(options: AIServiceOptions) {
    if (options.apiKey) {
      this.client = new Anthropic({
        apiKey: options.apiKey,
      });
      this.defaultModel = options.defaultModel || this.defaultModel;
      console.log(`[Anthropic] Service initialized with model: ${this.defaultModel}`);
    } else {
      console.warn("[Anthropic] No API key provided, service will not be available");
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getProviderName(): string {
    return "Anthropic";
  }

  async generateText(
    prompt: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Anthropic service is not available. API key not configured.");
    }

    try {
      const response = await this.client.messages.create({
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature,
        system: options?.systemPrompt,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Anthropic");
      }

      return content.text;
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API error: ${error.message}`);
      }
      throw error;
    }
  }
}


