/**
 * Agent using OpenAI's Responses API with native web search
 * This is the modern approach recommended by OpenAI for 2025
 */

import { Expert, Contribution, ContributionDebugInfo, WebSearchDebugInfo } from "@/types";
import { createResponseWithWebSearch, URLCitation, WebSearchCall } from "@/lib/openai/responses-client";
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "@/lib/openai/client";

export interface ResponsesGenerateResult {
  content: string;
  debug: ContributionDebugInfo;
  citations?: URLCitation[];
}

export class ResponsesAgent {
  private expert: Expert;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private useWebSearch: boolean;
  private conversationHistory: string[];

  constructor(
    expert: Expert,
    model: string = DEFAULT_MODEL,
    temperature: number = DEFAULT_TEMPERATURE,
    maxTokens: number = DEFAULT_MAX_TOKENS,
    useWebSearch: boolean = false
  ) {
    this.expert = expert;
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
    this.useWebSearch = useWebSearch;
    this.conversationHistory = [];

    console.log(`🤖 [RESPONSES AGENT INIT] ${expert.name}:`, {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      webSearch: this.useWebSearch,
      usingResponsesAPI: true,
    });
  }

  getExpert(): Expert {
    return this.expert;
  }

  /**
   * Generate a response using Responses API
   */
  async generate(prompt: string, context?: string[]): Promise<ResponsesGenerateResult> {
    // Build the full input with system prompt, context, and user prompt
    let fullInput = `${this.expert.systemPrompt}\n\n`;

    if (context && context.length > 0) {
      fullInput += `Contexte des contributions précédentes :\n${context.join("\n\n")}\n\n`;
    }

    if (this.conversationHistory.length > 0) {
      fullInput += `Historique de la conversation :\n${this.conversationHistory.join("\n\n")}\n\n`;
    }

    fullInput += `Requête actuelle :\n${prompt}`;

    console.log(`📤 [RESPONSES API CALL] ${this.expert.name}:`, {
      model: this.model,
      temperature: this.temperature,
      max_output_tokens: this.maxTokens,
      webSearchEnabled: this.useWebSearch,
      inputLength: fullInput.length,
    });

    try {
      let result;

      if (this.useWebSearch) {
        // Use Responses API with native web search
        result = await createResponseWithWebSearch(this.model, fullInput, {
          reasoning: { effort: "medium" },
          temperature: this.temperature,
          max_output_tokens: this.maxTokens,
        });
      } else {
        // Use Responses API without web search
        const { createResponse } = await import("@/lib/openai/responses-client");
        result = await createResponse({
          model: this.model,
          input: fullInput,
          reasoning: { effort: "medium" },
          temperature: this.temperature,
          max_output_tokens: this.maxTokens,
        });
      }

      const assistantMessage = result.outputText;

      // Store in conversation history
      this.conversationHistory.push(`User: ${prompt}`);
      this.conversationHistory.push(`Assistant: ${assistantMessage}`);

      // Convert web search calls to our debug format
      const webSearches: WebSearchDebugInfo[] = result.webSearchCalls
        .filter((call) => call.action?.type === "search" && call.action.query)
        .map((call) => ({
          query: call.action!.query!,
          searchDepth: "basic" as const,
          resultsCount: call.action?.sources?.length || 0,
          results: (call.action?.sources || []).map((source) => ({
            title: source.title || "Untitled",
            url: source.url,
            content: "",
            score: undefined,
          })),
          answer: undefined,
        }));

      if (webSearches.length > 0) {
        console.log(`✅ [RESPONSES API] ${webSearches.length} web search(es) performed by ${this.expert.name}`);
      }

      // Build debug info
      const debugInfo: ContributionDebugInfo = {
        systemPrompt: this.expert.systemPrompt,
        userPrompt: prompt,
        contextProvided: context || [],
        conversationHistory: this.conversationHistory.map((msg) => ({
          role: msg.startsWith("User:") ? ("user" as const) : ("assistant" as const),
          content: msg.replace(/^(User|Assistant): /, ""),
        })),
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        webSearches: webSearches.length > 0 ? webSearches : undefined,
      };

      return {
        content: assistantMessage,
        debug: debugInfo,
        citations: result.citations,
      };
    } catch (error) {
      console.error(`❌ [RESPONSES AGENT] Error for ${this.expert.name}:`, error);
      throw error;
    }
  }

  /**
   * React to previous contributions
   */
  async react(previousContributions: Contribution[]): Promise<ResponsesGenerateResult> {
    const context = previousContributions.map((c) => `[${c.agentName}]: ${c.content}`);

    const prompt = `En tant qu'expert, réagis aux contributions précédentes. Tu peux :
- Apporter ton expertise complémentaire
- Soulever des points de désaccord constructifs
- Poser des questions pertinentes
- Proposer des recommandations

Sois concis et apporte de la valeur ajoutée.`;

    return this.generate(prompt, context);
  }

  resetHistory(): void {
    this.conversationHistory = [];
  }
}
