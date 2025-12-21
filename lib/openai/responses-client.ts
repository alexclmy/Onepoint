/**
 * OpenAI Responses API Client
 * Uses the new Responses API with native web search capabilities
 * https://platform.openai.com/docs/guides/migrate-to-responses
 */

import OpenAI from "openai";
import { getOpenAIClient } from "./client";

export interface WebSearchAction {
  type: "search" | "open_page" | "find_in_page";
  query?: string;
  domains?: string[];
  sources?: Array<{
    url: string;
    title?: string;
  }>;
}

export interface WebSearchCall {
  id: string;
  status: "completed" | "in_progress" | "failed";
  action?: WebSearchAction;
}

export interface URLCitation {
  type: "url_citation";
  start_index: number;
  end_index: number;
  url: string;
  title?: string;
}

export interface ResponseMessage {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<{
    type: "output_text";
    text: string;
    annotations?: URLCitation[];
  }>;
}

export interface ResponsesAPIResult {
  outputText: string;
  citations: URLCitation[];
  webSearchCalls: WebSearchCall[];
  fullResponse: any;
}

export interface CreateResponseOptions {
  model: string;
  input: string;
  reasoning?: {
    effort?: "low" | "medium" | "high";
  };
  tools?: Array<{
    type: "web_search";
    filters?: {
      allowed_domains?: string[];
    };
    external_web_access?: boolean;
    user_location?: {
      type: "approximate";
      country?: string;
      city?: string;
      region?: string;
      timezone?: string;
    };
  }>;
  tool_choice?: "auto" | "required" | "none";
  temperature?: number;
  max_output_tokens?: number;
}

/**
 * Create a response using OpenAI's Responses API with native web search
 */
export async function createResponse(
  options: CreateResponseOptions
): Promise<ResponsesAPIResult> {
  const client = getOpenAIClient();

  console.log("🚀 [RESPONSES API] Creating response with:", {
    model: options.model,
    hasWebSearch: options.tools?.some((t) => t.type === "web_search"),
    reasoning: options.reasoning,
  });

  try {
    // Call the Responses API
    const response = await (client as any).responses.create({
      model: options.model,
      input: options.input,
      tools: options.tools,
      tool_choice: options.tool_choice || "auto",
      reasoning: options.reasoning,
      temperature: options.temperature,
      max_output_tokens: options.max_output_tokens,
    });

    console.log("✅ [RESPONSES API] Response received:", {
      outputItemsCount: response.output?.length || 0,
    });

    // Extract output items
    const webSearchCalls: WebSearchCall[] = [];
    let outputText = "";
    const citations: URLCitation[] = [];

    if (Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === "web_search_call") {
          webSearchCalls.push({
            id: item.id,
            status: item.status,
            action: item.action,
          });

          if (item.action?.type === "search") {
            console.log(`🔍 [WEB SEARCH] Query: "${item.action.query}"`, {
              domainsSearched: item.action.domains?.length || 0,
              sourcesFound: item.action.sources?.length || 0,
            });
          }
        } else if (item.type === "message" && item.role === "assistant") {
          // Extract text and citations
          for (const content of item.content || []) {
            if (content.type === "output_text") {
              outputText += content.text;

              if (content.annotations) {
                citations.push(...content.annotations.filter((a: any) => a.type === "url_citation"));
              }
            }
          }
        }
      }
    }

    console.log("📊 [RESPONSES API] Extracted:", {
      textLength: outputText.length,
      citationsCount: citations.length,
      webSearchCallsCount: webSearchCalls.length,
    });

    return {
      outputText,
      citations,
      webSearchCalls,
      fullResponse: response,
    };
  } catch (error: any) {
    console.error("❌ [RESPONSES API] Error:", error.message);
    throw new Error(`Responses API error: ${error.message}`);
  }
}

/**
 * Create a response with web search enabled (shortcut)
 */
export async function createResponseWithWebSearch(
  model: string,
  input: string,
  options?: {
    reasoning?: { effort?: "low" | "medium" | "high" };
    temperature?: number;
    max_output_tokens?: number;
    allowed_domains?: string[];
  }
): Promise<ResponsesAPIResult> {
  return createResponse({
    model,
    input,
    tools: [
      {
        type: "web_search",
        filters: options?.allowed_domains
          ? { allowed_domains: options.allowed_domains }
          : undefined,
      },
    ],
    tool_choice: "auto",
    reasoning: options?.reasoning,
    temperature: options?.temperature,
    max_output_tokens: options?.max_output_tokens,
  });
}
