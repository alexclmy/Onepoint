import { NextRequest, NextResponse } from "next/server";
import { getAllVeilles, deleteVeille } from "@/lib/supabase/veilles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/veilles
 * Get all veilles
 */
export async function GET(request: NextRequest) {
  try {
    const { veilles, error } = await getAllVeilles();

    if (error) {
      console.error("Error in GET /api/veilles:", error);
      return NextResponse.json(
        { error: "Failed to fetch veilles" },
        { status: 500 }
      );
    }

    return NextResponse.json({ veilles });
  } catch (error) {
    console.error("Unexpected error in GET /api/veilles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/veilles?id=xxx
 * Delete a veille by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing veille ID" },
        { status: 400 }
      );
    }

    const { success, error } = await deleteVeille(id);

    if (!success || error) {
      console.error("Error in DELETE /api/veilles:", error);
      return NextResponse.json(
        { error: error || "Failed to delete veille" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/veilles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
