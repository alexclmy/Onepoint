"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Loader2, CheckCircle2, Search, Lightbulb, FileText } from "lucide-react";

export interface VeilleEvent {
  type: "status" | "subQueries" | "searchStart" | "searchResults" | "searchComplete" | "finalReport" | "saved" | "complete" | "error";
  data: any;
}

export interface VeilleResultsProps {
  isExecuting: boolean;
  events: VeilleEvent[];
}

export function VeilleResults({ isExecuting, events }: VeilleResultsProps) {
  // Extract data from events
  const subQueries = events.find((e) => e.type === "subQueries")?.data.subQueries || [];
  const searchCompletions = events.filter((e) => e.type === "searchComplete");
  const finalReport = events.find((e) => e.type === "finalReport")?.data.report;
  const isComplete = events.some((e) => e.type === "complete");
  const error = events.find((e) => e.type === "error");

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
