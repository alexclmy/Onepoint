"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

export default function ConfigPage() {
  const [config, setConfig] = useState({
    provider: "openai",
    model: "gpt-4-turbo-preview",
    temperature: 0.7,
    maxTokens: 4000,
    apiKey: "",
  });

  const handleSave = () => {
    // TODO: Save config to database
    console.log("Saving config:", config);
  };

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
              <Input
                id="model"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="gpt-4-turbo-preview"
              />
              <p className="text-xs text-muted-foreground">
                Modèles recommandés : gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo
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

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (optionnel)</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) =>
                  setConfig({ ...config, apiKey: e.target.value })
                }
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Laissez vide pour utiliser la clé configurée en variable d&apos;environnement
              </p>
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Enregistrer la Configuration
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
              <strong>Coût estimé par analyse :</strong> Variable selon la complexité
            </p>
            <p>
              <strong>Modèle recommandé :</strong> gpt-4-turbo-preview pour de meilleurs résultats
            </p>
            <p>
              <strong>Temperature recommandée :</strong> 0.7 pour un bon équilibre créativité/cohérence
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
