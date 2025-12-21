"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Eye, Trash2, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Analysis } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AnalysesStats {
  total: number;
  thisMonth: number;
  averageDuration: number;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<AnalysesStats>({
    total: 0,
    thisMonth: 0,
    averageDuration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Load analyses on mount
  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/analyses?stats=true");

      if (!response.ok) {
        throw new Error("Failed to fetch analyses");
      }

      const data = await response.json();
      setAnalyses(data.analyses || []);
      setStats(data.stats || { total: 0, thisMonth: 0, averageDuration: 0 });
    } catch (error) {
      console.error("Error loading analyses:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des analyses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (analysisId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette analyse ?")) {
      return;
    }

    try {
      setDeletingId(analysisId);
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete analysis");
      }

      toast({
        title: "Succès",
        description: "Analyse supprimée avec succès",
      });

      // Reload analyses
      loadAnalyses();
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'analyse",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (analysisId: string) => {
    // Navigate to view page (we'll create this later)
    router.push(`/analysis/${analysisId}`);
  };

  const handleDownloadPDF = async (analysis: Analysis) => {
    if (analysis.pdfUrl) {
      // If PDF URL exists, download it
      window.open(analysis.pdfUrl, "_blank");
    } else {
      // Generate PDF on the fly
      try {
        toast({
          title: "Génération du PDF",
          description: "Veuillez patienter...",
        });

        const response = await fetch("/api/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInput: analysis.userInput,
            actions: analysis.selectedActions,
            timeline: analysis.timeline,
            executiveSummary: analysis.result || "",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate PDF");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analyse-${format(analysis.createdAt, "yyyy-MM-dd")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Succès",
          description: "PDF téléchargé avec succès",
        });
      } catch (error) {
        console.error("Error downloading PDF:", error);
        toast({
          title: "Erreur",
          description: "Impossible de générer le PDF",
          variant: "destructive",
        });
      }
    }
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
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  stats.total
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ce mois-ci</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  stats.thisMonth
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Durée moyenne</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  `${stats.averageDuration} min`
                )}
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
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune analyse</h3>
                  <p className="text-sm text-muted-foreground">
                    Commencez par créer une nouvelle analyse
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">{analysis.userInput}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.selectedActions.map((action) => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>
                            {format(analysis.createdAt, "dd MMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                          </span>
                          <span>•</span>
                          <span>{analysis.selectedExperts.length} experts</span>
                          <span>•</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              analysis.status === "completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : analysis.status === "failed"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : analysis.status === "running"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : ""
                            }`}
                          >
                            {analysis.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleView(analysis.id)}
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadPDF(analysis)}
                          title="Télécharger le PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(analysis.id)}
                          disabled={deletingId === analysis.id}
                          title="Supprimer"
                        >
                          {deletingId === analysis.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
