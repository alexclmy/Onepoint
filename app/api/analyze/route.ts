/**
 * Analysis API Route
 *
 * This endpoint handles multi-agent strategic analysis requests.
 * It orchestrates multiple AI experts to analyze business questions through:
 * - Initial individual analyses
 * - Debate and refinement rounds
 * - Action-specific synthesis
 * - Final cross-action synthesis
 *
 * Features:
 * - Server-Sent Events (SSE) streaming for real-time updates
 * - Database persistence (Supabase)
 * - LLM configuration loading
 * - Company context enrichment
 * - Debug information capture
 *
 * @module AnalyzeRoute
 */

import { NextRequest } from "next/server";
import { ActionType, Contribution, UserQuestion, Expert } from "@/types";
import { HybridOrchestrator } from "@/lib/agents/hybrid-orchestrator";
import { supabase } from "@/lib/supabase/client";
import {
  createAnalysis,
  completeAnalysis,
  failAnalysis,
} from "@/lib/supabase/analyses";
import { createModuleLogger } from "@/lib/utils/logger";

const log = createModuleLogger('AnalyzeRoute');

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, selectedActions, selectedExperts, userInvolved, useWebSearch, companyContext } = body as {
      userInput: string;
      selectedActions: ActionType[];
      selectedExperts: string[];
      userInvolved: boolean;
      useWebSearch?: boolean;
      companyContext?: any;
    };

    // Validate input
    if (!userInput || !selectedActions.length || !selectedExperts.length) {
      return new Response("Invalid input", { status: 400 });
    }

    // Enrich user input with company context if provided
    let enrichedUserInput = userInput;
    if (companyContext) {
      const contextParts: string[] = [userInput];

      if (companyContext.name) {
        contextParts.push(`\n\n**Contexte Entreprise: ${companyContext.name}**`);
      }
      if (companyContext.industry) {
        contextParts.push(`Industrie: ${companyContext.industry}`);
      }
      if (companyContext.description) {
        contextParts.push(`Description: ${companyContext.description}`);
      }
      if (companyContext.targetMarket) {
        contextParts.push(`Marché cible: ${companyContext.targetMarket}`);
      }
      if (companyContext.competitors && companyContext.competitors.length > 0) {
        contextParts.push(`Concurrents: ${companyContext.competitors.join(", ")}`);
      }
      if (companyContext.uniqueSellingPoints && companyContext.uniqueSellingPoints.length > 0) {
        contextParts.push(`Points de différenciation: ${companyContext.uniqueSellingPoints.join(", ")}`);
      }
      if (companyContext.values && companyContext.values.length > 0) {
        contextParts.push(`Valeurs: ${companyContext.values.join(", ")}`);
      }
      if (companyContext.glossary && companyContext.glossary.length > 0) {
        contextParts.push(`\nGlossaire:`);
        companyContext.glossary.forEach((term: any) => {
          contextParts.push(`- ${term.term}: ${term.definition}`);
        });
      }
      if (companyContext.customContext) {
        contextParts.push(`\nContexte additionnel: ${companyContext.customContext}`);
      }

      enrichedUserInput = contextParts.join("\n");
    }

    // Create analysis record in database
    const { id: analysisId, error: createError } = await createAnalysis({
      userInput,
      selectedActions,
      selectedExperts,
      userInvolved,
    });

    if (createError || !analysisId) {
      log.error("Failed to create analysis in database", createError);
      return new Response("Failed to create analysis", { status: 500 });
    }

    log.info('Analysis created', { analysisId });

    // Load all experts from Supabase
    let allExperts: Expert[] = [];
    try {
      const { data: expertsData, error: expertsError } = await supabase
        .from("experts")
        .select("*")
        .order("is_predefined", { ascending: false })
        .order("created_at", { ascending: false });

      if (expertsError) {
        log.error("Failed to load experts from database", expertsError);
        return new Response("Failed to load experts", { status: 500 });
      }

      allExperts = (expertsData || []).map((expert) => ({
        id: expert.id,
        name: expert.name,
        role: expert.role,
        expertise: expert.expertise,
        tone: expert.tone as Expert["tone"],
        systemPrompt: expert.system_prompt,
        isCustom: expert.is_custom,
        isPredefined: expert.is_predefined,
        color: expert.color || "#009DDF",
        avatar: expert.avatar,
      }));
    } catch (error) {
      log.error("Exception while loading experts", error);
      return new Response("Failed to load experts", { status: 500 });
    }

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Load LLM configuration from Supabase
          const { data: llmConfig, error: configError } = await supabase
            .from("llm_configs")
            .select("*")
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Load LLM configuration
          log.debug('LLM config loaded from database', {
            hasConfig: !!llmConfig,
            hasError: !!configError,
          });

          // Use user config or fallback to defaults (GPT-5.2 is the new default)
          const model = llmConfig?.model || "gpt-5.2";
          const temperature = llmConfig?.temperature ?? 0.7;
          const maxTokens = llmConfig?.max_tokens || 4000;

          log.info('Starting analysis with LLM configuration', {
            source: llmConfig ? 'database' : 'defaults',
            model,
            temperature,
            maxTokens,
            webSearchEnabled: useWebSearch || false,
          });

          // Use Hybrid Orchestrator with Responses API and native web search
          const orchestrator = new HybridOrchestrator({
            userInput: enrichedUserInput, // Use enriched input with company context
            selectedActions,
            selectedExperts,
            userInvolved,
            allExperts, // Pass all experts (predefined + custom)
            useWebSearch: useWebSearch || false, // Enable web search if requested
            model, // Apply user's model choice or default
            temperature, // Apply user's temperature or default
            maxTokens, // Apply user's max tokens or default
            onContribution: (contribution: Contribution) => {
              sendEvent({
                type: "contribution",
                contribution,
              });
            },
            onQuestion: async (question: UserQuestion) => {
              sendEvent({
                type: "question",
                question,
              });

              // In a real implementation, we would wait for user response
              // For now, we'll return a placeholder
              return null;
            },
          });

          const result = await orchestrator.runAnalysis();

          // Save final results to database
          const { error: completeError } = await completeAnalysis(analysisId, {
            timeline: result.timeline,
            result: result.finalOutput,
            // pdfUrl will be added later when PDF is generated
          });

          if (completeError) {
            log.error("Failed to save analysis results", completeError);
          } else {
            log.info('Analysis completed successfully', { analysisId });
          }

          sendEvent({
            type: "complete",
            result: {
              analysisId, // Send analysis ID to client
              timeline: result.timeline,
              finalOutput: result.finalOutput,
            },
          });

          controller.close();
        } catch (error) {
          log.error("Orchestration failed", error, { analysisId });

          // Mark analysis as failed in database
          await failAnalysis(
            analysisId,
            error instanceof Error ? error.message : "Unknown error"
          );

          sendEvent({
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    log.error("API request failed", error);
    return new Response("Internal server error", { status: 500 });
  }
}
