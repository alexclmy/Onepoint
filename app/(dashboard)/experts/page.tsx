"use client";

import { useState } from "react";
import { PREDEFINED_EXPERTS } from "@/lib/experts/predefined-experts";
import { Expert } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

export default function ExpertsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [experts] = useState<Expert[]>(PREDEFINED_EXPERTS);

  const filteredExperts = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const customExperts = filteredExperts.filter((e) => e.isCustom);
  const predefinedExperts = filteredExperts.filter((e) => !e.isCustom);

  return (
    <div className="h-full p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Experts</h1>
            <p className="mt-2 text-muted-foreground">
              Gérez vos experts prédéfinis et créez des experts personnalisés
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Créer un Expert
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un expert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Custom Experts */}
        {customExperts.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Experts Personnalisés</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customExperts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} isCustom />
              ))}
            </div>
          </div>
        )}

        {/* Predefined Experts */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Experts Prédéfinis ({predefinedExperts.length})
          </h2>
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {predefinedExperts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function ExpertCard({ expert, isCustom }: { expert: Expert; isCustom?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: expert.color }}
            />
            <CardTitle className="text-base">{expert.name}</CardTitle>
          </div>
          {isCustom && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardDescription className="text-sm font-medium text-primary">
          {expert.role}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{expert.expertise}</p>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {expert.tone}
          </Badge>
          {isCustom && <Badge className="text-xs">Custom</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
