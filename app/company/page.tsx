"use client";

import { useState, useEffect } from "react";
import { Company, GlossaryTerm } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Save, Building2, X } from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for editing company
  const [newValue, setNewValue] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");
  const [newUSP, setNewUSP] = useState("");
  const [newGlossaryTerm, setNewGlossaryTerm] = useState({ term: "", definition: "" });

  // Load companies from Supabase on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("company")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
        alert("Erreur lors du chargement des entreprises. Vérifiez votre connexion Supabase.");
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
      alert("Une erreur s'est produite lors du chargement des entreprises.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: "",
      industry: "",
      description: "",
      values: [],
      competitors: [],
      uniqueSellingPoints: [],
      glossary: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEditingCompany(newCompany);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany({ ...company });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCompany) return;

    // Validation
    if (!editingCompany.name || !editingCompany.industry || !editingCompany.description) {
      alert("Veuillez remplir les champs obligatoires: nom, secteur et description.");
      return;
    }

    try {
      setIsSaving(true);
      const exists = companies.find((c) => c.id === editingCompany.id);

      // Prepare data for Supabase (remove frontend-only fields)
      const supabaseData = {
        name: editingCompany.name,
        industry: editingCompany.industry,
        description: editingCompany.description,
        size: editingCompany.size || null,
        location: editingCompany.location || null,
        website: editingCompany.website || null,
        founded_year: editingCompany.foundedYear || null,
        mission: editingCompany.mission || null,
        vision: editingCompany.vision || null,
        values: editingCompany.values || [],
        target_market: editingCompany.targetMarket || null,
        competitors: editingCompany.competitors || [],
        unique_selling_points: editingCompany.uniqueSellingPoints || [],
        glossary: editingCompany.glossary || [],
        custom_context: editingCompany.customContext || null,
      };

      if (exists) {
        // Update existing company
        const { error } = await supabase
          .from("company")
          .update(supabaseData)
          .eq("id", editingCompany.id);

        if (error) {
          console.error("Erreur lors de la mise à jour:", error);
          alert(`Erreur lors de la mise à jour: ${error.message}`);
          return;
        }
      } else {
        // Insert new company
        const { error } = await supabase.from("company").insert([supabaseData]);

        if (error) {
          console.error("Erreur lors de la création:", error);
          alert(`Erreur lors de la création: ${error.message}`);
          return;
        }
      }

      // Reload companies from database
      await loadCompanies();

      setIsEditDialogOpen(false);
      setEditingCompany(null);
      alert(exists ? "Entreprise mise à jour avec succès !" : "Entreprise créée avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur s'est produite lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
      return;
    }

    try {
      const { error } = await supabase.from("company").delete().eq("id", companyId);

      if (error) {
        console.error("Erreur lors de la suppression:", error);
        alert(`Erreur lors de la suppression: ${error.message}`);
        return;
      }

      // Remove from local state
      setCompanies(companies.filter((c) => c.id !== companyId));
      alert("Entreprise supprimée avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur s'est produite lors de la suppression.");
    }
  };

  // Helper functions for editing
  const addValue = () => {
    if (editingCompany && newValue.trim()) {
      setEditingCompany({
        ...editingCompany,
        values: [...(editingCompany.values || []), newValue.trim()],
      });
      setNewValue("");
    }
  };

  const removeValue = (index: number) => {
    if (editingCompany) {
      setEditingCompany({
        ...editingCompany,
        values: editingCompany.values?.filter((_, i) => i !== index) || [],
      });
    }
  };

  const addCompetitor = () => {
    if (editingCompany && newCompetitor.trim()) {
      setEditingCompany({
        ...editingCompany,
        competitors: [...(editingCompany.competitors || []), newCompetitor.trim()],
      });
      setNewCompetitor("");
    }
  };

  const removeCompetitor = (index: number) => {
    if (editingCompany) {
      setEditingCompany({
        ...editingCompany,
        competitors: editingCompany.competitors?.filter((_, i) => i !== index) || [],
      });
    }
  };

  const addUSP = () => {
    if (editingCompany && newUSP.trim()) {
      setEditingCompany({
        ...editingCompany,
        uniqueSellingPoints: [...(editingCompany.uniqueSellingPoints || []), newUSP.trim()],
      });
      setNewUSP("");
    }
  };

  const removeUSP = (index: number) => {
    if (editingCompany) {
      setEditingCompany({
        ...editingCompany,
        uniqueSellingPoints: editingCompany.uniqueSellingPoints?.filter((_, i) => i !== index) || [],
      });
    }
  };

  const addGlossaryTerm = () => {
    if (editingCompany && newGlossaryTerm.term.trim() && newGlossaryTerm.definition.trim()) {
      setEditingCompany({
        ...editingCompany,
        glossary: [...editingCompany.glossary, newGlossaryTerm],
      });
      setNewGlossaryTerm({ term: "", definition: "" });
    }
  };

  const removeGlossaryTerm = (index: number) => {
    if (editingCompany) {
      setEditingCompany({
        ...editingCompany,
        glossary: editingCompany.glossary.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Mes Entreprises</h1>
              <p className="mt-2 text-muted-foreground">
                Gérez vos entreprises pour enrichir le contexte de vos analyses
              </p>
            </div>
          </div>
          <Button onClick={handleCreateNew} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Entreprise
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Companies List */}
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">
                Chargement des entreprises...
              </p>
            </CardContent>
          </Card>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune entreprise</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Créez votre première entreprise pour commencer
              </p>
              <Button onClick={handleCreateNew} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Créer une entreprise
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {company.industry}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {company.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {company.size && (
                      <Badge variant="outline" className="text-xs">
                        {company.size}
                      </Badge>
                    )}
                    {company.location && (
                      <Badge variant="outline" className="text-xs">
                        {company.location}
                      </Badge>
                    )}
                  </div>
                  {company.glossary.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      📚 {company.glossary.length} terme{company.glossary.length > 1 ? "s" : ""} dans le glossaire
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editingCompany && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany.name ? `Modifier ${editingCompany.name}` : "Nouvelle Entreprise"}
                </DialogTitle>
                <DialogDescription>
                  Configurez les informations de l'entreprise
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <div className="space-y-6 py-4">
                  {/* Informations Générales */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Informations Générales</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'entreprise *</Label>
                        <Input
                          id="name"
                          value={editingCompany.name}
                          onChange={(e) =>
                            setEditingCompany({ ...editingCompany, name: e.target.value })
                          }
                          placeholder="Ex: Decathlon"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Secteur *</Label>
                        <Input
                          id="industry"
                          value={editingCompany.industry}
                          onChange={(e) =>
                            setEditingCompany({ ...editingCompany, industry: e.target.value })
                          }
                          placeholder="Ex: Sport & Distribution"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={editingCompany.description}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, description: e.target.value })
                        }
                        placeholder="Décrivez l'entreprise..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="size">Taille</Label>
                        <Input
                          id="size"
                          value={editingCompany.size || ""}
                          onChange={(e) =>
                            setEditingCompany({ ...editingCompany, size: e.target.value })
                          }
                          placeholder="Ex: 100K+ employés"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Localisation</Label>
                        <Input
                          id="location"
                          value={editingCompany.location || ""}
                          onChange={(e) =>
                            setEditingCompany({ ...editingCompany, location: e.target.value })
                          }
                          placeholder="Ex: France"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foundedYear">Année de création</Label>
                        <Input
                          id="foundedYear"
                          type="number"
                          value={editingCompany.foundedYear || ""}
                          onChange={(e) =>
                            setEditingCompany({
                              ...editingCompany,
                              foundedYear: parseInt(e.target.value),
                            })
                          }
                          placeholder="1976"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        value={editingCompany.website || ""}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, website: e.target.value })
                        }
                        placeholder="https://www.decathlon.fr"
                      />
                    </div>
                  </div>

                  {/* Mission, Vision, Valeurs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mission, Vision & Valeurs</h3>
                    <div className="space-y-2">
                      <Label htmlFor="mission">Mission</Label>
                      <Textarea
                        id="mission"
                        value={editingCompany.mission || ""}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, mission: e.target.value })
                        }
                        placeholder="Notre raison d'être..."
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vision">Vision</Label>
                      <Textarea
                        id="vision"
                        value={editingCompany.vision || ""}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, vision: e.target.value })
                        }
                        placeholder="Où nous voulons aller..."
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Valeurs</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addValue())}
                          placeholder="Ajouter une valeur"
                        />
                        <Button onClick={addValue} size="icon" type="button">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editingCompany.values?.map((value, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {value}
                            <button onClick={() => removeValue(index)} type="button">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Marché & Concurrence */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Marché & Concurrence</h3>
                    <div className="space-y-2">
                      <Label htmlFor="targetMarket">Marché cible</Label>
                      <Textarea
                        id="targetMarket"
                        value={editingCompany.targetMarket || ""}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, targetMarket: e.target.value })
                        }
                        placeholder="Décrivez le marché cible..."
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Concurrents</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newCompetitor}
                          onChange={(e) => setNewCompetitor(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addCompetitor())
                          }
                          placeholder="Nom du concurrent"
                        />
                        <Button onClick={addCompetitor} size="icon" type="button">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editingCompany.competitors?.map((comp, index) => (
                          <Badge key={index} variant="outline" className="gap-1">
                            {comp}
                            <button onClick={() => removeCompetitor(index)} type="button">
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
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addUSP())}
                          placeholder="Ajouter un USP"
                        />
                        <Button onClick={addUSP} size="icon" type="button">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editingCompany.uniqueSellingPoints?.map((usp, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {usp}
                            <button onClick={() => removeUSP(index)} type="button">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Glossaire */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Glossaire</h3>
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
                              setNewGlossaryTerm({
                                ...newGlossaryTerm,
                                definition: e.target.value,
                              })
                            }
                            onKeyPress={(e) =>
                              e.key === "Enter" && (e.preventDefault(), addGlossaryTerm())
                            }
                            placeholder="Net Promoter Score"
                          />
                          <Button onClick={addGlossaryTerm} size="icon" type="button">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {editingCompany.glossary.length > 0 && (
                      <div className="space-y-2">
                        {editingCompany.glossary.map((item, index) => (
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
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contexte Personnalisé */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Contexte Personnalisé</h3>
                    <Textarea
                      value={editingCompany.customContext || ""}
                      onChange={(e) =>
                        setEditingCompany({ ...editingCompany, customContext: e.target.value })
                      }
                      placeholder="Informations supplémentaires..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
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
