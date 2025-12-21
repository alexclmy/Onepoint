"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";

export default function ConfigPage() {
  const [config, setConfig] = useState({
    id: "",
    provider: "openai",
    model: "gpt-5.2", // Default to latest GPT-5.2 model
    temperature: 0.7,
    maxTokens: 4000,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("llm_configs")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erreur lors du chargement:", error);
        return;
      }

      if (data) {
        setConfig({
          id: data.id,
          provider: data.provider,
          model: data.model,
          temperature: parseFloat(data.temperature),
          maxTokens: data.max_tokens,
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const supabaseData = {
        provider: config.provider,
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      };

      if (config.id) {
        const { error } = await supabase
          .from("llm_configs")
          .update(supabaseData)
          .eq("id", config.id);

        if (error) {
          console.error("Erreur lors de la mise à jour:", error);
          alert(`Erreur: ${error.message}`);
          return;
        }
      } else {
        const { data, error } = await supabase
          .from("llm_configs")
          .insert([supabaseData])
          .select()
          .single();

        if (error) {
          console.error("Erreur lors de la création:", error);
          alert(`Erreur: ${error.message}`);
          return;
        }

        if (data) {
          setConfig((prev) => ({ ...prev, id: data.id }));
        }
      }

      alert("Configuration enregistrée avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur s'est produite lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Configuration LLM</h1>
            <p className="mt-2 text-muted-foreground">
              Configurez les paramètres du modèle de langage
            </p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Chargement de la configuration...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configuration LLM</h1>
          <p className="mt-2 text-muted-foreground">
            Configurez les paramètres du modèle de langage
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres OpenAI</CardTitle>
            <CardDescription>
              Configuration du modèle et des paramètres d'inférence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider */}
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={config.provider}
                onChange={(e) =>
                  setConfig({ ...config, provider: e.target.value })
                }
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Actuellement, seul OpenAI est supporté
              </p>
            </div>

            <Separator />

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <select
                id="model"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <optgroup label="GPT-5 Series (2025 - Recommandés)">
                  <option value="gpt-5.2">GPT-5.2 (Dernier modèle)</option>
                  <option value="gpt-5.1">GPT-5.1 (Conversationnel)</option>
                  <option value="gpt-5">GPT-5 (Multimodal avancé)</option>
                </optgroup>
                <optgroup label="GPT-4 Series">
                  <option value="gpt-4o">GPT-4o (Flagship multimodal)</option>
                  <option value="gpt-4.1">GPT-4.1 (Spécialisé coding)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Économique)</option>
                </optgroup>
                <optgroup label="Reasoning Models">
                  <option value="o4-mini">o4-mini (Raisonnement rapide)</option>
                </optgroup>
                <optgroup label="GPT-3.5 Series">
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </optgroup>
              </select>
              <p className="text-xs text-muted-foreground">
                Recommandés : GPT-5.2 (meilleur performance), GPT-4o (multimodal), GPT-4.1 (coding)
              </p>
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperature ({config.temperature})
              </Label>
              <input
                type="range"
                id="temperature"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) =>
                  setConfig({ ...config, temperature: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Contrôle la créativité (0 = déterministe, 2 = très créatif)
              </p>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={config.maxTokens}
                onChange={(e) =>
                  setConfig({ ...config, maxTokens: parseInt(e.target.value) })
                }
                placeholder="4000"
              />
              <p className="text-xs text-muted-foreground">
                Nombre maximum de tokens par réponse
              </p>
            </div>

            <Separator />

            {/* Info about API Key */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> La clé API OpenAI est configurée via les variables d&apos;environnement (OPENAI_API_KEY)
              </p>
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer la Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Coût estimé par analyse :</strong> Variable selon la complexité et le modèle
            </p>
            <p>
              <strong>Modèles recommandés (2025) :</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>GPT-5.2</strong> - Meilleure performance globale, multimodal avancé</li>
              <li><strong>GPT-4o</strong> - Excellent rapport qualité/prix, très rapide</li>
              <li><strong>GPT-4.1</strong> - Optimal pour analyses techniques et coding</li>
            </ul>
            <p className="mt-2">
              <strong>Temperature recommandée :</strong> 0.7 pour un bon équilibre créativité/cohérence
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
