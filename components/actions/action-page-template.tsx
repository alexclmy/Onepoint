"use client";

import { useState, useEffect } from "react";
import { Company, ActionType } from "@/types";
import { CompanySelector } from "@/components/analysis/company-selector";
import { ExpertSelector } from "@/components/analysis/expert-selector";
import { AnalysisResults } from "@/components/actions/analysis-results";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ActionPageTemplateProps {
  actionType: ActionType;
  actionTitle: string;
  actionDescription: string;
  actionIcon?: React.ReactNode;
  suggestedExperts?: string[]; // Expert IDs that are pre-selected for this action
  contextPlaceholder?: string;
}

export function ActionPageTemplate({
  actionType,
  actionTitle,
  actionDescription,
  actionIcon,
  suggestedExperts = ["super-consultant-onepoint"],
  contextPlaceholder = "Décrivez le contexte de votre analyse...",
}: ActionPageTemplateProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedExperts, setSelectedExperts] = useState<string[]>(suggestedExperts);
  const [context, setContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("company")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
        return;
      }

      // Transform database dates to Date objects
      const transformedData = (data || []).map((company) => ({
        ...company,
        createdAt: new Date(company.created_at),
        updatedAt: new Date(company.updated_at),
      }));

      setCompanies(transformedData);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleLaunch = async () => {
    if (selectedExperts.length === 0) {
      alert("Veuillez sélectionner au moins un expert");
      return;
    }

    if (!context.trim()) {
      alert("Veuillez fournir un contexte pour l'analyse");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStarted(true);
    setTimelineEvents([]);

    try {
      const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: context,
          selectedExperts: selectedExperts,
          selectedActions: [actionType],
          userInvolved: false,
          companyContext: selectedCompany
            ? {
                name: selectedCompany.name,
                industry: selectedCompany.industry,
                description: selectedCompany.description,
                glossary: selectedCompany.glossary,
                values: selectedCompany.values,
                competitors: selectedCompany.competitors,
                uniqueSellingPoints: selectedCompany.uniqueSellingPoints,
                targetMarket: selectedCompany.targetMarket,
                customContext: selectedCompany.customContext,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              setTimelineEvents((prev) => [...prev, event]);
            } catch (e) {
              console.error("Error parsing SSE event:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      alert("Une erreur s'est produite lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {actionIcon}
          <h1 className="text-3xl font-bold">{actionTitle}</h1>
        </div>
        <p className="text-muted-foreground">{actionDescription}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          <CompanySelector
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            onChange={setSelectedCompanyId}
          />

          <Card>
            <CardHeader>
              <CardTitle>Contexte de l'analyse</CardTitle>
              <CardDescription>
                Décrivez la situation ou le problème à analyser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={contextPlaceholder}
                rows={8}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleLaunch}
            disabled={isAnalyzing || selectedExperts.length === 0 || !context.trim()}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Lancer l'analyse {actionTitle}
              </>
            )}
          </Button>

          {selectedExperts.length === 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>Veuillez sélectionner au moins un expert pour lancer l'analyse.</p>
            </div>
          )}
        </div>

        {/* Right Column: Experts */}
        <div className="space-y-6">
          <ExpertSelector
            selectedExperts={selectedExperts}
            onChange={setSelectedExperts}
          />
        </div>
      </div>

      {/* Analysis Results */}
      {analysisStarted && (
        <div className="mt-8">
          <AnalysisResults isAnalyzing={isAnalyzing} events={timelineEvents} />
        </div>
      )}
    </div>
  );
}
