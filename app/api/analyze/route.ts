import { NextRequest } from "next/server";
import { ActionType, Contribution, UserQuestion, Expert } from "@/types";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";
import { supabase } from "@/lib/supabase/client";
import { PREDEFINED_EXPERTS } from "@/lib/experts/predefined-experts";
import {
  createAnalysis,
  completeAnalysis,
  failAnalysis,
} from "@/lib/supabase/analyses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, selectedActions, selectedExperts, userInvolved } = body as {
      userInput: string;
      selectedActions: ActionType[];
      selectedExperts: string[];
      userInvolved: boolean;
    };

    // Validate input
    if (!userInput || !selectedActions.length || !selectedExperts.length) {
      return new Response("Invalid input", { status: 400 });
    }

    // Create analysis record in database
    const { id: analysisId, error: createError } = await createAnalysis({
      userInput,
      selectedActions,
      selectedExperts,
      userInvolved,
    });

    if (createError || !analysisId) {
      console.error("Failed to create analysis:", createError);
      return new Response("Failed to create analysis", { status: 500 });
    }

    // Load custom experts from Supabase
    let allExperts = [...PREDEFINED_EXPERTS];
    try {
      const { data: customExpertsData } = await supabase
        .from("experts")
        .select("*")
        .eq("is_custom", true);

      if (customExpertsData && customExpertsData.length > 0) {
        const customExperts: Expert[] = customExpertsData.map((expert) => ({
          id: expert.id,
          name: expert.name,
          role: expert.role,
          expertise: expert.expertise,
          tone: expert.tone as Expert["tone"],
          systemPrompt: expert.system_prompt,
          isCustom: expert.is_custom,
          color: expert.color || "#009DDF",
          avatar: expert.avatar,
        }));
        allExperts = [...PREDEFINED_EXPERTS, ...customExperts];
      }
    } catch (error) {
      console.error("Error loading custom experts:", error);
      // Continue with predefined experts only
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
          const orchestrator = new AgentOrchestrator({
            userInput,
            selectedActions,
            selectedExperts,
            userInvolved,
            allExperts, // Pass all experts (predefined + custom)
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
            console.error("Failed to save analysis results:", completeError);
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
          console.error("Orchestration error:", error);

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
    console.error("API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
