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
  // Get current date context for temporal awareness
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleString('fr-FR', { month: 'long' });

  const systemPrompt = `Tu es un expert en recherche stratégique. Ta tâche est de décomposer une question en EXACTEMENT 4 sous-questions RÉALISTES et ACCESSIBLES pour une recherche web.

CONTEXTE TEMPOREL IMPORTANT :
- Nous sommes en ${currentMonth} ${currentYear}
- Pour des sujets récents, utilise des termes comme "récemment", "derniers mois", "tendances actuelles" plutôt que des années spécifiques

IMPORTANT : Les sous-questions doivent être:
- Formulées de manière à ce qu'on puisse trouver des réponses sur le web (articles, blogs, médias, sites spécialisés)
- GÉNÉRALES et pas trop spécifiques (éviter de demander des listes exhaustives impossible à obtenir)
- Orientées vers ce qui est DISPONIBLE publiquement en ligne
- CONCRÈTES et factuelles (éviter les questions trop académiques ou théoriques)

Contexte des paramètres :
- Géographie (${params.geography}/100): ${params.geography < 30 ? "Local/Régional" : params.geography < 70 ? "National" : "International/Global"}
- Temporalité (${params.temporality}/100): ${params.temporality < 30 ? "Dernières semaines" : params.temporality < 70 ? "Derniers mois" : "Historique complet"}
- Focus (${params.focus}/100): ${params.focus < 30 ? "Business/Marché" : params.focus < 70 ? "Équilibré" : "Technique/Innovation"}

Mots-clés prioritaires: ${keywords.join(", ")}

Exemples de BONNES sous-questions (accessibles web):
- "Quelles sont les principales innovations dans [domaine] récemment ?"
- "Quels acteurs clés dominent le marché de [sujet] actuellement ?"
- "Quels articles de presse ou analyses ont parlé de [sujet] récemment ?"
- "Quelles tendances émergentes dans [domaine] sont documentées ?"

Exemples de MAUVAISES sous-questions (irréalistes):
- "Liste exhaustive de tous les papiers sur arXiv en ${currentMonth} ${currentYear}" ❌
- "Tous les repos GitHub avec étoiles, forks, dates de commit" ❌
- "Chiffres comparatifs complets sur tous les benchmarks" ❌

Réponds UNIQUEMENT avec un JSON au format (EXACTEMENT 4 sous-questions) :
{
  "subQueries": ["sous-question 1", "sous-question 2", "sous-question 3", "sous-question 4"]
}`;

  const completionOptions: OpenAI.Chat.ChatCompletionCreateParams = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Décompose cette demande de veille en sous-questions RÉALISTES et ACCESSIBLES pour une recherche web :\n\n"${query}"` },
    ],
    response_format: { type: "json_object" },
  };

  if (!isReasoningModel(model)) {
    completionOptions.temperature = 0.7;
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
 * Includes a 120-second timeout to prevent hanging indefinitely
 */
async function executeWebSearch(subQuery: string, model: string): Promise<{ results: SearchResult[], synthesis: string, debugInfo: any }> {
  const SEARCH_TIMEOUT_MS = 120000; // 120 seconds timeout per search

  // Create a promise that rejects after timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Search timed out after ${SEARCH_TIMEOUT_MS / 1000} seconds`));
    }, SEARCH_TIMEOUT_MS);
  });

  // Create the actual search promise
  const searchPromise = (async () => {
    try {
      log.info('Executing web search', { subQuery, model });

      // Use the proper Responses API with native web search
      const response = await createResponseWithWebSearch(
        model,
        `Tu DOIS effectuer une recherche web et répondre à cette question basée sur les résultats trouvés.

Question: ${subQuery}

INSTRUCTIONS IMPORTANTES:
1. Effectue une recherche web approfondie sur cette question (utilise le web search tool)
2. Explore PLUSIEURS sources différentes (articles, blogs, sites d'actualité, forums spécialisés)
3. Synthétise les informations trouvées en 2-4 paragraphes concis
4. Cite TOUTES les sources pertinentes avec le format [titre](url)
5. Si les résultats sont limités ou peu pertinents :
   - Mentionne quand même les sources que tu as trouvées
   - Explique pourquoi il y a peu de résultats (sujet trop récent, trop spécifique, manque de données publiques, etc.)
   - Suggère des pistes alternatives ou des informations connexes trouvées
6. NE POSE JAMAIS de questions de clarification - réponds avec ce que tu trouves
7. Concentre-toi sur les informations les plus récentes et pertinentes disponibles

IMPORTANT: Même si les résultats ne sont pas parfaits, fournis une synthèse avec les sources trouvées plutôt que de dire "aucun résultat".

Réponds maintenant avec une synthèse basée sur ta recherche web:`,
        {
          temperature: 0.2,
          max_output_tokens: 4000,
          forceWebSearch: true,
        }
      );

      log.info('Web search completed', {
        subQuery,
        citationsCount: response.citations.length,
        webSearchCallsCount: response.webSearchCalls.length,
        outputTextLength: response.outputText.length,
      });

      // Build results from both citations AND web search sources
      // Use citations if available, otherwise fallback to sources from web search calls
      let results: SearchResult[] = [];

      if (response.citations.length > 0) {
        // Use citations from the text
        results = response.citations.map((citation, index) => ({
          title: citation.title || `Source ${index + 1}`,
          url: citation.url,
          snippet: response.outputText.substring(
            citation.start_index,
            Math.min(citation.end_index, response.outputText.length)
          ),
          relevance: 100 - (index * 10),
        }));
      } else {
        // Fallback: extract sources from web search calls
        const allSources = response.webSearchCalls
          .flatMap(call => call.action?.sources || [])
          .slice(0, 10); // Limit to top 10 sources

        results = allSources.map((source, index) => ({
          title: source.title || `Source ${index + 1}`,
          url: source.url,
          snippet: source.title || '',
          relevance: 100 - (index * 10),
        }));
      }

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

      // Return the output text as synthesis (already includes web search results)
      // If we have sources but no output text, create a basic summary
      let synthesis = response.outputText;
      if (!synthesis || synthesis.trim().length === 0) {
        if (results.length > 0) {
          synthesis = `${results.length} source(s) trouvée(s) sur cette recherche. Consultez les détails techniques pour voir les URLs.`;
        } else {
          synthesis = "Aucun résultat pertinent trouvé pour cette recherche. Le sujet pourrait être trop récent ou trop spécifique.";
        }
      }

      return {
        results,
        synthesis,
        debugInfo
      };
    } catch (error) {
      log.error("Exception during web search", error);
      return {
        results: [],
        synthesis: "Erreur lors de la recherche.",
        debugInfo: { error: String(error) }
      };
    }
  })();

  // Race between search and timeout
  try {
    return await Promise.race([searchPromise, timeoutPromise]);
  } catch (error: any) {
    if (error.message.includes('timed out')) {
      log.warn('Search timed out', { subQuery, timeout: SEARCH_TIMEOUT_MS });
      return {
        results: [],
        synthesis: `La recherche a dépassé le temps limite de ${SEARCH_TIMEOUT_MS / 1000} secondes. Cette question était peut-être trop complexe ou le web search a rencontré des difficultés. Essayez de reformuler la question de manière plus simple ou divisez-la en plusieurs questions distinctes.`,
        debugInfo: { error: 'Timeout', timeoutMs: SEARCH_TIMEOUT_MS }
      };
    }
    throw error;
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

IMPORTANT : Tu DOIS toujours générer un rapport, même si les résultats de recherche sont limités. Si certaines recherches n'ont pas donné de résultats, mentionne-le et concentre-toi sur ce qui a été trouvé.

Format attendu (Markdown) :
# Synthèse de Veille Stratégique

## 🎯 Résumé Exécutif
[2-3 paragraphes clés synthétisant les informations disponibles]

## 📊 Principales Découvertes
### [Thème 1]
- Point clé avec sources
- Impact et implications

### [Thème 2]
- Point clé avec sources
- Impact et implications

## 🔍 Analyse Détaillée
[Analyse approfondie des thèmes trouvés, même si limitée]

## 📚 Sources Clés
[Liste des sources principales trouvées avec leurs URLs]

## 🚀 Axes d'Exploration et d'Approfondissement
[Suggère 3-5 axes ou pistes à explorer pour aller plus loin sur ce sujet]
- Axe 1 : [Domaine ou angle spécifique à creuser]
- Axe 2 : [Question connexe ou aspect complémentaire]
- Axe 3 : [Tendance émergente à surveiller]
- Axe 4 : [Données manquantes qui mériteraient une veille dédiée]

Si des recherches n'ont pas donné de résultats, indique-le clairement et intègre ces manques dans les axes d'approfondissement.`;

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
  const finalReport = response.choices[0].message.content || "";

  log.info('Final synthesis generated', {
    reportLength: finalReport.length,
    resultsCount: results.length,
  });

  return finalReport;
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

          const { results: searchResults, synthesis, debugInfo } = await executeWebSearch(subQuery, model);

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

          // synthesis is already provided by the Responses API with web search
          // Include both citations count and sources count for better visibility
          const citationsCount = searchResults.length;
          const sourcesCount = debugInfo.webSearchCalls.reduce((acc: number, call: any) => acc + (call.sourcesFound || 0), 0);

          controller.enqueue(
            encoder.encode(encodeSSE("searchComplete", {
              index,
              subQuery,
              synthesis,
              resultsCount: searchResults.length,
              citationsCount,
              sourcesCount,
            }))
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
