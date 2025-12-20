"use client";

import { useState, useEffect } from "react";
import { ActionSelector } from "@/components/analysis/action-selector";
import { ExpertSelector } from "@/components/analysis/expert-selector";
import { AnalysisInput } from "@/components/analysis/analysis-input";
import { CompanySelector } from "@/components/analysis/company-selector";
import { Timeline } from "@/components/analysis/timeline";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionType, Contribution, UserQuestion, Company } from "@/types";
import { Play, Download } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const [userInput, setUserInput] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<ActionType[]>([]);
  const [selectedExperts, setSelectedExperts] = useState<string[]>([
    "super-consultant-onepoint", // Pre-select Super Consultant
  ]);
  const [userInvolved, setUserInvolved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeline, setTimeline] = useState<Contribution[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<UserQuestion | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

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

  const canStartAnalysis =
    userInput.trim().length > 0 &&
    selectedActions.length > 0 &&
    selectedExperts.length > 0;

  const handleStartAnalysis = async () => {
    if (!canStartAnalysis) return;

    setIsAnalyzing(true);
    setTimeline([]);
    setAnalysisComplete(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          selectedActions,
          selectedExperts,
          selectedCompanyId,
          userInvolved,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "contribution") {
              setTimeline((prev) => [...prev, data.contribution]);
            } else if (data.type === "question") {
              setCurrentQuestion(data.question);
              // Wait for user response
              // This would be handled by a modal or input component
            } else if (data.type === "complete") {
              setAnalysisComplete(true);
            }
          }
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    // TODO: Implement PDF download
    console.log("Downloading PDF...");
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Analyse</h1>
          <p className="mt-2 text-muted-foreground">
            Lancez une analyse stratégique multi-agents en définissant votre demande
            et en sélectionnant les actions et experts pertinents.
          </p>
        </div>

        {/* Configuration Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <CompanySelector
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onChange={setSelectedCompanyId}
            />
            <AnalysisInput value={userInput} onChange={setUserInput} />
            <ActionSelector
              selectedActions={selectedActions}
              onChange={setSelectedActions}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ExpertSelector
              selectedExperts={selectedExperts}
              onChange={setSelectedExperts}
            />

            {/* User Involvement */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="user-involved"
                checked={userInvolved}
                onCheckedChange={(checked) => setUserInvolved(!!checked)}
              />
              <label
                htmlFor="user-involved"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                M'impliquer dans les échanges (répondre aux questions des agents)
              </label>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartAnalysis}
              disabled={!canStartAnalysis || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Lancer l'Analyse
                </>
              )}
            </Button>

            {companies.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">
                💡 Créez des entreprises dans{" "}
                <a href="/company" className="text-primary hover:underline">
                  Mes Entreprises
                </a>{" "}
                pour enrichir vos analyses
              </p>
            )}
          </div>
        </div>

        {/* Timeline Section */}
        {timeline.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Timeline des Contributions</h2>
              {analysisComplete && (
                <Button onClick={handleDownloadPDF} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PDF
                </Button>
              )}
            </div>
            <Timeline contributions={timeline} />
          </div>
        )}
      </div>
    </div>
  );
}
