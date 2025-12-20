"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, Trash2, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";
import { Analysis, ActionType } from "@/types";
import { ACTIONS } from "@/lib/actions/action-definitions";

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading analyses:", error);
        return;
      }

      const transformedData: Analysis[] = (data || []).map((item) => ({
        id: item.id,
        userInput: item.user_input,
        selectedActions: item.selected_actions as ActionType[],
        selectedExperts: item.selected_experts as string[],
        userInvolved: item.user_involved,
        status: item.status as Analysis["status"],
        timeline: item.timeline || [],
        result: item.result,
        pdfUrl: item.pdf_url,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      setAnalyses(transformedData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (analysisId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette analyse ?")) {
      return;
    }

    try {
      setIsDeleting(analysisId);
      const { error } = await supabase
        .from("analyses")
        .delete()
        .eq("id", analysisId);

      if (error) {
        console.error("Error deleting analysis:", error);
        alert("Erreur lors de la suppression");
        return;
      }

      setAnalyses(analyses.filter((a) => a.id !== analysisId));
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownloadPDF = async (analysis: Analysis) => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: analysis.userInput,
          result: analysis.result,
          timeline: analysis.timeline,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analyse-${format(analysis.createdAt, "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Erreur lors du téléchargement du PDF");
    }
  };

  const getActionLabel = (actionType: ActionType) => {
    return ACTIONS[actionType]?.name || actionType;
  };

  const getStatusBadge = (status: Analysis["status"]) => {
    const colors = {
      completed: "bg-green-500",
      running: "bg-blue-500",
      failed: "bg-red-500",
      pending: "bg-yellow-500",
      waiting_user: "bg-orange-500",
    };

    const labels = {
      completed: "Terminée",
      running: "En cours",
      failed: "Échouée",
      pending: "En attente",
      waiting_user: "Attente utilisateur",
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="h-full p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Historique des Analyses</h1>
          <p className="mt-2 text-muted-foreground">
            Consultez et téléchargez vos analyses précédentes
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total des Analyses</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : analyses.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Terminées</CardDescription>
              <CardTitle className="text-3xl text-green-500">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : analyses.filter(a => a.status === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En cours</CardDescription>
              <CardTitle className="text-3xl text-blue-500">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : analyses.filter(a => a.status === 'running').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Analyses List */}
        <Card>
          <CardHeader>
            <CardTitle>Toutes les Analyses</CardTitle>
            <CardDescription>
              Historique complet de vos analyses stratégiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Aucune analyse</h3>
                <p className="text-sm text-muted-foreground">
                  Lancez votre première analyse pour la voir apparaître ici
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <h3 className="font-medium line-clamp-1">{analysis.userInput}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.selectedActions.map((action) => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {getActionLabel(action)}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground items-center">
                          <span>
                            {format(analysis.createdAt, "dd MMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                          </span>
                          <span>•</span>
                          <span>{analysis.selectedExperts.length} experts</span>
                          <span>•</span>
                          {getStatusBadge(analysis.status)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedAnalysis(analysis)}
                          disabled={analysis.status !== 'completed'}
                          title="Voir l'analyse"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadPDF(analysis)}
                          disabled={analysis.status !== 'completed'}
                          title="Télécharger le PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(analysis.id)}
                          disabled={isDeleting === analysis.id}
                          title="Supprimer"
                        >
                          {isDeleting === analysis.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Details Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'analyse</DialogTitle>
            <DialogDescription>
              {selectedAnalysis && format(selectedAnalysis.createdAt, "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
            </DialogDescription>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Request */}
              <div>
                <h3 className="font-semibold mb-2">Demande</h3>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">{selectedAnalysis.userInput}</p>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold mb-2">Analyses réalisées</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAnalysis.selectedActions.map((action) => (
                    <Badge key={action} variant="outline">
                      {getActionLabel(action)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experts */}
              <div>
                <h3 className="font-semibold mb-2">Experts consultés</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAnalysis.selectedExperts.length} experts ont participé à cette analyse
                </p>
              </div>

              {/* Timeline */}
              {selectedAnalysis.timeline && selectedAnalysis.timeline.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Timeline ({selectedAnalysis.timeline.length} contributions)
                  </h3>
                  <ScrollArea className="h-[200px] rounded-lg bg-muted p-4">
                    <div className="space-y-3">
                      {selectedAnalysis.timeline.map((contribution) => (
                        <div key={contribution.id} className="border-l-2 border-primary pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{contribution.agentName}</span>
                            <Badge variant="outline" className="text-xs">
                              {contribution.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {contribution.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Result */}
              {selectedAnalysis.result && (
                <div>
                  <h3 className="font-semibold mb-2">Rapport final</h3>
                  <ScrollArea className="h-[300px] rounded-lg bg-muted p-4">
                    <pre className="whitespace-pre-wrap text-sm font-sans">
                      {selectedAnalysis.result}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedAnalysis)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAnalysis(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
