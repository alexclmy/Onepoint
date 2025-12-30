# Configuration LLM

## Vue d'ensemble

La page de configuration LLM permet de définir les paramètres globaux du modèle de langage utilisé pour toutes les analyses multi-agents et veilles stratégiques. Cette configuration centralisée garantit la cohérence des résultats.

## 🎯 Objectif

Centraliser la configuration du LLM pour :
- Choisir le modèle OpenAI optimal
- Ajuster les paramètres d'inférence (température, max tokens)
- Optimiser le rapport qualité/coût
- Garantir la cohérence des analyses

## User Flow

### Étape 1 : Accès à la configuration

**Navigation :**
- Cliquer sur "Configuration" dans le sidebar
- Chargement de la configuration actuelle depuis Supabase
- Si aucune configuration : valeurs par défaut

**Valeurs par défaut :**
- Provider: `openai`
- Model: `gpt-5.2` (dernier modèle recommandé)
- Temperature: `0.7`
- Max Tokens: `4000`

### Étape 2 : Sélection du modèle

**Modèles disponibles (Décembre 2025) :**

**🚀 GPT-5 Series (Recommandés) :**
- **GPT-5.2** : Dernier modèle (Décembre 2025), meilleures performances
- **GPT-5.1** : Flagship (Novembre 2025), très performant
- **GPT-5** : Version originale (Août 2025)
- **GPT-5 Mini** : Rapide et économique

**💻 Coding Models :**
- **GPT-5.1 Codex Max** : Agentic coding, optimal pour tâches techniques
- **GPT-5 Codex** : Optimisé pour Codex CLI

**🧠 Reasoning Models (o-Series) :**
- **o3** : Math, Science, Coding
- **o4-mini** : Rapide et efficient

**GPT-4.1 Series (1M tokens context) :**
- **GPT-4.1** : Improved instructions
- **GPT-4.1 Mini** : Version économique
- **GPT-4.1 Nano** : Premier nano model

**GPT-4o Series :**
- **GPT-4o** : Multimodal
- **GPT-4o Mini** : Économique
- **GPT-4o Audio** : Audio I/O

**Legacy Models :**
- GPT-4 Turbo
- GPT-4
- GPT-3.5 Turbo

**Sélection :**
- Dropdown avec groupes (optgroups)
- Description de chaque modèle
- Lien vers documentation officielle OpenAI
- Recommandations : GPT-5.2, GPT-5 Mini, o3

### Étape 3 : Ajustement de la température

**Temperature :**
- Slider de 0 à 2.0 (step 0.1)
- Valeur affichée en temps réel
- Description : "Contrôle la créativité"

**Signification :**
- **0.0** : Déterministe, reproductible, factuel
- **0.7** : Équilibré (recommandé)
- **1.0** : Créatif
- **2.0** : Très créatif, moins cohérent

**Recommandation :**
- 0.5-0.7 pour analyses stratégiques
- 0.3-0.5 pour analyses techniques
- 0.7-1.0 pour brainstorming créatif

**Note :** Les modèles de reasoning (o-series, GPT-5) ne supportent pas le paramètre temperature. Le code détecte automatiquement et ne l'envoie pas à l'API.

### Étape 4 : Configuration Max Tokens

**Max Tokens :**
- Input numérique
- Valeur recommandée : 4000
- Description : "Nombre maximum de tokens par réponse"

**Recommandations par usage :**
- **2000-3000** : Réponses concises
- **4000** : Standard (recommandé)
- **6000-8000** : Analyses approfondies
- **10000+** : Rapports détaillés

**Limites :**
- Dépend du modèle choisi
- GPT-5 : jusqu'à 16384 tokens
- GPT-4.1 : jusqu'à 1M tokens de contexte

### Étape 5 : Enregistrement

**Actions :**
1. Cliquer sur "Enregistrer la Configuration"
2. Validation des champs
3. Sauvegarde dans Supabase (`llm_configs` table)
4. Toast de confirmation
5. Configuration appliquée à toutes les futures analyses

**Validation :**
- Model non vide
- Temperature entre 0 et 2
- Max Tokens > 0

## Implémentation Technique

### Architecture

```
┌─────────────────────┐
│   ConfigPage        │
│   app/config/       │
│   page.tsx          │
└──────────┬──────────┘
           │
           ├─ Supabase Client
           ↓
┌──────────────────────┐
│  Supabase Database   │
│  Table: llm_configs  │
└──────────────────────┘
           ↓
┌──────────────────────┐
│  All API Routes      │
│  Use config          │
└──────────────────────┘
```

