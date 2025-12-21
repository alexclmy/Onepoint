import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    // Test 1: Get all configs
    const { data: allConfigs, error: allError } = await supabase
      .from("llm_configs")
      .select("*");

    // Test 2: Get latest config (same query as analyze route)
    const { data: latestConfig, error: latestError } = await supabase
      .from("llm_configs")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        allConfigs: {
          count: allConfigs?.length || 0,
          data: allConfigs,
          error: allError,
        },
        latestConfig: {
          found: !!latestConfig,
          data: latestConfig,
          error: latestError,
        },
      },
      interpretation: {
        hasAnyConfig: (allConfigs?.length || 0) > 0,
        latestConfigFound: !!latestConfig,
        willUseDefaults: !latestConfig,
        configToUse: latestConfig || {
          model: "gpt-4-turbo-preview (DEFAULT)",
          temperature: 0.7,
          max_tokens: 4000,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
