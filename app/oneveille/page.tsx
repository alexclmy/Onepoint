"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CompanySelector } from "@/components/analysis/company-selector";
import { VeilleResults, VeilleEvent } from "@/components/oneveille/veille-results";
import { supabase } from "@/lib/supabase/client";
import { Company } from "@/types";
import { Radar, Sparkles, Globe, Clock, Briefcase, X, Loader2 } from "lucide-react";

interface AnalysisParams {
  geography: number; // 0-100: Local → Global
  temporality: number; // 0-100: Récent → Historique
  focus: number; // 0-100: Business → Technique
}

export default function OneVeillePage() {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Analysis parameters
  const [params, setParams] = useState<AnalysisParams>({
    geography: 50,
    temporality: 50,
    focus: 50,
  });

  // Keywords
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Subject variations
  const [suggestedVariations, setSuggestedVariations] = useState<string[]>([]);
  const [finalSubject, setFinalSubject] = useState("");

  // Company
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Veille execution
  const [isExecutingVeille, setIsExecutingVeille] = useState(false);
  const [veilleEvents, setVeilleEvents] = useState<VeilleEvent[]>([]);
  const [veilleStarted, setVeilleStarted] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  // Auto-scroll to results when veille starts or when new events arrive
  useEffect(() => {
    if (veilleStarted && resultsRef.current) {
      // Small delay to ensure the results section has rendered
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [veilleStarted, veilleEvents.length]);

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

  const handleAnalyzeQuery = async () => {
    if (!query.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/oneveille/analyze-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const data = await response.json();

      // Set suggested parameters
      setParams({
        geography: data.parameters.geography,
        temporality: data.parameters.temporality,
        focus: data.parameters.focus,
      });

      // Set suggested keywords
      setSuggestedKeywords(data.keywords);

      // Set suggested variations
      setSuggestedVariations(data.variations || []);

      // Initialize final subject with original query
      setFinalSubject(query);

      setHasAnalyzed(true);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur s'est produite lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
    } else if (selectedKeywords.length < 3) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleLaunchVeille = async () => {
    if (selectedKeywords.length === 0) return;

    setIsExecutingVeille(true);
    setVeilleStarted(true);
    setVeilleEvents([]);

    try {
      const response = await fetch("/api/oneveille/execute-veille", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: finalSubject, // Use the final (possibly edited) subject
          parameters: params,
          keywords: selectedKeywords,
          companyId: selectedCompanyId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du lancement de la veille");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let currentEventType = "unknown";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEventType = line.substring(7).trim();
            continue;
          }

          if (line.startsWith("data:")) {
            const data = line.substring(6).trim();
            if (data) {
              try {
                const parsed = JSON.parse(data);
                setVeilleEvents((prev) => [...prev, { type: currentEventType as any, data: parsed }]);
              } catch (e) {
                console.error("Failed to parse SSE data:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setVeilleEvents((prev) => [...prev, { type: "error", data: { error: String(error) } }]);
    } finally {
      setIsExecutingVeille(false);
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Radar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">OneVeille</h1>
            <p className="text-muted-foreground">Veille stratégique intelligente et personnalisée</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Query Input */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quel est le sujet de votre veille ?
            </CardTitle>
            <CardDescription>
              Décrivez le sujet sur lequel vous souhaitez effectuer une veille stratégique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Les tendances de l'intelligence artificielle dans le secteur de la santé, les stratégies d'acquisition des startups fintech, l'évolution du marché des véhicules électriques en Europe..."
              rows={4}
              className="text-base resize-none"
            />
            <Button
              onClick={handleAnalyzeQuery}
              disabled={!query.trim() || isAnalyzing}
              size="lg"
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyser et affiner ma demande
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Parameters Adjustment (shown after analysis) */}
        {hasAnalyzed && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de veille</CardTitle>
                <CardDescription>
                  Ajustez les curseurs pour affiner votre demande de veille
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Geography Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="font-medium">🌍 Géographie</span>
                    </div>
                    <Badge variant="secondary">{getSliderLabel(params.geography, "geography")}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-16">Local</span>
                    <Slider
                      value={[params.geography]}
                      onValueChange={(value) => setParams({ ...params, geography: value[0] })}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">Global</span>
                  </div>
                </div>

                {/* Temporality Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">⏰ Temporalité</span>
                    </div>
                    <Badge variant="secondary">{getSliderLabel(params.temporality, "temporality")}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-16">Récent</span>
                    <Slider
                      value={[params.temporality]}
                      onValueChange={(value) => setParams({ ...params, temporality: value[0] })}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">Historique</span>
                  </div>
                </div>

                {/* Focus Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="font-medium">💼 Focus</span>
                    </div>
                    <Badge variant="secondary">{getSliderLabel(params.focus, "focus")}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-16">Business</span>
                    <Slider
                      value={[params.focus]}
                      onValueChange={(value) => setParams({ ...params, focus: value[0] })}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">Technique</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Keywords Cloud */}
            <Card>
              <CardHeader>
                <CardTitle>Mots-clés suggérés</CardTitle>
                <CardDescription>
                  Sélectionnez jusqu'à 3 mots-clés pour enrichir votre veille • {selectedKeywords.length}/3 sélectionnés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map((keyword) => {
                    const isSelected = selectedKeywords.includes(keyword);
                    const canSelect = selectedKeywords.length < 3 || isSelected;

                    return (
                      <button
                        key={keyword}
                        onClick={() => canSelect && toggleKeyword(keyword)}
                        disabled={!canSelect}
                        className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-md scale-105"
                            : canSelect
                            ? "bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105"
                            : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                        }`}
                      >
                        {keyword}
                        {isSelected && <X className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Subject Variations */}
            {suggestedVariations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Variations du sujet suggérées</CardTitle>
                  <CardDescription>
                    Sélectionnez une variation pour explorer différents angles d'approche (optionnel)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suggestedVariations.map((variation, index) => {
                      const isSelected = finalSubject === variation;
                      return (
                        <button
                          key={index}
                          onClick={() => setFinalSubject(variation)}
                          className={`w-full text-left rounded-lg p-4 text-sm transition-all border-2 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-background hover:border-primary/50 hover:bg-accent"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Sparkles className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={isSelected ? "font-medium" : ""}>{variation}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Company Selection (Optional) */}
            <CompanySelector
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onChange={setSelectedCompanyId}
            />

            {/* Step 6: Final Subject Edit */}
            <Card>
              <CardHeader>
                <CardTitle>Sujet final de la veille</CardTitle>
                <CardDescription>
                  Vous pouvez affiner ou modifier le sujet avant de lancer la veille
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={finalSubject}
                  onChange={(e) => setFinalSubject(e.target.value)}
                  placeholder="Modifiez le sujet si nécessaire..."
                  rows={3}
                  className="text-base resize-none"
                />
              </CardContent>
            </Card>

            {/* Launch Button */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <Button
                  onClick={handleLaunchVeille}
                  size="lg"
                  className="w-full"
                  disabled={selectedKeywords.length === 0 || !finalSubject.trim() || isExecutingVeille}
                >
                  {isExecutingVeille ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Veille en cours...
                    </>
                  ) : (
                    <>
                      <Radar className="mr-2 h-5 w-5" />
                      Lancer la veille stratégique
                    </>
                  )}
                </Button>
                {!isExecutingVeille && (
                  <>
                    {selectedKeywords.length === 0 && (
                      <p className="mt-2 text-center text-sm text-muted-foreground">
                        Veuillez sélectionner au moins 1 mot-clé pour continuer
                      </p>
                    )}
                    {!finalSubject.trim() && selectedKeywords.length > 0 && (
                      <p className="mt-2 text-center text-sm text-muted-foreground">
                        Veuillez renseigner le sujet final de la veille
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Veille Results */}
        {veilleStarted && (
          <div ref={resultsRef} className="mt-8">
            <VeilleResults isExecuting={isExecutingVeille} events={veilleEvents} />
          </div>
        )}
      </div>
    </div>
  );
}
