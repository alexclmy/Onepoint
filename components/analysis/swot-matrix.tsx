"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from "lucide-react";

export interface SWOTItem {
  title: string;
  description: string;
  impact?: "high" | "medium" | "low";
}

export interface SWOTData {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

interface SWOTMatrixProps {
  data: SWOTData;
  className?: string;
}

const impactColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

interface SWOTQuadrantProps {
  title: string;
  items: SWOTItem[];
  color: string;
  icon: React.ReactNode;
}

function SWOTQuadrant({ title, items, color, icon }: SWOTQuadrantProps) {
  return (
    <Card className={`p-6 ${color}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {items.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucun élément identifié</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="rounded-lg bg-background/50 p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium">{item.title}</h4>
                {item.impact && (
                  <Badge variant="outline" className={`text-xs ${impactColors[item.impact]}`}>
                    {item.impact === "high" ? "Fort" : item.impact === "medium" ? "Moyen" : "Faible"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export function SWOTMatrix({ data, className = "" }: SWOTMatrixProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Analyse SWOT</h2>
        <p className="text-sm text-muted-foreground">
          Matrice d'analyse stratégique - Forces, Faiblesses, Opportunités, Menaces
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Strengths (top-left) */}
        <SWOTQuadrant
          title="Forces (Strengths)"
          items={data.strengths}
          color="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          icon={<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />}
        />

        {/* Quadrant 2: Weaknesses (top-right) */}
        <SWOTQuadrant
          title="Faiblesses (Weaknesses)"
          items={data.weaknesses}
          color="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          icon={<TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
        />

        {/* Quadrant 3: Opportunities (bottom-left) */}
        <SWOTQuadrant
          title="Opportunités (Opportunities)"
          items={data.opportunities}
          color="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
          icon={<Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        />

        {/* Quadrant 4: Threats (bottom-right) */}
        <SWOTQuadrant
          title="Menaces (Threats)"
          items={data.threats}
          color="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
          icon={<AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
        />
      </div>

      {/* Summary Stats */}
      <Card className="p-4 bg-muted/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.strengths.length}
            </p>
            <p className="text-xs text-muted-foreground">Forces</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {data.weaknesses.length}
            </p>
            <p className="text-xs text-muted-foreground">Faiblesses</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.opportunities.length}
            </p>
            <p className="text-xs text-muted-foreground">Opportunités</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {data.threats.length}
            </p>
            <p className="text-xs text-muted-foreground">Menaces</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
