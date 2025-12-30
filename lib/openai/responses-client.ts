/**
 * OpenAI Responses API Client
 *
 * This module provides an interface to OpenAI's Responses API (2025).
 * The Responses API is the modern successor to Chat Completions API, offering:
 * - Native web search capabilities (no external services needed)
 * - Automatic citation extraction from web sources
 * - 40-80% cost reduction compared to Chat Completions
 * - 3-5% performance improvement on benchmarks
 * - Better handling of reasoning models (GPT-5, o-series)
 *
 * Important: GPT-5 and o-series models don't support the temperature parameter
 *
 * @see https://platform.openai.com/docs/guides/migrate-to-responses
 * @module ResponsesClient
 */

import OpenAI from "openai";
import { getOpenAIClient } from "./client";
import { createModuleLogger } from "@/lib/utils/logger";

const log = createModuleLogger('ResponsesClient');

/**
 * Check if a model is a reasoning model that doesn't support temperature
 *
 * GPT-5 and o-series models use built-in reasoning and don't support
 * temperature, top_p, presence_penalty, or frequency_penalty parameters.
 *
 * @param model - Model name to check
 * @returns True if it's a reasoning model
 */
function isReasoningModel(model: string): boolean {
  const lowerModel = model.toLowerCase();
  return (
    lowerModel.startsWith("gpt-5") ||
    lowerModel.startsWith("o3") ||
    lowerModel.startsWith("o4") ||
    lowerModel.startsWith("o1") ||
    lowerModel.includes("reasoning")
  );
}

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
 * Create a response using OpenAI's Responses API
 *
 * This function handles:
 * - Automatic parameter adjustment for reasoning models
 * - Web search tool integration
 * - Citation extraction from web results
 * - Structured output parsing
 *
 * @param options - Configuration for the API call
 * @returns Parsed response with text, citations, and web search calls
 */
export async function createResponse(
  options: CreateResponseOptions
): Promise<ResponsesAPIResult> {
  const isReasoning = isReasoningModel(options.model);

  log.debug('Creating Responses API call', {
    model: options.model,
    isReasoningModel: isReasoning,
    hasWebSearch: options.tools?.some((t) => t.type === "web_search"),
    reasoning: options.reasoning,
    temperatureSupported: !isReasoning,
  });

  try {
    // Build API parameters
    const apiParams: any = {
      model: options.model,
      input: options.input,
      tools: options.tools,
      tool_choice: options.tool_choice || "auto",
      reasoning: options.reasoning,
      max_output_tokens: options.max_output_tokens,
    };

    // Only include temperature for non-reasoning models
    // GPT-5 and o-series models don't support temperature
    if (!isReasoning && options.temperature !== undefined) {
      apiParams.temperature = options.temperature;
    }

    // Call the Responses API directly using fetch
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(apiParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error('Responses API call failed', { status: response.status, error: errorText });
      throw new Error(`Responses API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    log.debug('Responses API call completed', {
      outputItemsCount: data.output?.length || 0,
      hasOutputText: !!data.output_text,
    });

    // Extract output items
    const webSearchCalls: WebSearchCall[] = [];
    let outputText = data.output_text || "";
    const citations: URLCitation[] = [];

    if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === "web_search_call") {
          webSearchCalls.push({
            id: item.id,
            status: item.status,
            action: item.action,
          });

          if (item.action?.type === "search") {
            log.debug(`Web search executed: "${item.action.query}"`, {
              domainsSearched: item.action.domains?.length || 0,
              sourcesFound: item.action.sources?.length || 0,
            });
          }
        } else if (item.type === "message" && item.role === "assistant") {
          // Extract text and citations
          for (const content of item.content || []) {
            if (content.type === "output_text") {
              if (!outputText) {
                outputText += content.text;
              }

              if (content.annotations) {
                citations.push(...content.annotations.filter((a: any) => a.type === "url_citation"));
              }
            }
          }
        }
      }
    }

    log.debug('Response extracted successfully', {
      textLength: outputText.length,
      citationsCount: citations.length,
      webSearchCallsCount: webSearchCalls.length,
    });

    return {
      outputText,
      citations,
      webSearchCalls,
      fullResponse: data,
    };
  } catch (error: any) {
    log.error('Responses API call failed', error);
    throw new Error(`Responses API error: ${error.message}`);
  }
}

/**
 * Create a response with web search enabled (convenience function)
 *
 * This is a shortcut for createResponse() with web search tool pre-configured.
 * Use this when you want to enable native web search capabilities.
 *
 * @param model - OpenAI model to use
 * @param input - User input/prompt
 * @param options - Optional configuration (temperature, tokens, domains)
 * @returns Response with web search results and citations
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
