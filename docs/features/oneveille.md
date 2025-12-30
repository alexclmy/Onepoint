# OneVeille - Veille Stratégique Automatisée

## Vue d'ensemble

OneVeille est un système de veille stratégique automatisée qui combine l'intelligence artificielle et la recherche web native pour produire des rapports de veille complets et sourcés.

## 🎯 Objectif

Automatiser le processus de veille stratégique en :
1. Décomposant un sujet complexe en sous-questions accessibles
2. Effectuant des recherches web parallèles et approfondies
3. Synthétisant les informations trouvées par axe
4. Générant un rapport stratégique global avec sources

## User Flow

### Étape 1 : Saisie du sujet

**Interface utilisateur:**
- Champ texte pour le sujet de veille
- Placeholder avec exemples

**Actions utilisateur:**
1. Saisir le sujet (ex: "Tendances IA 2025")
2. Cliquer sur "Analyser et affiner ma demande"

**Validations:**
- Sujet non vide
- Minimum 5 caractères

### Étape 2 : Affinage de la demande

**Réponse du système:**
L'IA analyse le sujet et propose :
- **Paramètres de veille** (curseurs 0-100)
  - 🌍 Géographie : Local → Global
  - ⏰ Temporalité : Dernière semaine → Historique
  - 💼 Focus : Business ← → Technique

- **Mots-clés suggérés** (8-12 suggestions)
  - Affichage en nuage de tags
  - Sélection jusqu'à 3 mots-clés

- **Variations du sujet** (3-4 propositions)
  - Angles d'approche alternatifs
  - Sélection optionnelle pour modifier le sujet

**Interface affichée:**
- 3 cartes avec les paramètres, mots-clés et variations
- Carte "Sujet final de la veille" éditable
- Sélecteur d'entreprise (optionnel)

**Actions utilisateur:**
1. Ajuster les curseurs de paramètres
2. Sélectionner 1-3 mots-clés (obligatoire)
3. (Optionnel) Cliquer sur une variation pour remplacer le sujet
4. (Optionnel) Éditer manuellement le sujet final
5. (Optionnel) Sélectionner une entreprise
6. Cliquer sur "Lancer la veille stratégique"

**Validations:**
- Au moins 1 mot-clé sélectionné
- Sujet final non vide

### Étape 3 : Exécution de la veille

**Phase 1 : Décomposition** (~5-10 secondes)
- Message : "Décomposition de la requête en sous-questions..."
- Génération de 4-6 axes de recherche

**Phase 2 : Recherches web** (~30-90 secondes)
- Message : "Recherche en cours sur X axes..."
- Pour chaque axe (en parallèle) :
  - Badge "En cours" avec spinner
  - Passage à "Terminé" avec checkmark vert
  - Affichage du nombre de résultats trouvés

**Affichage temps réel:**
- Scroll automatique vers la section résultats
- Carte "Axes de recherche" avec statut de chaque axe
- (Si debug activé) Détails techniques des recherches web

**Phase 3 : Synthèse finale** (~20-30 secondes)
- Message : "Synthèse finale en cours..."
- Génération du rapport de veille stratégique

### Étape 4 : Consultation des résultats

**Interface finale:**
- **Bouton debug** : "Afficher/Masquer les détails techniques"
- **Axes de recherche** : Liste avec statut de chaque axe
- **(Si debug)** Détails techniques :
  - Nombre de citations et recherches web
  - Queries exactes envoyées
  - Sources trouvées avec URLs cliquables
  - Timestamps
- **Résultats de recherche** : Synthèse par axe en markdown
- **Synthèse de Veille Stratégique** : Rapport final structuré

**Actions disponibles:**
- Cliquer sur "Afficher les détails techniques" pour le debug
- Expander les détails de chaque recherche
- Cliquer sur les URLs des sources
- Copier le markdown du rapport
- Consultation dans l'historique OneVeille

## Debug UI

### Bouton de toggle

**Position:** En haut à droite des résultats
**Style:** Outline avec icône Bug
**Texte:** "Afficher les détails techniques" / "Masquer"

### Panel de debug

