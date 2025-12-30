/**
 * OneVeille Execution API Route
 *
 * Handles strategic intelligence ("veille") requests with:
 * - Query decomposition into focused sub-questions
 * - Parallel web searches for each sub-question
 * - Individual synthesis per sub-question
 * - Final global synthesis
 * - Real-time SSE streaming of progress
 * - Database persistence
 *
 * @module ExecuteVeilleRoute
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase/client";
import { createModuleLogger } from "@/lib/utils/logger";
import { createResponseWithWebSearch } from "@/lib/openai/responses-client";

const log = createModuleLogger('ExecuteVeille');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VeilleRequest {
  query: string;
  parameters: {
    geography: number;
    temporality: number;
    focus: number;
  };
  keywords: string[];
  companyId?: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
}

interface VeilleResult {
  subQuery: string;
  searchResults: SearchResult[];
  synthesis: string;
}

/**
 * Check if a model is a reasoning model that doesn't support temperature
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

/**
 * Stream encoder for Server-Sent Events
 */
function encodeSSE(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Decompose main query into focused sub-queries
 */
async function decompose
(query: string, params: VeilleRequest["parameters"], keywords: string[], model: string): Promise<string[]> {
  const systemPrompt = `Tu es un expert en recherche stratégique. Ta tâche est de décomposer une question complexe en 5-8 sous-questions ciblées pour une recherche web approfondie.

Contexte des paramètres :
- Géographie (${params.geography}/100): ${params.geography < 30 ? "Local/Régional" : params.geography < 70 ? "National" : "International/Global"}
- Temporalité (${params.temporality}/100): ${params.temporality < 30 ? "Dernières semaines" : params.temporality < 70 ? "Derniers mois" : "Historique complet"}
- Focus (${params.focus}/100): ${params.focus < 30 ? "Business/Marché" : params.focus < 70 ? "Équilibré" : "Technique/Innovation"}

Mots-clés prioritaires: ${keywords.join(", ")}

Réponds UNIQUEMENT avec un JSON au format :
{
  "subQueries": ["sous-question 1", "sous-question 2", ...]
}`;

  const completionOptions: OpenAI.Chat.ChatCompletionCreateParams = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Décompose cette demande de veille en sous-questions ciblées :\n\n"${query}"` },
    ],
    response_format: { type: "json_object" },
  };

  if (!isReasoningModel(model)) {
    completionOptions.temperature = 0.8;
  }

  const response = await openai.chat.completions.create(completionOptions);
  const result = response.choices[0].message.content;

  if (!result) {
    throw new Error("No response from decomposition");
  }

  const parsed = JSON.parse(result);
  return parsed.subQueries || [];
}

/**
 * Execute web search using OpenAI Responses API with native web search
 */
async function executeWebSearch(subQuery: string, model: string): Promise<{ results: SearchResult[], debugInfo: any }> {
  try {
    log.info('Executing web search', { subQuery, model });

    // Use the proper Responses API with native web search
    const response = await createResponseWithWebSearch(
      model,
      `Recherche sur le web pour répondre à cette question: ${subQuery}\n\nFournis une synthèse des informations trouvées avec les sources.`,
      {
        temperature: 0.7,
        max_output_tokens: 2000,
      }
    );

    log.info('Web search completed', {
      subQuery,
      citationsCount: response.citations.length,
      webSearchCallsCount: response.webSearchCalls.length,
    });

    // Convert citations to SearchResult format
    const results: SearchResult[] = response.citations.map((citation, index) => ({
      title: citation.title || `Source ${index + 1}`,
      url: citation.url,
      snippet: response.outputText.substring(citation.start_index, citation.end_index),
      relevance: 100 - (index * 10), // Prioritize earlier citations
    }));

    // Prepare debug info
    const debugInfo = {
      webSearchCalls: response.webSearchCalls.map(call => ({
        id: call.id,
        status: call.status,
        query: call.action?.query,
        sourcesFound: call.action?.sources?.length || 0,
        sources: call.action?.sources?.map(s => ({ url: s.url, title: s.title })) || [],
      })),
      citationsCount: response.citations.length,
      outputLength: response.outputText.length,
    };

    return { results, debugInfo };
  } catch (error) {
    log.error("Exception during web search", error);
    return { results: [], debugInfo: { error: String(error) } };
  }
}

/**
 * Synthesize findings from all searches
 */
async function synthesizeFindings(
  query: string,
  results: VeilleResult[],
  params: VeilleRequest["parameters"],
  model: string
): Promise<string> {
  const systemPrompt = `Tu es un consultant en veille stratégique. Synthétise les résultats de recherche en un rapport structuré et actionnable.

Format attendu (Markdown) :
# Synthèse de Veille Stratégique

## 🎯 Résumé Exécutif
[2-3 paragraphes clés]

## 📊 Principales Découvertes
### [Thème 1]
- Point clé avec [source]
- Impact et implications

### [Thème 2]
- Point clé avec [source]
- Impact et implications

## 🔍 Analyse Détaillée
[Analyse approfondie par sous-thème]

## 💡 Recommandations Stratégiques
1. [Recommandation 1]
2. [Recommandation 2]

## 📚 Sources Clés
[Liste des sources principales avec URLs]`;

  const resultsContext = results
    .map((r, i) => `\n### Recherche ${i + 1}: ${r.subQuery}\n${r.synthesis}`)
    .join("\n");

  const completionOptions: OpenAI.Chat.ChatCompletionCreateParams = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Question initiale: "${query}"\n\nRésultats de recherche:${resultsContext}\n\nSynthétise ces informations en un rapport stratégique complet.`,
      },
    ],
  };

  if (!isReasoningModel(model)) {
    completionOptions.temperature = 0.7;
  }

  const response = await openai.chat.completions.create(completionOptions);
  return response.choices[0].message.content || "";
}

/**
 * Synthesize individual search results
 */
async function synthesizeSearchResults(
  subQuery: string,
  searchResults: SearchResult[],
  model: string
): Promise<string> {
  if (searchResults.length === 0) {
    return "Aucun résultat pertinent trouvé.";
  }

  const resultsText = searchResults
    .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.snippet}\n   Source: ${r.url}`)
    .join("\n\n");

  const completionOptions: OpenAI.Chat.ChatCompletionCreateParams = {
    model,
    messages: [
      {
        role: "system",
        content: "Tu es un analyste. Synthétise les résultats de recherche en 2-3 paragraphes concis avec les points clés et sources.",
      },
      {
        role: "user",
        content: `Question: ${subQuery}\n\nRésultats:\n${resultsText}\n\nSynthétise ces informations.`,
      },
    ],
  };

  if (!isReasoningModel(model)) {
    completionOptions.temperature = 0.7;
  }

  const response = await openai.chat.completions.create(completionOptions);
  return response.choices[0].message.content || "";
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body: VeilleRequest = await request.json();
        const { query, parameters, keywords, companyId } = body;

        // Load LLM config
        const { data: llmConfig } = await supabase
          .from("llm_configs")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const model = llmConfig?.model || "gpt-4o";

        log.info('Starting veille execution', {
          query,
          parameters,
          keywords,
          model,
        });

        // Load company context if provided
        let companyContext = "";
        if (companyId) {
          const { data: company } = await supabase
            .from("company")
            .select("*")
            .eq("id", companyId)
            .single();

          if (company) {
            companyContext = `\nContexte entreprise: ${company.name}\nSecteur: ${company.sector}\nDescription: ${company.description}`;
          }
        }

        // Phase 1: Decompose query
        controller.enqueue(
          encoder.encode(encodeSSE("status", { phase: "decomposition", message: "Décomposition de la requête en sous-questions..." }))
        );

        const subQueries = await decompose(query + companyContext, parameters, keywords, model);

        controller.enqueue(
          encoder.encode(encodeSSE("subQueries", { subQueries }))
        );

        // Phase 2: Execute searches in parallel
        controller.enqueue(
          encoder.encode(encodeSSE("status", { phase: "search", message: `Recherche en cours sur ${subQueries.length} axes...` }))
        );

        const searchPromises = subQueries.map(async (subQuery, index) => {
          controller.enqueue(
            encoder.encode(encodeSSE("searchStart", { index, subQuery }))
          );

          const { results: searchResults, debugInfo } = await executeWebSearch(subQuery, model);

          // Send debug information
          controller.enqueue(
            encoder.encode(encodeSSE("searchDebug", {
              index,
              subQuery,
              debugInfo,
              timestamp: new Date().toISOString(),
            }))
          );

          controller.enqueue(
            encoder.encode(encodeSSE("searchResults", { index, subQuery, resultsCount: searchResults.length }))
          );

          // Synthesize individual search results
          const synthesis = await synthesizeSearchResults(subQuery, searchResults, model);

          controller.enqueue(
            encoder.encode(encodeSSE("searchComplete", { index, subQuery, synthesis }))
          );

          return {
            subQuery,
            searchResults,
            synthesis,
          };
        });

        const results = await Promise.all(searchPromises);

        // Phase 3: Final synthesis
        controller.enqueue(
          encoder.encode(encodeSSE("status", { phase: "synthesis", message: "Synthèse finale en cours..." }))
        );

        const finalReport = await synthesizeFindings(query, results, parameters, model);

        controller.enqueue(
          encoder.encode(encodeSSE("finalReport", { report: finalReport }))
        );

        // Save to database
        const { data: savedVeille, error: saveError } = await supabase
          .from("veille_history")
          .insert({
            query,
            parameters,
            keywords,
            company_id: companyId || null,
            sub_queries: subQueries,
            results: results,
            final_report: finalReport,
            model_used: model,
          })
          .select()
          .single();

        if (saveError) {
          log.error("Failed to save veille to database", saveError);
        } else {
          log.info('Veille saved successfully', { veilleId: savedVeille.id });
          controller.enqueue(
            encoder.encode(encodeSSE("saved", { veilleId: savedVeille.id }))
          );
        }

        controller.enqueue(
          encoder.encode(encodeSSE("complete", { message: "Veille terminée avec succès" }))
        );

        controller.close();
      } catch (error) {
        log.error("Veille execution failed", error);
        controller.enqueue(
          encoder.encode(encodeSSE("error", { error: String(error) }))
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
