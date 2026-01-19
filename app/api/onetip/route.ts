import { NextRequest, NextResponse } from "next/server";
import { getAllTips, createTip } from "@/lib/supabase/onetip";

/**
 * GET /api/onetip
 * Get all tips
 */
export async function GET() {
  try {
    const { tips, error } = await getAllTips();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ tips });
  } catch (error) {
    console.error("Error in GET /api/onetip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/onetip
 * Create a new tip
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, content, imageUrl, linkUrl, category } = body;

    if (!title || !description || !content || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { tip, error } = await createTip({
      title,
      description,
      content,
      imageUrl,
      linkUrl,
      category,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ tip }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/onetip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