### Composant Principal

**File:** `/app/config/page.tsx`

**État clé :**
```typescript
const [config, setConfig] = useState({
  id: "",
  provider: "openai",
  model: "gpt-5.2",
  temperature: 0.7,
  maxTokens: 4000,
});
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
```

**Chargement :**
```typescript
const loadConfig = async () => {
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
};
```

**Enregistrement :**
```typescript
const handleSave = async () => {
  setIsSaving(true);

  const supabaseData = {
    provider: config.provider,
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  };

  if (config.id) {
    // Update existing config
    const { error } = await supabase
      .from("llm_configs")
      .update(supabaseData)
      .eq("id", config.id);

    if (error) {
      alert(`Erreur: ${error.message}`);
      return;
    }
  } else {
    // Insert new config
    const { data, error } = await supabase
      .from("llm_configs")
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      alert(`Erreur: ${error.message}`);
      return;
    }

    if (data) {
      setConfig((prev) => ({ ...prev, id: data.id }));
    }
  }

  setIsSaving(false);
  alert("Configuration enregistrée avec succès !");
};
```

### Base de Données

**Table:** `llm_configs`

```sql
CREATE TABLE llm_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL DEFAULT 'gpt-5.2',
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure only one config exists
CREATE UNIQUE INDEX idx_single_config ON llm_configs ((true));
```

**Champs :**
- `provider` : Toujours "openai" pour l'instant
- `model` : Nom du modèle OpenAI
- `temperature` : 0.0 - 2.0
- `max_tokens` : Nombre maximum de tokens

### Utilisation dans les API

**Chargement de la config :**
```typescript
// app/api/analyze/route.ts
export async function POST(request: NextRequest) {
  // Load LLM config
  const { data: configData } = await supabase
    .from("llm_configs")
    .select("*")
    .single();

  const model = configData?.model || "gpt-5.2";
  const temperature = configData?.temperature || 0.7;
  const maxTokens = configData?.max_tokens || 4000;

  // Use in orchestrator
  const orchestrator = new HybridOrchestrator({
    question,
    selectedActions,
    companyContext,
    model, // From config
    onEvent,
  });

  await orchestrator.executeAnalysis();
}
```

**Détection des modèles de reasoning :**
```typescript
function isReasoningModel(model: string): boolean {
  return (
    model.startsWith("gpt-5") ||
    model.startsWith("o1") ||
    model.startsWith("o3") ||
    model.startsWith("o4")
  );
}

// Dans l'appel API
const completionOptions: any = {
  model: config.model,
  messages: [...],
  max_tokens: config.maxTokens,
};

// Temperature uniquement pour modèles non-reasoning
if (!isReasoningModel(config.model)) {
  completionOptions.temperature = config.temperature;
}

const completion = await openai.chat.completions.create(completionOptions);
```

### Type TypeScript

```typescript
interface LLMConfig {
  id: string;
  provider: "openai";
  model: string;
  temperature: number;
  maxTokens: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## UI Components

### Model Selector

```tsx
<div className="space-y-2">
  <Label htmlFor="model">Modèle</Label>
  <select
    id="model"
    value={config.model}
    onChange={(e) => setConfig({ ...config, model: e.target.value })}
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
  >
    <optgroup label="🚀 GPT-5 Series (2025 - Recommandés)">
      <option value="gpt-5.2">GPT-5.2 (Dernier - Décembre 2025)</option>
      <option value="gpt-5.1">GPT-5.1 (Flagship - Novembre 2025)</option>
      <option value="gpt-5">GPT-5 (Août 2025)</option>
      <option value="gpt-5-mini">GPT-5 Mini (Rapide & économique)</option>
    </optgroup>
    <optgroup label="💻 Coding Models">
      <option value="gpt-5.1-codex-max">GPT-5.1 Codex Max</option>
      <option value="gpt-5-codex">GPT-5 Codex</option>
    </optgroup>
    <optgroup label="🧠 Reasoning Models (o-Series)">
      <option value="o3">o3 (Math, Science, Coding)</option>
      <option value="o4-mini">o4-mini (Rapide & efficient)</option>
    </optgroup>
    {/* ... autres groupes */}
  </select>
  <p className="text-xs text-muted-foreground">
    📊 Source : <a href="https://platform.openai.com/docs/models" target="_blank">
      Documentation officielle OpenAI
    </a>
  </p>
  <p className="text-xs text-muted-foreground">
    ⭐ Recommandés : GPT-5.2, GPT-5 Mini, o3
  </p>
