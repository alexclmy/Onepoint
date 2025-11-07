"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, X, Building2 } from "lucide-react";
import { GlossaryTerm } from "@/types";

export default function CompanyPage() {
  const [company, setCompany] = useState({
    name: "",
    industry: "",
    description: "",
    size: "",
    location: "",
    website: "",
    foundedYear: new Date().getFullYear(),
    mission: "",
    vision: "",
    values: [] as string[],
    targetMarket: "",
    competitors: [] as string[],
    uniqueSellingPoints: [] as string[],
    glossary: [] as GlossaryTerm[],
    customContext: "",
  });

  const [newValue, setNewValue] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");
  const [newUSP, setNewUSP] = useState("");
  const [newGlossaryTerm, setNewGlossaryTerm] = useState({ term: "", definition: "" });

  const handleSave = async () => {
    // TODO: Save to Supabase
    console.log("Saving company data:", company);
  };

  const addValue = () => {
    if (newValue.trim()) {
      setCompany({ ...company, values: [...company.values, newValue.trim()] });
      setNewValue("");
    }
  };

  const removeValue = (index: number) => {
    setCompany({
      ...company,
      values: company.values.filter((_, i) => i !== index),
    });
  };

  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      setCompany({ ...company, competitors: [...company.competitors, newCompetitor.trim()] });
      setNewCompetitor("");
    }
  };

  const removeCompetitor = (index: number) => {
    setCompany({
      ...company,
      competitors: company.competitors.filter((_, i) => i !== index),
    });
  };

  const addUSP = () => {
    if (newUSP.trim()) {
      setCompany({
        ...company,
        uniqueSellingPoints: [...company.uniqueSellingPoints, newUSP.trim()],
      });
      setNewUSP("");
    }
  };

  const removeUSP = (index: number) => {
    setCompany({
      ...company,
      uniqueSellingPoints: company.uniqueSellingPoints.filter((_, i) => i !== index),
    });
  };

  const addGlossaryTerm = () => {
    if (newGlossaryTerm.term.trim() && newGlossaryTerm.definition.trim()) {
      setCompany({
        ...company,
        glossary: [...company.glossary, newGlossaryTerm],
      });
      setNewGlossaryTerm({ term: "", definition: "" });
    }
  };

  const removeGlossaryTerm = (index: number) => {
    setCompany({
      ...company,
      glossary: company.glossary.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Configuration Entreprise</h1>
              <p className="mt-2 text-muted-foreground">
                Configurez les informations de votre entreprise pour enrichir le contexte des analyses
              </p>
            </div>
          </div>
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </div>

        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
            <CardDescription>
              Informations de base sur votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                  id="name"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="Onepoint"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Secteur d'activité *</Label>
                <Input
                  id="industry"
                  value={company.industry}
                  onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                  placeholder="Conseil en transformation digitale"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={company.description}
                onChange={(e) => setCompany({ ...company, description: e.target.value })}
                placeholder="Décrivez votre entreprise en quelques phrases..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="size">Taille</Label>
                <Input
                  id="size"
                  value={company.size}
                  onChange={(e) => setCompany({ ...company, size: e.target.value })}
                  placeholder="50-200 employés"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={company.location}
                  onChange={(e) => setCompany({ ...company, location: e.target.value })}
                  placeholder="Paris, France"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Année de création</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={company.foundedYear}
                  onChange={(e) =>
                    setCompany({ ...company, foundedYear: parseInt(e.target.value) })
                  }
                  placeholder="2020"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                placeholder="https://www.onepoint.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mission, Vision, Valeurs */}
        <Card>
          <CardHeader>
            <CardTitle>Mission, Vision & Valeurs</CardTitle>
            <CardDescription>
              Définissez l'identité et les principes de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mission">Mission</Label>
              <Textarea
                id="mission"
                value={company.mission}
                onChange={(e) => setCompany({ ...company, mission: e.target.value })}
                placeholder="Notre raison d'être..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vision">Vision</Label>
              <Textarea
                id="vision"
                value={company.vision}
                onChange={(e) => setCompany({ ...company, vision: e.target.value })}
                placeholder="Où nous voulons aller..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Valeurs</Label>
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addValue()}
                  placeholder="Ajouter une valeur"
                />
                <Button onClick={addValue} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {company.values.map((value, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {value}
                    <button onClick={() => removeValue(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marché & Concurrence */}
        <Card>
          <CardHeader>
            <CardTitle>Marché & Concurrence</CardTitle>
            <CardDescription>
              Informations sur votre marché cible et vos concurrents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetMarket">Marché cible</Label>
              <Textarea
                id="targetMarket"
                value={company.targetMarket}
                onChange={(e) => setCompany({ ...company, targetMarket: e.target.value })}
                placeholder="Décrivez votre marché cible..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Concurrents principaux</Label>
              <div className="flex gap-2">
                <Input
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCompetitor()}
                  placeholder="Nom du concurrent"
                />
                <Button onClick={addCompetitor} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {company.competitors.map((competitor, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {competitor}
                    <button onClick={() => removeCompetitor(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Points de différenciation (USP)</Label>
              <div className="flex gap-2">
                <Input
                  value={newUSP}
                  onChange={(e) => setNewUSP(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addUSP()}
                  placeholder="Ajouter un point de différenciation"
                />
                <Button onClick={addUSP} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {company.uniqueSellingPoints.map((usp, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {usp}
                    <button onClick={() => removeUSP(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Glossaire */}
        <Card>
          <CardHeader>
            <CardTitle>Glossaire</CardTitle>
            <CardDescription>
              Définissez les termes spécifiques à votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Terme</Label>
                <Input
                  value={newGlossaryTerm.term}
                  onChange={(e) =>
                    setNewGlossaryTerm({ ...newGlossaryTerm, term: e.target.value })
                  }
                  placeholder="Ex: NPS"
                />
              </div>
              <div className="space-y-2">
                <Label>Définition</Label>
                <div className="flex gap-2">
                  <Input
                    value={newGlossaryTerm.definition}
                    onChange={(e) =>
                      setNewGlossaryTerm({ ...newGlossaryTerm, definition: e.target.value })
                    }
                    onKeyPress={(e) => e.key === "Enter" && addGlossaryTerm()}
                    placeholder="Net Promoter Score"
                  />
                  <Button onClick={addGlossaryTerm} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {company.glossary.length > 0 && (
              <div className="space-y-2">
                {company.glossary.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{item.term}</p>
                      <p className="text-sm text-muted-foreground">{item.definition}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGlossaryTerm(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contexte Personnalisé */}
        <Card>
          <CardHeader>
            <CardTitle>Contexte Personnalisé</CardTitle>
            <CardDescription>
              Ajoutez des informations supplémentaires spécifiques à votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={company.customContext}
              onChange={(e) => setCompany({ ...company, customContext: e.target.value })}
              placeholder="Ajoutez ici toute information pertinente : projets en cours, challenges spécifiques, objectifs stratégiques..."
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        {/* Save Button Bottom */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer la Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
