"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ExternalLink, ArrowRight } from "lucide-react";
import { OneTip } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TipCardProps {
  tip: OneTip;
  onUpvote?: (id: string) => Promise<void>;
}

const categoryColors: Record<string, string> = {
  llm: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  tools: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  process: "bg-green-500/10 text-green-500 border-green-500/20",
  communication: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  analysis: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  general: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const categoryLabels: Record<string, string> = {
  llm: "LLM",
  tools: "Outils",
  process: "Processus",
  communication: "Communication",
  analysis: "Analyse",
  general: "Général",
};

export function TipCard({ tip, onUpvote }: TipCardProps) {
  const router = useRouter();
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [upvotes, setUpvotes] = useState(tip.upvotes);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpvoting || !onUpvote) return;

    setIsUpvoting(true);
    try {
      await onUpvote(tip.id);
      setUpvotes((prev) => prev + 1);
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/onetip/${tip.id}`);
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
      onClick={handleCardClick}
    >
      {tip.imageUrl && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tip.imageUrl}
            alt={tip.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
              {tip.title}
            </CardTitle>
          </div>
          <Badge className={categoryColors[tip.category] || categoryColors.general} variant="outline">
            {categoryLabels[tip.category] || tip.category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-3">{tip.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            disabled={isUpvoting}
            className="hover:bg-primary/10"
          >
            <ThumbsUp className={`h-4 w-4 mr-1 ${isUpvoting ? "animate-pulse" : ""}`} />
            <span className="font-semibold">{upvotes}</span>
          </Button>
          {tip.linkUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(tip.linkUrl, "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" className="group-hover:text-primary">
          En savoir plus
          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
