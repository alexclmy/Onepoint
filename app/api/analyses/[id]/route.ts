import { NextRequest, NextResponse } from "next/server";
import { getAnalysisById, deleteAnalysis } from "@/lib/supabase/analyses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/analyses/[id]
 * Get a specific analysis by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    const { analysis, error } = await getAnalysisById(id);

    if (error) {
      return NextResponse.json(
        { error: error === "Analysis not found" ? error : "Failed to fetch analysis" },
        { status: error === "Analysis not found" ? 404 : 500 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analyses/[id]
 * Delete a specific analysis by ID
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    const { success, error } = await deleteAnalysis(id);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to delete analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
