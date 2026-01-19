import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase/client";

// Lazy initialization to avoid build-time errors
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

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
1. Les paramètres optimaux sur 3 axes (valeurs de 1 à 10) :
   - geography (1 = très local/ville, 5 = national, 10 = global/international)
   - temporality (1 = dernière semaine, 3 = dernier mois, 5 = 3 mois, 7 = 6 mois, 10 = historique complet)
   - focus (1 = purement business/marché, 5 = équilibré, 10 = purement technique/innovation)

2. Une liste de 8-12 mots-clés pertinents pour enrichir la recherche
   - Identifie les termes clés et concepts importants liés au sujet
   - Inclus des termes généraux et spécifiques, en français et anglais si pertinent
   - Pense aux synonymes et termes connexes couramment utilisés

3. 3-4 variations du sujet pour inspirer l'utilisateur avec différents angles d'approche
   - Propose des angles d'approche cohérents et complémentaires
   - Chaque variation doit offrir une perspective unique
   - Garde le sujet principal mais explore différents aspects (business, technique, marché, innovation, etc.)
   - Sois créatif et pertinent pour enrichir la réflexion

${useStructuredOutput ? 'Réponds UNIQUEMENT avec un JSON valide au format :' : 'Réponds au format JSON suivant (commence ta réponse par { et termine par }) :'}
{
  "parameters": {
    "geography": <nombre 1-10>,
    "temporality": <nombre 1-10>,
    "focus": <nombre 1-10>
  },
  "keywords": ["mot-clé 1", "mot-clé 2", ...],
  "variations": [
    "Variation 1 du sujet",
    "Variation 2 du sujet",
    "Variation 3 du sujet",
    "Variation 4 du sujet (optionnel)"
  ],
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

    console.log("🔍 [ONEVEILLE] Calling Chat Completions API for query analysis...");

    const completion = await getOpenAI().chat.completions.create(completionOptions);

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
      !Array.isArray(analysis.keywords) ||
      !Array.isArray(analysis.variations)
    ) {
      throw new Error("Invalid response structure from OpenAI");
    }

    // Convert from 1-10 scale to 0-100 scale for frontend sliders
    // Formula: (value - 1) * (100 / 9) to map [1,10] to [0,100]
    const convertToSliderScale = (value: number): number => {
      const clamped = Math.min(10, Math.max(1, value));
      return Math.round((clamped - 1) * (100 / 9));
    };

    console.log("✅ [ONEVEILLE] Analysis completed successfully");

    return NextResponse.json({
      parameters: {
        geography: convertToSliderScale(analysis.parameters.geography),
        temporality: convertToSliderScale(analysis.parameters.temporality),
        focus: convertToSliderScale(analysis.parameters.focus),
      },
      keywords: analysis.keywords.slice(0, 12), // Limit to 12 keywords
      variations: analysis.variations.slice(0, 4), // Limit to 4 variations
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