</div>
```

### Temperature Slider

```tsx
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
```

### Save Button

```tsx
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
```

### Info Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Informations</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-sm">
    <p>
      <strong>Coût estimé par analyse :</strong> Variable selon complexité
    </p>
    <p>
      <strong>Modèles recommandés (2025) :</strong>
    </p>
    <ul className="list-disc list-inside ml-4 space-y-1">
      <li>GPT-5.2 - Meilleure performance globale</li>
      <li>GPT-4o - Excellent rapport qualité/prix</li>
      <li>GPT-4.1 - Optimal pour analyses techniques</li>
    </ul>
    <p>
      <strong>Temperature recommandée :</strong> 0.7 pour équilibre
    </p>
  </CardContent>
</Card>
```

## Recommandations par Cas d'Usage

### Analyses Stratégiques

**Modèle recommandé :** GPT-5.2 ou GPT-5.1
**Temperature :** 0.6-0.7
**Max Tokens :** 4000-6000

**Raison :** Modèles les plus performants pour raisonnement stratégique et insights actionnables.

### Analyses Techniques

**Modèle recommandé :** GPT-5.1 Codex Max ou o3
**Temperature :** 0.3-0.5
**Max Tokens :** 4000-8000

**Raison :** Optimisés pour code, architecture technique, et raisonnement logique.

### Veilles Stratégiques

**Modèle recommandé :** GPT-5 ou GPT-4o
**Temperature :** 0.7
**Max Tokens :** 2500-4000

**Raison :** Bon équilibre vitesse/qualité avec web search natif.

### Brainstorming Créatif

**Modèle recommandé :** GPT-5.2
**Temperature :** 0.8-1.0
**Max Tokens :** 4000

**Raison :** Maximise la créativité et diversité des idées.

### Analyse à Budget Limité

**Modèle recommandé :** GPT-5 Mini ou GPT-4o Mini
**Temperature :** 0.7
**Max Tokens :** 2000-3000

**Raison :** Très économiques tout en offrant bonne qualité.

## Coûts Estimés (OpenAI API)

**GPT-5 Series :**
- GPT-5.2 : ~$15-30 / 1M tokens
- GPT-5.1 : ~$10-20 / 1M tokens
- GPT-5 : ~$5-15 / 1M tokens
- GPT-5 Mini : ~$2-5 / 1M tokens

**GPT-4 Series :**
- GPT-4o : ~$2.50-10 / 1M tokens
- GPT-4.1 : ~$5-15 / 1M tokens

**o-Series (Reasoning) :**
- o3 : ~$10-20 / 1M tokens
- o4-mini : ~$3-8 / 1M tokens

**Estimation par analyse :**
- Analyse simple (3 actions) : $0.10-0.50
- Analyse standard (5-6 actions) : $0.50-2.00
- Veille stratégique : $0.30-1.00

*Note : Coûts approximatifs selon la tarification OpenAI Décembre 2025. Consultez la documentation officielle pour les prix actuels.*

## Troubleshooting

### Problème : Configuration non sauvegardée

**Cause possible :** Erreur de connexion Supabase
**Solution :** Vérifier les credentials Supabase dans `.env.local`

### Problème : Modèle non reconnu par l'API

**Cause possible :** Nom de modèle incorrect
**Solution :** Vérifier que le nom correspond exactement à la documentation OpenAI

### Problème : Temperature ignorée

**Cause possible :** Modèle de reasoning utilisé
**Solution :** Normal, les modèles o-series et GPT-5+ ne supportent pas temperature

### Problème : Coûts trop élevés

**Cause possible :** Modèle trop performant pour le besoin
**Solution :** Basculer sur GPT-5 Mini ou GPT-4o Mini

## Évolutions Futures

- [ ] Support multi-providers (Anthropic Claude, Mistral, etc.)
- [ ] Configurations multiples (par use case)
- [ ] A/B testing de configurations
- [ ] Monitoring des coûts en temps réel
- [ ] Alertes si dépassement budget
- [ ] Presets par type d'analyse
- [ ] Historique des configurations
- [ ] Statistiques de performance par modèle
