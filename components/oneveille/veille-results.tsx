"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Loader2, CheckCircle2, Search, Lightbulb, FileText, Bug, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

export interface VeilleEvent {
  type: "status" | "subQueries" | "searchStart" | "searchResults" | "searchDebug" | "searchComplete" | "finalReport" | "saved" | "complete" | "error";
  data: any;
}

export interface VeilleResultsProps {
  isExecuting: boolean;
  events: VeilleEvent[];
}

export function VeilleResults({ isExecuting, events }: VeilleResultsProps) {
  const [showDebug, setShowDebug] = useState(false);
  const [expandedDebug, setExpandedDebug] = useState<number[]>([]);

  // Extract data from events
  const subQueries = events.find((e) => e.type === "subQueries")?.data.subQueries || [];
  const searchCompletions = events.filter((e) => e.type === "searchComplete");
  const searchDebugEvents = events.filter((e) => e.type === "searchDebug");
  const finalReport = events.find((e) => e.type === "finalReport")?.data.report;
  const isComplete = events.some((e) => e.type === "complete");
  const error = events.find((e) => e.type === "error");

  const toggleDebugExpand = (index: number) => {
    setExpandedDebug(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Current phase
  const currentStatus = events.filter((e) => e.type === "status").slice(-1)[0]?.data;

  if (error) {
    return (
      <Card className="border-2 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Loader2 className="h-5 w-5" />
            Erreur lors de la veille
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error.data.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Toggle Button */}
      {searchDebugEvents.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="gap-2"
          >
            <Bug className="h-4 w-4" />
            {showDebug ? "Masquer" : "Afficher"} les détails techniques
          </Button>
        </div>
      )}

      {/* Current Status */}
      {isExecuting && currentStatus && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">{currentStatus.message}</p>
                <p className="text-sm text-muted-foreground">
                  Phase: {currentStatus.phase === "decomposition" ? "Décomposition" : currentStatus.phase === "search" ? "Recherche" : "Synthèse"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-queries */}
      {subQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Axes de recherche ({subQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subQueries.map((query: string, index: number) => {
                const searchComplete = searchCompletions.find((e) => e.data.index === index);
                const isSearching = !searchComplete && isExecuting;

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      searchComplete ? "bg-muted/30" : "bg-background"
                    }`}
                  >
                    {searchComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    ) : isSearching ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Search className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{query}</p>
                      {searchComplete && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {searchComplete.data.resultsCount || 0} résultats trouvés
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      {showDebug && searchDebugEvents.length > 0 && (
        <Card className="border-2 border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Bug className="h-5 w-5" />
              Détails techniques des recherches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchDebugEvents.map((event, idx) => {
              const debugInfo = event.data.debugInfo;
              const isExpanded = expandedDebug.includes(idx);

              return (
                <div key={idx} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                  <button
                    onClick={() => toggleDebugExpand(idx)}
                    className="w-full flex items-start gap-2 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 mt-1 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mt-1 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.data.subQuery}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {debugInfo.citationsCount || 0} citations • {debugInfo.webSearchCalls?.length || 0} recherches web
                      </p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 pl-6">
                      {/* Web Search Calls */}
                      {debugInfo.webSearchCalls && debugInfo.webSearchCalls.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-muted-foreground mb-2">
                            RECHERCHES WEB EFFECTUÉES
                          </h5>
                          <div className="space-y-2">
                            {debugInfo.webSearchCalls.map((call: any, callIdx: number) => (
                              <div key={callIdx} className="bg-muted/50 rounded p-3 text-xs">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant={call.status === "completed" ? "default" : "secondary"} className="text-xs">
                                    {call.status}
                                  </Badge>
                                  <span className="text-muted-foreground">ID: {call.id}</span>
                                </div>
                                {call.query && (
                                  <p className="font-mono text-xs mb-2">
                                    <span className="text-muted-foreground">Query:</span> {call.query}
                                  </p>
                                )}
                                {call.sources && call.sources.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-muted-foreground mb-1">Sources trouvées ({call.sourcesFound}):</p>
                                    <ul className="space-y-1">
                                      {call.sources.slice(0, 5).map((source: any, srcIdx: number) => (
                                        <li key={srcIdx} className="flex items-start gap-1">
                                          <ExternalLink className="h-3 w-3 mt-0.5 shrink-0" />
                                          <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline text-blue-600 dark:text-blue-400 break-all"
                                          >
                                            {source.title || source.url}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error Info */}
                      {debugInfo.error && (
                        <div className="bg-destructive/10 rounded p-3">
                          <p className="text-xs text-destructive font-mono">{debugInfo.error}</p>
                        </div>
                      )}

                      {/* Timestamp */}
                      {event.data.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          Timestamp: {new Date(event.data.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Individual Search Results */}
      {searchCompletions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Résultats de recherche ({searchCompletions.length}/{subQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchCompletions.map((event, index) => (
              <div key={index} className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-medium text-sm mb-2">{event.data.subQuery}</h4>
                <div className="text-sm text-muted-foreground">
                  <MarkdownRenderer content={event.data.synthesis} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Final Report */}
      {finalReport && (
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Rapport de veille stratégique
              </CardTitle>
              {isComplete && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Terminé
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/30 p-6">
              <MarkdownRenderer content={finalReport} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
