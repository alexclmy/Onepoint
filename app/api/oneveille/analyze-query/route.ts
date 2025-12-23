import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Call OpenAI to analyze the query and suggest parameters
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant expert en veille stratégique.

Ta tâche est d'analyser une demande de veille et de suggérer :
1. Les paramètres optimaux sur 3 axes (valeurs de 0 à 100) :
   - geography (0 = très local, 50 = national, 100 = global/international)
   - temporality (0 = dernière semaine, 25 = dernier mois, 50 = 3 mois, 75 = 6 mois, 100 = historique complet)
   - focus (0 = purement business/marché, 50 = équilibré, 100 = purement technique)

2. Une liste de 8-12 mots-clés pertinents pour enrichir la recherche

Réponds UNIQUEMENT avec un JSON valide au format :
{
  "parameters": {
    "geography": <nombre 0-100>,
    "temporality": <nombre 0-100>,
    "focus": <nombre 0-100>
  },
  "keywords": ["mot-clé 1", "mot-clé 2", ...],
  "reasoning": "Explication brève de tes choix"
}`,
        },
        {
          role: "user",
          content: `Analyse cette demande de veille et suggère les paramètres optimaux :\n\n"${query}"`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("No response from OpenAI");
    }

    const analysis = JSON.parse(result);

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
