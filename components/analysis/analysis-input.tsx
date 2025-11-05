"use client";

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function AnalysisInput({ value, onChange }: AnalysisInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre Demande</CardTitle>
        <CardDescription>
          Décrivez le contexte et l&apos;objectif de votre analyse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Ex: Nous sommes une startup SaaS B2B dans le secteur de la logistique. Nous souhaitons analyser notre positionnement concurrentiel et identifier les opportunités de croissance pour les 18 prochains mois..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[150px] resize-none"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {value.length} caractères
        </p>
      </CardContent>
    </Card>
  );
}