**Contenu pour chaque axe:**
```
┌─────────────────────────────────────┐
│ ▼ [Titre de l'axe de recherche]   │
│   3 citations • 5 recherches web   │
│                                     │
│   RECHERCHES WEB EFFECTUÉES         │
│   ┌─────────────────────────────┐  │
│   │ ✓ completed    ID: ws_...   │  │
│   │ Query: "AI trends 2025"     │  │
│   │ Sources trouvées (8):       │  │
│   │   🔗 Source 1 Title (URL)   │  │
│   │   🔗 Source 2 Title (URL)   │  │
│   └─────────────────────────────┘  │
│                                     │
│   Timestamp: 30/12/2025 15:04:19   │
└─────────────────────────────────────┘
```

## Implémentation Technique

### Architecture

```
┌──────────────────┐
│  OneVeille Page  │
│  app/oneveille/  │
│  page.tsx        │
└────────┬─────────┘
         │
         ├─ 1. Analyze Query
         ↓
┌──────────────────────────┐
│  /api/oneveille/         │
│  analyze-query           │
└────────┬─────────────────┘
         │
         ├─ Returns: params, keywords, variations
         │
         ├─ 2. Execute Veille (SSE)
         ↓
┌──────────────────────────┐
│  /api/oneveille/         │
│  execute-veille          │
└────────┬─────────────────┘
         │
         ├─ decompose()
         ├─ executeWebSearch() × N (parallel)
         ├─ synthesizeFindings()
         │
         ↓
┌──────────────────────────┐
│  ResponsesClient         │
│  createResponseWith      │
│  WebSearch()             │
└──────────────────────────┘
```

### Composants Principaux

#### 1. Page Component (`app/oneveille/page.tsx`)

**États principaux:**
```typescript
// Step 1: Query input
const [query, setQuery] = useState("");
const [isAnalyzing, setIsAnalyzing] = useState(false);

// Step 2: Refinement
const [hasAnalyzed, setHasAnalyzed] = useState(false);
const [params, setParams] = useState<AnalysisParams>({
  geography: 50,
  temporality: 50,
  focus: 50
});
const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
const [suggestedVariations, setSuggestedVariations] = useState<string[]>([]);
const [finalSubject, setFinalSubject] = useState("");

// Step 3: Execution
const [isExecutingVeille, setIsExecutingVeille] = useState(false);
const [veilleEvents, setVeilleEvents] = useState<VeilleEvent[]>([]);
const [veilleStarted, setVeilleStarted] = useState(false);
```

**Flux d'événements SSE:**
```typescript
// Event types
type VeilleEvent =
  | { type: "status", data: { phase, message } }
  | { type: "subQueries", data: { subQueries } }
  | { type: "searchStart", data: { index, subQuery } }
  | { type: "searchDebug", data: { index, subQuery, debugInfo } }
  | { type: "searchResults", data: { index, subQuery, resultsCount } }
  | { type: "searchComplete", data: { index, subQuery, synthesis } }
  | { type: "finalReport", data: { report } }
  | { type: "saved", data: { veilleId } }
  | { type: "complete", data: { message } }
  | { type: "error", data: { error } }
```

#### 2. Analyze Query API (`/api/oneveille/analyze-query/route.ts`)

**Prompt système:**
```typescript
const systemPrompt = `
Tu es un expert en recherche stratégique.

Ta tâche est d'analyser une demande de veille et de suggérer :
1. Les paramètres optimaux sur 3 axes (0-100)
   - geography (local → global)
   - temporality (semaine → historique)
   - focus (business → technique)

2. 8-12 mots-clés pertinents

3. 3-4 variations du sujet pour inspirer

Réponds en JSON:
{
  "parameters": { geography, temporality, focus },
  "keywords": [...],
  "variations": [...],
  "reasoning": "..."
}
`;
```

**Réponse:**
```json
{
  "parameters": {
    "geography": 75,
    "temporality": 80,
    "focus": 60
  },
  "keywords": [
    "LLM 2025",
    "foundation models",
    "multimodal AI",
    ...
  ],
  "variations": [
    "Rétrospective marché: tendances commerciales...",
    "Rétrospective technique: innovations architectures...",
    ...
  ],
  "reasoning": "..."
}
```

#### 3. Execute Veille API (`/api/oneveille/execute-veille/route.ts`)

