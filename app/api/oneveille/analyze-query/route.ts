import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Models that support structured outputs
const STRUCTURED_OUTPUT_MODELS = [
  "gpt-4-turbo-preview",
  "gpt-4-1106-preview",
  "gpt-4-0125-preview",
  "gpt-5",
  "gpt-5.1",
  "gpt-5.2",
  "gpt-5-mini",
  "gpt-4o",
  "gpt-4o-mini",
];

/**
 * Check if a model is a reasoning model that doesn't support temperature
 * GPT-5 and o-series models don't support temperature, top_p, presence_penalty, etc.
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

function supportsStructuredOutput(model: string): boolean {
  return STRUCTURED_OUTPUT_MODELS.some(supportedModel =>
    model.toLowerCase().includes(supportedModel.toLowerCase())
  );
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Load LLM configuration from Supabase
    const { data: llmConfig, error: configError } = await supabase
      .from("llm_configs")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Use user config or fallback to GPT-4o (supports structured output)
    const model = llmConfig?.model || "gpt-4o";
    const useStructuredOutput = supportsStructuredOutput(model);
    const isReasoning = isReasoningModel(model);

    console.log("🔍 [ONEVEILLE] Analyzing query with:", {
      model,
      isReasoningModel: isReasoning,
      supportsStructuredOutput: useStructuredOutput,
      temperatureSupported: !isReasoning,
    });

    const systemPrompt = `Tu es un assistant expert en veille stratégique.

Ta tâche est d'analyser une demande de veille et de suggérer :
1. Les paramètres optimaux sur 3 axes (valeurs de 0 à 100) :
   - geography (0 = très local, 50 = national, 100 = global/international)
   - temporality (0 = dernière semaine, 25 = dernier mois, 50 = 3 mois, 75 = 6 mois, 100 = historique complet)
   - focus (0 = purement business/marché, 50 = équilibré, 100 = purement technique)

2. Une liste de 8-12 mots-clés pertinents pour enrichir la recherche

${useStructuredOutput ? 'Réponds UNIQUEMENT avec un JSON valide au format :' : 'Réponds au format JSON suivant (commence ta réponse par { et termine par }) :'}
{
  "parameters": {
    "geography": <nombre 0-100>,
    "temporality": <nombre 0-100>,
    "focus": <nombre 0-100>
  },
  "keywords": ["mot-clé 1", "mot-clé 2", ...],
  "reasoning": "Explication brève de tes choix"
}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Analyse cette demande de veille et suggère les paramètres optimaux :\n\n"${query}"`,
      },
    ];

    // Build completion options
    const completionOptions: OpenAI.Chat.ChatCompletionCreateParams = {
      model,
      messages,
    };

    // Only include temperature for non-reasoning models
    // GPT-5 and o-series models don't support temperature
    if (!isReasoning) {
      completionOptions.temperature = 0.7;
    }

    // Add response_format only for models that support it
    if (useStructuredOutput) {
      completionOptions.response_format = { type: "json_object" };
    }

    const completion = await openai.chat.completions.create(completionOptions);

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    let analysis;
    try {
      // Try to extract JSON if the model didn't use structured output
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : result;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON:", result);
      throw new Error("Invalid JSON response from OpenAI");
    }

    // Validate the response structure
    if (
      !analysis.parameters ||
      typeof analysis.parameters.geography !== "number" ||
      typeof analysis.parameters.temporality !== "number" ||
      typeof analysis.parameters.focus !== "number" ||
      !Array.isArray(analysis.keywords)
    ) {
      throw new Error("Invalid response structure from OpenAI");
    }

    console.log("✅ [ONEVEILLE] Analysis completed successfully");

    return NextResponse.json({
      parameters: {
        geography: Math.min(100, Math.max(0, analysis.parameters.geography)),
        temporality: Math.min(100, Math.max(0, analysis.parameters.temporality)),
        focus: Math.min(100, Math.max(0, analysis.parameters.focus)),
      },
      keywords: analysis.keywords.slice(0, 12), // Limit to 12 keywords
      reasoning: analysis.reasoning || "",
    });
  } catch (error) {
    console.error("Error analyzing query:", error);
    return NextResponse.json(
      { error: "Failed to analyze query" },
      { status: 500 }
    );
  }
}
