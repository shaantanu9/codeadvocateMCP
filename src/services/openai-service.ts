import OpenAI from "openai";
import type { AIService, AIServiceOptions } from "./ai-service.interface.js";

/**
 * OpenAI service implementation
 */
export class OpenAIService implements AIService {
  private client: OpenAI | null = null;
  private defaultModel: string = "gpt-4";

  constructor(options: AIServiceOptions) {
    if (options.apiKey) {
      this.client = new OpenAI({
        apiKey: options.apiKey,
      });
      this.defaultModel = options.defaultModel || this.defaultModel;
      console.log(`[OpenAI] Service initialized with model: ${this.defaultModel}`);
    } else {
      console.warn("[OpenAI] No API key provided, service will not be available");
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getProviderName(): string {
    return "OpenAI";
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
      throw new Error("OpenAI service is not available. API key not configured.");
    }

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (options?.systemPrompt) {
        messages.push({
          role: "system",
          content: options.systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: prompt,
      });

      const response = await this.client.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages,
        max_tokens: options?.maxTokens,
        temperature: options?.temperature,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      return content;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }
}


