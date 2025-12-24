"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Analysis } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/analysis/timeline";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function AnalysisViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const analysisId = params.id as string;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analyses/${analysisId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error loading analysis:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'analyse",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [analysisId, toast]);

  useEffect(() => {
    if (analysisId) {
      loadAnalysis();
    }
  }, [analysisId, loadAnalysis]);

  const handleDownloadPDF = async () => {
    if (!analysis) return;

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
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Analyse introuvable</h2>
        <Button onClick={() => router.push("/history")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'historique
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/history")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Détails de l'Analyse</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Créée le {format(analysis.createdAt, "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
          </div>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
        </div>

        {/* Analysis Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informations de l'Analyse</CardTitle>
              <Badge
                variant="outline"
                className={`${
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Demande
              </h3>
              <p className="text-base">{analysis.userInput}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Actions Sélectionnées
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.selectedActions.map((action) => (
                  <Badge key={action} variant="secondary">
                    {action}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Experts Consultés
              </h3>
              <p className="text-sm">{analysis.selectedExperts.length} experts ont participé</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Contributions
              </h3>
              <p className="text-sm">{analysis.timeline.length} contributions au total</p>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        {analysis.result && (
          <Card>
            <CardHeader>
              <CardTitle>Synthèse Exécutive</CardTitle>
              <CardDescription>
                Résumé stratégique de l'analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={analysis.result} />
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {analysis.timeline.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Timeline des Contributions</h2>
            <Timeline contributions={analysis.timeline} />
          </div>
        )}
      </div>
    </div>
  );
}
