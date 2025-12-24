import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { data: veilles, error } = await supabase
      .from("veille_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching veilles:", error);
      return NextResponse.json(
        { error: "Failed to fetch veilles" },
        { status: 500 }
      );
    }

    return NextResponse.json({ veilles: veilles || [] });
  } catch (error) {
    console.error("Error in GET /api/veilles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { error } = await supabase
      .from("veille_history")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting veille:", error);
      return NextResponse.json(
        { error: "Failed to delete veille" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/veilles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
