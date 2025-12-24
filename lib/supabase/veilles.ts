import { supabase } from "./client";
import { VeilleHistory } from "@/types";

/**
 * Get all veilles from the database
 */
export async function getAllVeilles(): Promise<{
  veilles: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("veille_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching veilles:", error);
      return { veilles: [], error: error.message };
    }

    return { veilles: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching veilles:", error);
    return {
      veilles: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single veille by ID
 */
export async function getVeilleById(id: string): Promise<{
  veille: any | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("veille_history")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching veille:", error);
      return { veille: null, error: error.message };
    }

    return { veille: data };
  } catch (error) {
    console.error("Unexpected error fetching veille:", error);
    return {
      veille: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a veille by ID
 */
export async function deleteVeille(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from("veille_history")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting veille:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting veille:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
