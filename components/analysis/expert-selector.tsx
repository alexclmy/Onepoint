"use client";

import { useState } from "react";
import { PREDEFINED_EXPERTS } from "@/lib/experts/predefined-experts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ExpertSelectorProps {
  selectedExperts: string[];
  onChange: (experts: string[]) => void;
}

export function ExpertSelector({ selectedExperts, onChange }: ExpertSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExperts = PREDEFINED_EXPERTS.filter(
    (expert) =>
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpert = (expertId: string) => {
    if (selectedExperts.includes(expertId)) {
      onChange(selectedExperts.filter((id) => id !== expertId));
    } else {
      onChange([...selectedExperts, expertId]);
    }
  };

  const selectAll = () => {
    onChange(PREDEFINED_EXPERTS.map((e) => e.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Experts</CardTitle>
            <CardDescription>
              Sélectionnez les experts qui participeront à l'analyse
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-primary hover:underline"
            >
              Tous
            </button>
            <span className="text-xs text-muted-foreground">|</span>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:underline"
            >
              Aucun
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un expert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Expert List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredExperts.map((expert) => {
                const isSelected = selectedExperts.includes(expert.id);
                return (
                  <div
                    key={expert.id}
                    className={`flex items-start space-x-3 rounded-lg border p-3 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      id={expert.id}
                      checked={isSelected}
                      onCheckedChange={() => toggleExpert(expert.id)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: expert.color }}
                        />
                        <label
                          htmlFor={expert.id}
                          className="cursor-pointer text-sm font-medium leading-none"
                        >
                          {expert.name}
                        </label>
                      </div>
                      <p className="text-xs font-medium text-primary">
                        {expert.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expert.expertise}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {expert.tone}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {selectedExperts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedExperts.length} expert{selectedExperts.length > 1 ? "s" : ""}{" "}
              sélectionné{selectedExperts.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
