"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Eye, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Mock data
const mockAnalyses = [
  {
    id: "1",
    userInput: "Analyse SWOT pour startup SaaS B2B logistique",
    actions: ["swot", "pestel"],
    status: "completed",
    createdAt: new Date("2024-01-15T10:30:00"),
    expertsCount: 8,
  },
  {
    id: "2",
    userInput: "Étude de marché TAM/SAM/SOM pour plateforme e-learning",
    actions: ["market-sizing", "competitive-analysis"],
    status: "completed",
    createdAt: new Date("2024-01-14T15:45:00"),
    expertsCount: 5,
  },
  {
    id: "3",
    userInput: "Product roadmap et priorisation features application mobile",
    actions: ["product-roadmap", "feature-prioritization"],
    status: "completed",
    createdAt: new Date("2024-01-12T09:00:00"),
    expertsCount: 6,
  },
];

export default function HistoryPage() {
  const [analyses] = useState(mockAnalyses);

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
              <CardTitle className="text-3xl">{analyses.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ce mois-ci</CardDescription>
              <CardTitle className="text-3xl">3</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Durée moyenne</CardDescription>
              <CardTitle className="text-3xl">22 min</CardTitle>
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
                        {analysis.actions.map((action) => (
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
                        <span>{analysis.expertsCount} experts</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {analysis.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
