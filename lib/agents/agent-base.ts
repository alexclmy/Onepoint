import { Expert, AgentMessage, Contribution } from "@/types";
import { openai, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "@/lib/openai/client";

export class Agent {
  private expert: Expert;
  private conversationHistory: AgentMessage[];
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(
    expert: Expert,
    model: string = DEFAULT_MODEL,
    temperature: number = DEFAULT_TEMPERATURE,
    maxTokens: number = DEFAULT_MAX_TOKENS
  ) {
    this.expert = expert;
    this.conversationHistory = [];
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  getExpert(): Expert {
    return this.expert;
  }

  async generate(prompt: string, context?: string[]): Promise<string> {
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
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: messages as any,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const assistantMessage = response.choices[0]?.message?.content || "";

      // Store in conversation history
      this.conversationHistory.push(
        { role: "user", content: prompt },
        { role: "assistant", content: assistantMessage }
      );

      return assistantMessage;
    } catch (error) {
      console.error(`Error generating response for ${this.expert.name}:`, error);
      throw error;
    }
  }

  async react(previousContributions: Contribution[]): Promise<string> {
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
