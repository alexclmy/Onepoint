"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { ArrowLeft, Download, Radar, Globe, Clock, Briefcase, Lightbulb, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { VeilleHistory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

export default function VeillePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [veille, setVeille] = useState<VeilleHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadVeille(params.id as string);
    }
  }, [params.id]);

  const loadVeille = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("veille_history")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setVeille({
          id: data.id,
          query: data.query,
          parameters: data.parameters,
          keywords: data.keywords,
          companyId: data.company_id,
          subQueries: data.sub_queries,
          results: data.results,
          finalReport: data.final_report,
          modelUsed: data.model_used,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });
      }
    } catch (error) {
      console.error("Error loading veille:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la veille",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!veille) return;

    try {
      setIsDownloading(true);
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
    } finally {
      setIsDownloading(false);
    }
  };

  const getSliderLabel = (value: number, type: "geography" | "temporality" | "focus") => {
    const ranges = {
      geography: ["Local", "Régional", "National", "Continental", "Global"],
      temporality: ["Dernière semaine", "Dernier mois", "3 derniers mois", "6 derniers mois", "Historique"],
      focus: ["Business pur", "Mix Business", "Équilibré", "Mix Technique", "Technique pur"],
    };
    const index = Math.floor((value / 100) * (ranges[type].length - 1));
    return ranges[type][index];
  };

  if (isLoading) {
    return (
      <div className="h-full p-8">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!veille) {
    return (
      <div className="h-full p-8">
        <div className="flex flex-col items-center justify-center h-full">
          <Radar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Veille non trouvée</h3>
          <Button onClick={() => router.push("/history")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'historique
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/history")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'historique
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radar className="h-8 w-8 text-purple-600" />
              Rapport de Veille
            </h1>
            <p className="mt-2 text-muted-foreground">
              {format(veille.createdAt, "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
          </div>
          <Button onClick={handleDownloadPDF} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </>
            )}
          </Button>
        </div>

        {/* Query */}
        <Card>
          <CardHeader>
            <CardTitle>Requête de Veille</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{veille.query}</p>
          </CardContent>
        </Card>

        {/* Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres d'Analyse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Géographie</p>
                  <p className="text-sm text-muted-foreground">
                    {getSliderLabel(veille.parameters.geography, "geography")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Temporalité</p>
                  <p className="text-sm text-muted-foreground">
                    {getSliderLabel(veille.parameters.temporality, "temporality")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Focus</p>
                  <p className="text-sm text-muted-foreground">
                    {getSliderLabel(veille.parameters.focus, "focus")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Mots-clés Sélectionnés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {veille.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-sm">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sub-queries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Axes de Recherche ({veille.subQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {veille.subQueries.map((query, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                  <Badge variant="outline" className="mt-0.5">
                    {index + 1}
                  </Badge>
                  <p className="text-sm flex-1">{query}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Final Report */}
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              Rapport de Veille Stratégique
            </CardTitle>
            <CardDescription>
              Généré avec {veille.modelUsed}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/30 p-6">
              <MarkdownRenderer content={veille.finalReport} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