**Fonction de décomposition:**
```typescript
async function decompose(
  query: string,
  params: VeilleRequest["parameters"],
  keywords: string[],
  model: string
): Promise<string[]> {
  // Génère 4-6 sous-questions RÉALISTES et ACCESSIBLES
  // Évite les questions trop spécifiques ou impossibles
  // Exemple: "Quelles innovations AI en 2025?"
  //          (PAS "Liste exhaustive arXiv 2025")
}
```

**Fonction de recherche web:**
```typescript
async function executeWebSearch(
  subQuery: string,
  model: string
): Promise<{
  results: SearchResult[],
  synthesis: string,
  debugInfo: any
}> {
  // 1. Appel Responses API avec web search forcé
  const response = await createResponseWithWebSearch(
    model,
    prompt,
    { forceWebSearch: true }
  );

  // 2. Extraction des résultats
  //    - Priorité: citations dans le texte
  //    - Fallback: sources des web search calls
  let results = response.citations.length > 0
    ? response.citations.map(...)
    : response.webSearchCalls
        .flatMap(call => call.action?.sources || [])
        .map(...);

  // 3. Synthesis
  let synthesis = response.outputText ||
    `${results.length} source(s) trouvée(s)`;

  return { results, synthesis, debugInfo };
}
```

**Fonction de synthèse finale:**
```typescript
async function synthesizeFindings(
  query: string,
  results: VeilleResult[],
  params: VeilleRequest["parameters"],
  model: string
): Promise<string> {
  // Génère un rapport structuré en Markdown:
  // # Synthèse de Veille Stratégique
  // ## 🎯 Résumé Exécutif
  // ## 📊 Principales Découvertes
  // ## 🔍 Analyse Détaillée
  // ## 💡 Recommandations Stratégiques
  // ## 📚 Sources Clés
}
```

#### 4. VeilleResults Component (`components/oneveille/veille-results.tsx`)

**Extraction des données:**
```typescript
const subQueries = events.find(e => e.type === "subQueries")?.data.subQueries || [];
const searchCompletions = events.filter(e => e.type === "searchComplete");
const searchDebugEvents = events.filter(e => e.type === "searchDebug");
const finalReport = events.find(e => e.type === "finalReport")?.data.report;
const isComplete = events.some(e => e.type === "complete");
```

**Affichage conditionnel:**
```tsx
{/* Debug Toggle */}
{searchDebugEvents.length > 0 && (
  <Button onClick={() => setShowDebug(!showDebug)}>
    <Bug /> {showDebug ? "Masquer" : "Afficher"} les détails
  </Button>
)}

{/* Debug Panel */}
{showDebug && searchDebugEvents.length > 0 && (
  <Card className="border-orange-500/20">
    {/* Détails des recherches web */}
  </Card>
)}

{/* Final Report */}
{finalReport && (
  <Card className="border-primary/30">
    <CardTitle>Rapport de veille stratégique</CardTitle>
    <MarkdownRenderer content={finalReport} />
  </Card>
)}
```

### OpenAI Responses API

#### Configuration

**Web search forcé:**
```typescript
{
  model: "gpt-4o",
  input: "Recherche web sur: ...",
  tools: [{
    type: "web_search",
    filters: { allowed_domains: [...] }, // Optionnel
  }],
  tool_choice: "required", // Force l'utilisation du web search
  temperature: 0.7,
  max_output_tokens: 2500
}
```

**Réponse:**
```json
{
  "output_text": "Voici les informations trouvées...",
  "output": [
    {
      "type": "web_search_call",
      "id": "ws_...",
      "status": "completed",
      "action": {
        "type": "search",
        "query": "AI trends 2025",
        "sources": [
          { "url": "...", "title": "..." },
          ...
        ]
      }
    },
    {
      "type": "message",
      "role": "assistant",
      "content": [{
        "type": "output_text",
        "text": "...",
        "annotations": [
          {
            "type": "url_citation",
            "start_index": 100,
            "end_index": 150,
            "url": "https://...",
            "title": "..."
          }
        ]
      }]
    }
  ]
}
```

#### Extraction des sources

**Stratégie en 2 niveaux:**

1. **Niveau 1: Citations dans le texte**
   ```typescript
   if (response.citations.length > 0) {
     results = response.citations.map(citation => ({
       title: citation.title,
       url: citation.url,
       snippet: outputText.substring(
         citation.start_index,
         citation.end_index
       )
     }));
   }
   ```

