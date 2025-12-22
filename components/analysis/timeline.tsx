"use client";

import { useState } from "react";
import { Contribution } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, AlertTriangle, CheckCircle2, HelpCircle, FileText, Info, Sparkles } from "lucide-react";
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
  const [debugContribution, setDebugContribution] = useState<Contribution | null>(null);

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
                    className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2" onClick={() => toggleExpanded(contribution.id)}>
                            <span className="font-medium cursor-pointer">{contribution.agentName}</span>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!contribution.debug) {
                                console.warn("⚠️ Contribution sans données debug:", contribution);
                                alert("Aucune donnée de debug disponible pour cette contribution.");
                                return;
                              }
                              setDebugContribution(contribution);
                            }}
                            className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-colors shadow-sm ${
                              contribution.debug
                                ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                                : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            }`}
                            title={contribution.debug
                              ? "Voir les détails techniques (prompts, config LLM, recherches web)"
                              : "Données de debug non disponibles"}
                            disabled={!contribution.debug}
                          >
                            <Info className="h-4 w-4" />
                            🔍 Debug
                            {contribution.debug?.webSearches && contribution.debug.webSearches.length > 0 && (
                              <span className="ml-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] text-white">
                                {contribution.debug.webSearches.length}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Content */}
                        <div className="text-sm" onClick={() => toggleExpanded(contribution.id)}>
                          {isExpanded ? (
                            <MarkdownRenderer content={contribution.content} className="text-sm" />
                          ) : (
                            <p className="text-muted-foreground cursor-pointer">{preview}</p>
                          )}
                        </div>

                        {/* Expand indicator */}
                        {contribution.content.length > 150 && (
                          <button
                            onClick={() => toggleExpanded(contribution.id)}
                            className="text-xs text-primary hover:underline"
                          >
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

      {/* Debug Dialog */}
      <Dialog open={!!debugContribution} onOpenChange={() => setDebugContribution(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Détails Techniques - {debugContribution?.agentName}
            </DialogTitle>
            <DialogDescription>
              Informations de debug pour cette contribution
            </DialogDescription>
          </DialogHeader>

          {debugContribution?.debug && (
            <div className="space-y-6">
              {/* Configuration du modèle */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Configuration du Modèle
                </h3>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Modèle :</span>
                        <span className="ml-2 font-mono">{debugContribution.debug.model}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Temperature :</span>
                        <span className="ml-2 font-mono">{debugContribution.debug.temperature}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Tokens :</span>
                        <span className="ml-2 font-mono">{debugContribution.debug.maxTokens}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recherches Web :</span>
                        <span className="ml-2 font-mono">
                          {debugContribution.debug.webSearches?.length || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recherches Web */}
              {debugContribution.debug.webSearches && debugContribution.debug.webSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    🌐 Recherches Web Effectuées ({debugContribution.debug.webSearches.length})
                  </h3>
                  <div className="space-y-3">
                    {debugContribution.debug.webSearches.map((search, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Recherche {index + 1}</Badge>
                              <span className="text-sm text-muted-foreground">{search.query}</span>
                            </div>
                            <div className="ml-4 space-y-1">
                              <p className="text-xs font-medium">
                                Profondeur: {search.searchDepth} • {search.resultsCount} résultats
                              </p>
                            </div>
                            {search.results && search.results.length > 0 && (
                              <div className="ml-4 space-y-1">
                                <p className="text-xs font-medium">Sources :</p>
                                {search.results.slice(0, 5).map((result, sIndex) => (
                                  <div key={sIndex} className="text-xs">
                                    <a
                                      href={result.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {result.title}
                                    </a>
                                    {result.score && (
                                      <span className="ml-2 text-muted-foreground">
                                        (score: {result.score.toFixed(2)})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {search.answer && (
                              <div className="ml-4 mt-2">
                                <p className="text-xs font-medium">Réponse synthétisée :</p>
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                  {search.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* System Prompt */}
              <div>
                <h3 className="text-sm font-semibold mb-2">📋 System Prompt</h3>
                <Card>
                  <CardContent className="p-4">
                    <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                      {debugContribution.debug.systemPrompt}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* User Prompt */}
              <div>
                <h3 className="text-sm font-semibold mb-2">💬 User Prompt</h3>
                <Card>
                  <CardContent className="p-4">
                    <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                      {debugContribution.debug.userPrompt}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Context Provided */}
              {debugContribution.debug.contextProvided.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    🔗 Contexte Fourni ({debugContribution.debug.contextProvided.length} éléments)
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {debugContribution.debug.contextProvided.map((context, index) => (
                          <div key={index} className="text-xs border-l-2 border-primary pl-3">
                            {context}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Conversation History */}
              {debugContribution.debug.conversationHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    💭 Historique de Conversation ({debugContribution.debug.conversationHistory.length} messages)
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {debugContribution.debug.conversationHistory.map((message, index) => (
                          <div
                            key={index}
                            className={`text-xs p-2 rounded ${
                              message.role === "user"
                                ? "bg-blue-50 dark:bg-blue-950"
                                : "bg-green-50 dark:bg-green-950"
                            }`}
                          >
                            <Badge variant="outline" className="mb-1">
                              {message.role}
                            </Badge>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Réponse du LLM */}
              <div>
                <h3 className="text-sm font-semibold mb-2">🤖 Réponse du LLM</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                      {debugContribution.content}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
