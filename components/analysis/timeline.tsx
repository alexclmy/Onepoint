"use client";

import { useState } from "react";
import { Contribution } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, AlertTriangle, CheckCircle2, HelpCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";

interface TimelineProps {
  contributions: Contribution[];
}

const getContributionIcon = (type: Contribution["type"]) => {
  switch (type) {
    case "analysis":
      return <FileText className="h-4 w-4" />;
    case "debate":
      return <AlertTriangle className="h-4 w-4" />;
    case "question":
      return <HelpCircle className="h-4 w-4" />;
    case "consensus":
      return <CheckCircle2 className="h-4 w-4" />;
    case "summary":
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getContributionColor = (type: Contribution["type"]) => {
  switch (type) {
    case "analysis":
      return "bg-blue-500";
    case "debate":
      return "bg-orange-500";
    case "question":
      return "bg-purple-500";
    case "consensus":
      return "bg-green-500";
    case "summary":
      return "bg-primary";
  }
};

const getContributionLabel = (type: Contribution["type"]) => {
  switch (type) {
    case "analysis":
      return "Analyse";
    case "debate":
      return "Débat";
    case "question":
      return "Question";
    case "consensus":
      return "Consensus";
    case "summary":
      return "Synthèse";
  }
};

export function Timeline({ contributions }: TimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <ScrollArea className="h-[600px] pr-4">
          <div className="relative space-y-4">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

            {contributions.map((contribution, index) => {
              const isExpanded = expandedId === contribution.id;
              const preview =
                contribution.content.length > 150
                  ? contribution.content.slice(0, 150) + "..."
                  : contribution.content;

              return (
                <div key={contribution.id} className="relative pl-12">
                  {/* Icon */}
                  <div
                    className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${getContributionColor(
                      contribution.type
                    )} text-white`}
                  >
                    {getContributionIcon(contribution.type)}
                  </div>

                  {/* Content */}
                  <div
                    className="cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                    onClick={() => toggleExpanded(contribution.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{contribution.agentName}</span>
                          <span className="text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            {getContributionLabel(contribution.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(contribution.timestamp), "HH:mm:ss", {
                              locale: fr,
                            })}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="text-sm">
                          {isExpanded ? (
                            <MarkdownRenderer content={contribution.content} className="text-sm" />
                          ) : (
                            <p className="text-muted-foreground">{preview}</p>
                          )}
                        </div>

                        {/* Expand indicator */}
                        {contribution.content.length > 150 && (
                          <button className="text-xs text-primary hover:underline">
                            {isExpanded ? "Voir moins" : "Voir plus"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
