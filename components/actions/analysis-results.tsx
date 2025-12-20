"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  Users,
  Sparkles,
  Info
} from "lucide-react";
import { Contribution } from "@/types";

interface AnalysisResultsProps {
  isAnalyzing: boolean;
  events: any[];
}

export function AnalysisResults({ isAnalyzing, events }: AnalysisResultsProps) {
  const [expandedContributions, setExpandedContributions] = useState<Set<number>>(new Set());
  const [debugContribution, setDebugContribution] = useState<Contribution | null>(null);

  // Extract data from events
  const contributions: Contribution[] = [];
  let finalOutput: string | null = null;
  let error: string | null = null;

  events.forEach((event) => {
    if (event.type === "contribution" && event.contribution) {
      contributions.push(event.contribution);
    } else if (event.type === "complete" && event.result) {
      finalOutput = event.result.finalOutput;
    } else if (event.type === "error") {
      error = event.error;
    }
  });

  const toggleExpanded = (index: number) => {
    const newSet = new Set(expandedContributions);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedContributions(newSet);
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
      default:
        return "bg-gray-500";
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
      default:
        return "Contribution";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Analyse en cours...
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                Erreur lors de l'analyse
              </>
            ) : finalOutput ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Analyse terminée
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-primary" />
                Démarrage de l'analyse...
              </>
            )}
          </CardTitle>
        </CardHeader>
        {(contributions.length > 0 || isAnalyzing) && (
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{contributions.length} contributions</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Contributions Timeline */}
      {contributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion des experts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="relative space-y-4">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

                {contributions.map((contribution, index) => {
                  const isExpanded = expandedContributions.has(index);
                  const preview =
                    contribution.content.length > 200
                      ? contribution.content.slice(0, 200) + "..."
                      : contribution.content;

                  return (
                    <div key={contribution.id} className="relative pl-12">
                      {/* Icon */}
                      <div
                        className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${getContributionColor(
                          contribution.type
                        )} text-white`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div
                        className="cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md"
                      >
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2" onClick={() => toggleExpanded(index)}>
                              <span className="font-semibold">{contribution.agentName}</span>
                              <Badge variant="outline" className="text-xs">
                                {getContributionLabel(contribution.type)}
                              </Badge>
                            </div>
                            {contribution.debug && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDebugContribution(contribution);
                                }}
                                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                title="Voir les détails techniques"
                              >
                                <Info className="h-4 w-4" />
                                Debug
                              </button>
                            )}
                          </div>

                          {/* Content */}
                          <div className="text-sm" onClick={() => toggleExpanded(index)}>
                            {isExpanded ? (
                              <div className="whitespace-pre-wrap">{contribution.content}</div>
                            ) : (
                              <p className="text-muted-foreground">{preview}</p>
                            )}
                          </div>

                          {/* Expand indicator */}
                          {contribution.content.length > 200 && (
                            <button
                              className="text-xs text-primary hover:underline"
                              onClick={() => toggleExpanded(index)}
                            >
                              {isExpanded ? "Voir moins" : "Voir plus"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Final Output */}
      {finalOutput && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rapport final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap rounded-lg bg-muted p-4">
                {finalOutput}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && contributions.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Les experts préparent leur analyse...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Debug Dialog */}
      <Dialog open={!!debugContribution} onOpenChange={() => setDebugContribution(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Détails techniques - {debugContribution?.agentName}
            </DialogTitle>
            <DialogDescription>
              Informations de debug pour cette contribution
            </DialogDescription>
          </DialogHeader>

          {debugContribution?.debug && (
            <div className="space-y-4">
              {/* Model Config */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Configuration du modèle
                </h3>
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Modèle:</span>
                    <p className="font-mono">{debugContribution.debug.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature:</span>
                    <p className="font-mono">{debugContribution.debug.temperature}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Tokens:</span>
                    <p className="font-mono">{debugContribution.debug.maxTokens}</p>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <h3 className="font-semibold mb-2">System Prompt</h3>
                <div className="rounded-lg bg-muted p-3">
                  <pre className="whitespace-pre-wrap text-xs font-mono">
                    {debugContribution.debug.systemPrompt}
                  </pre>
                </div>
              </div>

              {/* User Prompt */}
              <div>
                <h3 className="font-semibold mb-2">User Prompt</h3>
                <div className="rounded-lg bg-muted p-3">
                  <pre className="whitespace-pre-wrap text-xs font-mono">
                    {debugContribution.debug.userPrompt}
                  </pre>
                </div>
              </div>

              {/* Context Provided */}
              {debugContribution.debug.contextProvided.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Contexte fourni ({debugContribution.debug.contextProvided.length} éléments)
                  </h3>
                  <div className="rounded-lg bg-muted p-3 space-y-2">
                    {debugContribution.debug.contextProvided.map((ctx, idx) => (
                      <div key={idx} className="border-l-2 border-primary pl-3">
                        <pre className="whitespace-pre-wrap text-xs font-mono">{ctx}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation History */}
              {debugContribution.debug.conversationHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Historique de conversation ({debugContribution.debug.conversationHistory.length} messages)
                  </h3>
                  <ScrollArea className="h-[200px] rounded-lg bg-muted p-3">
                    <div className="space-y-2">
                      {debugContribution.debug.conversationHistory.map((msg, idx) => (
                        <div key={idx} className={`p-2 rounded ${
                          msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900' :
                          msg.role === 'assistant' ? 'bg-green-100 dark:bg-green-900' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <div className="text-xs font-semibold mb-1 capitalize">{msg.role}</div>
                          <pre className="whitespace-pre-wrap text-xs font-mono">{msg.content}</pre>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Response */}
              <div>
                <h3 className="font-semibold mb-2">Réponse du LLM</h3>
                <div className="rounded-lg bg-muted p-3">
                  <pre className="whitespace-pre-wrap text-xs font-mono">
                    {debugContribution.content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
