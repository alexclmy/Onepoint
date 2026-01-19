"use client";

import { useEffect, useState } from "react";
import { TipCard } from "@/components/onetip/tip-card";
import { TipForm } from "@/components/onetip/tip-form";
import { OneTip } from "@/types";
import { Loader2, Lightbulb, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "all", label: "Toutes les catégories" },
  { value: "llm", label: "LLM" },
  { value: "tools", label: "Outils" },
  { value: "process", label: "Processus" },
  { value: "communication", label: "Communication" },
  { value: "analysis", label: "Analyse" },
  { value: "general", label: "Général" },
];

export default function OneTipPage() {
  const [tips, setTips] = useState<OneTip[]>([]);
  const [filteredTips, setFilteredTips] = useState<OneTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const fetchTips = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/onetip");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform database format to camelCase
      const transformedTips = data.tips.map((tip: any) => ({
        id: tip.id,
        title: tip.title,
        description: tip.description,
        content: tip.content,
        imageUrl: tip.image_url,
        linkUrl: tip.link_url,
        category: tip.category,
        upvotes: tip.upvotes,
        createdAt: new Date(tip.created_at),
        updatedAt: new Date(tip.updated_at),
      }));

      setTips(transformedTips);
      setFilteredTips(transformedTips);
    } catch (error) {
      console.error("Error fetching tips:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tips",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredTips(tips);
    } else {
      setFilteredTips(tips.filter((tip) => tip.category === selectedCategory));
    }
  }, [selectedCategory, tips]);

  const handleCreateTip = async (tipData: {
    title: string;
    description: string;
    content: string;
    imageUrl?: string;
    linkUrl?: string;
    category: string;
  }) => {
    try {
      const response = await fetch("/api/onetip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tipData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Refresh tips list
      await fetchTips();
    } catch (error) {
      console.error("Error creating tip:", error);
      throw error;
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      const response = await fetch(`/api/onetip/${id}/upvote`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update the tip in the local state
      setTips((prevTips) =>
        prevTips.map((tip) =>
          tip.id === id ? { ...tip, upvotes: tip.upvotes + 1 } : tip
        )
      );
    } catch (error) {
      console.error("Error upvoting tip:", error);
      toast({
        title: "Erreur",
        description: "Impossible de voter pour ce tip",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">OneTip</h1>
              <p className="text-muted-foreground mt-1">
                Boîte à outils et astuces pour consultants
              </p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Découvrez des astuces, outils et bonnes pratiques partagés par la
            communauté pour vous aider dans vos missions de conseil.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TipForm onSubmit={handleCreateTip} />
        </div>

        {/* Tips Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTips.length === 0 ? (
          <div className="text-center py-20">
            <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun tip trouvé</h3>
            <p className="text-muted-foreground mb-6">
              {selectedCategory === "all"
                ? "Soyez le premier à partager un tip !"
                : "Aucun tip dans cette catégorie pour le moment."}
            </p>
            <TipForm onSubmit={handleCreateTip} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTips.map((tip) => (
              <TipCard key={tip.id} tip={tip} onUpvote={handleUpvote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
