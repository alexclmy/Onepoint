"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TipDetail } from "@/components/onetip/tip-detail";
import { OneTip } from "@/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TipDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tip, setTip] = useState<OneTip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTip = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/onetip/${id}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Transform database format to camelCase
        const transformedTip: OneTip = {
          id: data.tip.id,
          title: data.tip.title,
          description: data.tip.description,
          content: data.tip.content,
          imageUrl: data.tip.image_url,
          linkUrl: data.tip.link_url,
          category: data.tip.category,
          upvotes: data.tip.upvotes,
          createdAt: new Date(data.tip.created_at),
          updatedAt: new Date(data.tip.updated_at),
        };

        setTip(transformedTip);
      } catch (error) {
        console.error("Error fetching tip:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le tip",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTip();
    }
  }, [id, toast]);

  const handleUpvote = async (tipId: string) => {
    try {
      const response = await fetch(`/api/onetip/${tipId}/upvote`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update the tip in the local state
      if (tip) {
        setTip({ ...tip, upvotes: tip.upvotes + 1 });
      }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tip non trouvé</h2>
          <p className="text-muted-foreground">Ce tip n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return <TipDetail tip={tip} onUpvote={handleUpvote} />;
}
