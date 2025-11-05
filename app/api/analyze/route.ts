import { NextRequest } from "next/server";
import { ActionType, Contribution, UserQuestion } from "@/types";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

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

          sendEvent({
            type: "complete",
            result: {
              timeline: result.timeline,
              finalOutput: result.finalOutput,
            },
          });

          controller.close();
        } catch (error) {
          console.error("Orchestration error:", error);
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
