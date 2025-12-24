"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Eye, Trash2, FileText, Loader2, Radar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Analysis, VeilleHistory, Report } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface HistoryStats {
  total: number;
  totalAnalyses: number;
  totalVeilles: number;
  thisMonth: number;
  averageDuration: number;
}

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    total: 0,
    totalAnalyses: 0,
    totalVeilles: 0,
    thisMonth: 0,
    averageDuration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load analyses and veilles in parallel
      const [analysesResponse, veillesResponse] = await Promise.all([
        fetch("/api/analyses?stats=true"),
        fetch("/api/veilles"),
      ]);

      if (!analysesResponse.ok || !veillesResponse.ok) {
        throw new Error("Failed to fetch reports");
      }

      const analysesData = await analysesResponse.json();
      const veillesData = await veillesResponse.json();

      const analyses: Analysis[] = analysesData.analyses || [];
      const veillesRaw = veillesData.veilles || [];

      // Transform raw veilles from database to VeilleHistory type
      const veilles: VeilleHistory[] = veillesRaw.map((v: any) => ({
        id: v.id,
        query: v.query,
        parameters: v.parameters,
        keywords: v.keywords,
        companyId: v.company_id,
        subQueries: v.sub_queries,
        results: v.results,
        finalReport: v.final_report,
        modelUsed: v.model_used,
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.updated_at),
      }));

      // Transform to unified Report type
      const allReports: Report[] = [
        ...analyses.map((a) => ({ type: "analysis" as const, data: a })),
        ...veilles.map((v) => ({ type: "veille" as const, data: v })),
      ];

      // Sort by date (most recent first)
      allReports.sort((a, b) => {
        const dateA = a.data.createdAt.getTime();
        const dateB = b.data.createdAt.getTime();
        return dateB - dateA;
      });

      setReports(allReports);

      // Calculate stats
      const now = new Date();
      const thisMonthReports = allReports.filter((r) => {
        const createdAt = r.data.createdAt;
        return (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      });

      setStats({
        total: allReports.length,
        totalAnalyses: analyses.length,
        totalVeilles: veilles.length,
        thisMonth: thisMonthReports.length,
        averageDuration: analysesData.stats?.averageDuration || 0,
      });
    } catch (error) {
      console.error("Error loading reports:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load all reports on mount
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDelete = async (report: Report) => {
    const itemType = report.type === "analysis" ? "analyse" : "veille";
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette ${itemType} ?`)) {
      return;
    }

    try {
      setDeletingId(report.data.id);

      let response;
      if (report.type === "analysis") {
        response = await fetch(`/api/analyses/${report.data.id}`, {
          method: "DELETE",
        });
      } else {
        response = await fetch(`/api/veilles?id=${report.data.id}`, {
          method: "DELETE",
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to delete ${itemType}`);
      }

      toast({
        title: "Succès",
        description: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} supprimée avec succès`,
      });

      // Reload reports
      loadReports();
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la ${itemType}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (report: Report) => {
    if (report.type === "analysis") {
      router.push(`/analysis/${report.data.id}`);
    } else {
      router.push(`/veille/${report.data.id}`);
    }
  };

  const handleDownloadPDF = async (report: Report) => {
    if (report.type === "analysis") {
      const analysis = report.data as Analysis;
      if (analysis.pdfUrl) {
        window.open(analysis.pdfUrl, "_blank");
      } else {
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
    } else {
      // Veille PDF generation
      const veille = report.data as VeilleHistory;
      try {
        toast({
          title: "Génération du PDF",
          description: "Veuillez patienter...",
        });

        const response = await fetch("/api/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInput: veille.query,
            actions: [],
            timeline: [],
            executiveSummary: veille.finalReport,
            isVeille: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate PDF");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `veille-${format(veille.createdAt, "yyyy-MM-dd")}.pdf`;
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
          <h1 className="text-3xl font-bold">Historique</h1>
          <p className="mt-2 text-muted-foreground">
            Consultez et téléchargez vos analyses et veilles précédentes
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total</CardDescription>
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
              <CardDescription>Analyses</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  stats.totalAnalyses
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Veilles</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  stats.totalVeilles
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
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les Rapports</CardTitle>
            <CardDescription>
              Historique complet de vos analyses et veilles stratégiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun rapport</h3>
                  <p className="text-sm text-muted-foreground">
                    Commencez par créer une nouvelle analyse ou veille
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => {
                    const isAnalysis = report.type === "analysis";
                    const data = report.data;

                    return (
                      <div
                        key={data.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {isAnalysis ? (
                              <FileText className="h-4 w-4 text-primary" />
                            ) : (
                              <Radar className="h-4 w-4 text-purple-600" />
                            )}
                            <h3 className="font-medium">
                              {isAnalysis
                                ? (data as Analysis).userInput
                                : (data as VeilleHistory).query}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isAnalysis
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                            >
                              {isAnalysis ? "Analyse" : "Veille"}
                            </Badge>
                          </div>
                          {isAnalysis && (
                            <div className="flex flex-wrap gap-2">
                              {(data as Analysis).selectedActions.map((action) => (
                                <Badge key={action} variant="outline" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {!isAnalysis && (
                            <div className="flex flex-wrap gap-2">
                              {(data as VeilleHistory).keywords.map((keyword) => (
                                <Badge key={keyword} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              {format(data.createdAt, "dd MMM yyyy 'à' HH:mm", {
                                locale: fr,
                              })}
                            </span>
                            <span>•</span>
                            {isAnalysis ? (
                              <>
                                <span>{(data as Analysis).selectedExperts.length} experts</span>
                                <span>•</span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    (data as Analysis).status === "completed"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : (data as Analysis).status === "failed"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : (data as Analysis).status === "running"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : ""
                                  }`}
                                >
                                  {(data as Analysis).status}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <span>{(data as VeilleHistory).subQueries.length} recherches</span>
                                <span>•</span>
                                <span>{(data as VeilleHistory).modelUsed}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(report)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDownloadPDF(report)}
                            title="Télécharger le PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(report)}
                            disabled={deletingId === data.id}
                            title="Supprimer"
                          >
                            {deletingId === data.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