2. **Niveau 2 (Fallback): Sources des recherches**
   ```typescript
   else {
     const allSources = response.webSearchCalls
       .flatMap(call => call.action?.sources || [])
       .slice(0, 10);

     results = allSources.map(source => ({
       title: source.title,
       url: source.url,
       snippet: source.title
     }));
   }
   ```

### Base de Données (Supabase)

#### Table `veille_history`

```sql
CREATE TABLE veille_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  parameters JSONB NOT NULL,
  keywords TEXT[] NOT NULL,
  company_id UUID REFERENCES company(id),
  sub_queries TEXT[] NOT NULL,
  results JSONB NOT NULL,
  final_report TEXT NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Champs:**
- `query`: Sujet de la veille (final)
- `parameters`: { geography, temporality, focus }
- `keywords`: Mots-clés sélectionnés
- `sub_queries`: Axes de recherche générés
- `results`: Array des résultats par axe
- `final_report`: Rapport markdown complet
- `model_used`: Modèle OpenAI utilisé

## Points Techniques Importants

### 1. Génération de sous-questions réalistes

**Prompting critique:**
```typescript
IMPORTANT : Les sous-questions doivent être:
- RÉALISTES (ce qu'on peut trouver sur le web)
- GÉNÉRALES (pas de listes exhaustives)
- ACCESSIBLES publiquement
- CONCRÈTES et factuelles

Exemples BONNES: "Principales innovations AI en 2025?"
Exemples MAUVAISES: "Liste exhaustive arXiv 2025" ❌
```

### 2. Gestion des sources manquantes

**Si pas de citations:**
```typescript
if (!synthesis || synthesis.trim().length === 0) {
  if (results.length > 0) {
    synthesis = `${results.length} source(s) trouvée(s).
                 Consultez les détails techniques.`;
  } else {
    synthesis = "Aucun résultat pertinent trouvé.
                 Sujet trop récent ou trop spécifique.";
  }
}
```

### 3. Auto-scroll

**Scroll vers résultats:**
```typescript
useEffect(() => {
  if (veilleStarted && resultsRef.current) {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  }
}, [veilleStarted, veilleEvents.length]);
```

### 4. Responsive UI

**Curseurs de paramètres:**
```tsx
<div className="flex items-center gap-4">
  <span className="text-xs w-16">Local</span>
  <Slider
    value={[params.geography]}
    onValueChange={(value) => setParams({...params, geography: value[0]})}
    max={100}
    className="flex-1"
  />
  <span className="text-xs w-16 text-right">Global</span>
</div>
```

## Troubleshooting

### Problème: Pas de résultats de recherche
**Cause:** Questions trop spécifiques ou récentes
**Solution:** Améliorer le prompt de décomposition, rendre les questions plus générales

### Problème: Synthèse finale manquante
**Cause:** Erreur dans synthesizeFindings ou événement SSE perdu
**Solution:** Vérifier les logs, s'assurer que tous les searchComplete sont émis avant synthesizeFindings

### Problème: Debug ne montre pas les sources
**Cause:** `debugInfo.webSearchCalls` vide
**Solution:** Vérifier que createResponseWithWebSearch retourne bien les webSearchCalls

### Problème: Compteur "11/8 résultats"
**Cause:** Duplication d'événements searchComplete
**Solution:** Utiliser `events.filter(e => e.type === "searchComplete")` sans duplications

## Tests Recommandés

1. **Sujet simple** : "Tendances IA 2025"
   - Doit générer 4-6 axes pertinents
   - Chaque axe doit avoir des résultats

2. **Sujet complexe** : "Impact IA dans la santé en France"
   - Test des paramètres géographie/focus
   - Vérification contexte entreprise

3. **Sujet trop récent** : "Papiers AI décembre 2025"
   - Gestion des sources manquantes
   - Messages informatifs

4. **Test mobile** : Responsive design
   - Curseurs fonctionnels
   - Auto-scroll vers résultats

5. **Test debug** : Affichage détails techniques
   - Toggle fonctionne
   - URLs cliquables
   - Expand/collapse

## Évolutions Futures

- [ ] Filtrage par domaines (allowed_domains)
- [ ] Géolocalisation des résultats (user_location)
- [ ] Export rapport en PDF/Word
- [ ] Comparaison de veilles multiples
- [ ] Alertes veille automatiques (scheduling)
- [ ] Intégration RSS/newsletters
