import { supabase } from "./client";
import { Analysis, Contribution, ActionType } from "@/types";

/**
 * Create a new analysis record in the database
 */
export async function createAnalysis(data: {
  userInput: string;
  selectedActions: ActionType[];
  selectedExperts: string[];
  userInvolved: boolean;
}): Promise<{ id: string; error?: string }> {
  try {
    const { data: analysisData, error } = await supabase
      .from("analyses")
      .insert({
        user_input: data.userInput,
        selected_actions: data.selectedActions,
        selected_experts: data.selectedExperts,
        user_involved: data.userInvolved,
        status: "running",
        timeline: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating analysis:", error);
      return { id: "", error: error.message };
    }

    return { id: analysisData.id };
  } catch (error) {
    console.error("Unexpected error creating analysis:", error);
    return {
      id: "",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Update an analysis with timeline contributions (during streaming)
 */
export async function updateAnalysisTimeline(
  analysisId: string,
  timeline: Contribution[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("analyses")
      .update({
        timeline: timeline,
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    if (error) {
      console.error("Error updating analysis timeline:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating timeline:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Complete an analysis with final results
 */
export async function completeAnalysis(
  analysisId: string,
  data: {
    timeline: Contribution[];
    result: string;
    pdfUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("analyses")
      .update({
        status: "completed",
        timeline: data.timeline,
        result: data.result,
        pdf_url: data.pdfUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    if (error) {
      console.error("Error completing analysis:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error completing analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Mark an analysis as failed
 */
export async function failAnalysis(
  analysisId: string,
  errorMessage: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("analyses")
      .update({
        status: "failed",
        result: `Error: ${errorMessage}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    if (error) {
      console.error("Error marking analysis as failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error failing analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get all analyses, sorted by creation date (newest first)
 */
export async function getAllAnalyses(): Promise<{
  analyses: Analysis[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analyses:", error);
      return { analyses: [], error: error.message };
    }

    // Transform database records to Analysis type
    const analyses: Analysis[] = (data || []).map((record) => ({
      id: record.id,
      userInput: record.user_input,
      selectedActions: record.selected_actions,
      selectedExperts: record.selected_experts,
      userInvolved: record.user_involved,
      status: record.status,
      timeline: record.timeline || [],
      result: record.result,
      pdfUrl: record.pdf_url,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    }));

    return { analyses };
  } catch (error) {
    console.error("Unexpected error fetching analyses:", error);
    return {
      analyses: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get a single analysis by ID
 */
export async function getAnalysisById(
  analysisId: string
): Promise<{ analysis: Analysis | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (error) {
      console.error("Error fetching analysis:", error);
      return { analysis: null, error: error.message };
    }

    if (!data) {
      return { analysis: null, error: "Analysis not found" };
    }

    const analysis: Analysis = {
      id: data.id,
      userInput: data.user_input,
      selectedActions: data.selected_actions,
      selectedExperts: data.selected_experts,
      userInvolved: data.user_involved,
      status: data.status,
      timeline: data.timeline || [],
      result: data.result,
      pdfUrl: data.pdf_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return { analysis };
  } catch (error) {
    console.error("Unexpected error fetching analysis:", error);
    return {
      analysis: null,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Delete an analysis by ID
 */
export async function deleteAnalysis(
  analysisId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First delete associated user questions
    await supabase
      .from("user_questions")
      .delete()
      .eq("analysis_id", analysisId);

    // Then delete the analysis
    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", analysisId);

    if (error) {
      console.error("Error deleting analysis:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get analyses statistics
 */
export async function getAnalysesStats(): Promise<{
  total: number;
  thisMonth: number;
  averageDuration: number;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("created_at, updated_at, status");

    if (error) {
      console.error("Error fetching analyses stats:", error);
      return { total: 0, thisMonth: 0, averageDuration: 0, error: error.message };
    }

    const total = data?.length || 0;

    // Count this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = data?.filter(
      (a) => new Date(a.created_at) >= firstDayOfMonth
    ).length || 0;

    // Calculate average duration (in minutes) for completed analyses
    const completedAnalyses = data?.filter((a) => a.status === "completed") || [];
    let totalDuration = 0;

    completedAnalyses.forEach((a) => {
      const created = new Date(a.created_at);
      const updated = new Date(a.updated_at);
      const duration = (updated.getTime() - created.getTime()) / 1000 / 60; // in minutes
      totalDuration += duration;
    });

    const averageDuration = completedAnalyses.length > 0
      ? Math.round(totalDuration / completedAnalyses.length)
      : 0;

    return { total, thisMonth, averageDuration };
  } catch (error) {
    console.error("Unexpected error fetching stats:", error);
    return {
      total: 0,
      thisMonth: 0,
      averageDuration: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
