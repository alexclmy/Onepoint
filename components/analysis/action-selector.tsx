"use client";

import { ActionType } from "@/types";
import { ACTION_LIST } from "@/lib/actions/action-definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActionSelectorProps {
  selectedActions: ActionType[];
  onChange: (actions: ActionType[]) => void;
}

export function ActionSelector({ selectedActions, onChange }: ActionSelectorProps) {
  const toggleAction = (actionId: ActionType) => {
    if (selectedActions.includes(actionId)) {
      onChange(selectedActions.filter((id) => id !== actionId));
    } else {
      onChange([...selectedActions, actionId]);
    }
  };

  const selectAll = () => {
    onChange(ACTION_LIST.map((a) => a.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Actions d'Analyse</CardTitle>
            <CardDescription>
              Sélectionnez au moins une action à réaliser
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-primary hover:underline"
            >
              Tout sélectionner
            </button>
            <span className="text-xs text-muted-foreground">|</span>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:underline"
            >
              Tout désélectionner
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {ACTION_LIST.map((action) => {
              const isSelected = selectedActions.includes(action.id);
              return (
                <div
                  key={action.id}
                  className={`flex items-start space-x-3 rounded-lg border p-3 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    id={action.id}
                    checked={isSelected}
                    onCheckedChange={() => toggleAction(action.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={action.id}
                      className="cursor-pointer text-sm font-medium leading-none"
                    >
                      {action.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      ~{action.estimatedDuration} min
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {selectedActions.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            {selectedActions.length} action{selectedActions.length > 1 ? "s" : ""}{" "}
            sélectionnée{selectedActions.length > 1 ? "s" : ""} •{" "}
            Durée estimée:{" "}
            {ACTION_LIST.filter((a) => selectedActions.includes(a.id)).reduce(
              (sum, a) => sum + a.estimatedDuration,
              0
            )}{" "}
            min
          </p>
        )}
      </CardContent>
    </Card>
  );
}
