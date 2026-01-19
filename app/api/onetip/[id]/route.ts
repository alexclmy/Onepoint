import { NextRequest, NextResponse } from "next/server";
import { getTipById, updateTip, deleteTip } from "@/lib/supabase/onetip";

/**
 * GET /api/onetip/[id]
 * Get a specific tip by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tip, error } = await getTipById(id);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!tip) {
      return NextResponse.json({ error: "Tip not found" }, { status: 404 });
    }

    return NextResponse.json({ tip });
  } catch (error) {
    console.error("Error in GET /api/onetip/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/onetip/[id]
 * Update a tip
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { tip, error } = await updateTip(id, body);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ tip });
  } catch (error) {
    console.error("Error in PATCH /api/onetip/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/onetip/[id]
 * Delete a tip
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { success, error } = await deleteTip(id);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete tip" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/onetip/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
