import { Expert, AgentMessage, Contribution, ContributionDebugInfo } from "@/types";
import { openai, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "@/lib/openai/client";
import { availableTools } from "@/lib/web-search/tools";
import { searchWeb, formatSearchResultsForAI } from "@/lib/web-search/search-service";

export interface GenerateResponse {
  content: string;
  debug: ContributionDebugInfo;
}

export class Agent {
  private expert: Expert;
  private conversationHistory: AgentMessage[];
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private useWebSearch: boolean;

  constructor(
    expert: Expert,
    model: string = DEFAULT_MODEL,
    temperature: number = DEFAULT_TEMPERATURE,
    maxTokens: number = DEFAULT_MAX_TOKENS,
    useWebSearch: boolean = false
  ) {
    this.expert = expert;
    this.conversationHistory = [];
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
    this.useWebSearch = useWebSearch;
  }

  getExpert(): Expert {
    return this.expert;
  }

  async generate(prompt: string, context?: string[]): Promise<GenerateResponse> {
    const messages: AgentMessage[] = [
      {
        role: "system",
        content: this.expert.systemPrompt,
      },
    ];

    // Add context from other agents if provided
    if (context && context.length > 0) {
      messages.push({
        role: "system",
        content: `Voici les contributions précédentes d'autres experts :\n\n${context.join("\n\n")}`,
      });
    }

    // Add conversation history
    messages.push(...this.conversationHistory);

    // Add current prompt
    messages.push({
      role: "user",
      content: prompt,
    });

    try {
      // First API call with optional tools
      const requestParams: any = {
        model: this.model,
        messages: messages as any,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      };

      // Add tools if web search is enabled
      if (this.useWebSearch) {
        requestParams.tools = availableTools;
        requestParams.tool_choice = "auto";
      }

      const response = await openai.chat.completions.create(requestParams);

      const responseMessage = response.choices[0]?.message;

      // Check if the model wants to call a function
      if (responseMessage?.tool_calls && this.useWebSearch) {
        // The model wants to use tools
        const toolCalls = responseMessage.tool_calls;

        // Add assistant's message to history
        messages.push(responseMessage as any);

        // Process each tool call
        for (const toolCall of toolCalls) {
          if (toolCall.type === "function" && toolCall.function.name === "search_web") {
            const args = JSON.parse(toolCall.function.arguments);
            console.log(`🔍 Agent ${this.expert.name} recherche sur le web: "${args.query}"`);

            // Execute web search
            const searchResults = await searchWeb(args.query, {
              searchDepth: args.search_depth || "basic",
              includeAnswer: true,
              maxResults: 5,
            });

            // Format results for AI
            const formattedResults = formatSearchResultsForAI(searchResults);

            // Add tool response to messages
            messages.push({
              role: "tool" as any,
              tool_call_id: toolCall.id,
              content: formattedResults,
            } as any);
          }
        }

        // Get final response from model with search results
        const finalResponse = await openai.chat.completions.create({
          model: this.model,
          messages: messages as any,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        });

        const assistantMessage = finalResponse.choices[0]?.message?.content || "";

        // Store in conversation history
        this.conversationHistory.push(
          { role: "user", content: prompt },
          { role: "assistant", content: assistantMessage }
        );

        // Build debug info
        const debugInfo: ContributionDebugInfo = {
          systemPrompt: this.expert.systemPrompt,
          userPrompt: prompt,
          contextProvided: context || [],
          conversationHistory: [...this.conversationHistory],
          model: this.model,
          temperature: this.temperature,
          maxTokens: this.maxTokens,
        };

        return {
          content: assistantMessage,
          debug: debugInfo,
        };
      } else {
        // No function call, use the direct response
        const assistantMessage = responseMessage?.content || "";

        // Store in conversation history
        this.conversationHistory.push(
          { role: "user", content: prompt },
          { role: "assistant", content: assistantMessage }
        );

        // Build debug info
        const debugInfo: ContributionDebugInfo = {
          systemPrompt: this.expert.systemPrompt,
          userPrompt: prompt,
          contextProvided: context || [],
          conversationHistory: [...this.conversationHistory],
          model: this.model,
          temperature: this.temperature,
          maxTokens: this.maxTokens,
        };

        return {
          content: assistantMessage,
          debug: debugInfo,
        };
      }
    } catch (error) {
      console.error(`Error generating response for ${this.expert.name}:`, error);
      throw error;
    }
  }

  async react(previousContributions: Contribution[]): Promise<GenerateResponse> {
    const context = previousContributions.map(
      (c) => `[${c.agentName}]: ${c.content}`
    );

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
