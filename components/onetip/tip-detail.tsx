"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ExternalLink, ArrowLeft } from "lucide-react";
import { OneTip } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TipDetailProps {
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

export function TipDetail({ tip, onUpvote }: TipDetailProps) {
  const router = useRouter();
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [upvotes, setUpvotes] = useState(tip.upvotes);

  const handleUpvote = async () => {
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

  const handleBack = () => {
    router.push("/onetip");
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux tips
      </Button>

      <Card>
        {tip.imageUrl && (
          <div className="w-full h-64 overflow-hidden rounded-t-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold flex-1">{tip.title}</h1>
            <Badge className={categoryColors[tip.category] || categoryColors.general} variant="outline">
              {categoryLabels[tip.category] || tip.category}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">{tip.description}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleUpvote} disabled={isUpvoting}>
              <ThumbsUp className={`h-4 w-4 mr-2 ${isUpvoting ? "animate-pulse" : ""}`} />
              <span className="font-semibold">{upvotes}</span>
              <span className="ml-1 text-muted-foreground">votes</span>
            </Button>
            {tip.linkUrl && (
              <Button variant="outline" onClick={() => window.open(tip.linkUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Lien externe
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: tip.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
