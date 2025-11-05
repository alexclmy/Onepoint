import OpenAI from "openai";

export const DEFAULT_MODEL = "gpt-4-turbo-preview";
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 4000;

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

// For backward compatibility
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    return getOpenAIClient()[prop as keyof OpenAI];
  },
});
