import { NextRequest, NextResponse } from "next/server";
import { getAllAnalyses, getAnalysesStats } from "@/lib/supabase/analyses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/analyses
 * Get all analyses with optional stats
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get("stats") === "true";

    // Fetch analyses
    const { analyses, error } = await getAllAnalyses();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch analyses" },
        { status: 500 }
      );
    }

    // Optionally include stats
    if (includeStats) {
      const stats = await getAnalysesStats();
      return NextResponse.json({ analyses, stats });
    }

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
