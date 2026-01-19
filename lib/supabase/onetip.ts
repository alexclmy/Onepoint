import { supabase } from "./client";
import { OneTip } from "@/types";

/**
 * Get all tips from the database
 */
export async function getAllTips(): Promise<{
  tips: any[];
  error?: string;
}> {
  try {
    console.log("[ONETIP API] Fetching all tips from database...");

    const { data, error } = await supabase
      .from("onetip")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ONETIP API] Supabase error:", error);
      return { tips: [], error: error.message };
    }

    console.log("[ONETIP API] Successfully fetched tips:", data?.length || 0);

    return { tips: data || [] };
  } catch (error) {
    console.error("[ONETIP API] Unexpected error fetching tips:", error);
    return {
      tips: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single tip by ID
 */
export async function getTipById(id: string): Promise<{
  tip: any | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("onetip")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching tip:", error);
      return { tip: null, error: error.message };
    }

    return { tip: data };
  } catch (error) {
    console.error("Unexpected error fetching tip:", error);
    return {
      tip: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a new tip
 */
export async function createTip(tip: {
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  category: string;
}): Promise<{
  tip: any | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("onetip")
      .insert({
        title: tip.title,
        description: tip.description,
        content: tip.content,
        image_url: tip.imageUrl,
        link_url: tip.linkUrl,
        category: tip.category,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating tip:", error);
      return { tip: null, error: error.message };
    }

    return { tip: data };
  } catch (error) {
    console.error("Unexpected error creating tip:", error);
    return {
      tip: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update a tip
 */
export async function updateTip(
  id: string,
  tip: {
    title?: string;
    description?: string;
    content?: string;
    imageUrl?: string;
    linkUrl?: string;
    category?: string;
  }
): Promise<{
  tip: any | null;
  error?: string;
}> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (tip.title) updateData.title = tip.title;
    if (tip.description) updateData.description = tip.description;
    if (tip.content) updateData.content = tip.content;
    if (tip.imageUrl !== undefined) updateData.image_url = tip.imageUrl;
    if (tip.linkUrl !== undefined) updateData.link_url = tip.linkUrl;
    if (tip.category) updateData.category = tip.category;

    const { data, error } = await supabase
      .from("onetip")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating tip:", error);
      return { tip: null, error: error.message };
    }

    return { tip: data };
  } catch (error) {
    console.error("Unexpected error updating tip:", error);
    return {
      tip: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a tip by ID
 */
export async function deleteTip(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.from("onetip").delete().eq("id", id);

    if (error) {
      console.error("Error deleting tip:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting tip:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Upvote a tip (increment upvotes by 1)
 */
export async function upvoteTip(id: string): Promise<{
  tip: any | null;
  error?: string;
}> {
  try {
    // First get the current upvotes count
    const { data: currentTip, error: fetchError } = await supabase
      .from("onetip")
      .select("upvotes")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching tip for upvote:", fetchError);
      return { tip: null, error: fetchError.message };
    }

    // Increment upvotes
    const { data, error } = await supabase
      .from("onetip")
      .update({
        upvotes: (currentTip.upvotes || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error upvoting tip:", error);
      return { tip: null, error: error.message };
    }

    return { tip: data };
  } catch (error) {
    console.error("Unexpected error upvoting tip:", error);
    return {
      tip: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get tips by category
 */
export async function getTipsByCategory(category: string): Promise<{
  tips: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("onetip")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tips by category:", error);
      return { tips: [], error: error.message };
    }

    return { tips: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching tips by category:", error);
    return {
      tips: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
