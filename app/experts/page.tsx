"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { PREDEFINED_EXPERTS } from "@/lib/experts/predefined-experts";
import { Expert } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Save, Loader2 } from "lucide-react";

export default function ExpertsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customExperts, setCustomExperts] = useState<Expert[]>([]);
  const [experts, setExperts] = useState<Expert[]>(PREDEFINED_EXPERTS);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCustomExperts();
  }, []);

  useEffect(() => {
    // Merge predefined and custom experts
    setExperts([...PREDEFINED_EXPERTS, ...customExperts]);
  }, [customExperts]);

  const loadCustomExperts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .eq("is_custom", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement:", error);
        return;
      }

      const transformedData = (data || []).map((expert) => ({
        id: expert.id,
        name: expert.name,
        role: expert.role,
        expertise: expert.expertise,
        tone: expert.tone as Expert["tone"],
        systemPrompt: expert.system_prompt,
        isCustom: expert.is_custom,
        color: expert.color || "#009DDF",
        avatar: expert.avatar,
      }));

      setCustomExperts(transformedData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExperts = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomExperts = filteredExperts.filter((e) => e.isCustom);
  const filteredPredefinedExperts = filteredExperts.filter((e) => !e.isCustom);

  const handleEdit = (expert: Expert) => {
    setEditingExpert({ ...expert });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingExpert) return;

    // Validation
    if (!editingExpert.name || !editingExpert.role || !editingExpert.expertise || !editingExpert.systemPrompt) {
      alert("Veuillez remplir tous les champs obligatoires : nom, rôle, expertise et instructions.");
      return;
    }

    // If it's a predefined expert being edited, just update local state (no DB save)
    if (!editingExpert.isCustom) {
      alert("Note : Les modifications des experts prédéfinis ne sont pas sauvegardées.");
      setIsEditDialogOpen(false);
      setEditingExpert(null);
      return;
    }

    // It's a custom expert - save to Supabase
    try {
      setIsSaving(true);

      const supabaseData = {
        name: editingExpert.name,
        role: editingExpert.role,
        expertise: editingExpert.expertise,
        tone: editingExpert.tone,
        system_prompt: editingExpert.systemPrompt,
        is_custom: true,
        color: editingExpert.color || "#009DDF",
        avatar: editingExpert.avatar || null,
      };

      const isNewExpert = editingExpert.id.startsWith("custom-");

      if (isNewExpert) {
        // Insert new custom expert
        const { data, error } = await supabase
          .from("experts")
          .insert([supabaseData])
          .select()
          .single();

        if (error) {
          console.error("Erreur lors de la création:", error);
          alert(`Erreur: ${error.message}`);
          return;
        }

        // Update with real ID from database
        if (data) {
          const newExpert = {
            ...editingExpert,
            id: data.id,
          };
          setCustomExperts([...customExperts, newExpert]);
        }
      } else {
        // Update existing custom expert
        const { error } = await supabase
          .from("experts")
          .update(supabaseData)
          .eq("id", editingExpert.id);

        if (error) {
          console.error("Erreur lors de la mise à jour:", error);
          alert(`Erreur: ${error.message}`);
          return;
        }

        setCustomExperts(
          customExperts.map((e) => (e.id === editingExpert.id ? editingExpert : e))
        );
      }

      setIsEditDialogOpen(false);
      setEditingExpert(null);
      alert(isNewExpert ? "Expert créé avec succès !" : "Expert mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur s'est produite lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (expertId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet expert ?")) {
      return;
    }

    try {
      const { error } = await supabase.from("experts").delete().eq("id", expertId);

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        alert(`Erreur: ${error.message}`);
        return;
      }

      setCustomExperts(customExperts.filter((e) => e.id !== expertId));
      alert("Expert supprimé avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur s'est produite lors de la suppression.");
    }
  };

  const handleCreateNew = () => {
    const newExpert: Expert = {
      id: `custom-${Date.now()}`,
      name: "",
      role: "",
      expertise: "",
      tone: "pragmatic",
      systemPrompt: "",
      isCustom: true,
      color: "#009DDF",
    };
    setEditingExpert(newExpert);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Experts</h1>
            <p className="mt-2 text-muted-foreground">
              Gérez vos experts prédéfinis et créez des experts personnalisés
            </p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Chargement des experts...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Experts</h1>
            <p className="mt-2 text-muted-foreground">
              Gérez vos experts prédéfinis et créez des experts personnalisés
            </p>
          </div>
          <Button onClick={handleCreateNew}>
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
        {filteredCustomExperts.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Experts Personnalisés</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCustomExperts.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  expert={expert}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isCustom
                />
              ))}
            </div>
          </div>
        )}

        {/* Predefined Experts */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Experts Prédéfinis ({filteredPredefinedExperts.length})
          </h2>
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPredefinedExperts.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  expert={expert}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Edit Dialog */}
        {editingExpert && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingExpert.name ? `Modifier ${editingExpert.name}` : "Nouvel Expert"}
                </DialogTitle>
                <DialogDescription>
                  Configurez les détails de l'expert et ses instructions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      value={editingExpert.name}
                      onChange={(e) =>
                        setEditingExpert({ ...editingExpert, name: e.target.value })
                      }
                      placeholder="Ex: Marie Dubois"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Input
                      id="role"
                      value={editingExpert.role}
                      onChange={(e) =>
                        setEditingExpert({ ...editingExpert, role: e.target.value })
                      }
                      placeholder="Ex: Expert DevOps"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">Expertise</Label>
                  <Input
                    id="expertise"
                    value={editingExpert.expertise}
                    onChange={(e) =>
                      setEditingExpert({ ...editingExpert, expertise: e.target.value })
                    }
                    placeholder="Ex: Infrastructure cloud, CI/CD, conteneurisation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone of Voice</Label>
                    <Select
                      value={editingExpert.tone}
                      onValueChange={(value) =>
                        setEditingExpert({
                          ...editingExpert,
                          tone: value as Expert["tone"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formel</SelectItem>
                        <SelectItem value="creative">Créatif</SelectItem>
                        <SelectItem value="analytical">Analytique</SelectItem>
                        <SelectItem value="strategic">Stratégique</SelectItem>
                        <SelectItem value="pragmatic">Pragmatique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Couleur</Label>
                    <Input
                      id="color"
                      type="color"
                      value={editingExpert.color || "#009DDF"}
                      onChange={(e) =>
                        setEditingExpert({ ...editingExpert, color: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">Instructions (System Prompt)</Label>
                  <Textarea
                    id="systemPrompt"
                    value={editingExpert.systemPrompt}
                    onChange={(e) =>
                      setEditingExpert({ ...editingExpert, systemPrompt: e.target.value })
                    }
                    placeholder="Tu es [Nom], expert en [domaine]..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Définissez le comportement, l'expertise et le style de réponse de l'expert
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function ExpertCard({
  expert,
  onEdit,
  onDelete,
  isCustom,
}: {
  expert: Expert;
  onEdit: (expert: Expert) => void;
  onDelete: (id: string) => void;
  isCustom?: boolean;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: expert.color }}
            />
            <CardTitle className="text-base">{expert.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(expert)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {isCustom && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(expert.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-sm font-medium text-primary">
          {expert.role}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{expert.expertise}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {expert.tone}
          </Badge>
          {isCustom && <Badge className="text-xs">Custom</Badge>}
          {expert.id === "super-consultant-onepoint" && (
            <Badge className="bg-primary text-xs">⭐ Super Consultant</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
