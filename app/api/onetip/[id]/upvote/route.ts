import { NextRequest, NextResponse } from "next/server";
import { upvoteTip } from "@/lib/supabase/onetip";

/**
 * POST /api/onetip/[id]/upvote
 * Upvote a tip
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tip, error } = await upvoteTip(id);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!tip) {
      return NextResponse.json({ error: "Tip not found" }, { status: 404 });
    }

    return NextResponse.json({ tip });
  } catch (error) {
    console.error("Error in POST /api/onetip/[id]/upvote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
